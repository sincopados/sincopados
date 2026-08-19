<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon: string
  hint?: string
  color?: string
}>();
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-muted">{{ label }}</span>
        <UIcon :name="icon" class="size-5" :class="color ?? 'text-primary'" />
      </div>
    </template>

    <div class="flex items-baseline gap-2">
      <span class="text-2xl font-bold text-highlighted">{{ value }}</span>
      <span v-if="hint" class="text-xs text-muted">{{ hint }}</span>
    </div>
  </UCard>
</template>
