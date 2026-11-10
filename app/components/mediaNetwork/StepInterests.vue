<script setup lang="ts">
const state = defineModel<{ interests: MediaNetworkInterest[] }>({ required: true })

defineProps<{ loading?: boolean }>()
const emit = defineEmits<{ back: [], submit: [] }>()

const items = MEDIA_NETWORK_INTERESTS.map(value => ({
  value,
  label: MEDIA_NETWORK_INTEREST_LABELS[value],
  description: MEDIA_NETWORK_INTEREST_DESCRIPTIONS[value],
}))
</script>

<template>
  <UForm
    :schema="mediaNetworkInterestsSchema"
    :state="state"
    class="space-y-5"
    @submit="emit('submit')"
  >
    <UFormField
      label="¿En qué te interesa participar?"
      name="interests"
      help="Puedes elegir varias opciones."
      required
    >
      <UCheckboxGroup
        v-model="state.interests"
        :items="items"
        variant="card"
        class="mt-2"
        :ui="{ fieldset: 'grid gap-3 sm:grid-cols-2' }"
      />
    </UFormField>

    <div class="flex flex-col-reverse gap-3 sm:flex-row">
      <UButton
        label="Atrás"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        size="xl"
        :disabled="loading"
        @click="emit('back')"
      />
      <UButton
        type="submit"
        label="Enviar postulación"
        trailing-icon="i-lucide-send"
        size="xl"
        class="flex-1 justify-center"
        :loading="loading"
      />
    </div>
  </UForm>
</template>
