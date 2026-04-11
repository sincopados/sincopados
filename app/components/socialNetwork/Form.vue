<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

type UserType = 'creator' | 'negocio' | null
type PlanType = 'starter' | 'profesional' | null

const plans = {
  starter: {
    name: 'Plan Starter',
    price: '$299',
    period: '/mes',
    description: 'Ideal para comenzar tu presencia en redes sociales.',
    icon: 'i-lucide-zap',
    color: '#1877F2',
    features: [
      '12 publicaciones al mes',
      '3 plataformas incluidas',
      'Estrategia de contenido',
      'Edicion basica con musica',
      'Sesion de rodaje y fotos mensual',
      'Reporte mensual',
      'Soporte personalizado',
    ],
  },
  profesional: {
    name: 'Plan Profesional',
    price: '$699',
    period: '/mes',
    description: 'Para marcas y negocios que quieren dominar su nicho.',
    icon: 'i-lucide-star',
    color: '#E1306C',
    features: [
      '20 publicaciones al mes',
      '3 plataformas incluidas',
      'Estrategia de contenido',
      'Edición premium + efectos',
      'Sesion de rodaje y fotos mensual',
      'Reportes mensual',
      'Soporte personalizado',
    ],
    badge: 'Mas popular',
  },
}

const userType = ref<UserType>(null)
const selectedPlan = ref<PlanType>(null)
const submitted = ref(false)

const schema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email invalido'),
  phone: z.string().optional(),
  handle: z.string().optional(),
  message: z.string().optional(),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: '',
  email: '',
  phone: '',
  handle: '',
  message: '',
})

const userTypeOptions = [
  {
    value: 'creator',
    label: 'Creador de Contenido',
    description: 'Influencer, artista, personalidad digital',
    icon: 'i-lucide-user',
  },
  {
    value: 'negocio',
    label: 'Negocio / Marca',
    description: 'Empresa, tienda, restaurante, marca',
    icon: 'i-lucide-building-2',
  },
]

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!userType.value || !selectedPlan.value) return
  submitted.value = true
}

const selectedPlanData = computed(() => {
  if (!selectedPlan.value) return null
  return plans[selectedPlan.value]
})
</script>

