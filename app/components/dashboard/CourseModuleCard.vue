<script setup lang="ts">
import type { CourseModule } from '~/types/db'

defineProps<{
  module: CourseModule
  /** Número de orden que se muestra en la portada. */
  index: number
  /** Ruta a la página del módulo. */
  to: string
  /** Muestra las acciones de edición; sólo para superusuario. */
  canManage?: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const coverFailed = ref(false)
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }" class="flex h-full flex-col overflow-hidden">
    <NuxtLink :to="to" class="relative block aspect-video bg-elevated" :aria-label="`Ver ${module.title}`">
      <img
        v-if="module.cover_url && !coverFailed"
        :src="module.cover_url"
        :alt="module.title"
        loading="lazy"
        class="size-full object-cover"
        @error="coverFailed = true"
      >
      <div v-else class="flex size-full items-center justify-center text-dimmed">
        <UIcon name="i-lucide-image-off" class="size-8" />
      </div>
      <span class="absolute left-3 top-3 rounded-md bg-default/90 px-2 py-0.5 text-xs font-semibold text-highlighted tabular-nums">
        Módulo {{ index }}
      </span>
      <UBadge
        :label="module.is_active ? 'Activo' : 'Inactivo'"
        :color="module.is_active ? 'success' : 'neutral'"
        variant="solid"
        size="sm"
        class="absolute right-3 top-3"
      />
    </NuxtLink>

    <div class="flex flex-1 flex-col gap-2 p-4">
      <h3 class="font-semibold text-highlighted">
        <ULink :to="to" class="hover:text-primary">{{ module.title }}</ULink>
      </h3>
      <p class="font-mono text-xs text-dimmed">/{{ module.slug }}</p>
      <p v-if="module.description" class="line-clamp-3 text-sm text-muted">{{ module.description }}</p>
      <p v-else class="text-sm italic text-dimmed">Sin descripción.</p>
    </div>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-2">
        <UButton :to="to" label="Ver" icon="i-lucide-eye" color="neutral" variant="ghost" size="sm" class="mr-auto" />
        <template v-if="canManage">
          <UButton label="Editar" icon="i-lucide-pencil" color="neutral" variant="outline" size="sm" @click="emit('edit')" />
          <UButton label="Eliminar" icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" @click="emit('delete')" />
        </template>
      </div>
    </template>
  </UCard>
</template>
