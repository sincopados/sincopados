<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { UBadge, UButton, UProgress } from '#components';
import type { Database, ClientService, Service, ServiceStage } from '~/types/db';

definePageMeta({
  middleware: 'role',
  roles: ['superusuario', 'tutor'],
});

const client = useSupabaseClient<Database>();
const userId = useAuthUserId();
const { isSuperuser } = useProfile();
const localePath = useLocalePath();

type Contracted = ClientService & {
  services: Pick<Service, 'name' | 'manages_social'> | null
  owner: { full_name: string | null, email: string } | null
  manager: { full_name: string | null, email: string } | null
  client_service_stages: Array<{ stage: ServiceStage, position: number, completed_at: string | null }>
}

// La RLS deja a todo el staff leer los servicios contratados; el filtro por
// responsable es una comodidad para el tutor, no una medida de seguridad.
const onlyMine = ref(false);

const { data: items, status } = await useAsyncData<Contracted[]>('contracted-services', async () => {
  const { data, error } = await client
    .from('client_services')
    .select(`
      *,
      services(name, manages_social),
      owner:profiles!client_services_client_id_fkey(full_name, email),
      manager:profiles!client_services_manager_id_fkey(full_name, email),
      client_service_stages(stage, position, completed_at)
    `)
    .order('starts_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as Contracted[];
});

// Un tutor entra viendo sólo lo suyo, que es lo que puede firmar; el
// superusuario entra viendo todo.
onMounted(() => {
  onlyMine.value = !isSuperuser.value;
});

const rows = computed(() => {
  const all = items.value ?? [];
  if (!onlyMine.value || !userId.value) return all;
  return all.filter(item => item.manager_id === userId.value);
});

const progressOf = (item: Contracted) => {
  const total = item.client_service_stages?.length ?? 0;
  if (!total) return { completed: 0, total: 0, percent: 0 };

  const completed = item.client_service_stages.filter(s => s.completed_at).length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
};

const currentStageOf = (item: Contracted) => {
  const pending = [...(item.client_service_stages ?? [])]
    .sort((a, b) => a.position - b.position)
    .find(s => !s.completed_at);

  return pending ? SERVICE_STAGE_LABELS[pending.stage] : 'Completado';
};

const person = (value: { full_name: string | null, email: string } | null) =>
  value?.full_name || value?.email || 'Sin asignar';

const columns: TableColumn<Contracted>[] = [
  {
    id: 'service',
    header: 'Servicio',
    cell: ({ row }) => h('div', { class: 'flex flex-col' }, [
      h('span', { class: 'font-medium' }, row.original.services?.name ?? 'Servicio'),
      h('span', { class: 'text-xs text-muted' }, person(row.original.owner)),
    ]),
  },
  {
    id: 'manager',
    header: 'Responsable',
    cell: ({ row }) => person(row.original.manager),
  },
  {
    id: 'payment',
    header: 'Pago',
    cell: ({ row }) => h(
      UBadge,
      {
        color: PAYMENT_STATUS_COLORS[row.original.payment_status],
        variant: 'subtle',
        icon: PAYMENT_STATUS_ICONS[row.original.payment_status],
      },
      () => PAYMENT_STATUS_LABELS[row.original.payment_status],
    ),
  },
  {
    id: 'stage',
    header: 'Etapa actual',
    cell: ({ row }) => h(
      UBadge,
      { color: currentStageOf(row.original) === 'Completado' ? 'success' : 'primary', variant: 'subtle' },
      () => currentStageOf(row.original),
    ),
  },
  {
    id: 'progress',
    header: 'Avance',
    cell: ({ row }) => {
      const { completed, total, percent } = progressOf(row.original);
      return h('div', { class: 'flex min-w-32 flex-col gap-1' }, [
        h(UProgress, { modelValue: percent, size: 'sm' }),
        h('span', { class: 'text-xs text-muted' }, `${completed} / ${total} etapas`),
      ]);
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => h('div', { class: 'flex justify-end' }, [
      h(UButton, {
        to: localePath(`/dashboard/mis-servicios/${row.original.id}`),
        icon: 'i-lucide-route',
        label: 'Trazabilidad',
        color: 'neutral',
        variant: 'outline',
        size: 'xs',
      }),
    ]),
  },
];
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Servicios contratados</h1>
        <p class="mt-1 text-muted">Estado y trazabilidad de cada servicio en curso.</p>
      </div>

      <USwitch v-model="onlyMine" label="Sólo los que gestiono" />
    </div>

    <UCard>
      <UTable
        :data="rows"
        :columns="columns"
        :loading="status === 'pending'"
        empty="No hay servicios contratados"
      />
    </UCard>
  </div>
</template>
