<script setup lang="ts">
import type { CourseModule } from '~/types/db'

/** Modal de alta y edición de un módulo: sin `module` es un alta. */
const props = defineProps<{
  module?: CourseModule | null
  courseTitle?: string
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  submit: [data: CourseModuleFormData]
}>()

const initial = computed<CourseModuleFormState | undefined>(() => {
  const m = props.module
  if (!m) return undefined
  return { title: m.title, slug: m.slug, description: m.description ?? '', cover_url: m.cover_url ?? '', is_active: m.is_active }
})
</script>

<template>
  <UModal
    v-model:open="open"
    :title="module ? 'Editar módulo' : 'Nuevo módulo'"
    :description="courseTitle"
  >
    <template #body>
      <!-- `key` reinicia el formulario al cambiar entre alta y edición. -->
      <DashboardCourseModuleForm
        :key="module?.id ?? 'new'"
        :initial="initial"
        :module-id="module?.id"
        :loading="loading"
        @submit="emit('submit', $event)"
        @cancel="open = false"
      />
    </template>
  </UModal>
</template>
