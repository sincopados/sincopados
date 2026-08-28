<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { SocialNetwork } from '~/types/db'

const props = defineProps<{
  /** Valores de partida. Cambiar la referencia recarga el formulario. */
  initial: ServiceSchema
  loading: boolean
  submitLabel: string
}>()

const emit = defineEmits<{ submit: [event: FormSubmitEvent<ServiceSchema>] }>()

// El formulario es dueño de su estado y sólo lo devuelve al enviar, así que la
// página no tiene que mantenerlo sincronizado ni se muta un prop.
const state = reactive<ServiceSchema>({ ...props.initial })

watch(() => props.initial, (next) => {
  Object.assign(state, next)
})

// El slug se deriva del nombre en vivo; se muestra sólo para que se vea qué se
// va a guardar. La unicidad la garantiza el índice de Postgres, no esto.
const derivedSlug = computed(() => slugify(state.name))

const toggleNetwork = (network: SocialNetwork) => {
  state.social_networks = state.social_networks.includes(network)
    ? state.social_networks.filter(n => n !== network)
    : [...state.social_networks, network]
}

// Apagar el manejo de redes limpia la selección: la base de datos rechaza la
// combinación incoherente con un CHECK, así que conviene no llegar a enviarla.
watch(() => state.manages_social, (enabled) => {
  if (!enabled) state.social_networks = []
})
</script>

<template>
  <UForm :schema="serviceSchema" :state="state" class="space-y-5" @submit="emit('submit', $event)">
    <div class="space-y-4">
      <UFormField label="Nombre" name="name" required>
        <UInput v-model="state.name" class="w-full" placeholder="4 Videos TikTok" />
      </UFormField>

      <UFormField label="Identificador" help="Se genera solo a partir del nombre.">
        <UInput
          :model-value="derivedSlug"
          disabled
          class="w-full font-mono"
          placeholder="se-genera-del-nombre"
        />
      </UFormField>

      <UFormField label="Descripción" name="description">
        <UTextarea v-model="state.description" class="w-full" :rows="3" />
      </UFormField>
    </div>

    <USeparator label="Qué incluye" />

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Número de videos" name="video_count">
        <UInputNumber v-model="state.video_count" :min="0" class="w-full" />
      </UFormField>

      <UFormField label="Número de imágenes" name="image_count">
        <UInputNumber v-model="state.image_count" :min="0" class="w-full" />
      </UFormField>

      <UFormField label="Número de carruseles" name="carousel_count">
        <UInputNumber v-model="state.carousel_count" :min="0" class="w-full" />
      </UFormField>

      <UFormField label="Horas de rodaje" name="shooting_hours">
        <UInputNumber v-model="state.shooting_hours" :min="0" :step="0.5" class="w-full" />
      </UFormField>
    </div>

    <USeparator label="Redes sociales" />

    <UFormField name="manages_social">
      <USwitch
        v-model="state.manages_social"
        label="Incluye manejo de redes"
        :description="state.manages_social
          ? 'Elige en cuáles se publica.'
          : 'Actívalo para elegir las redes incluidas.'"
      />
    </UFormField>

    <UFormField v-if="state.manages_social" name="social_networks">
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="network in SOCIAL_NETWORKS"
          :key="network"
          :icon="SOCIAL_NETWORK_ICONS[network]"
          :label="SOCIAL_NETWORK_LABELS[network]"
          :color="state.social_networks.includes(network) ? 'primary' : 'neutral'"
          :variant="state.social_networks.includes(network) ? 'solid' : 'outline'"
          size="sm"
          :aria-pressed="state.social_networks.includes(network)"
          @click="toggleNetwork(network)"
        />
      </div>
    </UFormField>

    <USeparator label="Precio" />

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Precio (COP)" name="price" required>
        <UInputNumber v-model="state.price" :min="0" class="w-full" />
      </UFormField>

      <UFormField label="Comisión por referido (%)" name="commission_rate" required>
        <UInputNumber v-model="state.commission_rate" :min="0" :max="100" class="w-full" />
      </UFormField>
    </div>

    <UButton type="submit" :label="submitLabel" :loading="loading" block />
  </UForm>
</template>
