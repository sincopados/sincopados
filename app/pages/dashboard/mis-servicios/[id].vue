<script setup lang="ts">
import type { Database, ClientService, Service, PaymentStatus } from '~/types/db';
import type { RecordedPayment, NewPayment } from '~/composables/useServicePayments';

// El cliente entra desde «Mis servicios»; el equipo, desde «Servicios
// contratados». La RLS decide qué filas devuelve la consulta en cada caso.
definePageMeta({
  middleware: 'role',
  roles: ['cliente', 'superusuario', 'tutor'],
});

const route = useRoute();
const client = useSupabaseClient<Database>();
const userId = useAuthUserId();
const toast = useToast();
const { isSuperuser } = useProfile();

const serviceId = computed(() => String(route.params.id));

type PersonRef = { id: string, full_name: string | null, email: string } | null

type Detail = ClientService & {
  services: Service | null
  manager: PersonRef
  owner: PersonRef
}

const { data: item, status, refresh } = await useAsyncData<Detail | null>(
  () => `client-service-${serviceId.value}`,
  async () => {
    const { data, error } = await client
      .from('client_services')
      .select(`
        *,
        services(*),
        manager:profiles!client_services_manager_id_fkey(id, full_name, email),
        owner:profiles!client_services_client_id_fkey(id, full_name, email)
      `)
      .eq('id', serviceId.value)
      .maybeSingle();

    if (error) throw error;
    return (data ?? null) as unknown as Detail | null;
  },
  { watch: [serviceId] },
);

// La miga de pan se deriva de la ruta, así que sin esto mostraría el UUID.
const breadcrumbTitle = useBreadcrumbTitle();
watchEffect(() => {
  breadcrumbTitle.value = item.value?.services?.name ?? null;
});

const { stages, status: stagesStatus, toggle, saving, progress, completed, total, current, isFinished }
  = useServiceStages(serviceId);

const contractedAmount = computed(() => Number(item.value?.amount ?? 0));
const payments = useServicePayments(serviceId, contractedAmount);

/**
 * Espejo de `private.can_track_service()`. La base de datos vuelve a
 * comprobarlo en cada UPDATE: esto sólo evita mostrar botones que fallarían.
 */
const canTrack = computed(() =>
  isSuperuser.value || (!!userId.value && item.value?.manager_id === userId.value),
);

/** Los pagos son un hecho contable: sólo el superusuario los toca. */
const canBill = computed(() => isSuperuser.value);

const savingStatus = ref(false);

const setPaymentStatus = async (next: PaymentStatus) => {
  if (!item.value || next === item.value.payment_status) return;

  savingStatus.value = true;

  const { error } = await client
    .from('client_services')
    .update({ payment_status: next })
    .eq('id', serviceId.value);

  savingStatus.value = false;

  if (error) {
    toast.add({ title: 'No se pudo cambiar el estado de pago', description: error.message, color: 'error' });
    return;
  }

  toast.add({ title: `Estado de pago: ${PAYMENT_STATUS_LABELS[next]}`, color: 'success' });
  await refresh();
};

const addPayment = async (payment: NewPayment) => {
  await payments.add(payment);
};

const removePayment = async (payment: RecordedPayment) => {
  if (!confirm(`¿Eliminar el pago de ${money(Number(payment.amount), item.value?.currency)}?`)) return;
  await payments.remove(payment);
};

