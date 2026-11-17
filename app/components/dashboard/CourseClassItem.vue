<script setup lang="ts">
import type { CourseClass } from '~/types/db'

defineProps<{
  lesson: CourseClass
  /** Número de orden dentro del módulo. */
  index: number
  /** Ruta a la página de la clase. */
  to: string
  /** Muestra las acciones de edición; sólo para superusuario. */
  canManage?: boolean
  /** Oculta la etiqueta Activa/Inactiva (vista del alumno: todo es activo). */
  hideStatus?: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const coverFailed = ref(false)
</script>

<template>
  <div class="flex items-center gap-4 rounded-lg border border-default p-3 transition-colors hover:bg-elevated/50">
    <NuxtLink :to="to" class="relative aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-elevated sm:w-36" :aria-label="`Ver ${lesson.title}`">
      <img
        v-if="lesson.cover_url && !coverFailed"
        :src="lesson.cover_url"
        :alt="lesson.title"
        loading="lazy"
        class="size-full object-cover"
        @error="coverFailed = true"
      >
      <div v-else class="flex size-full items-center justify-center text-dimmed">
        <UIcon :name="lesson.video_url ? 'i-lucide-circle-play' : 'i-lucide-file-text'" class="size-6" />
      </div>
    </NuxtLink>

    <div class="min-w-0 flex-1 space-y-1">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold text-primary tabular-nums">Clase {{ index }}</span>
        <UBadge
          v-if="!hideStatus"
          :label="lesson.is_active ? 'Activa' : 'Inactiva'"
          :color="lesson.is_active ? 'success' : 'neutral'"
          variant="subtle"
          size="sm"
        />
        <UIcon v-if="lesson.video_url" name="i-lucide-video" class="size-4 text-dimmed" aria-label="Tiene video" />
      </div>
      <ULink :to="to" class="block truncate font-semibold text-highlighted hover:text-primary">{{ lesson.title }}</ULink>
      <p v-if="lesson.description" class="line-clamp-2 text-sm text-muted">{{ lesson.description }}</p>
    </div>

    <div v-if="canManage" class="flex shrink-0 gap-1">
      <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="sm" aria-label="Editar clase" @click="emit('edit')" />
      <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" aria-label="Eliminar clase" @click="emit('delete')" />
    </div>
  </div>
</template>
