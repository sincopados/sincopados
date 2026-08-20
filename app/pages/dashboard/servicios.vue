<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui';
import { UBadge, UButton, UDropdownMenu, UIcon } from '#components';
import type { Database, Profile, Service, SocialNetwork } from '~/types/db';

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

/* --- Alta de servicios en el catálogo --- */

// El slug ya no se escribe: se deriva del nombre, así que no entra en el esquema.
const serviceSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  description: z.string().max(500).optional().or(z.literal('')),
  price: z.number().min(0),
  commission_rate: z.number().min(0).max(100),
  video_count: z.number().int().min(0).max(999),
  image_count: z.number().int().min(0).max(999),
  carousel_count: z.number().int().min(0).max(999),
  shooting_hours: z.number().min(0).max(9999),
  manages_social: z.boolean(),
  social_networks: z.array(z.enum(SOCIAL_NETWORKS)),
});

type ServiceSchema = z.output<typeof serviceSchema>

const emptyService = () => ({
  name: '',
  description: '',
  price: 0,
  commission_rate: 10,
  video_count: 0,
  image_count: 0,
  carousel_count: 0,
  shooting_hours: 0,
  manages_social: false,
  social_networks: [] as SocialNetwork[],
});

const serviceState = reactive(emptyService());
const creating = ref(false);
const modalOpen = ref(false);

// El slug se deriva del nombre en vivo; se muestra sólo para que se vea qué se
// va a guardar. La unicidad la garantiza el índice de Postgres, no esto.
const derivedSlug = computed(() => slugify(serviceState.name));

const toggleNetwork = (network: SocialNetwork) => {
  const current = serviceState.social_networks;
  serviceState.social_networks = current.includes(network)
    ? current.filter(n => n !== network)
    : [...current, network];
};

// Apagar el manejo de redes limpia la selección: la base de datos rechaza la
// combinación incoherente con un CHECK, así que conviene no llegar a enviarla.
watch(() => serviceState.manages_social, (enabled) => {
  if (!enabled) serviceState.social_networks = [];
});

const createService = async (event: FormSubmitEvent<ServiceSchema>) => {
  creating.value = true;

  const { error } = await client.from('services').insert({
    name: event.data.name,
    slug: derivedSlug.value,
    description: event.data.description || null,
    price: event.data.price,
    commission_rate: event.data.commission_rate / 100,
    video_count: event.data.video_count,
    image_count: event.data.image_count,
    carousel_count: event.data.carousel_count,
    shooting_hours: event.data.shooting_hours,
    manages_social: event.data.manages_social,
    social_networks: event.data.manages_social ? event.data.social_networks : [],
  });

  creating.value = false;

  if (error) {
    // Con el slug automático, un choque de clave única significa que ya existe
    // un servicio con ese mismo nombre.
    toast.add({
      title: 'No se pudo crear el servicio',
      description: error.code === '23505'
        ? `Ya existe un servicio llamado "${event.data.name}".`
        : error.message,
      color: 'error',
    });
    return;
  }

  Object.assign(serviceState, emptyService());
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

const clientOptions = computed(() =>
  (clients.value ?? []).map(c => ({ label: c.full_name || c.email, value: c.id })),
);

const serviceOptions = computed(() =>
  (services.value ?? []).filter(s => s.is_active).map(s => ({ label: s.name, value: s.id })),
);

const managerOptions = computed(() =>
  (managers.value ?? []).map(m => ({
    label: `${m.full_name || m.email} · ${ROLE_LABELS[m.role]}`,
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
          <UForm :schema="serviceSchema" :state="serviceState" class="space-y-5" @submit="createService">
            <div class="space-y-4">
              <UFormField label="Nombre" name="name" required>
                <UInput v-model="serviceState.name" class="w-full" placeholder="4 Videos TikTok" />
              </UFormField>

              <UFormField
                label="Identificador"
                help="Se genera solo a partir del nombre."
              >
                <UInput
                  :model-value="derivedSlug"
                  disabled
                  class="w-full font-mono"
                  placeholder="se-genera-del-nombre"
                />
              </UFormField>

              <UFormField label="Descripción" name="description">
                <UTextarea v-model="serviceState.description" class="w-full" :rows="3" />
              </UFormField>
            </div>

            <USeparator label="Qué incluye" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Número de videos" name="video_count">
                <UInputNumber v-model="serviceState.video_count" :min="0" class="w-full" />
              </UFormField>

              <UFormField label="Número de imágenes" name="image_count">
                <UInputNumber v-model="serviceState.image_count" :min="0" class="w-full" />
              </UFormField>

              <UFormField label="Número de carruseles" name="carousel_count">
                <UInputNumber v-model="serviceState.carousel_count" :min="0" class="w-full" />
              </UFormField>

              <UFormField label="Horas de rodaje" name="shooting_hours">
                <UInputNumber v-model="serviceState.shooting_hours" :min="0" :step="0.5" class="w-full" />
              </UFormField>
            </div>

            <USeparator label="Redes sociales" />

            <UFormField name="manages_social">
              <USwitch
                v-model="serviceState.manages_social"
                label="Incluye manejo de redes"
                :description="serviceState.manages_social
                  ? 'Elige en cuáles se publica.'
                  : 'Actívalo para elegir las redes incluidas.'"
              />
            </UFormField>

            <UFormField v-if="serviceState.manages_social" name="social_networks">
              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="network in SOCIAL_NETWORKS"
                  :key="network"
                  :icon="SOCIAL_NETWORK_ICONS[network]"
                  :label="SOCIAL_NETWORK_LABELS[network]"
                  :color="serviceState.social_networks.includes(network) ? 'primary' : 'neutral'"
                  :variant="serviceState.social_networks.includes(network) ? 'solid' : 'outline'"
                  size="sm"
                  :aria-pressed="serviceState.social_networks.includes(network)"
                  @click="toggleNetwork(network)"
                />
              </div>
            </UFormField>

            <USeparator label="Precio" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Precio (COP)" name="price" required>
                <UInputNumber v-model="serviceState.price" :min="0" class="w-full" />
              </UFormField>

              <UFormField label="Comisión por referido (%)" name="commission_rate" required>
                <UInputNumber v-model="serviceState.commission_rate" :min="0" :max="100" class="w-full" />
              </UFormField>
            </div>

            <UButton type="submit" label="Crear servicio" :loading="creating" block />
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

        <UFormField label="Responsable" name="manager_id">
          <USelectMenu
            v-model="assignState.manager_id"
            :items="managerOptions"
            value-key="value"
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
