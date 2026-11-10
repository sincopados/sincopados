<script setup lang="ts">
const state = defineModel<{ full_name: string, whatsapp: string, website: string }>({ required: true })

const emit = defineEmits<{ next: [] }>()
</script>

<template>
  <UForm
    :schema="mediaNetworkContactSchema"
    :state="state"
    class="space-y-5"
    @submit="emit('next')"
  >
    <UFormField label="Nombre completo" name="full_name" required>
      <UInput
        v-model="state.full_name"
        placeholder="¿Cómo te llamas?"
        icon="i-lucide-user"
        autocomplete="name"
        size="xl"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="Número de WhatsApp"
      name="whatsapp"
      help="Si es de Colombia puedes escribirlo sin el +57."
      required
    >
      <UInput
        v-model="state.whatsapp"
        type="tel"
        inputmode="tel"
        placeholder="300 123 4567"
        icon="i-simple-icons-whatsapp"
        autocomplete="tel"
        size="xl"
        class="w-full"
      />
    </UFormField>

    <!-- Campo trampa para bots: fuera de pantalla y fuera del orden de tabulación. -->
    <div aria-hidden="true" class="absolute -left-[9999px] h-0 overflow-hidden">
      <label>
        Sitio web
        <input v-model="state.website" type="text" name="website" tabindex="-1" autocomplete="off">
      </label>
    </div>

    <UButton type="submit" label="Continuar" trailing-icon="i-lucide-arrow-right" size="xl" block />
  </UForm>
</template>
