<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { WithdrawalRequest, WithdrawalStatus } from '~/types/db'

const {
  requests, status, request, requesting,
  available, locked, requested, withdrawn, openRequests, canRequest,
} = useMyWithdrawals()

const { accounts, defaultAccount } = usePayoutAccounts()

const formOpen = ref(false)

const toggleForm = () => {
  formOpen.value = !formOpen.value
}

// El máximo depende del saldo, que cambia al resolverse un ticket: el esquema
// se recalcula para no quedarse con un tope obsoleto.
const schema = computed(() => z.object({
  amount: z.number()
    .min(MIN_WITHDRAWAL_AMOUNT, `El retiro mínimo es de ${MIN_WITHDRAWAL_AMOUNT.toLocaleString('es-CO')}`)
    .max(available.value, 'No puedes retirar más de tu saldo disponible'),
  account_id: z.uuid('Elige una cuenta de retiro'),
  notes: z.string().max(300).optional().or(z.literal('')),
}))

interface Schema {
  amount: number
  account_id: string
  notes?: string
}

const state = reactive({
  amount: 0,
  account_id: '',
  notes: '',
})

// Al abrir se propone el saldo completo y la cuenta principal: es el caso
// habitual, y el usuario sólo ajusta si quiere retirar menos.
watch(formOpen, (open) => {
  if (!open) return
  state.amount = available.value
  state.account_id = defaultAccount.value?.id ?? ''
  state.notes = ''
})

const accountItems = computed(() =>
  (accounts.value ?? []).map(account => ({
    label: `${account.label || PAYOUT_METHOD_LABELS[account.method]} — ${describePayoutAccount(account)}`,
    value: account.id,
  })),
)

const hasAccounts = computed(() => (accounts.value ?? []).length > 0)

const setAmount = (value: number) => {
  state.amount = value
}

const submit = async (event: FormSubmitEvent<Schema>) => {
  const ok = await request(event.data.amount, event.data.account_id, event.data.notes ?? '')
  if (ok) formOpen.value = false
}

const money = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

const date = (value: string) =>
  new Date(value).toLocaleDateString('es-CO', { dateStyle: 'medium' })

const dateTime = (value: string) =>
  new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

const etaLabel = (item: WithdrawalRequest) => {
  const remaining = hoursUntilDue(item.requested_at, item.eta_hours)

  if (remaining > 0) return `Quedan unas ${remaining} h (plazo de ${item.eta_hours} h)`
  return `El plazo de ${item.eta_hours} h ya se cumplió`
}

const statusOf = (value: WithdrawalStatus) => value

