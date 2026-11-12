<script setup lang="ts">
const stats = [
  { n: 4, label: 'Pilares conectados' },
  { n: 6, label: 'Canales en la red' },
  { n: 20, label: 'Cupos máx. por cohorte' },
  { n: 100, suffix: '%', label: 'Digital y en la nube' },
]
</script>

<template>
  <section class="stats" aria-label="El centro de medios en cifras">
    <div class="wrap">
      <div class="stats-grid">
        <div v-for="(s, i) in stats" :key="s.label" class="stat rv" :data-d="i || undefined">
          <div class="n"><LandingCounter :to="s.n" />{{ s.suffix }}</div>
          <div class="l">{{ s.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats { padding: 20px 0 110px; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
.stat { padding: 26px 18px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.n { font-weight: 700; font-size: clamp(48px, 13vw, 104px); line-height: .9; color: var(--gold); letter-spacing: -.02em; }
.l { margin-top: 10px; font-size: 13px; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); }

@media (min-width: 640px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
