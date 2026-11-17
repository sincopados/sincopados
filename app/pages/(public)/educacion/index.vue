<script setup lang="ts">
const title = 'Educación · Cursos de Sincopados'
const description = 'Aprende producción de contenido, edición y marketing con los cursos de Sincopados: clases en video, material de apoyo y acceso desde tu panel.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogUrl: 'https://sincopados.com/educacion',
  ogImage: '/Logo-Sincopados-Golden.png',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: '/Logo-Sincopados-Golden.png',
})

const { data: courses, status, error } = await useCourseCatalog()
// El temario de todos los cursos activos en una sola llamada.
const { data: syllabus } = await useCourseSyllabus()
</script>

<template>
  <div>
    <UPageHero
      title="Aprende con Sincopados"
      description="Cursos prácticos de producción de contenido, edición y marketing digital. Clases en video, material de apoyo y acceso desde tu panel de alumno."
      :links="[{ label: 'Ver cursos', to: '#cursos', icon: 'i-lucide-arrow-down', size: 'lg' }]"
    >
      <template #headline>
        <UBadge label="Educación" icon="i-lucide-graduation-cap" variant="subtle" />
      </template>
    </UPageHero>

    <UContainer id="cursos" class="scroll-mt-24 pb-24">
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="No pudimos cargar los cursos"
        description="Inténtalo de nuevo en unos minutos."
      />

      <div v-else-if="status === 'pending' && !courses.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="i in 3" :key="i" class="h-96 rounded-xl" />
      </div>

      <div v-else-if="courses.length" class="space-y-12">
        <section
          v-for="course in courses"
          :key="course.id"
          class="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
          :aria-label="course.title"
        >
          <EducationCourseCard :course="course" :totals="syllabusTotals(syllabus[course.id])" />

          <div class="space-y-3">
            <h2 class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
              <UIcon name="i-lucide-list-tree" class="size-4" />
              Contenido del curso
            </h2>
            <EducationSyllabus v-if="syllabus[course.id]?.length" :modules="syllabus[course.id]!" open="first" />
            <p v-else class="rounded-xl border border-dashed border-default p-6 text-center text-sm text-muted">
              El temario de este curso se publicará pronto.
            </p>
          </div>
        </section>
      </div>

      <UEmpty
        v-else
        icon="i-lucide-book-open"
        title="Pronto publicaremos nuevos cursos"
        description="Escríbenos y te avisamos cuando abran las inscripciones."
        :actions="[{ label: 'Avísame', icon: 'i-simple-icons-whatsapp', to: whatsappLink('Hola, quiero saber cuándo abren nuevos cursos de Sincopados.'), target: '_blank' }]"
        variant="outline"
      />
    </UContainer>
  </div>
</template>
