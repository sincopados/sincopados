<script setup lang="ts">
import type { CourseClass } from '~/types/db'

/** Modal de alta y edición de una clase: sin `lesson` es un alta. */
const props = defineProps<{
  lesson?: CourseClass | null
  moduleTitle?: string
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  submit: [data: CourseClassFormData]
}>()

const initial = computed<CourseClassFormState | undefined>(() => {
  const c = props.lesson
  if (!c) return undefined
  return {
    title: c.title,
    slug: c.slug,
    cover_url: c.cover_url ?? '',
    description: c.description ?? '',
    video_url: c.video_url ?? '',
    content: c.content ?? '',
    is_active: c.is_active,
  }
})
</script>

<template>
  <UModal
    v-model:open="open"
    :title="lesson ? 'Editar clase' : 'Nueva clase'"
    :description="moduleTitle"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #body>
      <!-- `key` reinicia el formulario al cambiar entre alta y edición. -->
      <DashboardCourseClassForm
        :key="lesson?.id ?? 'new'"
        :initial="initial"
        :class-id="lesson?.id"
        :loading="loading"
        @submit="emit('submit', $event)"
        @cancel="open = false"
      />
    </template>
  </UModal>
</template>
