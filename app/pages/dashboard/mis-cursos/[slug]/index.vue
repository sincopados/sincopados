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
const { course, enrollment, modules, classCount, denied, status, error } = useStudentCourse(courseSlug)

// Sin inscripción el curso no existe para este alumno.
watchEffect(() => {
  if (denied.value) showError({ statusCode: 404, statusMessage: 'Curso no encontrado' })
})

useSeoMeta({ title: () => course.value?.title ?? 'Curso' })
useBreadcrumbLabels(() => ({ [courseSlug.value]: course.value?.title }))

const modulePath = (m: StudentModule) => localePath(`/dashboard/mis-cursos/${courseSlug.value}/${m.slug}`)
const classPath = (m: StudentModule, c: CourseClass) =>
  localePath(`/dashboard/mis-cursos/${courseSlug.value}/${m.slug}/${c.slug}`)

/** Primera clase del curso: el botón «Empezar». */
const firstClass = computed(() => {
  const m = modules.value.find(x => x.course_classes.length)
  return m ? classPath(m, m.course_classes[0]!) : null
})

const accordionItems = computed(() =>
  modules.value.map((m, i) => ({
    label: m.title,
    value: m.id,
    module: m,
    index: i + 1,
  })),
)
// Todos abiertos al entrar: el temario completo de un vistazo.
const openModules = ref<string[]>([])
watch(modules, (list) => {
  openModules.value = list.map(m => m.id)
}, { immediate: true })

const coverFailed = ref(false)
</script>

<template>
  <div class="space-y-6">
    <UButton
      :to="localePath('/dashboard/mis-cursos')"
      label="Mis cursos"
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
      title="No se pudo cargar el curso"
      :description="error.message"
    />

    <template v-else-if="course && enrollment">
      <!-- Cabecera del curso -->
      <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
        <div class="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div class="aspect-video bg-elevated md:aspect-auto md:min-h-56">
            <img
              v-if="course.cover_url && !coverFailed"
              :src="course.cover_url"
              :alt="course.title"
              class="size-full object-cover"
              @error="coverFailed = true"
            >
            <div v-else class="flex size-full items-center justify-center text-dimmed">
              <UIcon name="i-lucide-graduation-cap" class="size-12" />
            </div>
          </div>

          <div class="flex flex-col gap-4 p-6">
            <div>
              <UBadge
                v-if="enrollment.status === 'completado'"
                label="Curso completado"
                color="info"
                variant="subtle"
                class="mb-2"
              />
              <h1 class="text-2xl font-bold text-highlighted text-balance">{{ course.title }}</h1>
              <p class="mt-1 text-sm text-muted">
                {{ modules.length }} {{ modules.length === 1 ? 'módulo' : 'módulos' }} ·
                {{ classCount }} {{ classCount === 1 ? 'clase' : 'clases' }}
              </p>
            </div>

            <p v-if="course.description" class="line-clamp-4 whitespace-pre-line text-muted">{{ course.description }}</p>

            <div class="mt-auto space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted">Tu progreso</span>
                <span class="font-medium">{{ enrollment.progress }} %</span>
              </div>
              <UProgress :model-value="enrollment.progress" />
            </div>

            <UButton
              v-if="firstClass"
              :to="firstClass"
              label="Empezar el curso"
              icon="i-lucide-play"
              class="self-start"
            />
          </div>
        </div>
      </UCard>

      <!-- Temario -->
      <section class="space-y-3">
        <h2 class="text-lg font-semibold text-highlighted">Contenido del curso</h2>

        <UCard v-if="modules.length" :ui="{ body: 'p-0 sm:p-0' }">
          <UAccordion
            v-model="openModules"
            type="multiple"
            :items="accordionItems"
            :ui="{ item: 'border-b border-default last:border-b-0', trigger: 'px-4 sm:px-6 py-4', content: 'px-4 sm:px-6' }"
          >
            <template #default="{ item }">
              <div class="min-w-0 text-left">
                <p class="text-xs font-semibold text-primary">Módulo {{ item.index }}</p>
                <p class="truncate font-semibold text-highlighted">{{ item.label }}</p>
                <p class="text-xs font-normal text-muted">
                  {{ item.module.course_classes.length }} {{ item.module.course_classes.length === 1 ? 'clase' : 'clases' }}
                </p>
              </div>
            </template>

            <template #body="{ item }">
              <p v-if="item.module.description" class="mb-3 line-clamp-2 text-sm text-muted">{{ item.module.description }}</p>

              <ol v-if="item.module.course_classes.length" class="space-y-1">
                <li v-for="(c, i) in item.module.course_classes" :key="c.id">
                  <ULink
                    :to="classPath(item.module, c)"
                    class="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-default hover:bg-elevated hover:text-primary"
                  >
                    <UIcon :name="c.video_url ? 'i-lucide-circle-play' : 'i-lucide-file-text'" class="size-4 shrink-0 text-muted" />
                    <span class="w-5 text-right text-muted tabular-nums">{{ i + 1 }}</span>
                    <span class="truncate">{{ c.title }}</span>
                  </ULink>
                </li>
              </ol>
              <p v-else class="text-sm italic text-dimmed">Este módulo todavía no tiene clases.</p>

              <UButton
                :to="modulePath(item.module)"
                label="Ver módulo"
                trailing-icon="i-lucide-arrow-right"
                color="neutral"
                variant="link"
                size="sm"
                class="mt-2 px-2"
              />
            </template>
          </UAccordion>
        </UCard>

        <UEmpty
          v-else
          icon="i-lucide-layers"
          title="El contenido de este curso aún no está disponible"
          description="Pronto se publicarán los módulos y las clases."
          variant="outline"
        />
      </section>
    </template>

    <USkeleton v-else-if="status === 'pending'" class="h-96 rounded-lg" />
  </div>
</template>
