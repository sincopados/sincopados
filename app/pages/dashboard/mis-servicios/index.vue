<script setup lang="ts">
import type { Database, ClientService, Service } from '~/types/db';

definePageMeta({
  middleware: 'role',
  roles: ['cliente'],
});

const client = useSupabaseClient<Database>();
const userId = useAuthUserId();

type Acquired = ClientService & {
  services: Pick<Service, 'name' | 'description' | 'slug' | 'manages_social'> | null
}

// La RLS ya limita la consulta a `client_id = auth.uid()`; el filtro explícito
// mantiene el índice en uso y hace evidente la intención.
const { data: items, status } = await useAsyncData<Acquired[]>('my-services', async () => {
  if (!userId.value) return [];

  const { data, error } = await client
    .from('client_services')
    .select('*, services(name, description, slug, manages_social)')
    .eq('client_id', userId.value)
    .order('starts_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as Acquired[];
}, { watch: [userId] });

const money = (value: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

const localePath = useLocalePath();
const open = (id: string) => navigateTo(localePath(`/dashboard/mis-servicios/${id}`));

const statusColor = (value: ClientService['status']) =>
  value === 'activo' ? 'success' : value === 'finalizado' ? 'neutral' : 'error';
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">Mis servicios</h1>
      <p class="mt-1 text-muted">Servicios que has adquirido con nosotros.</p>
    </div>

    <div v-if="status === 'pending'" class="grid gap-4 md:grid-cols-2">
      <USkeleton v-for="i in 4" :key="i" class="h-32" />
    </div>

    <UAlert
      v-else-if="!items?.length"
      icon="i-lucide-package"
      color="neutral"
      variant="subtle"
      title="Todavía no tienes servicios"
      description="Cuando contrates un servicio aparecerá aquí."
    />

    <div v-else class="grid gap-4 md:grid-cols-2">
      <UCard
        v-for="item in items"
        :key="item.id"
        class="cursor-pointer transition-shadow hover:ring-2 hover:ring-primary/40"
        role="link"
        tabindex="0"
        @click="open(item.id)"
        @keydown.enter="open(item.id)"
        @keydown.space.prevent="open(item.id)"
      >
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <h2 class="font-semibold">{{ item.services?.name ?? 'Servicio' }}</h2>
            <UBadge :color="statusColor(item.status)" variant="subtle">{{ item.status }}</UBadge>
          </div>
        </template>

        <p v-if="item.services?.description" class="text-sm text-muted">
          {{ item.services.description }}
        </p>

        <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-muted">Valor</dt>
            <dd class="font-medium">{{ money(item.amount, item.currency) }}</dd>
          </div>
          <div>
            <dt class="text-muted">Inicio</dt>
            <dd class="font-medium">{{ new Date(item.starts_at).toLocaleDateString('es-CO') }}</dd>
          </div>
          <div v-if="item.ends_at">
            <dt class="text-muted">Finaliza</dt>
            <dd class="font-medium">{{ new Date(item.ends_at).toLocaleDateString('es-CO') }}</dd>
          </div>
        </dl>

        <template #footer>
          <div class="flex items-center justify-between gap-3 text-sm">
            <span class="text-muted">
              {{ (item.services?.manages_social ? SERVICE_STAGES : BASE_SERVICE_STAGES).length }} etapas de seguimiento
            </span>
            <span class="flex items-center gap-1 font-medium text-primary">
              Ver trazabilidad
              <UIcon name="i-lucide-arrow-right" class="size-4" />
            </span>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
