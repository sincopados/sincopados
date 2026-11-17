<script setup lang="ts">
import type { CourseClass } from '~/types/db'

definePageMeta({
  middleware: 'role',
  roles: ['superusuario', 'tutor'],
})

const route = useRoute()
const localePath = useLocalePath()
const { isSuperuser } = useProfile()

const courseSlug = computed(() => String(route.params.slug))
const moduleSlug = computed(() => String(route.params.modulo))
const classSlug = computed(() => String(route.params.clase))

// Las dos consultas comparten clave con las páginas del curso y del módulo.
const { course, findModule, status: courseStatus } = useCourseModules(courseSlug)
const { classes, findClass, status, error, saving, update, remove } = useModuleClasses(moduleSlug)

const mod = computed(() => findModule(moduleSlug.value)?.module ?? null)
const current = computed(() => findClass(classSlug.value))
const lesson = computed(() => current.value?.lesson ?? null)

watchEffect(() => {
  if (courseStatus.value !== 'success' || status.value !== 'success') return
  if (!course.value) showError({ statusCode: 404, statusMessage: 'Curso no encontrado' })
  else if (!mod.value) showError({ statusCode: 404, statusMessage: 'Módulo no encontrado' })
  else if (!lesson.value) showError({ statusCode: 404, statusMessage: 'Clase no encontrada' })
})

useSeoMeta({
  title: () => (lesson.value && mod.value ? `${lesson.value.title} · ${mod.value.title}` : 'Clase'),
})
useBreadcrumbLabels(() => ({
  [courseSlug.value]: course.value?.title,
  [moduleSlug.value]: mod.value?.title,
  [classSlug.value]: lesson.value?.title,
}))

const modulePath = computed(() => localePath(`/dashboard/cursos/${courseSlug.value}/${moduleSlug.value}`))
const classPath = (c: CourseClass) => localePath(`/dashboard/cursos/${courseSlug.value}/${moduleSlug.value}/${c.slug}`)

const dateTime = (value: string) =>
  new Date(value).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })

const coverFailed = ref(false)
watch(classSlug, () => { coverFailed.value = false })

/* --- Edición: si cambia el slug, la URL lo sigue --- */

const formOpen = ref(false)
const openEdit = () => {
  formOpen.value = true
}

const onSubmit = async (data: CourseClassFormData) => {
  if (!lesson.value) return
  if (!(await update(lesson.value.id, data))) return
  formOpen.value = false
  if (data.slug !== classSlug.value) {
    await navigateTo(localePath(`/dashboard/cursos/${courseSlug.value}/${moduleSlug.value}/${data.slug}`), { replace: true })
  }
}

/* --- Borrado: vuelve al módulo --- */

const deleting = ref<CourseClass | null>(null)
const askDelete = () => {
  deleting.value = lesson.value
}

