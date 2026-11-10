<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'

defineProps<{ id?: string }>()

const { step, state, submitting, goToInterests, back, submit, reset } = useMediaNetworkForm()

const steps: StepperItem[] = [
  { value: 'contacto', title: 'Tus datos', icon: 'i-lucide-user' },
  { value: 'intereses', title: 'Tu interés', icon: 'i-lucide-sparkles' },
]

// El paso de agradecimiento no aparece en el indicador: se marca todo completado.
const stepperValue = computed(() => (step.value === 'gracias' ? 'intereses' : step.value))
</script>

<template>
  <section :id="id" class="scroll-mt-20 py-16 sm:py-24">
    <UContainer>
      <div class="mx-auto max-w-2xl">
        <div class="mb-10 text-center">
          <UBadge label="Consulta estratégica" color="primary" variant="subtle" class="mb-4" />
          <h2 class="font-condensed text-3xl font-bold uppercase text-highlighted text-balance sm:text-4xl">
            Postúlate a la convocatoria
          </h2>
          <p class="mt-3 text-lg text-muted text-pretty">
            Ningún servicio, alianza o colaboración empieza sin este filtro. Te toma menos de un minuto.
          </p>
        </div>

        <UCard :ui="{ body: 'relative p-6 sm:p-8' }">
          <UStepper
            v-if="step !== 'gracias'"
            :model-value="stepperValue"
            :items="steps"
            disabled
            size="sm"
            class="mb-8"
          />

          <MediaNetworkStepContact
            v-if="step === 'contacto'"
            v-model="state"
            @next="goToInterests"
          />

          <MediaNetworkStepInterests
            v-else-if="step === 'intereses'"
            v-model="state"
            :loading="submitting"
            @back="back"
            @submit="submit"
          />

          <MediaNetworkThanks
            v-else
            :name="state.full_name"
            @reset="reset"
          />
        </UCard>
      </div>
    </UContainer>
  </section>
</template>
