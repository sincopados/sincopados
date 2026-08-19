<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui';
import { UBadge, UButton, UDropdownMenu } from '#components';
import type { Course, Database, Profile } from '~/types/db';

definePageMeta({
  middleware: 'role',
  roles: ['superusuario', 'tutor'],
});

const client = useSupabaseClient<Database>();
const toast = useToast();

const money = (value: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

const { data: courses, status, refresh } = await useAsyncData<Course[]>('courses', async () => {
  const { data, error } = await client.from('courses').select('*').order('title');
  if (error) throw error;
  return data ?? [];
});

const { data: students } = await useAsyncData<Profile[]>('students', async () => {
  const { data, error } = await client.from('profiles').select('*').eq('role', 'alumno').order('full_name');
  if (error) throw error;
  return data ?? [];
});

/* --- Alta de cursos --- */

const courseSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Sólo minúsculas, números y guiones'),
  description: z.string().max(500).optional().or(z.literal('')),
  cover_url: z.url().optional().or(z.literal('')),
  price: z.number().min(0),
  commission_rate: z.number().min(0).max(100),
});

type CourseSchema = z.output<typeof courseSchema>

const courseState = reactive({ title: '', slug: '', description: '', cover_url: '', price: 0, commission_rate: 10 });
const creating = ref(false);
const modalOpen = ref(false);

const createCourse = async (event: FormSubmitEvent<CourseSchema>) => {
  creating.value = true;

  const { error } = await client.from('courses').insert({
    title: event.data.title,
    slug: event.data.slug,
    description: event.data.description || null,
    cover_url: event.data.cover_url || null,
    price: event.data.price,
    commission_rate: event.data.commission_rate / 100,
  });

  creating.value = false;

  if (error) {
    toast.add({ title: 'No se pudo crear el curso', description: error.message, color: 'error' });
    return;
  }

  Object.assign(courseState, { title: '', slug: '', description: '', cover_url: '', price: 0, commission_rate: 10 });
  modalOpen.value = false;
  toast.add({ title: 'Curso creado', color: 'success' });
  await refresh();
};

const toggleActive = async (course: Course) => {
  const { error } = await client.from('courses').update({ is_active: !course.is_active }).eq('id', course.id);

  if (error) {
    toast.add({ title: 'No se pudo actualizar', description: error.message, color: 'error' });
    return;
  }

  await refresh();
};

const removeCourse = async (course: Course) => {
  if (!confirm(`¿Eliminar el curso "${course.title}"?`)) return;

  const { error } = await client.from('courses').delete().eq('id', course.id);

  if (error) {
    toast.add({
      title: 'No se pudo eliminar',
      description: 'Probablemente hay alumnos inscritos en este curso.',
      color: 'error',
    });
    return;
  }

  await refresh();
};

/* --- Inscripción de alumnos --- */

const enrollSchema = z.object({
  student_id: z.uuid('Selecciona un alumno'),
  course_id: z.uuid('Selecciona un curso'),
  amount: z.number().min(0),
});

type EnrollSchema = z.output<typeof enrollSchema>

const enrollState = reactive({ student_id: '', course_id: '', amount: 0 });
const enrolling = ref(false);

// Igual que con los servicios, el trigger de la base de datos genera la
// comisión para quien refirió al alumno.
const enroll = async (event: FormSubmitEvent<EnrollSchema>) => {
  enrolling.value = true;

  const { error } = await client.from('enrollments').insert({
    student_id: event.data.student_id,
    course_id: event.data.course_id,
    amount: event.data.amount,
  });

  enrolling.value = false;

  if (error) {
    toast.add({
      title: 'No se pudo inscribir',
      description: error.code === '23505' ? 'El alumno ya está inscrito en este curso.' : error.message,
      color: 'error',
    });
    return;
  }

  Object.assign(enrollState, { student_id: '', course_id: '', amount: 0 });
  toast.add({ title: 'Alumno inscrito', color: 'success' });
};

const studentOptions = computed(() =>
  (students.value ?? []).map(s => ({ label: s.full_name || s.email, value: s.id })),
);

const courseOptions = computed(() =>
  (courses.value ?? []).filter(c => c.is_active).map(c => ({ label: c.title, value: c.id })),
);