const onDelete = async (c: CourseClass) => {
  if (!(await remove(c.id))) return
  deleting.value = null
  await navigateTo(modulePath.value, { replace: true })
}
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
        <!-- Clase -->
        <div class="space-y-6">
          <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
            <SharedVideoPlayer
              v-if="lesson.video_url"
              :key="lesson.id"
              :url="lesson.video_url"
              :title="lesson.title"
              :poster="lesson.cover_url"
            />
            <div v-else class="aspect-video bg-elevated">
              <img
                v-if="lesson.cover_url && !coverFailed"
                :src="lesson.cover_url"
                :alt="lesson.title"
                class="size-full object-cover"
                @error="coverFailed = true"
              >
              <div v-else class="flex size-full flex-col items-center justify-center gap-2 text-dimmed">
                <UIcon name="i-lucide-video-off" class="size-10" />
                <span class="text-sm">Esta clase no tiene video</span>
              </div>
            </div>

            <div class="space-y-4 p-6">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-sm font-medium text-primary">
                      Clase {{ current.position }} de {{ classes.length }}
                    </p>
                    <UBadge
                      :label="lesson.is_active ? 'Activa' : 'Inactiva'"
                      :color="lesson.is_active ? 'success' : 'neutral'"
                      variant="subtle"
                      size="sm"
                    />
                  </div>
                  <h1 class="mt-1 text-2xl font-bold text-highlighted text-balance">{{ lesson.title }}</h1>
                </div>

                <div v-if="isSuperuser" class="flex gap-2">
                  <UButton label="Editar" icon="i-lucide-pencil" color="neutral" variant="outline" @click="openEdit" />
                  <UButton label="Eliminar" icon="i-lucide-trash-2" color="error" variant="ghost" @click="askDelete" />
                </div>
              </div>

              <p v-if="lesson.description" class="whitespace-pre-line text-muted">{{ lesson.description }}</p>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="font-semibold">Contenido</h2>
            </template>
            <div v-if="lesson.content" class="whitespace-pre-line leading-relaxed text-default">{{ lesson.content }}</div>
            <p v-else class="italic text-dimmed">Esta clase todavía no tiene contenido.</p>
          </UCard>

          <DashboardClassMaterials :key="lesson.id" :class-id="lesson.id" :can-manage="isSuperuser" />
        </div>

        <!-- Ficha y navegación -->
        <div class="space-y-6">
          <UCard>
            <template #header>
              <h2 class="font-semibold">Detalles</h2>
            </template>

            <dl class="space-y-3 text-sm">
              <div>
                <dt class="text-muted">Curso</dt>
                <dd>
                  <ULink :to="localePath(`/dashboard/cursos/${courseSlug}`)" class="font-medium text-highlighted hover:text-primary">{{ course.title }}</ULink>
                </dd>
              </div>
              <div>
                <dt class="text-muted">Módulo</dt>
                <dd>
                  <ULink :to="modulePath" class="font-medium text-highlighted hover:text-primary">{{ mod.title }}</ULink>
                </dd>
              </div>
              <div>
                <dt class="text-muted">Estado</dt>
                <dd class="text-highlighted">{{ lesson.is_active ? 'Activa' : 'Inactiva (oculta a los alumnos)' }}</dd>
              </div>
              <div>
                <dt class="text-muted">Slug</dt>
                <dd class="font-mono text-highlighted">{{ lesson.slug }}</dd>
              </div>
              <div>
                <dt class="text-muted">Video</dt>
                <dd class="truncate">
                  <ULink v-if="lesson.video_url" :to="lesson.video_url" target="_blank" rel="noopener" class="text-primary">
                    {{ lesson.video_url }}
                  </ULink>
                  <span v-else class="text-dimmed">—</span>
                </dd>
              </div>
              <div>
                <dt class="text-muted">Portada</dt>
                <dd class="truncate">
                  <ULink v-if="lesson.cover_url" :to="lesson.cover_url" target="_blank" rel="noopener" class="text-primary">
                    {{ lesson.cover_url }}
                  </ULink>
                  <span v-else class="text-dimmed">—</span>
                </dd>
              </div>
              <div>
                <dt class="text-muted">Creada</dt>
                <dd class="text-highlighted">{{ dateTime(lesson.created_at) }}</dd>
              </div>
              <div>
                <dt class="text-muted">Última edición</dt>
                <dd class="text-highlighted">{{ dateTime(lesson.updated_at) }}</dd>
              </div>
            </dl>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="font-semibold">Clases del módulo</h2>
            </template>

            <ol class="space-y-1">
              <li v-for="(c, i) in classes" :key="c.id">
                <ULink
                  :to="classPath(c)"
                  class="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm"
                  :class="c.id === lesson.id ? 'bg-primary/10 font-semibold text-primary' : 'text-muted hover:bg-elevated hover:text-highlighted'"
                >
                  <span class="w-5 text-right tabular-nums">{{ i + 1 }}</span>
                  <span class="truncate">{{ c.title }}</span>
                  <UIcon v-if="!c.is_active" name="i-lucide-eye-off" class="ml-auto size-4 shrink-0 text-dimmed" aria-label="Inactiva" />
                </ULink>
              </li>
            </ol>
          </UCard>
        </div>
      </div>

      <div class="flex flex-wrap justify-between gap-3">
        <UButton
          v-if="current.prev"
          :to="classPath(current.prev)"
          :label="current.prev.title"
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="outline"
        />
        <span v-else />
        <UButton
          v-if="current.next"
          :to="classPath(current.next)"
          :label="current.next.title"
          trailing-icon="i-lucide-chevron-right"
          color="neutral"
          variant="outline"
        />
      </div>
    </template>

    <USkeleton v-else-if="status === 'pending' || courseStatus === 'pending'" class="h-96 rounded-lg" />

    <DashboardCourseClassFormModal
      v-model:open="formOpen"
      :lesson="lesson"
      :module-title="mod?.title"
      :loading="saving"
      @submit="onSubmit"
    />

    <DashboardDeleteModal v-model:item="deleting" title="Eliminar clase" :loading="saving" @confirm="onDelete" />
  </div>
</template>
