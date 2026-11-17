<script setup lang="ts">
import type { PublicCourse } from '~/composables/useCourseCatalog'

/**
 * Llamada a la acción de un curso. Si el usuario ya está inscrito lo lleva a
 * su curso en el panel; si no, abre WhatsApp con el curso ya mencionado.
 */
const props = defineProps<{ course: PublicCourse }>()

const localePath = useLocalePath()
const { data: enrollment } = useMyEnrollmentStatus(() => props.course.id)

const hasAccess = computed(() => enrollment.value === 'activo' || enrollment.value === 'completado')

const enrollUrl = computed(() =>
  whatsappLink(`Hola, quiero inscribirme al curso «${props.course.title}». ¿Me dan más información?`),
)
</script>

<template>
  <div class="space-y-4 rounded-xl border border-default bg-elevated/40 p-6">
    <div>
      <p class="text-sm text-muted">Inversión</p>
      <p class="text-3xl font-bold text-highlighted">{{ formatCoursePrice(course.price, course.currency) }}</p>
    </div>

    <UButton
      v-if="hasAccess"
      :to="localePath(`/dashboard/mis-cursos/${course.slug}`)"
      label="Entrar al curso"
      icon="i-lucide-play"
      size="lg"
      block
    />
    <template v-else>
      <UButton
        :to="enrollUrl"
        target="_blank"
        rel="noopener"
        label="Quiero inscribirme"
        icon="i-simple-icons-whatsapp"
        size="lg"
        block
      />
      <p class="text-center text-xs text-muted">Te respondemos por WhatsApp con los pasos para inscribirte.</p>
    </template>

    <ul class="space-y-2 border-t border-default pt-4 text-sm text-muted">
      <li class="flex items-center gap-2"><UIcon name="i-lucide-monitor-play" class="size-4 text-primary" /> Clases en video a tu ritmo</li>
      <li class="flex items-center gap-2"><UIcon name="i-lucide-paperclip" class="size-4 text-primary" /> Material de apoyo descargable</li>
      <li class="flex items-center gap-2"><UIcon name="i-lucide-infinity" class="size-4 text-primary" /> Acceso desde tu panel de alumno</li>
    </ul>
  </div>
</template>
