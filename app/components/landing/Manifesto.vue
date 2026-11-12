<script setup lang="ts">
const { reduce } = useLandingMotion()

// El texto se parte en palabras en el servidor; `hl` las pinta de dorado
// cuando se encienden.
const parts: { text: string, hl?: boolean }[] = [
  { text: 'No somos una agencia tradicional de prospección en frío. Somos una' },
  { text: 'red autosustentable', hl: true },
  { text: 'que transforma la' },
  { text: 'atención', hl: true },
  { text: 'en' },
  { text: 'ingresos', hl: true },
  { text: 'reales.' },
]
const words = parts.flatMap(p => p.text.split(/\s+/).map(w => ({ w, hl: !!p.hl })))

// Las palabras se encienden en orden según cuánto del bloque ha recorrido el scroll.
const text = useTemplateRef<HTMLElement>('text')
const lit = ref(0)
useRafFn(() => {
  if (reduce.value) { lit.value = words.length; return }
  if (!text.value) return
  const r = text.value.getBoundingClientRect()
  const vh = window.innerHeight
  const p = fxClamp((vh * 0.85 - r.top) / (r.height + vh * 0.35))
  lit.value = Math.floor(p * words.length * 1.08)
})
</script>

<template>
  <section class="manifesto">
    <div class="wrap">
      <p class="eyebrow">Manifiesto</p>
      <p ref="text" class="manifesto-text">
        <template v-for="(word, i) in words" :key="i">
          <span class="w" :class="{ hl: word.hl, on: i < lit }">{{ word.w }}</span>{{ ' ' }}
        </template>
      </p>
      <div class="manifesto-foot">
        <p class="lead rv">
          Contenido de alto impacto, interconexión multiplataforma y sistemas digitales optimizados. Operamos 100% en la nube, con talento binacional, desde Medellín para toda Hispanoamérica.
        </p>
        <div class="rv" data-d="1">
          <a href="#ecosistema" class="btn ghost magnetic">Conoce el ecosistema <span class="arr">↓</span></a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.manifesto { padding: 120px 0 110px; }
.eyebrow { margin-bottom: 28px; }
.manifesto-text { font-weight: 700; text-transform: uppercase; font-size: clamp(30px, 7vw, 78px); line-height: 1.02; letter-spacing: -.005em; }
.w { opacity: .14; transition: opacity .25s linear, color .25s; }
.w.on { opacity: 1; }
.w.hl.on { color: var(--gold); }
.manifesto-foot { margin-top: 40px; display: grid; gap: 20px; }

@media (min-width: 960px) {
  .manifesto { padding: 180px 0 160px; }
  .manifesto-foot { grid-template-columns: 1fr 1fr; align-items: end; }
}
@media (prefers-reduced-motion: reduce) {
  .w { opacity: 1; }
}
</style>
