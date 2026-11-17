<script setup lang="ts">
import type { CourseClass, CourseModule } from '~/types/db'

definePageMeta({
  middleware: 'role',
  roles: ['superusuario', 'tutor'],
})

const route = useRoute()
const localePath = useLocalePath()
const { isSuperuser } = useProfile()

const courseSlug = computed(() => String(route.params.slug))
const moduleSlug = computed(() => String(route.params.modulo))

// Misma clave que la página del curso: entrar desde allí no repite la consulta.
const { course, modules, findModule, status, error, saving, update, remove } = useCourseModules(courseSlug)

// Misma clave que la página de cada clase.
const {
  classes,
  status: classesStatus,
  error: classesError,
  saving: savingClass,
  create: createClass,
  update: updateClass,
  remove: removeClass,
} = useModuleClasses(moduleSlug)

const current = computed(() => findModule(moduleSlug.value))
const mod = computed(() => current.value?.module ?? null)

watchEffect(() => {
  if (status.value !== 'success') return
  if (!course.value) showError({ statusCode: 404, statusMessage: 'Curso no encontrado' })
  else if (!mod.value) showError({ statusCode: 404, statusMessage: 'Módulo no encontrado' })
})

useSeoMeta({
  title: () => (mod.value && course.value ? `${mod.value.title} · ${course.value.title}` : 'Módulo'),
})
useBreadcrumbLabels(() => ({
  [courseSlug.value]: course.value?.title,
  [moduleSlug.value]: mod.value?.title,
}))

const coursePath = computed(() => localePath(`/dashboard/cursos/${courseSlug.value}`))
const modulePath = (m: CourseModule) => localePath(`/dashboard/cursos/${courseSlug.value}/${m.slug}`)
const classPath = (c: CourseClass) => localePath(`/dashboard/cursos/${courseSlug.value}/${moduleSlug.value}/${c.slug}`)

const dateTime = (value: string) =>
  new Date(value).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })

const coverFailed = ref(false)
watch(moduleSlug, () => { coverFailed.value = false })

/* --- Módulo: edición (si cambia el slug, la URL lo sigue) y borrado --- */

const formOpen = ref(false)
const openEdit = () => {
  formOpen.value = true
}

const onSubmit = async (data: CourseModuleFormData) => {
  if (!mod.value) return
  if (!(await update(mod.value.id, data))) return
  formOpen.value = false
  if (data.slug !== moduleSlug.value) {
    await navigateTo(localePath(`/dashboard/cursos/${courseSlug.value}/${data.slug}`), { replace: true })
  }
}

const deleting = ref<CourseModule | null>(null)
const askDelete = () => {
  deleting.value = mod.value
}

const onDelete = async (m: CourseModule) => {
  if (!(await remove(m.id))) return
  deleting.value = null
  await navigateTo(coursePath.value, { replace: true })
}

/* --- Clases: alta, edición y borrado --- */

const classFormOpen = ref(false)
const editingClass = ref<CourseClass | null>(null)

const openCreateClass = () => {
  editingClass.value = null
  classFormOpen.value = true
}

const openEditClass = (c: CourseClass) => {
  editingClass.value = c
  classFormOpen.value = true
}

const onSubmitClass = async (data: CourseClassFormData) => {
  const ok = editingClass.value
    ? await updateClass(editingClass.value.id, data)
    : await createClass(data)
  if (ok) classFormOpen.value = false
}

const deletingClass = ref<CourseClass | null>(null)

