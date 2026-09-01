<script setup lang="ts">
import type { Database, Service } from '~/types/db'

/**
 * Explica al afiliado cómo gana con el plan de referidos.
 *
 * Los porcentajes salen del catálogo real y no de un texto fijo: si mañana
 * cambia la comisión de un servicio, esta tarjeta lo refleja sola.
 */
const client = useSupabaseClient<Database>()
const localePath = useLocalePath()
const toast = useToast()
const { profile } = useProfile()

// La RLS deja leer los servicios activos a cualquier autenticado.
const { data: services } = await useAsyncData<Service[]>('referral-guide-services', async () => {
  const { data, error } = await client
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: false })

  if (error) throw error
  return data ?? []
})

const rates = computed(() =>
  (services.value ?? []).map(service => Number(service.commission_rate) * 100),
)

/** Rango de comisión del catálogo, para no prometer un número que no existe. */
const rateLabel = computed(() => {
  if (!rates.value.length) return null

  const min = Math.min(...rates.value)
  const max = Math.max(...rates.value)

  return min === max ? `${min.toFixed(0)} %` : `${min.toFixed(0)} – ${max.toFixed(0)} %`
})

/** Lo que se ganaría con el servicio más caro del catálogo: hace tangible el plan. */
const bestExample = computed(() => {
  const best = (services.value ?? [])
    .map(service => ({ service, commission: Number(service.price) * Number(service.commission_rate) }))
    .sort((a, b) => b.commission - a.commission)[0]

  return best?.commission ? best : null
})

const money = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

const referralLink = computed(() => {
  if (!profile.value?.referral_code) return ''
  const origin = import.meta.client ? window.location.origin : ''
  return `${origin}/register?ref=${profile.value.referral_code}`
})

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(referralLink.value)
    toast.add({ title: 'Enlace copiado', icon: 'i-lucide-check', color: 'success' })
  }
  catch {
    toast.add({ title: `Copia manualmente: ${referralLink.value}`, color: 'warning' })
  }
}

const steps = computed(() => [
  {
    icon: 'i-lucide-share-2',
    title: 'Comparte tu enlace',
    text: 'Quien se registre con él queda asociado a ti para siempre.',
  },
  {
    icon: 'i-lucide-package',
    title: 'Ofrece nuestros servicios',
    text: 'Producción de video, contenido y gestión de redes. Mira el catálogo completo con precios y comisiones.',
  },
  {
    icon: 'i-lucide-percent',
    title: `Gana ${rateLabel.value ?? 'una comisión'} de cada contratación`,
    text: 'La comisión se calcula sobre el valor del servicio contratado.',
  },
  {
    icon: 'i-lucide-circle-check-big',
    title: 'Cobra cuando el trabajo se entrega',
    text: 'Tu comisión se libera cuando el servicio está pagado y con toda su trazabilidad cumplida.',
  },
  {
    icon: 'i-lucide-hand-coins',
    title: `Retira desde ${money(MIN_WITHDRAWAL_AMOUNT)}`,
    text: `A tu cuenta guardada. Respondemos en ${DEFAULT_WITHDRAWAL_ETA_HOURS} horas.`,
  },
])
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <div class="border-b border-default bg-primary/5 px-6 py-5">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <UIcon name="i-lucide-trending-up" class="size-5 text-primary" />
          </span>
          <div>
            <h2 class="text-xl font-bold text-highlighted">Gana con el plan de referidos</h2>
            <p class="text-sm text-muted">
              Recomienda nuestros servicios y llévate una comisión por cada contratación.
            </p>
          </div>
        </div>

        <UBadge v-if="rateLabel" color="primary" variant="subtle" size="lg">
          {{ rateLabel }} de comisión
        </UBadge>
      </div>
    </div>

    <!-- Ejemplo concreto: un porcentaje abstracto no motiva tanto como una cifra. -->
    <div v-if="bestExample" class="border-b border-default px-6 py-5">
      <p class="text-sm text-muted">
        Por ejemplo, si alguien contrata
        <span class="font-medium text-toned">{{ bestExample.service.name }}</span>
        con tu enlace, ganas
      </p>
      <p class="mt-1 text-3xl font-bold text-primary">
        {{ money(bestExample.commission) }}
      </p>
    </div>

    <ol class="grid gap-px bg-default sm:grid-cols-2 lg:grid-cols-5">
      <li
        v-for="(step, index) in steps"
        :key="step.title"
        class="flex flex-col gap-2 bg-default px-5 py-6"
      >
        <div class="flex items-center gap-2">
          <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
            {{ index + 1 }}
          </span>
          <UIcon :name="step.icon" class="size-5 text-primary" />
        </div>
        <p class="font-semibold leading-tight text-highlighted">
          {{ step.title }}
        </p>
        <p class="text-sm leading-relaxed text-muted">
          {{ step.text }}
        </p>
      </li>
    </ol>

    <div class="flex flex-wrap items-center gap-3 border-t border-default px-6 py-4">
      <UButton
        icon="i-lucide-copy"
        label="Copiar mi enlace"
        :disabled="!referralLink"
        @click="copyLink"
      />
      <UButton
        icon="i-lucide-package"
        label="Ver catálogo de servicios"
        color="neutral"
        variant="outline"
        :to="localePath('/dashboard/servicios-catalogo')"
      />
      <UButton
        icon="i-lucide-share-2"
        label="Mis referidos"
        color="neutral"
        variant="ghost"
        :to="localePath('/dashboard/referidos')"
      />
    </div>
  </UCard>
</template>
