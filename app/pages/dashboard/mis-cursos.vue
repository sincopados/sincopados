<script setup lang="ts">
import type { Course, Database, Enrollment } from '~/types/db';

definePageMeta({
  middleware: 'role',
  roles: ['alumno'],
});

const client = useSupabaseClient<Database>();
const userId = useAuthUserId();

type ActiveEnrollment = Enrollment & { courses: Pick<Course, 'title' | 'description' | 'cover_url' | 'slug'> | null }

const { data: items, status } = await useAsyncData<ActiveEnrollment[]>('my-courses', async () => {
  if (!userId.value) return [];

  const { data, error } = await client
    .from('enrollments')
    .select('*, courses(title, description, cover_url, slug)')
    .eq('student_id', userId.value)
    .eq('status', 'activo')
    .order('enrolled_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as ActiveEnrollment[];
}, { watch: [userId] });
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">Mis cursos</h1>
      <p class="mt-1 text-muted">Cursos que tienes activos ahora mismo.</p>
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
      <UCard v-for="item in items" :key="item.id">
        <template #header>
          <NuxtImg
            v-if="item.courses?.cover_url"
            :src="item.courses.cover_url"
            :alt="item.courses?.title ?? ''"
            class="mb-3 h-32 w-full rounded-md object-cover"
          />
          <h2 class="font-semibold">{{ item.courses?.title ?? 'Curso' }}</h2>
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
          <p class="text-xs text-muted">
            Inscrito el {{ new Date(item.enrolled_at).toLocaleDateString('es-CO') }}
          </p>
        </template>
      </UCard>
    </div>
  </div>
</template>