const money = (value: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

const date = (value: string) => new Date(value).toLocaleDateString('es-CO', { dateStyle: 'long' });

const statusColor = (value: ClientService['status']) =>
  value === 'activo' ? 'success' : value === 'finalizado' ? 'neutral' : 'error';

const personName = (person: PersonRef) => person?.full_name || person?.email || 'Sin asignar';
</script>

<template>
  <div class="space-y-6">
    <UButton
      to="/dashboard/mis-servicios"
      icon="i-lucide-arrow-left"
      label="Volver"
      color="neutral"
      variant="link"
      class="-ml-2"
    />

    <div v-if="status === 'pending'" class="space-y-4">
      <USkeleton class="h-24" />
      <USkeleton class="h-64" />
    </div>

    <UAlert
      v-else-if="!item"
      icon="i-lucide-search-x"
      color="neutral"
      variant="subtle"
      title="Servicio no encontrado"
      description="No existe, o no tienes permiso para verlo."
    />

    <template v-else>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-highlighted">
            {{ item.services?.name ?? 'Servicio' }}
          </h1>
          <p v-if="item.services?.description" class="mt-1 text-muted">
            {{ item.services.description }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UBadge
            :color="PAYMENT_STATUS_COLORS[item.payment_status]"
            variant="subtle"
            size="lg"
            :icon="PAYMENT_STATUS_ICONS[item.payment_status]"
          >
            {{ PAYMENT_STATUS_LABELS[item.payment_status] }}
          </UBadge>
          <UBadge :color="statusColor(item.status)" variant="subtle" size="lg">
            {{ item.status }}
          </UBadge>
        </div>
      </div>

      <!-- Resumen del contrato -->
      <UCard>
        <dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-user" class="mt-0.5 size-5 shrink-0 text-muted" />
            <div>
              <dt class="text-sm text-muted">Cliente</dt>
              <dd class="font-medium text-highlighted">{{ personName(item.owner) }}</dd>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-user-cog" class="mt-0.5 size-5 shrink-0 text-muted" />
            <div>
              <dt class="text-sm text-muted">Responsable</dt>
              <dd class="font-medium text-highlighted">{{ personName(item.manager) }}</dd>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-banknote" class="mt-0.5 size-5 shrink-0 text-muted" />
            <div>
              <dt class="text-sm text-muted">Valor</dt>
              <dd class="font-medium text-highlighted">{{ money(item.amount, item.currency) }}</dd>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-calendar-plus" class="mt-0.5 size-5 shrink-0 text-muted" />
            <div>
              <dt class="text-sm text-muted">Inicio</dt>
              <dd class="font-medium text-highlighted">{{ date(item.starts_at) }}</dd>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-calendar-check" class="mt-0.5 size-5 shrink-0 text-muted" />
            <div>
              <dt class="text-sm text-muted">Finaliza</dt>
              <dd class="font-medium text-highlighted">
                {{ item.ends_at ? date(item.ends_at) : 'Sin fecha' }}
              </dd>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon
              :name="PAYMENT_STATUS_ICONS[item.payment_status]"
              class="mt-0.5 size-5 shrink-0 text-muted"
            />
            <div>
              <dt class="text-sm text-muted">Estado de pago</dt>
              <dd class="font-medium text-highlighted">
                {{ PAYMENT_STATUS_DESCRIPTIONS[item.payment_status] }}
              </dd>
            </div>
          </div>
        </dl>

        <template v-if="canBill" #footer>
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-wide text-muted">Cambiar estado de pago</p>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="option in PAYMENT_STATUSES"
                :key="option"
                size="sm"
                :icon="PAYMENT_STATUS_ICONS[option]"
                :label="PAYMENT_STATUS_LABELS[option]"
                :color="item.payment_status === option ? PAYMENT_STATUS_COLORS[option] : 'neutral'"
                :variant="item.payment_status === option ? 'solid' : 'outline'"
                :disabled="savingStatus"
                :aria-pressed="item.payment_status === option"
                @click="setPaymentStatus(option)"
              />
            </div>
          </div>
        </template>
      </UCard>

      <!-- Qué incluye el paquete -->
      <DashboardServiceIncludes v-if="item.services" :service="item.services" />

      <!-- Pagos -->
      <DashboardServicePayments
        :payments="payments.payments.value ?? []"
        :currency="item.currency"
        :paid="payments.paid.value"
        :total="payments.total.value"
        :balance="payments.balance.value"
        :progress="payments.progress.value"
        :editable="canBill"
        :saving="payments.saving.value"
        :removing="payments.removing.value"
        :loading="payments.status.value === 'pending'"
        @add="addPayment"
        @remove="removePayment"
      />

      <!-- Trazabilidad -->
      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-highlighted">Trazabilidad del servicio</h2>
              <p class="mt-0.5 text-sm text-muted">
                <template v-if="isFinished">Todas las etapas están cumplidas.</template>
                <template v-else-if="current">
                  Etapa actual: <span class="font-medium text-toned">{{ SERVICE_STAGE_LABELS[current.stage] }}</span>
                </template>
                <template v-else>Aún no hay etapas registradas.</template>
              </p>
            </div>
            <UBadge color="neutral" variant="subtle" size="lg">
              {{ completed }} / {{ total }} etapas
            </UBadge>
          </div>
        </template>

        <UProgress v-if="total" :model-value="progress" class="mb-8" />

        <UAlert
          v-if="item.services?.manages_social"
          icon="i-lucide-share-2"
          color="info"
          variant="subtle"
          class="mb-6"
          title="Servicio con gestión de redes sociales"
          description="Además de las cinco etapas habituales, este servicio incluye publicación e informe."
        />

        <DashboardServiceTimeline
          :stages="stages ?? []"
          :current="current"
          :editable="canTrack"
          :saving="saving"
          :loading="stagesStatus === 'pending'"
          @toggle="toggle"
        />

        <template v-if="!canTrack" #footer>
          <p class="text-sm text-dimmed">
            Sólo el superusuario y el responsable asignado pueden marcar etapas.
          </p>
        </template>
      </UCard>
    </template>
  </div>
</template>