const onDeleteClass = async (c: CourseClass) => {
  if (await removeClass(c.id)) deletingClass.value = null
}
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
          <!-- Contenido del módulo -->
          <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
            <div class="aspect-video bg-elevated">
              <img
                v-if="mod.cover_url && !coverFailed"
                :src="mod.cover_url"
                :alt="mod.title"
                class="size-full object-cover"
                @error="coverFailed = true"
              >
              <div v-else class="flex size-full flex-col items-center justify-center gap-2 text-dimmed">
                <UIcon name="i-lucide-image-off" class="size-10" />
                <span class="text-sm">{{ mod.cover_url ? 'No se pudo cargar la portada' : 'Sin portada' }}</span>
              </div>
            </div>

            <div class="space-y-4 p-6">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-sm font-medium text-primary">
                      Módulo {{ current.position }} de {{ modules.length }}
                    </p>
                    <UBadge
                      :label="mod.is_active ? 'Activo' : 'Inactivo'"
                      :color="mod.is_active ? 'success' : 'neutral'"
                      variant="subtle"
                      size="sm"
                    />
                  </div>
                  <h1 class="mt-1 text-2xl font-bold text-highlighted text-balance">{{ mod.title }}</h1>
                </div>

                <div v-if="isSuperuser" class="flex gap-2">
                  <UButton label="Editar" icon="i-lucide-pencil" color="neutral" variant="outline" @click="openEdit" />
                  <UButton label="Eliminar" icon="i-lucide-trash-2" color="error" variant="ghost" @click="askDelete" />
                </div>
              </div>

              <p v-if="mod.description" class="whitespace-pre-line text-muted">{{ mod.description }}</p>
              <p v-else class="italic text-dimmed">Este módulo todavía no tiene descripción.</p>
            </div>
          </UCard>

          <!-- Clases del módulo -->
          <UCard>
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 class="text-lg font-semibold">Clases</h2>
                  <p class="text-sm text-muted">
                    {{ classes.length }} {{ classes.length === 1 ? 'clase' : 'clases' }}
                  </p>
                </div>
                <UButton v-if="isSuperuser" icon="i-lucide-plus" label="Agregar clase" size="sm" @click="openCreateClass" />
              </div>
            </template>

            <UAlert
              v-if="classesError"
              color="error"
              variant="subtle"
              icon="i-lucide-circle-alert"
              title="No se pudieron cargar las clases"
              :description="classesError.message"
            />

            <div v-else-if="classes.length" class="space-y-3">
              <DashboardCourseClassItem
                v-for="(c, i) in classes"
                :key="c.id"
                :lesson="c"
                :index="i + 1"
                :to="classPath(c)"
                :can-manage="isSuperuser"
                @edit="openEditClass(c)"
                @delete="deletingClass = c"
              />
            </div>

            <div v-else-if="classesStatus === 'pending'" class="space-y-3">
              <USkeleton v-for="i in 3" :key="i" class="h-20 rounded-lg" />
            </div>

            <UEmpty
              v-else
              icon="i-lucide-clapperboard"
              title="Este módulo aún no tiene clases"
              :description="isSuperuser ? 'Agrega la primera clase con su video y contenido.' : 'Un superusuario las agregará pronto.'"
              :actions="isSuperuser ? [{ label: 'Agregar clase', icon: 'i-lucide-plus', onClick: openCreateClass }] : undefined"
              variant="naked"
            />
          </UCard>
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
                  <ULink :to="coursePath" class="font-medium text-highlighted hover:text-primary">{{ course.title }}</ULink>
                </dd>
              </div>
              <div>
                <dt class="text-muted">Estado</dt>
                <dd class="text-highlighted">{{ mod.is_active ? 'Activo' : 'Inactivo (oculto a los alumnos)' }}</dd>
              </div>
              <div>
                <dt class="text-muted">Slug</dt>
                <dd class="font-mono text-highlighted">{{ mod.slug }}</dd>
              </div>
              <div>
                <dt class="text-muted">Portada</dt>
                <dd class="truncate">
                  <ULink v-if="mod.cover_url" :to="mod.cover_url" target="_blank" rel="noopener" class="text-primary">
                    {{ mod.cover_url }}
                  </ULink>
                  <span v-else class="text-dimmed">—</span>
                </dd>
              </div>
              <div>
                <dt class="text-muted">Creado</dt>
                <dd class="text-highlighted">{{ dateTime(mod.created_at) }}</dd>
              </div>
              <div>
                <dt class="text-muted">Última edición</dt>
                <dd class="text-highlighted">{{ dateTime(mod.updated_at) }}</dd>
              </div>
            </dl>
          </UCard>

          <UCard>
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
                  <UIcon v-if="!m.is_active" name="i-lucide-eye-off" class="ml-auto size-4 shrink-0 text-dimmed" aria-label="Inactivo" />
                </ULink>
              </li>
            </ol>
          </UCard>
        </div>
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

    <DashboardCourseModuleFormModal
      v-model:open="formOpen"
      :module="mod"
      :course-title="course?.title"
      :loading="saving"
      @submit="onSubmit"
    />

    <DashboardDeleteModal
      v-model:item="deleting"
      title="Eliminar módulo"
      warning="También se eliminarán todas sus clases."
      :loading="saving"
      @confirm="onDelete"
    />

    <DashboardCourseClassFormModal
      v-model:open="classFormOpen"
      :lesson="editingClass"
      :module-title="mod?.title"
      :loading="savingClass"
      @submit="onSubmitClass"
    />

    <DashboardDeleteModal
      v-model:item="deletingClass"
      title="Eliminar clase"
      :loading="savingClass"
      @confirm="onDeleteClass"
    />
  </div>
</template>
