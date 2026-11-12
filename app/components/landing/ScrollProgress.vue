<script setup lang="ts">
// Barra dorada superior que refleja cuánto se ha recorrido de la página.
const bar = useTemplateRef<HTMLElement>('bar')
useRafFn(() => {
  if (!bar.value) return
  const max = document.documentElement.scrollHeight - window.innerHeight
  bar.value.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
})
</script>

<template>
  <div ref="bar" class="progress" aria-hidden="true" />
</template>

<style scoped>
.progress { position: fixed; top: 0; left: 0; height: 2px; width: 100%; background: var(--gold); transform-origin: 0 50%; transform: scaleX(0); z-index: 100; }
</style>
