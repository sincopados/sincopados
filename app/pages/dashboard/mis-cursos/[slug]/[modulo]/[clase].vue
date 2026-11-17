<script setup lang="ts">
definePageMeta({
  middleware: 'role',
  roles: ['alumno'],
})

const route = useRoute()
const localePath = useLocalePath()

const courseSlug = computed(() => String(route.params.slug))
const moduleSlug = computed(() => String(route.params.modulo))
const classSlug = computed(() => String(route.params.clase))

// Misma clave que el curso y el módulo: navegar entre clases no recarga nada.
const { course, denied, status, error, findClass } = useStudentCourse(courseSlug)

const current = computed(() => findClass(moduleSlug.value, classSlug.value))
const mod = computed(() => current.value?.module ?? null)
const lesson = computed(() => current.value?.lesson ?? null)

watchEffect(() => {
  if (denied.value) showError({ statusCode: 404, statusMessage: 'Curso no encontrado' })
  else if (status.value === 'success' && !lesson.value) showError({ statusCode: 404, statusMessage: 'Clase no encontrada' })
})

useSeoMeta({ title: () => (lesson.value && mod.value ? `${lesson.value.title} · ${mod.value.title}` : 'Clase') })
useBreadcrumbLabels(() => ({
  [courseSlug.value]: course.value?.title,
  [moduleSlug.value]: mod.value?.title,
  [classSlug.value]: lesson.value?.title,
}))

const base = computed(() => `/dashboard/mis-cursos/${courseSlug.value}`)
const modulePath = computed(() => localePath(`${base.value}/${moduleSlug.value}`))
const stepPath = (step: { module: { slug: string }, lesson: { slug: string } }) =>
  localePath(`${base.value}/${step.module.slug}/${step.lesson.slug}`)

const coverFailed = ref(false)
watch(classSlug, () => { coverFailed.value = false })
</script>

<template>
  <div class="space-y-6">
    <UButton
      :to="modulePath"
      :label="mod ? `Volver a ${mod.title}` : 'Volver al módulo'"
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
      title="No se pudo cargar la clase"
      :description="error.message"
    />

    <template v-else-if="course && mod && current && lesson">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div class="space-y-6">
          <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
            <SharedVideoPlayer
              v-if="lesson.video_url"
              :key="lesson.id"
              :url="lesson.video_url"
              :title="lesson.title"
              :poster="lesson.cover_url"
            />
            <div v-else-if="lesson.cover_url && !coverFailed" class="aspect-video bg-elevated">
              <img :src="lesson.cover_url" :alt="lesson.title" class="size-full object-cover" @error="coverFailed = true">
            </div>

            <div class="space-y-3 p-6">
              <p class="text-sm font-medium text-primary">
                {{ mod.title }} · Clase {{ current.position }} de {{ mod.course_classes.length }}
              </p>
              <h1 class="text-2xl font-bold text-highlighted text-balance">{{ lesson.title }}</h1>
              <p v-if="lesson.description" class="whitespace-pre-line text-muted">{{ lesson.description }}</p>
            </div>
          </UCard>

          <UCard v-if="lesson.content">
            <template #header>
              <h2 class="font-semibold">Contenido</h2>
            </template>
            <div class="whitespace-pre-line leading-relaxed text-default">{{ lesson.content }}</div>
          </UCard>

          <!-- Sólo descarga: sin `can-manage` no hay subida ni borrado. -->
          <DashboardClassMaterials :key="lesson.id" :class-id="lesson.id" />
        </div>

        <UCard class="self-start">
          <template #header>
            <h2 class="font-semibold">Clases del módulo</h2>
          </template>
          <ol class="space-y-1">
            <li v-for="(c, i) in mod.course_classes" :key="c.id">
              <ULink
                :to="stepPath({ module: mod, lesson: c })"
                class="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm"
                :class="c.id === lesson.id ? 'bg-primary/10 font-semibold text-primary' : 'text-muted hover:bg-elevated hover:text-highlighted'"
              >
                <span class="w-5 text-right tabular-nums">{{ i + 1 }}</span>
                <span class="truncate">{{ c.title }}</span>
                <UIcon v-if="c.video_url" name="i-lucide-circle-play" class="ml-auto size-4 shrink-0 opacity-60" />
              </ULink>
            </li>
          </ol>
        </UCard>
      </div>

      <!-- Anterior / siguiente recorren todo el curso, cruzando módulos. -->
      <div class="flex flex-wrap justify-between gap-3">
        <UButton
          v-if="current.prev"
          :to="stepPath(current.prev)"
          :label="current.prev.lesson.title"
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="outline"
        />
        <span v-else />
        <UButton
          v-if="current.next"
          :to="stepPath(current.next)"
          :label="current.next.module.id === mod.id ? current.next.lesson.title : `Siguiente módulo: ${current.next.module.title}`"
          trailing-icon="i-lucide-chevron-right"
        />
        <UButton
          v-else
          :to="localePath(base)"
          label="Has llegado al final del curso"
          icon="i-lucide-party-popper"
          color="neutral"
          variant="soft"
        />
      </div>
    </template>

    <USkeleton v-else-if="status === 'pending'" class="h-96 rounded-lg" />
  </div>
</template>
