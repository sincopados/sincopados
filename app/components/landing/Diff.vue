<script setup lang="ts">
const items = [
  { k: '01 · Aplicación', title: 'Resultados inmediatos', text: 'Aprendes haciendo, con acompañamiento real de producción y monetización.' },
  { k: '02 · Equipo', title: 'Modelo de agencia real', text: 'No solo cursos: un equipo de trabajo activo al que puedes integrarte.' },
  { k: '03 · Filtro', title: 'Consulta estratégica', text: 'Sin prospección en frío. Conversamos con quien de verdad encaja en la red.' },
  { k: '04 · Nube', title: 'Escala sin fronteras', text: 'Operación remota y sistematizada para crecer desde cualquier lugar.' },
]
</script>

<template>
  <section class="diff">
    <div class="wrap">
      <p class="eyebrow rv">Por qué Sincopados</p>
      <h2 class="h-lg rv" data-d="1">Práctica, no <span class="gold">teoría</span></h2>
      <div class="diff-grid">
        <div v-for="(d, i) in items" :key="d.k" class="d-card rv" :data-d="i || undefined">
          <span class="k">{{ d.k }}</span>
          <h4>{{ d.title }}</h4>
          <p>{{ d.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.diff { padding: 120px 0 100px; background: var(--black); }
.diff-grid { display: grid; gap: 12px; margin-top: 44px; }
.d-card { padding: 28px 22px; border: 1px solid var(--line); border-radius: 18px; background: linear-gradient(180deg, var(--ink-2), var(--black)); transition: border-color .4s, transform .5s var(--ease); }
.d-card.in:hover { border-color: var(--gold); transform: translateY(-4px); }
.k { font-size: 12px; letter-spacing: .24em; text-transform: uppercase; color: var(--gold); }
.d-card h4 { font-weight: 700; text-transform: uppercase; font-size: 24px; line-height: 1.05; margin: 14px 0 10px; }
.d-card p { font-weight: 300; color: var(--muted); font-size: 17px; }

@media (min-width: 640px) {
  .diff-grid { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 960px) {
  .diff-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
