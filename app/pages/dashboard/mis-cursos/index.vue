<script setup lang="ts">
import type { Course, Database, Enrollment } from '~/types/db';

definePageMeta({
  middleware: 'role',
  roles: ['alumno'],
});

const client = useSupabaseClient<Database>();
const userId = useAuthUserId();
const localePath = useLocalePath();

type MyEnrollment = Enrollment & { courses: Pick<Course, 'title' | 'description' | 'cover_url' | 'slug'> | null }

// Activos y completados: los dos dan acceso al contenido del curso.
const { data: items, status } = await useAsyncData<MyEnrollment[]>('my-courses', async () => {
  if (!userId.value) return [];

  const { data, error } = await client
    .from('enrollments')
    .select('*, courses(title, description, cover_url, slug)')
    .eq('student_id', userId.value)
    .in('status', ['activo', 'completado'])
    .order('enrolled_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as MyEnrollment[];
}, { watch: [userId] });

const coursePath = (item: MyEnrollment) => localePath(`/dashboard/mis-cursos/${item.courses?.slug}`);
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">Mis cursos</h1>
      <p class="mt-1 text-muted">Los cursos en los que estás inscrito. Entra a uno para ver sus módulos y clases.</p>
    </div>

    <div v-if="status === 'pending'" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <USkeleton v-for="i in 3" :key="i" class="h-48" />
    </div>

    <UAlert
      v-else-if="!items?.length"
      icon="i-lucide-book-open"
      color="neutral"
      variant="subtle"
      title="No tienes cursos activos"
      description="Cuando te inscribas a un curso aparecerá aquí."
    />

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="item in items" :key="item.id" class="flex flex-col" :ui="{ body: 'flex-1' }">
        <template #header>
          <NuxtLink v-if="item.courses?.slug" :to="coursePath(item)" class="block">
            <NuxtPicture
              v-if="item.courses?.cover_url"
              :src="item.courses.cover_url"
              :alt="item.courses?.title ?? ''"
              class="mb-3 block h-32 w-full overflow-hidden rounded-md"
              :img-attrs="{ class: 'size-full object-cover' }"
              sizes="sm:90vw lg:45vw 2xl:30vw"
              loading="lazy"
              decoding="async"
            />
            <div class="flex items-start justify-between gap-2">
              <h2 class="font-semibold hover:text-primary">{{ item.courses?.title ?? 'Curso' }}</h2>
              <UBadge v-if="item.status === 'completado'" label="Completado" color="info" variant="subtle" size="sm" />
            </div>
          </NuxtLink>
        </template>

        <p v-if="item.courses?.description" class="line-clamp-3 text-sm text-muted">
          {{ item.courses.description }}
        </p>

        <div class="mt-4 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted">Progreso</span>
            <span class="font-medium">{{ item.progress }} %</span>
          </div>
          <UProgress :model-value="item.progress" />
        </div>

        <template #footer>
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs text-muted">
              Inscrito el {{ new Date(item.enrolled_at).toLocaleDateString('es-CO') }}
            </p>
            <UButton
              v-if="item.courses?.slug"
              :to="coursePath(item)"
              :label="item.status === 'completado' ? 'Repasar' : 'Entrar'"
              trailing-icon="i-lucide-arrow-right"
              size="sm"
            />
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
