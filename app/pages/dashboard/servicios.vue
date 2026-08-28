<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui';
import { UBadge, UButton, UDropdownMenu, UIcon } from '#components';
import type { Database, Profile, Service } from '~/types/db';

definePageMeta({
  middleware: 'role',
  roles: ['superusuario'],
});

const client = useSupabaseClient<Database>();
const toast = useToast();

const money = (value: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

const { data: services, status, refresh } = await useAsyncData<Service[]>('services', async () => {
  const { data, error } = await client.from('services').select('*').order('name');
  if (error) throw error;
  return data ?? [];
});

const { data: clients } = await useAsyncData<Profile[]>('clients', async () => {
  const { data, error } = await client.from('profiles').select('*').eq('role', 'cliente').order('full_name');
  if (error) throw error;
  return data ?? [];
});

// Responsables posibles: el equipo interno. La RLS acota lo que cada quien ve,
// así que un tutor no encontrará superusuarios en esta lista.
const { data: managers } = await useAsyncData<Profile[]>('managers', async () => {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .in('role', ['superusuario', 'tutor'])
    .order('full_name');
  if (error) throw error;
  return data ?? [];
});

/* --- Alta y edición de servicios en el catálogo --- */

// El esquema, el estado y la traducción a columnas viven en `useServiceForm`,
// compartidos con el formulario que renderiza ambos modales.
const serviceInitial = ref(emptyServiceForm());
const creating = ref(false);
const modalOpen = ref(false);

// Servicio en edición. `null` significa que el modal de edición está cerrado.
const editing = ref<Service | null>(null);
const editInitial = ref(emptyServiceForm());
const saving = ref(false);

const editModalOpen = computed({
  get: () => editing.value !== null,
  set: (open: boolean) => {
    if (!open) editing.value = null;
  },
});

/** Un choque de clave única sólo puede venir del slug, derivado del nombre. */
const duplicateNameError = (name: string) => `Ya existe un servicio llamado "${name}".`;

const openEditor = (service: Service) => {
  editInitial.value = serviceToForm(service);
  editing.value = service;
};

// Nombre del servicio que se está duplicando; `null` cuando el modal de alta
// se abrió en blanco. Sirve sólo para titular el modal.
const duplicating = ref<string | null>(null);

/**
 * Duplicar abre el alta precargada en vez de insertar una copia a ciegas: el
 * slug se deriva del nombre y debe ser único, así que hay que cambiarlo antes
 * de guardar. El sufijo «(copia)» deja el formulario listo para enviar.
 */
const duplicateService = (service: Service) => {
  serviceInitial.value = { ...serviceToForm(service), name: `${service.name} (copia)` };
  duplicating.value = service.name;
  modalOpen.value = true;
};

// Cerrar el modal deja de ser una duplicación: la próxima apertura desde el
// botón «Nuevo servicio» debe partir en blanco.
watch(modalOpen, (open) => {
  if (open) return;

  duplicating.value = null;
  serviceInitial.value = emptyServiceForm();
});

const createService = async (event: FormSubmitEvent<ServiceSchema>) => {
  creating.value = true;

  const { error } = await client.from('services').insert(formToService(event.data));

  creating.value = false;

  if (error) {
    toast.add({
      title: 'No se pudo crear el servicio',
      description: error.code === '23505' ? duplicateNameError(event.data.name) : error.message,
      color: 'error',
    });
    return;
  }

  serviceInitial.value = emptyServiceForm();
  modalOpen.value = false;
  toast.add({ title: 'Servicio creado', color: 'success' });
  await refresh();
};

const updateService = async (event: FormSubmitEvent<ServiceSchema>) => {
  const target = editing.value;
  if (!target) return;

  saving.value = true;

  const { error } = await client
    .from('services')
    .update(formToService(event.data))
    .eq('id', target.id);

  saving.value = false;

  if (error) {
    toast.add({
      title: 'No se pudo actualizar el servicio',
      description: error.code === '23505' ? duplicateNameError(event.data.name) : error.message,
      color: 'error',
    });
    return;
  }

  editing.value = null;
  toast.add({ title: 'Servicio actualizado', color: 'success' });
  await refresh();
};

const toggleActive = async (service: Service) => {
  const { error } = await client.from('services').update({ is_active: !service.is_active }).eq('id', service.id);

  if (error) {
    toast.add({ title: 'No se pudo actualizar', description: error.message, color: 'error' });
    return;
  }

  await refresh();
};

const removeService = async (service: Service) => {
  if (!confirm(`¿Eliminar el servicio "${service.name}"?`)) return;

  const { error } = await client.from('services').delete().eq('id', service.id);

  if (error) {
    toast.add({
      title: 'No se pudo eliminar',
      description: 'Probablemente hay clientes con este servicio contratado.',
      color: 'error',
    });
    return;
  }

  await refresh();
};

/* --- Asignación de un servicio a un cliente --- */

const assignSchema = z.object({
  client_id: z.uuid('Selecciona un cliente'),
  service_id: z.uuid('Selecciona un servicio'),
  amount: z.number().min(0),
  manager_id: z.uuid('Selecciona un responsable').optional().or(z.literal('')),
  starts_at: z.string().min(1, 'Indica la fecha de inicio'),
  ends_at: z.string().optional().or(z.literal('')),
}).refine(data => !data.ends_at || data.ends_at >= data.starts_at, {
  message: 'La fecha de finalización no puede ser anterior al inicio',
  path: ['ends_at'],
});

type AssignSchema = z.output<typeof assignSchema>

const today = new Date().toISOString().slice(0, 10);

const emptyAssign = () => ({
  client_id: '',
  service_id: '',
  amount: 0,
  manager_id: '',
  starts_at: today,
  ends_at: '',
});

const assignState = reactive(emptyAssign());
const assigning = ref(false);

// Al insertar aquí, el trigger `accrue_referral_earning` calcula y registra la
// comisión del referente del cliente, si lo tiene.
const assignService = async (event: FormSubmitEvent<AssignSchema>) => {
  assigning.value = true;

  const { error } = await client.from('client_services').insert({
    client_id: event.data.client_id,
    service_id: event.data.service_id,
    amount: event.data.amount,
    manager_id: event.data.manager_id || null,
    starts_at: new Date(event.data.starts_at).toISOString(),
    ends_at: event.data.ends_at ? new Date(event.data.ends_at).toISOString() : null,
  });

  assigning.value = false;

  if (error) {
    toast.add({ title: 'No se pudo asignar', description: error.message, color: 'error' });
    return;
  }

  Object.assign(assignState, emptyAssign());
  toast.add({ title: 'Servicio asignado', color: 'success' });
};

// El correo va en `description` y no pegado al nombre: se ve como subtítulo en
// la lista, y `filter-fields` lo hace buscable sin ensuciar la etiqueta.
const clientOptions = computed(() =>
  (clients.value ?? []).map(c => ({
    label: c.full_name || c.email,
    description: c.email,
    value: c.id,
  })),
);

const serviceOptions = computed(() =>
  (services.value ?? []).filter(s => s.is_active).map(s => ({ label: s.name, value: s.id })),
);

const managerOptions = computed(() =>
  (managers.value ?? []).map(m => ({
    label: `${m.full_name || m.email} · ${ROLE_LABELS[m.role]}`,
    description: m.email,
    value: m.id,
  })),
);

/** Resumen legible de lo que incluye un servicio, para la tabla del catálogo. */
const packageSummary = (service: Service) => {
  const parts = [
    service.video_count ? `${service.video_count} video${service.video_count === 1 ? '' : 's'}` : null,
    service.image_count ? `${service.image_count} imagen${service.image_count === 1 ? '' : 'es'}` : null,
    service.carousel_count ? `${service.carousel_count} carrusel${service.carousel_count === 1 ? '' : 'es'}` : null,
    Number(service.shooting_hours) ? `${Number(service.shooting_hours)} h de rodaje` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(' · ') : '—';
};

watch(() => assignState.service_id, (id) => {
  const found = (services.value ?? []).find(s => s.id === id);
  if (found) assignState.amount = Number(found.price);
});

const columns: TableColumn<Service>[] = [
  { accessorKey: 'name', header: 'Servicio' },
  {
    id: 'package',
    header: 'Incluye',
    cell: ({ row }) => h('div', { class: 'flex flex-col gap-1' }, [
      h('span', { class: 'text-sm' }, packageSummary(row.original)),
      row.original.manages_social
        ? h('div', { class: 'flex items-center gap-1' },
            row.original.social_networks.map(n => h(UIcon, {
              key: n,
              name: SOCIAL_NETWORK_ICONS[n],
              class: 'size-4 text-muted',
              title: SOCIAL_NETWORK_LABELS[n],
            })))
        : null,
    ]),
  },
  { accessorKey: 'price', header: 'Precio', cell: ({ row }) => money(row.original.price, row.original.currency) },
  {
    accessorKey: 'commission_rate',
    header: 'Comisión referido',
    cell: ({ row }) => `${(row.original.commission_rate * 100).toFixed(1)} %`,
  },
  {
    accessorKey: 'is_active',
    header: 'Estado',
    cell: ({ row }) => h(
      UBadge,
      { color: row.original.is_active ? 'success' : 'neutral', variant: 'subtle' },
      () => (row.original.is_active ? 'Activo' : 'Inactivo'),
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => h('div', { class: 'flex justify-end' }, [
      h(UDropdownMenu, {
        items: [[
          {
            label: 'Editar',
            icon: 'i-lucide-pencil',
            onSelect: () => openEditor(row.original),
          },
          {
            label: 'Duplicar',
            icon: 'i-lucide-copy',
            onSelect: () => duplicateService(row.original),
          },
          {
            label: row.original.is_active ? 'Desactivar' : 'Activar',
            icon: row.original.is_active ? 'i-lucide-eye-off' : 'i-lucide-eye',
            onSelect: () => toggleActive(row.original),
          },
          {
            label: 'Eliminar',
            icon: 'i-lucide-trash-2',
            color: 'error' as const,
            onSelect: () => removeService(row.original),
          },
        ]],
        content: { align: 'end' },
      }, {
        default: () => h(UButton, {
          icon: 'i-lucide-ellipsis-vertical',
          color: 'neutral',
          variant: 'ghost',
          square: true,
        }),
      }),
    ]),
  },
];
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Servicios</h1>
        <p class="mt-1 text-muted">Catálogo de servicios y asignación a clientes.</p>
      </div>

      <UModal v-model:open="modalOpen" :title="duplicating ? `Duplicar «${duplicating}»` : 'Nuevo servicio'">
        <UButton icon="i-lucide-plus" label="Nuevo servicio" />

        <template #body>
          <DashboardServiceForm
            :initial="serviceInitial"
            :loading="creating"
            submit-label="Crear servicio"
            @submit="createService"
          />
        </template>
      </UModal>
    </div>

    <UModal v-model:open="editModalOpen" :title="`Editar ${editing?.name ?? 'servicio'}`">
      <template #body>
        <DashboardServiceForm
          :initial="editInitial"
          :loading="saving"
          submit-label="Guardar cambios"
          @submit="updateService"
        />
      </template>
    </UModal>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Catálogo</h2>
      </template>

      <UTable
        :data="services ?? []"
        :columns="columns"
        :loading="status === 'pending'"
        empty="Aún no hay servicios"
      />
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Asignar servicio a un cliente</h2>
      </template>

      <UForm :schema="assignSchema" :state="assignState" class="grid gap-4 md:grid-cols-3" @submit="assignService">
        <UFormField label="Cliente" name="client_id" required>
          <USelectMenu
            v-model="assignState.client_id"
            :items="clientOptions"
            value-key="value"
            :filter-fields="['label', 'description']"
            :search-input="{ placeholder: 'Busca por nombre o correo…' }"
            class="w-full"
            placeholder="Selecciona un cliente"
          />
        </UFormField>

        <UFormField label="Servicio" name="service_id" required>
          <USelectMenu
            v-model="assignState.service_id"
            :items="serviceOptions"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Responsable" name="manager_id">
          <USelectMenu
            v-model="assignState.manager_id"
            :items="managerOptions"
            value-key="value"
            :filter-fields="['label', 'description']"
            :search-input="{ placeholder: 'Busca por nombre o correo…' }"
            class="w-full"
            placeholder="Sin asignar"
          />
        </UFormField>

        <UFormField label="Fecha de inicio" name="starts_at" required>
          <UInput v-model="assignState.starts_at" type="date" class="w-full" />
        </UFormField>

        <UFormField label="Fecha de finalización" name="ends_at">
          <UInput v-model="assignState.ends_at" type="date" class="w-full" />
        </UFormField>

        <UFormField label="Valor cobrado" name="amount" required>
          <UInputNumber v-model="assignState.amount" :min="0" class="w-full" />
        </UFormField>

        <div class="md:col-span-3">
          <UButton type="submit" label="Asignar servicio" :loading="assigning" />
        </div>
      </UForm>
    </UCard>
  </div>
</template>
