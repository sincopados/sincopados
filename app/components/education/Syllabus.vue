<script setup lang="ts">
import type { SyllabusModule } from '~/composables/useCourseCatalog'

/**
 * Temario público de un curso: cada módulo con su descripción y la lista de
 * títulos de sus clases. No hay enlaces a las clases: su contenido es sólo
 * para alumnos inscritos.
 */
const props = withDefaults(defineProps<{
  modules: SyllabusModule[]
  /** Módulos abiertos al cargar: todos, sólo el primero o ninguno. */
  open?: 'all' | 'first' | 'none'
}>(), { open: 'first' })

const items = computed(() =>
  props.modules.map((m, i) => ({ label: m.title, value: m.id, module: m, index: i + 1 })),
)

const opened = ref<string[]>(
  props.open === 'all'
    ? props.modules.map(m => m.id)
    : props.open === 'first' && props.modules[0]
      ? [props.modules[0].id]
      : [],
)
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-default">
    <UAccordion
      v-model="opened"
      type="multiple"
      :items="items"
      :ui="{
        item: 'border-b border-default last:border-b-0',
        trigger: 'px-4 sm:px-5 py-4 hover:bg-elevated/40',
        content: 'px-4 sm:px-5',
      }"
    >
      <template #default="{ item }">
        <div class="flex min-w-0 items-center gap-3 text-left">
          <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary tabular-nums">
            {{ item.index }}
          </span>
          <div class="min-w-0">
            <p class="truncate font-semibold text-highlighted">{{ item.label }}</p>
            <p class="text-xs font-normal text-muted">
              {{ item.module.classes.length }} {{ item.module.classes.length === 1 ? 'clase' : 'clases' }}
            </p>
          </div>
        </div>
      </template>

      <template #body="{ item }">
        <p v-if="item.module.description" class="mb-3 whitespace-pre-line text-sm text-muted">{{ item.module.description }}</p>

        <ol v-if="item.module.classes.length" class="space-y-1 pb-1">
          <li
            v-for="(c, i) in item.module.classes"
            :key="c.id"
            class="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm text-default"
          >
            <UIcon
              :name="c.has_video ? 'i-lucide-circle-play' : 'i-lucide-file-text'"
              class="size-4 shrink-0 text-muted"
              :aria-label="c.has_video ? 'Clase en video' : 'Clase de lectura'"
            />
            <span class="w-5 text-right text-muted tabular-nums">{{ i + 1 }}</span>
            <span class="min-w-0 flex-1">{{ c.title }}</span>
            <UIcon name="i-lucide-lock" class="size-3.5 shrink-0 text-dimmed" aria-label="Disponible al inscribirte" />
          </li>
        </ol>
        <p v-else class="pb-1 text-sm italic text-dimmed">Las clases de este módulo se publicarán pronto.</p>
      </template>
    </UAccordion>
  </div>
</template>
