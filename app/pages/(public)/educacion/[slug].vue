<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()
const slug = computed(() => String(route.params.slug))

const { data: course, status } = await usePublicCourse(slug)

const courseIds = computed(() => (course.value ? [course.value.id] : undefined))
const { data: syllabus } = await useCourseSyllabus(courseIds)
const modules = computed(() => (course.value ? syllabus.value[course.value.id] ?? [] : []))
const totals = computed(() => syllabusTotals(modules.value))

// Un curso inexistente o inactivo es un 404 real, también para buscadores.
if (status.value === 'success' && !course.value) {
  throw createError({ statusCode: 404, statusMessage: 'Curso no encontrado', fatal: true })
}

useSeoMeta({
  title: () => (course.value ? `${course.value.title} · Educación Sincopados` : 'Curso'),
  description: () => course.value?.description ?? undefined,
  ogTitle: () => course.value?.title,
  ogDescription: () => course.value?.description ?? undefined,
  ogType: 'website',
  ogUrl: () => `https://sincopados.com/educacion/${slug.value}`,
  ogImage: () => course.value?.cover_url ?? '/Logo-Sincopados-Golden.png',
  twitterCard: 'summary_large_image',
})

const coverFailed = ref(false)
</script>

<template>
  <UContainer class="py-10 sm:py-16">
    <UButton
      :to="localePath('/educacion')"
      label="Todos los cursos"
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="link"
      class="mb-6 px-0"
    />

    <div v-if="course" class="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div class="space-y-6">
        <div class="overflow-hidden rounded-xl bg-elevated">
          <img
            v-if="course.cover_url && !coverFailed"
            :src="course.cover_url"
            :alt="course.title"
            class="aspect-video w-full object-cover"
            @error="coverFailed = true"
          >
          <div v-else class="flex aspect-video items-center justify-center text-dimmed">
            <UIcon name="i-lucide-graduation-cap" class="size-16" />
          </div>
        </div>

        <div class="space-y-4">
          <UBadge label="Curso" icon="i-lucide-graduation-cap" variant="subtle" />
          <h1 class="text-3xl font-bold text-highlighted text-balance sm:text-4xl">{{ course.title }}</h1>
          <p v-if="course.description" class="whitespace-pre-line text-lg leading-relaxed text-muted">{{ course.description }}</p>
        </div>

        <section class="space-y-4 pt-4">
          <div class="flex flex-wrap items-end justify-between gap-2">
            <h2 class="text-2xl font-bold text-highlighted">Contenido del curso</h2>
            <p v-if="totals.modules" class="text-sm text-muted">
              {{ totals.modules }} {{ totals.modules === 1 ? 'módulo' : 'módulos' }} ·
              {{ totals.classes }} {{ totals.classes === 1 ? 'clase' : 'clases' }}
            </p>
          </div>
          <EducationSyllabus v-if="modules.length" :modules="modules" open="all" />
          <p v-else class="rounded-xl border border-dashed border-default p-6 text-center text-muted">
            El temario de este curso se publicará pronto.
          </p>
        </section>
      </div>

      <aside class="lg:sticky lg:top-24 lg:self-start">
        <EducationEnrollCta :course="course" />
      </aside>
    </div>

    <USkeleton v-else-if="status === 'pending'" class="h-96 rounded-xl" />
  </UContainer>
</template>
