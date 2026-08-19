<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui';
import { UBadge, UButton, UDropdownMenu } from '#components';
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

/* --- Alta de servicios en el catálogo --- */

const serviceSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Sólo minúsculas, números y guiones'),
  description: z.string().max(500).optional().or(z.literal('')),
  price: z.number().min(0),
  commission_rate: z.number().min(0).max(100),
});

type ServiceSchema = z.output<typeof serviceSchema>

const serviceState = reactive({ name: '', slug: '', description: '', price: 0, commission_rate: 10 });
const creating = ref(false);
const modalOpen = ref(false);

const createService = async (event: FormSubmitEvent<ServiceSchema>) => {
  creating.value = true;

  const { error } = await client.from('services').insert({
    name: event.data.name,
    slug: event.data.slug,
    description: event.data.description || null,
    price: event.data.price,
    commission_rate: event.data.commission_rate / 100,
  });

  creating.value = false;

  if (error) {
    toast.add({ title: 'No se pudo crear el servicio', description: error.message, color: 'error' });
    return;
  }

  Object.assign(serviceState, { name: '', slug: '', description: '', price: 0, commission_rate: 10 });
  modalOpen.value = false;
  toast.add({ title: 'Servicio creado', color: 'success' });
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
});

type AssignSchema = z.output<typeof assignSchema>

const assignState = reactive({ client_id: '', service_id: '', amount: 0 });
const assigning = ref(false);

// Al insertar aquí, el trigger `accrue_referral_earning` calcula y registra la
// comisión del referente del cliente, si lo tiene.
const assignService = async (event: FormSubmitEvent<AssignSchema>) => {
  assigning.value = true;

  const { error } = await client.from('client_services').insert({
    client_id: event.data.client_id,
    service_id: event.data.service_id,
    amount: event.data.amount,
  });

  assigning.value = false;

  if (error) {
    toast.add({ title: 'No se pudo asignar', description: error.message, color: 'error' });
    return;
  }

  Object.assign(assignState, { client_id: '', service_id: '', amount: 0 });
  toast.add({ title: 'Servicio asignado', color: 'success' });
};

const clientOptions = computed(() =>
  (clients.value ?? []).map(c => ({ label: c.full_name || c.email, value: c.id })),
);

const serviceOptions = computed(() =>
  (services.value ?? []).filter(s => s.is_active).map(s => ({ label: s.name, value: s.id })),
);

watch(() => assignState.service_id, (id) => {
  const found = (services.value ?? []).find(s => s.id === id);
  if (found) assignState.amount = Number(found.price);
});

const columns: TableColumn<Service>[] = [
  { accessorKey: 'name', header: 'Servicio' },
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

      <UModal v-model:open="modalOpen" title="Nuevo servicio">
        <UButton icon="i-lucide-plus" label="Nuevo servicio" />

        <template #body>
          <UForm :schema="serviceSchema" :state="serviceState" class="space-y-4" @submit="createService">
            <UFormField label="Nombre" name="name" required>
              <UInput v-model="serviceState.name" class="w-full" />
            </UFormField>

            <UFormField label="Slug" name="slug" required>
              <UInput v-model="serviceState.slug" class="w-full" placeholder="video-corporativo" />
            </UFormField>

            <UFormField label="Descripción" name="description">
              <UTextarea v-model="serviceState.description" class="w-full" />
            </UFormField>

            <UFormField label="Precio (COP)" name="price" required>
              <UInputNumber v-model="serviceState.price" :min="0" class="w-full" />
            </UFormField>

            <UFormField label="Comisión por referido (%)" name="commission_rate" required>
              <UInputNumber v-model="serviceState.commission_rate" :min="0" :max="100" class="w-full" />
            </UFormField>

            <UButton type="submit" label="Crear servicio" :loading="creating" />
          </UForm>
        </template>
      </UModal>
    </div>

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
            class="w-full"
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
