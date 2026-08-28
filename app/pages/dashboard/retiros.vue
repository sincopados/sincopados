<script setup lang="ts">
import type { WithdrawalTicket } from '~/composables/useWithdrawals';
import type { WithdrawalStatus } from '~/types/db';

definePageMeta({
  middleware: 'role',
  roles: ['superusuario'],
});

const { tickets, pending, status, update, saving } = useWithdrawalTickets();

// Ticket abierto en el panel de resolución, con su borrador editable.
const active = ref<WithdrawalTicket | null>(null);
const draft = reactive({ eta_hours: DEFAULT_WITHDRAWAL_ETA_HOURS, admin_notes: '' });

const openTicket = (ticket: WithdrawalTicket) => {
  draft.eta_hours = ticket.eta_hours;
  draft.admin_notes = ticket.admin_notes ?? '';
  active.value = ticket;
};

const modalOpen = computed({
  get: () => active.value !== null,
  set: (open: boolean) => {
    if (!open) active.value = null;
  },
});

const resolve = async (next: WithdrawalStatus) => {
  const ticket = active.value;
  if (!ticket) return;

  await update(ticket, {
    status: next,
    eta_hours: draft.eta_hours,
    admin_notes: draft.admin_notes || null,
  });

  active.value = null;
};

/** Guarda el plazo sin resolver el ticket, para renegociar la fecha. */
const saveEta = async () => {
  const ticket = active.value;
  if (!ticket) return;

  await update(ticket, { eta_hours: draft.eta_hours, admin_notes: draft.admin_notes || null });
  active.value = null;
};

