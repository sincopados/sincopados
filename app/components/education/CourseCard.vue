<script setup lang="ts">
import type { PublicCourse } from '~/composables/useCourseCatalog'

const props = defineProps<{
  course: PublicCourse
  /** Tamaño del temario, si se conoce. */
  totals?: { modules: number, classes: number }
}>()

const localePath = useLocalePath()
const to = computed(() => localePath(`/educacion/${props.course.slug}`))
const coverFailed = ref(false)
</script>

<template>
  <article class="group flex h-full flex-col overflow-hidden rounded-xl border border-default bg-default transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
    <NuxtLink :to="to" class="relative block aspect-video overflow-hidden bg-elevated" :aria-label="`Ver ${course.title}`">
      <img
        v-if="course.cover_url && !coverFailed"
        :src="course.cover_url"
        :alt="course.title"
        loading="lazy"
        class="size-full object-cover transition duration-500 group-hover:scale-105"
        @error="coverFailed = true"
      >
      <div v-else class="flex size-full items-center justify-center text-dimmed">
        <UIcon name="i-lucide-graduation-cap" class="size-12" />
      </div>
    </NuxtLink>

    <div class="flex flex-1 flex-col gap-3 p-5">
      <h3 class="text-lg font-semibold text-highlighted text-balance">
        <NuxtLink :to="to" class="hover:text-primary">{{ course.title }}</NuxtLink>
      </h3>
      <p v-if="course.description" class="line-clamp-3 text-sm text-muted">{{ course.description }}</p>

      <div v-if="totals?.modules" class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        <span class="flex items-center gap-1.5">
          <UIcon name="i-lucide-layers" class="size-4 text-primary" />
          {{ totals.modules }} {{ totals.modules === 1 ? 'módulo' : 'módulos' }}
        </span>
        <span class="flex items-center gap-1.5">
          <UIcon name="i-lucide-circle-play" class="size-4 text-primary" />
          {{ totals.classes }} {{ totals.classes === 1 ? 'clase' : 'clases' }}
        </span>
      </div>

      <div class="mt-auto flex items-center justify-between gap-3 pt-2">
        <span class="text-lg font-bold text-highlighted">{{ formatCoursePrice(course.price, course.currency) }}</span>
        <UButton :to="to" label="Ver curso" trailing-icon="i-lucide-arrow-right" size="sm" />
      </div>
    </div>
  </article>
</template>
