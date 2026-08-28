<script setup lang="ts">
import type { TrackedStage } from '~/composables/useServiceStages'
import type { ServiceStage } from '~/types/db'

const props = defineProps<{
  stages: TrackedStage[]
  /** Etapa en curso: la primera sin cumplir. */
  current: TrackedStage | null
  /** `true` para el superusuario y el responsable del servicio. */
  editable: boolean
  /** Etapa que está guardando ahora mismo, si hay alguna. */
  saving: ServiceStage | null
  loading?: boolean
}>()

const emit = defineEmits<{ toggle: [stage: TrackedStage] }>()

const dateTime = (value: string) =>
  new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

const signedBy = (stage: TrackedStage) =>
  stage.completed_profile?.full_name || stage.completed_profile?.email || 'el equipo'

const stateOf = (stage: TrackedStage) => {
  if (stage.completed_at) return 'done'
  return props.current?.id === stage.id ? 'current' : 'pending'
}
</script>

<template>
  <div v-if="loading" class="space-y-4">
    <USkeleton v-for="i in 5" :key="i" class="h-16" />
  </div>

  <UAlert
    v-else-if="!stages.length"
    icon="i-lucide-route"
    color="neutral"
    variant="subtle"
    title="Sin trazabilidad todavía"
    description="Las etapas se crean al contratar el servicio."
  />

  <ol v-else class="relative space-y-1">
    <li
      v-for="(stage, index) in stages"
      :key="stage.id"
      class="relative flex gap-4 pb-6 last:pb-0"
    >
      <!-- Línea que une los hitos; se corta en el último. -->
      <span
        v-if="index < stages.length - 1"
        class="absolute left-[1.125rem] top-10 h-[calc(100%-1.5rem)] w-px"
        :class="stage.completed_at ? 'bg-primary' : 'bg-default'"
        aria-hidden="true"
      />

      <span
        class="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
        :class="{
          'border-primary bg-primary text-inverted': stateOf(stage) === 'done',
          'border-primary bg-elevated text-primary': stateOf(stage) === 'current',
          'border-default bg-elevated text-dimmed': stateOf(stage) === 'pending',
        }"
      >
        <UIcon
          :name="stage.completed_at ? 'i-lucide-check' : SERVICE_STAGE_ICONS[stage.stage]"
          class="size-4"
        />
      </span>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h3
            class="font-semibold"
            :class="stateOf(stage) === 'pending' ? 'text-muted' : 'text-highlighted'"
          >
            {{ SERVICE_STAGE_LABELS[stage.stage] }}
          </h3>

          <UBadge v-if="stateOf(stage) === 'current'" color="primary" variant="subtle" size="sm">
            En curso
          </UBadge>
          <UBadge v-else-if="stage.completed_at" color="success" variant="subtle" size="sm">
            Cumplida
          </UBadge>
        </div>

        <p class="mt-0.5 text-sm text-muted">
          {{ SERVICE_STAGE_DESCRIPTIONS[stage.stage] }}
        </p>

        <p v-if="stage.completed_at" class="mt-1 text-xs text-dimmed">
          Cumplida el {{ dateTime(stage.completed_at) }} por {{ signedBy(stage) }}.
        </p>

        <p v-if="stage.notes" class="mt-2 rounded-md bg-elevated px-3 py-2 text-sm text-toned">
          {{ stage.notes }}
        </p>

        <UButton
          v-if="editable"
          class="mt-3"
          size="xs"
          :color="stage.completed_at ? 'neutral' : 'primary'"
          :variant="stage.completed_at ? 'outline' : 'solid'"
          :icon="stage.completed_at ? 'i-lucide-rotate-ccw' : 'i-lucide-check'"
          :label="stage.completed_at ? 'Reabrir etapa' : 'Marcar como cumplida'"
          :loading="saving === stage.stage"
          @click="emit('toggle', stage)"
        />
      </div>
    </li>
  </ol>
</template>
