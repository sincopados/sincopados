<script setup lang="ts">
/**
 * Reproduce la URL de video de una clase: YouTube, Vimeo y Google Drive con
 * su reproductor embebido, archivos directos con `<video>` y, si no se
 * reconoce, un enlace para abrirlo aparte.
 */
const props = defineProps<{
  url: string
  title: string
  poster?: string | null
}>()

const source = computed(() => toVideoSource(props.url))
</script>

<template>
  <div class="aspect-video overflow-hidden bg-black">
    <iframe
      v-if="source?.kind === 'iframe'"
      :src="source.src"
      :title="title"
      class="size-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
      loading="lazy"
    />
    <video
      v-else-if="source?.kind === 'file'"
      :src="source.src"
      :poster="poster ?? undefined"
      controls
      preload="metadata"
      class="size-full"
    />
    <div v-else class="flex size-full flex-col items-center justify-center gap-3 text-white/80">
      <UIcon name="i-lucide-circle-play" class="size-12" />
      <p class="text-sm">Este video no se puede reproducir aquí.</p>
      <UButton
        v-if="source"
        :to="source.src"
        target="_blank"
        rel="noopener"
        label="Abrir video"
        trailing-icon="i-lucide-external-link"
        color="neutral"
        variant="solid"
        size="sm"
      />
    </div>
  </div>
</template>