/** Cómo se pagó, desde la copia guardada en el propio ticket. */
const payoutOf = (item: WithdrawalRequest) => {
  if (!item.payout_method) return null

  return describePayoutAccount({
    method: item.payout_method,
    provider: item.payout_provider,
    account_number: item.payout_account_number,
  })
}
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-highlighted">Retiro de comisiones</h2>
            <p class="mt-0.5 text-sm text-muted">
              Sólo puedes retirar las comisiones de servicios pagados y entregados por completo.
            </p>
          </div>

          <UButton
            v-if="canRequest && hasAccounts"
            :icon="formOpen ? 'i-lucide-x' : 'i-lucide-hand-coins'"
            :label="formOpen ? 'Cancelar' : 'Solicitar retiro'"
            :color="formOpen ? 'neutral' : 'primary'"
            :variant="formOpen ? 'outline' : 'solid'"
            size="sm"
            @click="toggleForm"
          />
        </div>
      </template>

      <!-- Saldos -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-muted">Disponible</p>
          <p class="mt-1 text-2xl font-bold text-primary">{{ money(available) }}</p>
        </div>
        <div class="rounded-lg bg-elevated px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-muted">Aún no liberado</p>
          <p class="mt-1 text-2xl font-bold text-highlighted">{{ money(locked) }}</p>
        </div>
        <div class="rounded-lg bg-elevated px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-muted">En solicitud</p>
          <p class="mt-1 text-2xl font-bold text-warning">{{ money(requested) }}</p>
        </div>
        <div class="rounded-lg bg-elevated px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-muted">Ya retirado</p>
          <p class="mt-1 text-2xl font-bold text-success">{{ money(withdrawn) }}</p>
        </div>
      </div>

      <UAlert
        v-if="locked > 0"
        icon="i-lucide-lock"
        color="neutral"
        variant="subtle"
        class="mt-4"
        title="Comisiones aún no liberadas"
        :description="`${money(locked)} se liberarán cuando los servicios que las generaron estén pagados y con toda su trazabilidad cumplida.`"
      />

      <UAlert
        v-for="item in openRequests"
        :key="item.id"
        :icon="WITHDRAWAL_STATUS_ICONS.en_proceso"
        color="warning"
        variant="subtle"
        class="mt-4"
        :title="`Solicitud de ${money(Number(item.amount))} en proceso`"
        :description="etaLabel(item)"
      />

      <UAlert
        v-if="!hasAccounts && available > 0"
        icon="i-lucide-wallet"
        color="info"
        variant="subtle"
        class="mt-4"
        title="Añade una cuenta de retiro"
        description="Necesitas guardar al menos una cuenta antes de poder solicitar el pago."
      />

      <UAlert
        v-else-if="available > 0 && available < MIN_WITHDRAWAL_AMOUNT"
        icon="i-lucide-info"
        color="neutral"
        variant="subtle"
        class="mt-4"
        title="Saldo por debajo del mínimo"
        :description="`El retiro mínimo es de ${money(MIN_WITHDRAWAL_AMOUNT)}. Sigue acumulando comisiones para poder solicitarlo.`"
      />

      <UAlert
        v-else-if="available <= 0 && !openRequests.length"
        icon="i-lucide-info"
        color="neutral"
        variant="subtle"
        class="mt-4"
        title="Sin saldo disponible"
        description="Cuando un servicio que referiste quede pagado y con la trazabilidad completa, su comisión aparecerá aquí."
      />

      <!-- Formulario -->
      <UForm
        v-if="canRequest && hasAccounts && formOpen"
        :schema="schema"
        :state="state"
        class="mt-6 space-y-4 rounded-lg border border-default p-4"
        @submit="submit"
      >
        <UFormField
          label="¿Cuánto quieres retirar?"
          name="amount"
          :help="`Entre ${money(MIN_WITHDRAWAL_AMOUNT)} y ${money(available)}.`"
          required
        >
          <UInputNumber
            v-model="state.amount"
            :min="MIN_WITHDRAWAL_AMOUNT"
            :max="available"
            :step="1000"
            class="w-full"
          />
        </UFormField>

        <div class="flex flex-wrap gap-2">
          <UButton
            label="Todo el saldo"
            color="neutral"
            variant="outline"
            size="xs"
            @click="setAmount(available)"
          />
          <UButton
            label="Mitad"
            color="neutral"
            variant="outline"
            size="xs"
            @click="setAmount(Math.max(MIN_WITHDRAWAL_AMOUNT, Math.round(available / 2)))"
          />
          <UButton
            :label="`Mínimo (${money(MIN_WITHDRAWAL_AMOUNT)})`"
            color="neutral"
            variant="outline"
            size="xs"
            @click="setAmount(MIN_WITHDRAWAL_AMOUNT)"
          />
        </div>

        <UFormField label="¿A qué cuenta?" name="account_id" required>
          <USelectMenu
            v-model="state.account_id"
            :items="accountItems"
            value-key="value"
            class="w-full"
            placeholder="Elige una cuenta guardada"
          />
        </UFormField>

        <UFormField label="Nota para el administrador" name="notes">
          <UTextarea v-model="state.notes" class="w-full" :rows="2" />
        </UFormField>

        <p class="text-xs text-dimmed">
          Plazo de respuesta estimado: {{ DEFAULT_WITHDRAWAL_ETA_HOURS }} horas.
        </p>

        <UButton type="submit" label="Enviar solicitud" :loading="requesting" block />
      </UForm>

      <!-- Historial -->
      <div class="mt-6">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">Historial de solicitudes</h3>

        <div v-if="status === 'pending'" class="mt-3 space-y-3">
          <USkeleton v-for="i in 2" :key="i" class="h-16" />
        </div>

        <p v-else-if="!requests?.length" class="mt-3 text-sm text-muted">
          Todavía no has solicitado ningún retiro.
        </p>

        <ul v-else class="mt-3 divide-y divide-default">
          <li v-for="item in requests" :key="item.id" class="py-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-semibold text-highlighted">{{ money(Number(item.amount)) }}</span>
                  <UBadge
                    :color="WITHDRAWAL_STATUS_COLORS[statusOf(item.status)]"
                    :icon="WITHDRAWAL_STATUS_ICONS[statusOf(item.status)]"
                    variant="subtle"
                    size="sm"
                  >
                    {{ WITHDRAWAL_STATUS_LABELS[statusOf(item.status)] }}
                  </UBadge>
                </div>
                <p class="mt-0.5 text-xs text-muted">
                  Solicitado el {{ date(item.requested_at) }}
                  <template v-if="payoutOf(item)"> · {{ payoutOf(item) }}</template>
                </p>
                <p class="mt-1 text-sm text-toned">
                  {{ WITHDRAWAL_STATUS_DESCRIPTIONS[statusOf(item.status)] }}
                </p>
                <p v-if="item.admin_notes" class="mt-2 rounded-md bg-elevated px-3 py-2 text-sm text-toned">
                  <span class="font-medium">Respuesta:</span> {{ item.admin_notes }}
                </p>
              </div>

              <p v-if="item.resolved_at" class="shrink-0 text-xs text-dimmed">
                Resuelta el {{ dateTime(item.resolved_at) }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </UCard>

    <DashboardPayoutAccounts />
  </div>
</template>
