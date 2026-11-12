<template>
  <div class="grain" aria-hidden="true" />
</template>

<style scoped>
/* Grano cinematográfico: ruido SVG que salta en 6 pasos. */
.grain {
  position: fixed; inset: -50%; width: 200%; height: 200%; pointer-events: none; z-index: 90; opacity: .06;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: grain 1.2s steps(6) infinite;
}
@keyframes grain {
  0% { transform: translate(0, 0); }
  20% { transform: translate(-3%, 2%); }
  40% { transform: translate(2%, -3%); }
  60% { transform: translate(-2%, -1%); }
  80% { transform: translate(3%, 3%); }
  100% { transform: translate(0, 0); }
}
</style>
