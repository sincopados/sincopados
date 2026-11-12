<script setup lang="ts">
import '~/assets/css/landing.css'

// Mismo header y footer que el resto del sitio; entre ambos, la landing a
// sangre completa (sin el contenedor del layout por defecto).
useHead({
  meta: [{ name: 'theme-color', content: '#000000' }],
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <SharedHeader />
    <div class="landing flex-1">
      <slot />
    </div>
    <SharedFooter />
  </div>
</template>