const money = (value: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

const dateTime = (value: string) =>
  new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

const person = (value: { full_name: string | null, email: string } | null) =>
  value?.full_name || value?.email || 'Desconocido';

/** Un ticket abierto cuyo plazo ya venció: es lo que hay que atender primero. */
const isOverdue = (ticket: WithdrawalTicket) =>
  ticket.status === 'en_proceso' && hoursUntilDue(ticket.requested_at, ticket.eta_hours) < 0;

const totalPending = computed(() =>
  pending.value.reduce((sum, ticket) => sum + Number(ticket.amount), 0),
);
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Solicitudes de retiro</h1>
        <p class="mt-1 text-muted">Tickets de pago de comisiones de referido.</p>
      </div>

      <div v-if="pending.length" class="rounded-lg border border-warning/40 bg-warning/10 px-4 py-2 text-right">
        <p class="text-xs uppercase tracking-wide text-muted">Pendiente de pagar</p>
        <p class="text-lg font-bold text-warning">{{ money(totalPending) }}</p>
      </div>
    </div>

    <div v-if="status === 'pending'" class="space-y-3">
      <USkeleton v-for="i in 3" :key="i" class="h-24" />
    </div>

    <UAlert
      v-else-if="!tickets?.length"
      icon="i-lucide-inbox"
      color="neutral"
      variant="subtle"
      title="No hay solicitudes"
      description="Cuando un afiliado solicite el retiro de sus comisiones aparecerá aquí."
    />

    <div v-else class="space-y-3">
      <UCard
        v-for="ticket in tickets"
        :key="ticket.id"
        :class="isOverdue(ticket) ? 'ring-1 ring-error/40' : ''"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xl font-bold text-highlighted">
                {{ money(Number(ticket.amount), ticket.currency) }}
              </span>
              <UBadge
                :color="WITHDRAWAL_STATUS_COLORS[ticket.status]"
                :icon="WITHDRAWAL_STATUS_ICONS[ticket.status]"
                variant="subtle"
              >
                {{ WITHDRAWAL_STATUS_LABELS[ticket.status] }}
              </UBadge>
              <UBadge v-if="isOverdue(ticket)" color="error" variant="subtle" icon="i-lucide-alarm-clock">
                Plazo vencido
              </UBadge>
            </div>

            <p class="text-sm text-toned">
              <UIcon name="i-lucide-user" class="mr-1 inline size-4 text-muted" />
              {{ person(ticket.referrer) }}
            </p>

            <p class="text-xs text-muted">
              Solicitado el {{ dateTime(ticket.requested_at) }} · plazo de {{ ticket.eta_hours }} h
              <template v-if="ticket.status === 'en_proceso'">
                · vence el {{ dateTime(withdrawalDueAt(ticket.requested_at, ticket.eta_hours).toISOString()) }}
              </template>
            </p>

            <div v-if="ticket.payout_method" class="flex flex-wrap items-center gap-2 text-sm">
              <UBadge
                :icon="PAYOUT_METHOD_ICONS[ticket.payout_method]"
                color="neutral"
                variant="subtle"
              >
                {{ PAYOUT_METHOD_LABELS[ticket.payout_method] }}
              </UBadge>
              <span v-if="ticket.payout_provider" class="font-medium text-toned">
                {{ ticket.payout_provider }}
              </span>
              <span v-if="ticket.payout_account_number" class="font-mono text-toned">
                {{ ticket.payout_account_number }}
              </span>
              <span v-if="ticket.payout_holder" class="text-muted">
                · {{ ticket.payout_holder }}
              </span>
            </div>

            <p v-if="ticket.notes" class="mt-2 rounded-md bg-elevated px-3 py-2 text-sm text-toned">
              {{ ticket.notes }}
            </p>

            <p v-if="ticket.admin_notes" class="mt-2 text-sm text-muted">
              <span class="font-medium">Tu respuesta:</span> {{ ticket.admin_notes }}
            </p>

            <p v-if="ticket.resolved_at" class="text-xs text-dimmed">
              Resuelta el {{ dateTime(ticket.resolved_at) }} por {{ person(ticket.resolver) }}
            </p>
          </div>

          <UButton
            v-if="ticket.status === 'en_proceso'"
            icon="i-lucide-gavel"
            label="Resolver"
            color="primary"
            size="sm"
            :loading="saving === ticket.id"
            @click="openTicket(ticket)"
          />
        </div>
      </UCard>
    </div>

    <UModal v-model:open="modalOpen" :title="`Resolver retiro de ${person(active?.referrer ?? null)}`">
      <template #body>
        <div v-if="active" class="space-y-5">
          <div class="rounded-lg bg-elevated px-4 py-3">
            <p class="text-xs uppercase tracking-wide text-muted">Importe a pagar</p>
            <p class="text-2xl font-bold text-highlighted">
              {{ money(Number(active.amount), active.currency) }}
            </p>
            <div v-if="active.payout_method" class="mt-2 space-y-0.5 text-sm">
              <p class="font-medium text-toned">
                {{ PAYOUT_METHOD_LABELS[active.payout_method] }}
                <template v-if="active.payout_provider"> · {{ active.payout_provider }}</template>
              </p>
              <p v-if="active.payout_account_number" class="font-mono text-highlighted">
                {{ active.payout_account_number }}
              </p>
              <p v-if="active.payout_holder" class="text-muted">
                {{ active.payout_holder }}
              </p>
            </div>
          </div>

          <UFormField
            label="Plazo comprometido (horas)"
            help="Por defecto 72 h. Ajústalo si acordaste otro plazo con el afiliado."
          >
            <UInputNumber v-model="draft.eta_hours" :min="1" :max="8760" class="w-full" />
          </UFormField>

          <UFormField label="Respuesta para el afiliado">
            <UTextarea
              v-model="draft.admin_notes"
              class="w-full"
              :rows="3"
              placeholder="Pagado por Nequi el 28/08, comprobante 12345"
            />
          </UFormField>

          <USeparator />

          <div class="space-y-2">
            <UButton
              icon="i-lucide-circle-check-big"
              label="Marcar como procesado"
              color="success"
              block
              :loading="saving === active.id"
              @click="resolve('procesado')"
            />
            <UButton
              icon="i-lucide-circle-x"
              label="Cancelar la solicitud"
              color="error"
              variant="outline"
              block
              :loading="saving === active.id"
              @click="resolve('cancelado')"
            />
            <UButton
              icon="i-lucide-save"
              label="Sólo guardar plazo y nota"
              color="neutral"
              variant="ghost"
              block
              :loading="saving === active.id"
              @click="saveEta"
            />
          </div>

          <p class="text-xs text-dimmed">
            Al procesar, el importe se descuenta del saldo del afiliado. Al cancelar, vuelve
            a estar disponible para que pueda solicitarlo de nuevo.
          </p>
        </div>
      </template>
    </UModal>
  </div>
</template>
