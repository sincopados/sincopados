<script setup lang="ts">
import type { CourseModule } from '~/types/db'

definePageMeta({
  middleware: 'role',
  roles: ['superusuario', 'tutor'],
})

const route = useRoute()
const localePath = useLocalePath()
const { isSuperuser } = useProfile()

const courseSlug = computed(() => String(route.params.slug))
const { course, modules, status, error, saving, create, update, remove } = useCourseModules(courseSlug)

// Un slug que no corresponde a ningún curso visible es un 404, no una página vacía.
watchEffect(() => {
  if (status.value === 'success' && !course.value) {
    showError({ statusCode: 404, statusMessage: 'Curso no encontrado' })
  }
})

useSeoMeta({ title: () => (course.value ? `Módulos · ${course.value.title}` : 'Módulos del curso') })
useBreadcrumbLabels(() => ({ [courseSlug.value]: course.value?.title }))

const modulePath = (m: CourseModule) => localePath(`/dashboard/cursos/${courseSlug.value}/${m.slug}`)

/* --- Alta y edición --- */

const formOpen = ref(false)
const editingModule = ref<CourseModule | null>(null)

const openCreate = () => {
  editingModule.value = null
  formOpen.value = true
}

const openEdit = (m: CourseModule) => {
  editingModule.value = m
  formOpen.value = true
}

const onSubmit = async (data: CourseModuleFormData) => {
  const ok = editingModule.value
    ? await update(editingModule.value.id, data)
    : await create(data)
  if (ok) formOpen.value = false
}

/* --- Borrado --- */

const deleting = ref<CourseModule | null>(null)

const onDelete = async (m: CourseModule) => {
  if (await remove(m.id)) deleting.value = null
}
</script>

<template>
  <div class="space-y-6">
    <UButton
      :to="localePath('/dashboard/cursos')"
      label="Volver a cursos"
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

    <template v-else-if="course">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-2xl font-bold text-highlighted">{{ course.title }}</h1>
            <UBadge
              :label="course.is_active ? 'Activo' : 'Inactivo'"
              :color="course.is_active ? 'success' : 'neutral'"
              variant="subtle"
            />
          </div>
          <p class="mt-1 text-muted">
            {{ modules.length }} {{ modules.length === 1 ? 'módulo' : 'módulos' }}
            <template v-if="!isSuperuser"> · Sólo un superusuario puede modificarlos.</template>
          </p>
        </div>

        <UButton v-if="isSuperuser" icon="i-lucide-plus" label="Agregar módulo" @click="openCreate" />
      </div>

      <div v-if="modules.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCourseModuleCard
          v-for="(m, i) in modules"
          :key="m.id"
          :module="m"
          :index="i + 1"
          :to="modulePath(m)"
          :can-manage="isSuperuser"
          @edit="openEdit(m)"
          @delete="deleting = m"
        />
      </div>

      <UEmpty
        v-else
        icon="i-lucide-layers"
        title="Este curso aún no tiene módulos"
        :description="isSuperuser ? 'Agrega el primero para empezar a armar el contenido.' : 'Un superusuario los agregará pronto.'"
        :actions="isSuperuser ? [{ label: 'Agregar módulo', icon: 'i-lucide-plus', onClick: openCreate }] : undefined"
        variant="outline"
      />
    </template>

    <div v-else-if="status === 'pending'" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <USkeleton v-for="i in 3" :key="i" class="h-72 rounded-lg" />
    </div>

    <DashboardCourseModuleFormModal
      v-model:open="formOpen"
      :module="editingModule"
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
  </div>
</template>
