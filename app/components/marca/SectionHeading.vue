<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description?: string
}>()
</script>

<template>
  <div data-reveal class="max-w-3xl space-y-4">
    <p class="text-xs uppercase tracking-[0.4em] text-brand-500">
      {{ eyebrow }}
    </p>
    <h2 class="text-3xl font-bold uppercase leading-tight tracking-tight text-white sm:text-4xl">
      {{ title }}
    </h2>
    <p v-if="description" class="text-base leading-relaxed text-white/60">
      {{ description }}
    </p>
  </div>
</template>
