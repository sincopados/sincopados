<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { CourseEnrollmentCount, Database } from '~/types/db'

/**
 * Alumnos inscritos por curso, para superusuario y tutor.
 *
 * El conteo lo hace la vista `course_enrollment_counts` en Postgres; la RLS
 * sólo deja ver todos los cursos e inscripciones al staff, así que a otros
 * roles no se les debe montar este componente.
 */
const client = useSupabaseClient<Database>()
const localePath = useLocalePath()

const { data: rows, status, error } = await useAsyncData('course-enrollment-counts', async () => {
  const { data, error } = await client
    .from('course_enrollment_counts')
    .select('*')
    .order('total', { ascending: false })
    .order('title')
  if (error) throw error
  return data ?? []
})

const totals = computed(() => {
  const list = rows.value ?? []
  return {
    courses: list.length,
    students: list.reduce((sum, r) => sum + (r.total ?? 0), 0),
    active: list.reduce((sum, r) => sum + (r.active ?? 0), 0),
  }
})

// La barra de cada curso se mide contra el curso con más inscritos.
const max = computed(() => Math.max(1, ...(rows.value ?? []).map(r => r.total ?? 0)))

const columns: TableColumn<CourseEnrollmentCount>[] = [
  { accessorKey: 'title', header: 'Curso' },
  { accessorKey: 'total', header: 'Inscritos' },
  { accessorKey: 'active', header: 'Activos' },
  { accessorKey: 'completed', header: 'Completados' },
  { accessorKey: 'cancelled', header: 'Cancelados' },
]
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold">Alumnos por curso</h2>
          <p class="text-sm text-muted">
            {{ totals.students }} inscripciones en {{ totals.courses }} cursos · {{ totals.active }} activas
          </p>
        </div>
        <UButton
          :to="localePath('/dashboard/cursos')"
          label="Gestionar cursos"
          icon="i-lucide-book-open"
          color="neutral"
          variant="outline"
          size="sm"
        />
      </div>
    </template>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="No se pudo cargar el conteo de alumnos"
      :description="error.message"
    />

    <UTable
      v-else
      :data="rows ?? []"
      :columns="columns"
      :loading="status === 'pending'"
      empty="Todavía no hay cursos creados."
    >
      <template #title-cell="{ row }">
        <div class="flex items-center gap-2">
          <ULink
            :to="localePath(`/dashboard/cursos/${row.original.slug}`)"
            class="font-medium text-highlighted hover:text-primary"
          >
            {{ row.original.title }}
          </ULink>
          <UBadge v-if="!row.original.is_active" label="Inactivo" color="neutral" variant="subtle" size="sm" />
        </div>
      </template>

      <template #total-cell="{ row }">
        <div class="flex min-w-32 items-center gap-3">
          <span class="w-8 text-right font-semibold text-highlighted tabular-nums">{{ row.original.total ?? 0 }}</span>
          <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated" aria-hidden="true">
            <div
              class="h-full rounded-full bg-primary transition-[width] duration-500"
              :style="{ width: `${((row.original.total ?? 0) / max) * 100}%` }"
            />
          </div>
        </div>
      </template>

      <template #active-cell="{ row }">
        <span class="text-success tabular-nums">{{ row.original.active ?? 0 }}</span>
      </template>

      <template #completed-cell="{ row }">
        <span class="text-info tabular-nums">{{ row.original.completed ?? 0 }}</span>
      </template>

      <template #cancelled-cell="{ row }">
        <span class="text-muted tabular-nums">{{ row.original.cancelled ?? 0 }}</span>
      </template>
    </UTable>
  </UCard>
</template>