watch(() => enrollState.course_id, (id) => {
  const found = (courses.value ?? []).find(c => c.id === id);
  if (found) enrollState.amount = Number(found.price);
});

const columns: TableColumn<Course>[] = [
  { accessorKey: 'title', header: 'Curso' },
  { accessorKey: 'price', header: 'Precio', cell: ({ row }) => money(row.original.price, row.original.currency) },
  {
    accessorKey: 'commission_rate',
    header: 'Comisión referido',
    cell: ({ row }) => `${(row.original.commission_rate * 100).toFixed(1)} %`,
  },
  {
    accessorKey: 'is_active',
    header: 'Estado',
    cell: ({ row }) => h(
      UBadge,
      { color: row.original.is_active ? 'success' : 'neutral', variant: 'subtle' },
      () => (row.original.is_active ? 'Activo' : 'Inactivo'),
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => h('div', { class: 'flex justify-end' }, [
      h(UDropdownMenu, {
        items: [[
          {
            label: row.original.is_active ? 'Desactivar' : 'Activar',
            icon: row.original.is_active ? 'i-lucide-eye-off' : 'i-lucide-eye',
            onSelect: () => toggleActive(row.original),
          },
          {
            label: 'Eliminar',
            icon: 'i-lucide-trash-2',
            color: 'error' as const,
            onSelect: () => removeCourse(row.original),
          },
        ]],
        content: { align: 'end' },
      }, {
        default: () => h(UButton, {
          icon: 'i-lucide-ellipsis-vertical',
          color: 'neutral',
          variant: 'ghost',
          square: true,
        }),
      }),
    ]),
  },
];
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Cursos</h1>
        <p class="mt-1 text-muted">Catálogo de cursos e inscripción de alumnos.</p>
      </div>

      <UModal v-model:open="modalOpen" title="Nuevo curso">
        <UButton icon="i-lucide-plus" label="Nuevo curso" />

        <template #body>
          <UForm :schema="courseSchema" :state="courseState" class="space-y-4" @submit="createCourse">
            <UFormField label="Título" name="title" required>
              <UInput v-model="courseState.title" class="w-full" />
            </UFormField>

            <UFormField label="Slug" name="slug" required>
              <UInput v-model="courseState.slug" class="w-full" placeholder="edicion-de-video" />
            </UFormField>

            <UFormField label="Descripción" name="description">
              <UTextarea v-model="courseState.description" class="w-full" />
            </UFormField>

            <UFormField label="Portada (URL)" name="cover_url">
              <UInput v-model="courseState.cover_url" class="w-full" placeholder="https://…" />
            </UFormField>

            <UFormField label="Precio (COP)" name="price" required>
              <UInputNumber v-model="courseState.price" :min="0" class="w-full" />
            </UFormField>

            <UFormField label="Comisión por referido (%)" name="commission_rate" required>
              <UInputNumber v-model="courseState.commission_rate" :min="0" :max="100" class="w-full" />
            </UFormField>

            <UButton type="submit" label="Crear curso" :loading="creating" />
          </UForm>
        </template>
      </UModal>
    </div>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Catálogo</h2>
      </template>

      <UTable
        :data="courses ?? []"
        :columns="columns"
        :loading="status === 'pending'"
        empty="Aún no hay cursos"
      />
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Inscribir un alumno</h2>
      </template>

      <UForm :schema="enrollSchema" :state="enrollState" class="grid gap-4 md:grid-cols-3" @submit="enroll">
        <UFormField label="Alumno" name="student_id" required>
          <USelectMenu v-model="enrollState.student_id" :items="studentOptions" value-key="value" class="w-full" />
        </UFormField>

        <UFormField label="Curso" name="course_id" required>
          <USelectMenu v-model="enrollState.course_id" :items="courseOptions" value-key="value" class="w-full" />
        </UFormField>

        <UFormField label="Valor cobrado" name="amount" required>
          <UInputNumber v-model="enrollState.amount" :min="0" class="w-full" />
        </UFormField>

        <div class="md:col-span-3">
          <UButton type="submit" label="Inscribir alumno" :loading="enrolling" />
        </div>
      </UForm>
    </UCard>
  </div>
</template>
