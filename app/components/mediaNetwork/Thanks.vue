<script setup lang="ts">
defineProps<{ name: string }>()
const emit = defineEmits<{ reset: [] }>()
</script>

<template>
  <div class="flex flex-col items-center py-4 text-center">
    <div class="mb-5 flex size-16 items-center justify-center rounded-full bg-success/10">
      <UIcon name="i-lucide-circle-check-big" class="size-9 text-success" />
    </div>

    <h3 class="text-2xl font-bold text-highlighted text-balance">
      ¡Gracias{{ name ? `, ${name.split(' ')[0]}` : '' }}! Ya estás en la convocatoria.
    </h3>

    <p class="mt-3 max-w-md text-muted text-pretty">
      Revisaremos tu postulación y te escribiremos por WhatsApp para agendar la consulta
      estratégica. Mientras tanto, mira cómo trabajamos y sigue el proceso en nuestro canal.
    </p>

    <div class="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
      <UButton
        :to="SINCOPADOS_YOUTUBE_VIDEOS"
        target="_blank"
        rel="noopener"
        label="Ver el video"
        icon="i-lucide-circle-play"
        color="neutral"
        variant="outline"
        size="xl"
        class="justify-center"
      />
      <UButton
        :to="SINCOPADOS_YOUTUBE_SUBSCRIBE"
        target="_blank"
        rel="noopener"
        label="Suscríbete en YouTube"
        icon="i-simple-icons-youtube"
        color="error"
        size="xl"
        class="justify-center"
      />
    </div>

    <UButton
      label="Enviar otra postulación"
      color="neutral"
      variant="link"
      size="sm"
      class="mt-6"
      @click="emit('reset')"
    />
  </div>
</template>
