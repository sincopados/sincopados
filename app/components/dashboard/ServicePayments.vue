<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { RecordedPayment } from '~/composables/useServicePayments'

const props = defineProps<{
  payments: RecordedPayment[]
  currency: string
  paid: number
  total: number
  balance: number
  progress: number
  /** `true` sólo para el superusuario: registrar un cobro es un hecho contable. */
  editable: boolean
  saving: boolean
  removing: string | null
  loading?: boolean
}>()

const emit = defineEmits<{
  add: [payment: NewPayment]
  remove: [payment: RecordedPayment]
}>()

const formOpen = ref(false)

const toggleForm = () => {
  formOpen.value = !formOpen.value
}

const paymentSchema = z.object({
  amount: z.number().positive('El importe debe ser mayor que cero'),
  paid_at: z.string().min(1, 'Indica la fecha del pago'),
  method: z.string().max(60).optional().or(z.literal('')),
  notes: z.string().max(300).optional().or(z.literal('')),
})

type PaymentSchema = z.output<typeof paymentSchema>

const today = () => new Date().toISOString().slice(0, 10)

// El importe propuesto es el saldo pendiente: es el caso habitual y ahorra
// teclear. Si se cobró de más, `balance` es negativo y se parte de cero.
const emptyPayment = () => ({
  amount: Math.max(0, props.balance),
  paid_at: today(),
  method: '',
  notes: '',
})

const state = reactive(emptyPayment())

watch(formOpen, (open) => {
  if (open) Object.assign(state, emptyPayment())
})

const submit = (event: FormSubmitEvent<PaymentSchema>) => {
  emit('add', {
    amount: event.data.amount,
    paid_at: event.data.paid_at,
    method: event.data.method ?? '',
    notes: event.data.notes ?? '',
  })
}

// El padre cierra el formulario apagando `saving` tras un alta correcta.
watch(() => props.payments.length, () => {
  formOpen.value = false
})

const money = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: props.currency || 'COP',
    maximumFractionDigits: 0,
  }).format(value)

const date = (value: string) =>
  new Date(value).toLocaleDateString('es-CO', { dateStyle: 'medium' })

const recorder = (payment: RecordedPayment) =>
  payment.recorded_profile?.full_name || payment.recorded_profile?.email || 'el equipo'
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-highlighted">Pagos</h2>
          <p class="mt-0.5 text-sm text-muted">
            {{ payments.length }}
            {{ payments.length === 1 ? 'pago registrado' : 'pagos registrados' }}
          </p>
        </div>

        <UButton
          v-if="editable"
          :icon="formOpen ? 'i-lucide-x' : 'i-lucide-plus'"
          :label="formOpen ? 'Cancelar' : 'Registrar pago'"
          :color="formOpen ? 'neutral' : 'primary'"
          :variant="formOpen ? 'outline' : 'solid'"
          size="sm"
          @click="toggleForm"
        />
      </div>
    </template>

    <!-- Resumen económico -->
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-lg bg-elevated px-4 py-3">
        <p class="text-xs uppercase tracking-wide text-muted">Contratado</p>
        <p class="mt-1 text-xl font-bold text-highlighted">{{ money(total) }}</p>
      </div>
      <div class="rounded-lg bg-elevated px-4 py-3">
        <p class="text-xs uppercase tracking-wide text-muted">Pagado</p>
        <p class="mt-1 text-xl font-bold text-success">{{ money(paid) }}</p>
      </div>
      <div class="rounded-lg bg-elevated px-4 py-3">
        <p class="text-xs uppercase tracking-wide text-muted">
          {{ balance < 0 ? 'Cobrado de más' : 'Saldo pendiente' }}
        </p>
        <p
          class="mt-1 text-xl font-bold"
          :class="balance > 0 ? 'text-warning' : balance < 0 ? 'text-error' : 'text-success'"
        >
          {{ money(Math.abs(balance)) }}
        </p>
      </div>
    </div>

    <UProgress v-if="total > 0" :model-value="progress" class="mt-5" />

    <!-- Alta de pago -->
    <UForm
      v-if="editable && formOpen"
      :schema="paymentSchema"
      :state="state"
      class="mt-6 space-y-4 rounded-lg border border-default p-4"
      @submit="submit"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField label="Importe" name="amount" required>
          <UInputNumber v-model="state.amount" :min="0" class="w-full" />
        </UFormField>

        <UFormField label="Fecha del pago" name="paid_at" required>
          <UInput v-model="state.paid_at" type="date" class="w-full" />
        </UFormField>

        <UFormField label="Medio de pago" name="method">
          <UInput v-model="state.method" class="w-full" placeholder="Transferencia, efectivo…" />
        </UFormField>

        <UFormField label="Nota" name="notes">
          <UInput v-model="state.notes" class="w-full" placeholder="Cuota 1 de 3" />
        </UFormField>
      </div>

      <UButton type="submit" label="Registrar pago" :loading="saving" block />
    </UForm>

    <!-- Historial -->
    <div v-if="loading" class="mt-6 space-y-3">
      <USkeleton v-for="i in 2" :key="i" class="h-14" />
    </div>

    <p v-else-if="!payments.length" class="mt-6 text-sm text-muted">
      Todavía no hay pagos registrados para este servicio.
    </p>

    <ul v-else class="mt-6 divide-y divide-default">
      <li
        v-for="payment in payments"
        :key="payment.id"
        class="flex flex-wrap items-center justify-between gap-3 py-3"
      >
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-semibold text-highlighted">{{ money(Number(payment.amount)) }}</span>
            <UBadge v-if="payment.method" color="neutral" variant="subtle" size="sm">
              {{ payment.method }}
            </UBadge>
          </div>
          <p class="mt-0.5 text-xs text-muted">
            {{ date(payment.paid_at) }} · registrado por {{ recorder(payment) }}
          </p>
          <p v-if="payment.notes" class="mt-1 text-sm text-toned">
            {{ payment.notes }}
          </p>
        </div>

        <UButton
          v-if="editable"
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="xs"
          square
          :loading="removing === payment.id"
          :aria-label="`Eliminar el pago de ${money(Number(payment.amount))}`"
          @click="emit('remove', payment)"
        />
      </li>
    </ul>
  </UCard>
</template>
