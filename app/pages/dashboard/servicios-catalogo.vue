<script setup lang="ts">
import type { Database, Service, SocialNetwork } from '~/types/db';

// Abierta a todo el que pueda referir. La RLS de `services` sólo deja ver los
// activos a quien no es del equipo, así que nadie ve un servicio retirado.
definePageMeta({
  middleware: 'role',
  roles: ['afiliado', 'cliente', 'alumno', 'superusuario', 'tutor'],
});

const client = useSupabaseClient<Database>();

const { data: services, status } = await useAsyncData<Service[]>('catalog-services', async () => {
  const { data, error } = await client
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) throw error;
  return data ?? [];
});

/**
 * Servicios contratados gracias a este afiliado.
 *
 * Va por RPC y no por consulta directa: la RLS de `client_services` no deja al
 * afiliado leer contratos ajenos, y la función devuelve sólo lo que le
 * concierne, sin ningún dato del cliente.
 */
const { data: referred, status: referredStatus } = await useAsyncData('referred-services', async () => {
  const { data, error } = await client.rpc('get_referred_services');
  if (error) throw error;
  return data ?? [];
});

const activeReferred = computed(() =>
  (referred.value ?? []).filter(item => item.service_status === 'activo'),
);

const money = (value: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

const date = (value: string) => new Date(value).toLocaleDateString('es-CO', { dateStyle: 'medium' });

/** Comisión que deja un servicio del catálogo, para no obligar a calcularla. */
const commissionOf = (service: Service) =>
  Number(service.price) * Number(service.commission_rate);

const includedOf = (service: Service) => {
  const hours = Number(service.shooting_hours);

  return [
    service.video_count ? { icon: 'i-lucide-video', text: `${service.video_count} video${service.video_count === 1 ? '' : 's'}` } : null,
    service.image_count ? { icon: 'i-lucide-image', text: `${service.image_count} imagen${service.image_count === 1 ? '' : 'es'}` } : null,
    service.carousel_count ? { icon: 'i-lucide-gallery-horizontal-end', text: `${service.carousel_count} carrusel${service.carousel_count === 1 ? '' : 'es'}` } : null,
    hours ? { icon: 'i-lucide-clapperboard', text: `${hours} h de rodaje` } : null,
  ].filter(Boolean) as Array<{ icon: string, text: string }>;
};

const statusColor = (value: string) =>
  value === 'activo' ? 'success' : value === 'finalizado' ? 'neutral' : 'error';
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">Servicios</h1>
      <p class="mt-1 text-muted">
        Todo lo que puedes ofrecer con tu código de referido, y lo que ya has generado.
      </p>
    </div>

    <!-- Servicios activos referidos -->
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-lg font-semibold text-highlighted">Servicios que has referido</h2>
        <UBadge v-if="activeReferred.length" color="success" variant="subtle">
          {{ activeReferred.length }} {{ activeReferred.length === 1 ? 'activo' : 'activos' }}
        </UBadge>
      </div>

      <div v-if="referredStatus === 'pending'" class="space-y-3">
        <USkeleton v-for="i in 2" :key="i" class="h-20" />
      </div>

      <UAlert
        v-else-if="!referred?.length"
        icon="i-lucide-share-2"
        color="neutral"
        variant="subtle"
        title="Todavía no has referido ningún servicio"
        description="Comparte tu enlace: cuando alguien se registre con él y contrate un servicio, aparecerá aquí."
      />

      <div v-else class="grid gap-4 md:grid-cols-2">
        <UCard v-for="item in referred" :key="item.earning_id">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="font-semibold text-highlighted">{{ item.service_name }}</h3>
              <p class="mt-0.5 text-xs text-muted">
                Desde el {{ date(item.starts_at) }}
              </p>
            </div>
            <UBadge :color="statusColor(item.service_status)" variant="subtle" size="sm">
              {{ item.service_status }}
            </UBadge>
          </div>

          <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt class="text-muted">Tu comisión</dt>
              <dd class="font-semibold text-primary">
                {{ money(Number(item.commission_amount), item.currency) }}
              </dd>
            </div>
            <div>
              <dt class="text-muted">Estado de pago</dt>
              <dd>
                <UBadge
                  :color="PAYMENT_STATUS_COLORS[item.payment_status]"
                  variant="subtle"
                  size="sm"
                >
                  {{ PAYMENT_STATUS_LABELS[item.payment_status] }}
                </UBadge>
              </dd>
            </div>
          </dl>

          <div class="mt-4">
            <div class="flex items-center justify-between text-xs text-muted">
              <span>Avance del servicio</span>
              <span>{{ item.completed_stages }} / {{ item.total_stages }} etapas</span>
            </div>
            <UProgress
              class="mt-1.5"
              size="sm"
              :model-value="item.total_stages
                ? Math.round((Number(item.completed_stages) / Number(item.total_stages)) * 100)
                : 0"
            />
          </div>

          <UAlert
            v-if="item.commission_status === 'pendiente'"
            icon="i-lucide-lock"
            color="neutral"
            variant="subtle"
            class="mt-4"
            :ui="{ description: 'text-xs' }"
            description="Tu comisión se liberará cuando el servicio esté pagado y con toda su trazabilidad cumplida."
          />
          <UAlert
            v-else-if="item.commission_status === 'aprobado'"
            icon="i-lucide-circle-check-big"
            color="success"
            variant="subtle"
            class="mt-4"
            :ui="{ description: 'text-xs' }"
            description="Comisión liberada: ya puedes solicitar su retiro."
          />
        </UCard>
      </div>
    </section>

    <USeparator />

    <!-- Catálogo -->
    <section class="space-y-4">
      <div>
        <h2 class="text-lg font-semibold text-highlighted">Catálogo</h2>
        <p class="mt-0.5 text-sm text-muted">
          Lo que puedes ofrecer, con lo que incluye cada paquete y lo que ganas por él.
        </p>
      </div>

      <div v-if="status === 'pending'" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="i in 3" :key="i" class="h-64" />
      </div>

      <UAlert
        v-else-if="!services?.length"
        icon="i-lucide-package"
        color="neutral"
        variant="subtle"
        title="No hay servicios disponibles"
        description="Cuando se publique un servicio aparecerá aquí."
      />

      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UCard v-for="service in services" :key="service.id" class="flex flex-col">
          <template #header>
            <h3 class="font-semibold text-highlighted">{{ service.name }}</h3>
            <p v-if="service.description" class="mt-1 text-sm text-muted">
              {{ service.description }}
            </p>
          </template>

          <p class="text-2xl font-bold text-highlighted">
            {{ money(service.price, service.currency) }}
          </p>

          <ul v-if="includedOf(service).length" class="mt-4 space-y-2">
            <li
              v-for="item in includedOf(service)"
              :key="item.text"
              class="flex items-center gap-2 text-sm text-toned"
            >
              <UIcon :name="item.icon" class="size-4 shrink-0 text-primary" />
              {{ item.text }}
            </li>
          </ul>

          <div v-if="service.manages_social" class="mt-4">
            <p class="text-xs uppercase tracking-wide text-muted">Publicamos en</p>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <UIcon
                v-for="network in (service.social_networks as SocialNetwork[])"
                :key="network"
                :name="SOCIAL_NETWORK_ICONS[network]"
                :title="SOCIAL_NETWORK_LABELS[network]"
                class="size-4 text-muted"
              />
            </div>
          </div>

          <template #footer>
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-xs uppercase tracking-wide text-muted">Tu comisión</p>
                <p class="font-bold text-primary">
                  {{ money(commissionOf(service), service.currency) }}
                </p>
              </div>
              <UBadge color="primary" variant="subtle">
                {{ (service.commission_rate * 100).toFixed(1) }} %
              </UBadge>
            </div>
          </template>
        </UCard>
      </div>
    </section>
  </div>
</template>
