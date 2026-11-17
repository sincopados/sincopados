<script setup lang="ts">
import type { CourseClass } from '~/types/db'
import type { StudentModule } from '~/composables/useStudentCourse'

definePageMeta({
  middleware: 'role',
  roles: ['alumno'],
})

const route = useRoute()
const localePath = useLocalePath()

const courseSlug = computed(() => String(route.params.slug))
const moduleSlug = computed(() => String(route.params.modulo))

// Misma clave que la página del curso: entrar desde allí no repite la consulta.
const { course, modules, denied, status, error, findModule } = useStudentCourse(courseSlug)

const current = computed(() => findModule(moduleSlug.value))
const mod = computed(() => current.value?.module ?? null)

watchEffect(() => {
  if (denied.value) showError({ statusCode: 404, statusMessage: 'Curso no encontrado' })
  else if (status.value === 'success' && !mod.value) showError({ statusCode: 404, statusMessage: 'Módulo no encontrado' })
})

useSeoMeta({ title: () => (mod.value && course.value ? `${mod.value.title} · ${course.value.title}` : 'Módulo') })
useBreadcrumbLabels(() => ({
  [courseSlug.value]: course.value?.title,
  [moduleSlug.value]: mod.value?.title,
}))

const coursePath = computed(() => localePath(`/dashboard/mis-cursos/${courseSlug.value}`))
const modulePath = (m: StudentModule) => localePath(`/dashboard/mis-cursos/${courseSlug.value}/${m.slug}`)
const classPath = (c: CourseClass) => localePath(`/dashboard/mis-cursos/${courseSlug.value}/${moduleSlug.value}/${c.slug}`)

const coverFailed = ref(false)
watch(moduleSlug, () => { coverFailed.value = false })
</script>

<template>
  <div class="space-y-6">
    <UButton
      :to="coursePath"
      :label="course ? `Volver a ${course.title}` : 'Volver al curso'"
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="link"
      class="px-0"
    />

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="No se pudo cargar el módulo"
      :description="error.message"
    />

    <template v-else-if="course && current && mod">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div class="space-y-6">
          <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
            <div v-if="mod.cover_url && !coverFailed" class="aspect-video bg-elevated">
              <img :src="mod.cover_url" :alt="mod.title" class="size-full object-cover" @error="coverFailed = true">
            </div>
            <div class="space-y-3 p-6">
              <p class="text-sm font-medium text-primary">Módulo {{ current.position }} de {{ modules.length }}</p>
              <h1 class="text-2xl font-bold text-highlighted text-balance">{{ mod.title }}</h1>
              <p v-if="mod.description" class="whitespace-pre-line text-muted">{{ mod.description }}</p>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold">Clases</h2>
              <p class="text-sm text-muted">
                {{ mod.course_classes.length }} {{ mod.course_classes.length === 1 ? 'clase' : 'clases' }}
              </p>
            </template>

            <div v-if="mod.course_classes.length" class="space-y-3">
              <DashboardCourseClassItem
                v-for="(c, i) in mod.course_classes"
                :key="c.id"
                :lesson="c"
                :index="i + 1"
                :to="classPath(c)"
                hide-status
              />
            </div>
            <UEmpty
              v-else
              icon="i-lucide-clapperboard"
              title="Este módulo aún no tiene clases"
              description="Pronto se publicarán."
              variant="naked"
            />
          </UCard>
        </div>

        <UCard class="self-start">
          <template #header>
            <h2 class="font-semibold">Módulos del curso</h2>
          </template>
          <ol class="space-y-1">
            <li v-for="(m, i) in modules" :key="m.id">
              <ULink
                :to="modulePath(m)"
                class="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm"
                :class="m.id === mod.id ? 'bg-primary/10 font-semibold text-primary' : 'text-muted hover:bg-elevated hover:text-highlighted'"
              >
                <span class="w-5 text-right tabular-nums">{{ i + 1 }}</span>
                <span class="truncate">{{ m.title }}</span>
              </ULink>
            </li>
          </ol>
        </UCard>
      </div>

      <div class="flex flex-wrap justify-between gap-3">
        <UButton
          v-if="current.prev"
          :to="modulePath(current.prev)"
          :label="current.prev.title"
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="outline"
        />
        <span v-else />
        <UButton
          v-if="current.next"
          :to="modulePath(current.next)"
          :label="current.next.title"
          trailing-icon="i-lucide-chevron-right"
          color="neutral"
          variant="outline"
        />
      </div>
    </template>

    <USkeleton v-else-if="status === 'pending'" class="h-96 rounded-lg" />
  </div>
</template>
