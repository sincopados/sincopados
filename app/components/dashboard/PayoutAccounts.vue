<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { PayoutAccount, PayoutMethod } from '~/types/db'

const { accounts, status, add, makeDefault, remove, saving, removing } = usePayoutAccounts()

const formOpen = ref(false)

const toggleForm = () => {
  formOpen.value = !formOpen.value
}

// El esquema se afina según el medio: efectivo no pide número, y una
// transferencia sin entidad la rechazaría la base con un CHECK.
const schema = z.object({
  method: z.enum(PAYOUT_METHODS),
  provider: z.string().max(80).optional().or(z.literal('')),
  account_number: z.string().max(80).optional().or(z.literal('')),
  holder_name: z.string().max(120).optional().or(z.literal('')),
  label: z.string().max(60).optional().or(z.literal('')),
  is_default: z.boolean(),
}).superRefine((data, ctx) => {
  if (data.method === 'transferencia' && !data.provider?.trim()) {
    ctx.addIssue({ code: 'custom', path: ['provider'], message: 'Elige el banco o la billetera' })
  }
  if (data.method !== 'efectivo' && !data.account_number?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['account_number'],
      message: data.method === 'bre_b' ? 'Escribe tu llave Bre-B' : 'Escribe el número de cuenta',
    })
  }
})

type Schema = z.output<typeof schema>

const emptyAccount = () => ({
  method: 'transferencia' as PayoutMethod,
  provider: '',
  account_number: '',
  holder_name: '',
  label: '',
  is_default: false,
})

const state = reactive(emptyAccount())

watch(formOpen, (open) => {
  if (open) Object.assign(state, emptyAccount())
})

// Cambiar de medio deja obsoletos los campos del anterior.
watch(() => state.method, (method) => {
  if (method === 'efectivo') {
    state.provider = ''
    state.account_number = ''
  }
  else if (method === 'bre_b') {
    state.provider = ''
  }
})

// Se ensancha a `string[]` a propósito: la lista es una sugerencia y el campo
// admite escribir una entidad que no esté en ella.
const providerItems = computed<string[]>(() => [...PAYOUT_PROVIDERS])

const setMethod = (method: PayoutMethod) => {
  state.method = method
}

const setProvider = (provider: string) => {
  state.provider = provider
}

const numberLabel = computed(() =>
  state.method === 'bre_b' ? 'Llave Bre-B' : 'Número de cuenta o celular',
)

const submit = async (event: FormSubmitEvent<Schema>) => {
  const ok = await add({
    method: event.data.method,
    provider: event.data.provider ?? '',
    account_number: event.data.account_number ?? '',
    holder_name: event.data.holder_name ?? '',
    label: event.data.label ?? '',
    is_default: event.data.is_default,
  })

  if (ok) formOpen.value = false
}

const confirmRemove = async (account: PayoutAccount) => {
  if (!confirm(`¿Eliminar la cuenta "${account.label || describePayoutAccount(account)}"?`)) return
  await remove(account)
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="font-semibold text-highlighted">Cuentas de retiro</h3>
          <p class="mt-0.5 text-sm text-muted">
            Guárdalas una vez y reutilízalas en cada solicitud.
          </p>
        </div>

        <UButton
          :icon="formOpen ? 'i-lucide-x' : 'i-lucide-plus'"
          :label="formOpen ? 'Cancelar' : 'Añadir cuenta'"
          :color="formOpen ? 'neutral' : 'primary'"
          :variant="formOpen ? 'outline' : 'soft'"
          size="sm"
          @click="toggleForm"
        />
      </div>
    </template>

    <!-- Alta -->
    <UForm
      v-if="formOpen"
      :schema="schema"
      :state="state"
      class="mb-6 space-y-4 rounded-lg border border-default p-4"
      @submit="submit"
    >
      <UFormField label="Medio de pago" name="method" required>
        <div class="grid gap-2 sm:grid-cols-3">
          <UButton
            v-for="method in PAYOUT_METHODS"
            :key="method"
            :icon="PAYOUT_METHOD_ICONS[method]"
            :label="PAYOUT_METHOD_LABELS[method]"
            :color="state.method === method ? 'primary' : 'neutral'"
            :variant="state.method === method ? 'solid' : 'outline'"
            :aria-pressed="state.method === method"
            block
            @click="setMethod(method)"
          />
        </div>
        <p class="mt-2 text-xs text-muted">
          {{ PAYOUT_METHOD_DESCRIPTIONS[state.method] }}
        </p>
      </UFormField>

      <UFormField
        v-if="state.method === 'transferencia'"
        label="Banco o billetera"
        name="provider"
        help="Si no está en la lista, escríbelo."
        required
      >
        <UInputMenu
          v-model="state.provider"
          :items="providerItems"
          create-item
          class="w-full"
          placeholder="Bancolombia, Nequi, Binance…"
          @create="setProvider($event)"
        />
      </UFormField>

      <UFormField
        v-if="state.method !== 'efectivo'"
        :label="numberLabel"
        name="account_number"
        required
      >
        <UInput v-model="state.account_number" class="w-full" placeholder="3001234567" />
      </UFormField>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField label="Titular" name="holder_name">
          <UInput v-model="state.holder_name" class="w-full" placeholder="Nombre de quien recibe" />
        </UFormField>

        <UFormField label="Nombre para identificarla" name="label">
          <UInput v-model="state.label" class="w-full" placeholder="Mi Nequi" />
        </UFormField>
      </div>

      <UFormField name="is_default">
        <USwitch v-model="state.is_default" label="Usar como cuenta principal" />
      </UFormField>

      <UButton type="submit" label="Guardar cuenta" :loading="saving" block />
    </UForm>

    <!-- Listado -->
    <div v-if="status === 'pending'" class="space-y-3">
      <USkeleton v-for="i in 2" :key="i" class="h-14" />
    </div>

    <p v-else-if="!accounts?.length" class="text-sm text-muted">
      Aún no has guardado ninguna cuenta. Necesitas al menos una para solicitar un retiro.
    </p>

    <ul v-else class="divide-y divide-default">
      <li
        v-for="account in accounts"
        :key="account.id"
        class="flex flex-wrap items-center justify-between gap-3 py-3"
      >
        <div class="flex min-w-0 items-center gap-3">
          <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-elevated">
            <UIcon :name="PAYOUT_METHOD_ICONS[account.method]" class="size-4 text-primary" />
          </span>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-medium text-highlighted">
                {{ account.label || PAYOUT_METHOD_LABELS[account.method] }}
              </span>
              <UBadge v-if="account.is_default" color="primary" variant="subtle" size="sm">
                Principal
              </UBadge>
            </div>
            <p class="text-xs text-muted">
              {{ describePayoutAccount(account) }}
              <template v-if="account.holder_name"> · {{ account.holder_name }}</template>
            </p>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-1">
          <UButton
            v-if="!account.is_default"
            icon="i-lucide-star"
            color="neutral"
            variant="ghost"
            size="xs"
            square
            aria-label="Marcar como principal"
            @click="makeDefault(account)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            square
            :loading="removing === account.id"
            aria-label="Eliminar cuenta"
            @click="confirmRemove(account)"
          />
        </div>
      </li>
    </ul>
  </UCard>
</template>
