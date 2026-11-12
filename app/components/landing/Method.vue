<script setup lang="ts">
const feats = [
  { n: '01', title: 'Ganchos en 3 segundos', text: 'Probamos variaciones de hooks visuales en el inicio de cada pieza para disparar la retención.' },
  { n: '02', title: 'Edición con IA', text: 'La inteligencia artificial multiplica la producción: edición, guiones y análisis de métricas.' },
  { n: '03', title: 'Lives que conectan', text: 'Transmisiones en TikTok Live y YouTube Live con retos de edición en tiempo real.' },
  { n: '04', title: 'Decisiones con datos', text: 'Retención, rendimiento y RPM guían cada movimiento. Nada se deja a la suposición.' },
]

const { reduce } = useLandingMotion()
const split = useTemplateRef<HTMLElement>('split')
const long = useTemplateRef<HTMLElement>('long')
const shorts = useTemplateRef<HTMLElement[]>('shorts')

// Una barra larga (el contenido largo) se contrae y de ella brotan seis
// verticales (los clips), sincronizado con el scroll.
useRafFn(() => {
  if (reduce.value || !split.value || !long.value) return
  const vh = window.innerHeight
  const p = fxClamp((vh * 0.8 - split.value.getBoundingClientRect().top) / (vh * 0.55))
  long.value.style.transform = `scaleX(${1 - p * 0.9})`
  long.value.style.opacity = String(1 - fxClamp((p - 0.55) / 0.35))
  ;(shorts.value ?? []).forEach((s, i) => {
    const q = fxClamp((p - 0.25 - i * 0.08) / 0.3)
    s.style.opacity = String(q)
    s.style.transform = `translateY(${(1 - q) * 30}px) scale(${0.8 + q * 0.2})`
  })
})
</script>

<template>
  <section id="metodo" class="method">
    <div class="wrap method-grid">
      <div>
        <p class="eyebrow rv">Metodología Sincopados</p>
        <h2 class="h-lg rv" data-d="1">1 contenido largo.<br><span class="gold">Decenas</span> de piezas.</h2>
        <div ref="split" class="split-vis" aria-hidden="true">
          <div ref="long" class="long" />
          <div class="shorts">
            <div v-for="i in 6" :key="i" ref="shorts" class="s" />
          </div>
        </div>
        <div class="split-label"><span>Podcast · Live · Clase</span><span>Shorts · Reels · TikToks</span></div>
      </div>
      <div class="feats">
        <div v-for="(f, i) in feats" :key="f.n" class="feat rv" :data-d="i || undefined">
          <b>{{ f.n }}</b>
          <div>
            <h4>{{ f.title }}</h4>
            <p>{{ f.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.method { padding: 120px 0; }
.method-grid { display: grid; gap: 56px; }
.split-vis { position: relative; height: 220px; display: flex; align-items: center; }
.long { position: absolute; left: 0; top: 50%; height: 46px; width: 100%; margin-top: -23px; border-radius: 12px; background: var(--gold); transform-origin: 0 50%; will-change: transform, opacity; }
.shorts { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; align-items: center; }
.s { aspect-ratio: 9 / 16; border-radius: 8px; border: 1px solid var(--gold); background: var(--gold-soft); opacity: 0; transform: translateY(30px) scale(.8); will-change: transform, opacity; position: relative; overflow: hidden; }
.s::after { content: ''; position: absolute; left: 18%; right: 18%; bottom: 12%; height: 3px; border-radius: 2px; background: var(--gold); }
.split-label { display: flex; justify-content: space-between; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; color: var(--muted); margin-top: 14px; }
.feats { display: grid; border-top: 1px solid var(--line); }
.feat { display: grid; grid-template-columns: 44px 1fr; gap: 16px; padding: 22px 0; border-bottom: 1px solid var(--line); }
.feat b { font-weight: 700; color: var(--gold); font-size: 14px; letter-spacing: .1em; padding-top: 4px; }
.feat h4 { font-weight: 700; text-transform: uppercase; font-size: 22px; line-height: 1.1; margin-bottom: 6px; }
.feat p { color: var(--muted); font-weight: 300; font-size: 17px; }

@media (min-width: 960px) {
  .method-grid { grid-template-columns: 1fr 1fr; align-items: center; gap: 96px; }
  .split-vis { height: 340px; }
}
@media (prefers-reduced-motion: reduce) {
  .s { opacity: 1; transform: none; }
}
</style>