<template>
  <section class="py-24 bg-muted/20">
    <div class="container mx-auto px-6">
      <!-- Success state -->
      <div v-if="submitted" class="flex flex-col items-center text-center gap-6">
        <div class="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
          <UIcon name="i-lucide-check" class="size-10 text-primary" />
        </div>
        <h2 class="text-4xl font-extrabold text-highlighted">
          Solicitud recibida!
        </h2>
        <p class="text-muted max-w-md leading-relaxed">
          Gracias, {{ state.name }}. Nuestro equipo te contactara en menos de 24 horas para comenzar con tu {{ selectedPlanData?.name }}.
        </p>
      </div>

      <!-- Form -->
      <template v-else>
        <!-- Header -->
        <div class="text-center mb-14 space-y-4">
          <UBadge color="primary" variant="outline" size="lg" class="uppercase tracking-widest">
            Empieza hoy
          </UBadge>
          <h2 class="text-4xl lg:text-6xl font-extrabold text-highlighted text-balance">
            Encuentra tu <span class="text-primary">plan ideal</span>
          </h2>
          <p class="text-muted max-w-xl mx-auto leading-relaxed">
            Cuentanos sobre ti y elegimos juntos el plan que mejor se adapta a tus metas.
          </p>
        </div>

        <div class="max-w-4xl mx-auto space-y-10">
          <!-- Step 1: User type -->
          <div class="space-y-4">
            <p class="text-sm font-semibold text-muted tracking-wider uppercase">
              Paso 1 — Quien eres?
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                v-for="option in userTypeOptions"
                :key="option.value"
                type="button"
                class="flex items-start gap-4 p-6 rounded-2xl border text-left transition-all duration-200"
                :class="[
                  userType === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-muted bg-elevated hover:border-primary/50'
                ]"
                @click="userType = option.value as UserType"
              >
                <div
                  class="mt-0.5 rounded-xl p-2"
                  :class="[
                    userType === option.value
                      ? 'bg-primary text-inverted'
                      : 'bg-muted text-muted'
                  ]"
                >
                  <UIcon :name="option.icon" class="size-6" />
                </div>
                <div class="flex-1">
                  <p class="font-bold text-base text-highlighted">{{ option.label }}</p>
                  <p class="text-sm text-muted mt-0.5">{{ option.description }}</p>
                </div>
                <div v-if="userType === option.value" class="ml-auto">
                  <div class="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <UIcon name="i-lucide-check" class="size-3 text-inverted" />
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Step 2: Plan -->
          <div class="space-y-4">
            <p class="text-sm font-semibold text-muted tracking-wider uppercase">
              Paso 2 — Elige tu plan
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <button
                v-for="(plan, key) in plans"
                :key="key"
                type="button"
                class="relative flex flex-col text-left p-6 rounded-3xl border transition-all duration-200 overflow-hidden"
                :class="[
                  selectedPlan === key
                    ? 'border-2 bg-elevated'
                    : 'border-muted bg-elevated hover:border-muted'
                ]"
                :style="selectedPlan === key ? { borderColor: plan.color } : {}"
                @click="selectedPlan = key as PlanType"
              >
                <!-- Glow -->
                <div
                  v-if="selectedPlan === key"
                  class="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-20"
                  :style="{ background: plan.color }"
                />

                <!-- Badge -->
                <span
                  v-if="'badge' in plan"
                  class="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full"
                  :style="{ backgroundColor: `${plan.color}25`, color: plan.color }"
                >
                  {{ plan.badge }}
                </span>

                <!-- Selected check -->
                <div
                  v-if="selectedPlan === key"
                  class="absolute top-4 left-4"
                  :style="{ color: plan.color }"
                >
                  <div
                    class="w-5 h-5 rounded-full flex items-center justify-center"
                    :style="{ backgroundColor: plan.color }"
                  >
                    <UIcon name="i-lucide-check" class="size-3 text-white" />
                  </div>
                </div>

                <div class="flex items-center gap-2 mb-3 z-10" :style="{ color: plan.color }">
                  <UIcon :name="plan.icon" class="size-5" />
                  <span class="font-bold text-highlighted">{{ plan.name }}</span>
                </div>

                <div class="flex items-baseline gap-1 mb-2 z-10">
                  <span class="text-4xl font-extrabold text-highlighted">{{ plan.price }}</span>
                  <span class="text-muted text-sm">{{ plan.period }}</span>
                </div>

                <p class="text-sm text-muted mb-4 z-10">{{ plan.description }}</p>

                <ul class="space-y-2 z-10">
                  <li
                    v-for="feature in plan.features"
                    :key="feature"
                    class="flex items-center gap-2 text-sm text-highlighted"
                  >
                    <UIcon name="i-lucide-check" class="size-4 flex-shrink-0" :style="{ color: plan.color }" />
                    {{ feature }}
                  </li>
                </ul>
              </button>
            </div>
          </div>

          <!-- Step 3: Contact form -->
          <div class="space-y-4">
            <p class="text-sm font-semibold text-muted tracking-wider uppercase">
              Paso 3 — Tus datos
            </p>
            <UForm
              :schema="schema"
              :state="state"
              class="bg-elevated border border-muted rounded-3xl p-8 space-y-5"
              @submit="onSubmit"
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <UFormField name="name" label="Nombre completo">
                  <UInput
                    v-model="state.name"
                    placeholder="Ana Garcia"
                    size="lg"
                    class="rounded-xl"
                  />
                </UFormField>

                <UFormField name="email" label="Correo electronico">
                  <UInput
                    v-model="state.email"
                    type="email"
                    placeholder="ana@empresa.com"
                    size="lg"
                    class="rounded-xl"
                  />
                </UFormField>

                <UFormField name="phone" label="Telefono / WhatsApp">
                  <UInput
                    v-model="state.phone"
                    placeholder="+52 55 1234 5678"
                    size="lg"
                    class="rounded-xl"
                  />
                </UFormField>

                <UFormField name="handle" label="Usuario en redes (@)">
                  <UInput
                    v-model="state.handle"
                    placeholder="@miempresa"
                    size="lg"
                    class="rounded-xl"
                  />
                </UFormField>
              </div>

              <UFormField name="message" label="Cuentanos tu objetivo">
                <UTextarea
                  v-model="state.message"
                  placeholder="Ej: Quiero crecer mi cuenta de Instagram y generar mas ventas para mi tienda de ropa..."
                  :rows="4"
                  size="lg"
                  class="rounded-xl"
                />
              </UFormField>

              <!-- Summary -->
              <UAlert
                v-if="userType && selectedPlan"
                icon="i-lucide-check"
                color="primary"
                variant="subtle"
                class="rounded-2xl"
              >
                <template #description>
                  Seleccionaste
                  <strong>{{ userType === 'creator' ? 'Creador de Contenido' : 'Negocio / Marca' }}</strong>
                  con el
                  <strong>{{ plans[selectedPlan].name }}</strong>
                  a
                  <strong>{{ plans[selectedPlan].price }}/mes</strong>.
                </template>
              </UAlert>

              <UButton
                type="submit"
                size="xl"
                block
                :disabled="!userType || !selectedPlan"
                class="font-bold rounded-2xl"
              >
                Solicitar mi plan ahora
              </UButton>
            </UForm>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
