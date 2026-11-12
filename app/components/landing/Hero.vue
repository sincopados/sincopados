<script setup lang="ts">
const { reduce, finePointer } = useLandingMotion()

// Las líneas del titular suben al montar; en SSR quedan abajo, ocultas por
// `overflow:hidden`, y la clase `loaded` dispara la transición CSS.
const loaded = ref(false)
onMounted(() => requestAnimationFrame(() => { loaded.value = true }))

const lines = useTemplateRef<HTMLElement>('lines')
const glow = useTemplateRef<HTMLElement>('glow')
const mark = useTemplateRef<HTMLElement>('mark')

// Tilt del isotipo siguiendo el ratón, suavizado con lerp en cada frame.
let mx = 0, my = 0, tmx = 0, tmy = 0
useEventListener(window, 'mousemove', (e: MouseEvent) => {
  if (!finePointer.value) return
  tmx = e.clientX / window.innerWidth - 0.5
  tmy = e.clientY / window.innerHeight - 0.5
}, { passive: true })

useRafFn(() => {
  if (reduce.value) return
  const y = window.scrollY
  // Fuera de pantalla no hay nada que mover.
  if (y > window.innerHeight * 1.5) return
  mx = fxLerp(mx, tmx, 0.06)
  my = fxLerp(my, tmy, 0.06)
  if (lines.value) lines.value.style.transform = `translate3d(0,${y * 0.15}px,0)`
  if (glow.value) glow.value.style.transform = `translate(-50%,-50%) translate3d(0,${y * 0.35}px,0)`
  if (mark.value) {
    mark.value.style.transform
      = `translate3d(0,${y * -0.25}px,0) translate3d(${mx * -30}px,${my * -30}px,0) rotate(${mx * 6}deg)`
  }
})
</script>

<template>
  <section id="inicio" class="hero" :class="{ loaded }">
    <div class="hero-bg" aria-hidden="true">
      <div ref="lines" class="hero-lines" />
      <div ref="glow" class="hero-glow" />
      <img ref="mark" class="hero-mark" src="/marca/sincopados-isotipo-dorado.svg" alt="">
    </div>
    <div class="wrap hero-content">
      <div class="hero-grid">
        <div>
          <p class="eyebrow">Sincopados Media Network</p>
          <h1 class="h-xl">
            <span class="ln"><span>Tu talento,</span></span>
            <span class="ln"><span>monetizado</span></span>
            <span class="ln"><span class="gold">sin fronteras.</span></span>
          </h1>
        </div>
        <div>
          <p class="lead hero-sub">
            El centro de medios digitales que conecta el talento con la monetización global desde Medellín. Aprende edición con IA, domina los sistemas de monetización y entra a la red de creadores.
          </p>
          <div class="hero-ctas">
            <a href="#contacto" data-interest="Masterclass gratuita" class="btn magnetic">Masterclass gratuita <span class="arr">→</span></a>
            <a href="#contacto" data-interest="Consulta estratégica" class="btn ghost magnetic">Consulta estratégica</a>
          </div>
        </div>
      </div>
      <div class="hero-meta">
        <span class="rec"><b /> Medellín · LATAM</span>
        <span class="scroll-cue"><i /> Scroll</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero { min-height: 100svh; display: flex; align-items: flex-end; padding: 110px 0 48px; overflow: hidden; }
.hero-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.hero-mark { position: absolute; right: -28vw; top: 8vh; width: min(110vw, 860px); max-width: none; opacity: .09; will-change: transform; }
.hero-glow {
  position: absolute; left: 50%; top: 38%; width: 120vw; height: 120vw; max-width: 1100px; max-height: 1100px; transform: translate(-50%, -50%);
  background: radial-gradient(closest-side, rgba(212, 170, 0, .22), rgba(212, 170, 0, .04) 55%, transparent 72%); will-change: transform;
}
.hero-lines { position: absolute; inset: 0; background-image: linear-gradient(to right, var(--line) 1px, transparent 1px); background-size: 25% 100%; opacity: .35; will-change: transform; }
.hero-content { position: relative; z-index: 2; width: 100%; }
.eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
.eyebrow::before { content: ''; width: 28px; height: 1px; background: var(--gold); }

h1 .ln { display: block; overflow: hidden; }
h1 .ln > span { display: block; transform: translateY(110%); transition: transform 1.2s var(--ease); }
.loaded h1 .ln > span { transform: none; }
.loaded h1 .ln:nth-child(2) > span { transition-delay: .1s; }
.loaded h1 .ln:nth-child(3) > span { transition-delay: .2s; }

.hero-sub { margin: 26px 0 34px; opacity: 0; transform: translateY(20px); transition: opacity 1s .5s, transform 1s .5s var(--ease); }
.hero-ctas { display: flex; flex-direction: column; gap: 12px; opacity: 0; transform: translateY(20px); transition: opacity 1s .65s, transform 1s .65s var(--ease); }
.loaded .hero-sub, .loaded .hero-ctas { opacity: 1; transform: none; }

.hero-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 48px; padding-top: 18px; border-top: 1px solid var(--line); font-size: 12px; letter-spacing: .24em; text-transform: uppercase; color: var(--muted); }
.scroll-cue { display: flex; align-items: center; gap: 10px; }
.scroll-cue i { width: 1px; height: 34px; background: linear-gradient(var(--gold), transparent); animation: cue 2s var(--ease) infinite; transform-origin: top; }
@keyframes cue {
  0% { transform: scaleY(0); }
  50% { transform: scaleY(1); transform-origin: top; }
  51% { transform-origin: bottom; }
  100% { transform: scaleY(0); transform-origin: bottom; }
}

@media (min-width: 640px) {
  .hero-ctas { flex-direction: row; flex-wrap: wrap; }
}
@media (min-width: 960px) {
  .hero { padding-bottom: 56px; }
  .hero-mark { right: -6vw; top: 6vh; width: min(62vw, 880px); }
  .hero-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(340px, 1fr); align-items: end; gap: 56px; }
  h1 { font-size: clamp(56px, 6.8vw, 124px); }
  .hero-ctas { flex-direction: column; align-items: stretch; }
  .hero-sub { margin: 0 0 34px; }
}
@media (prefers-reduced-motion: reduce) {
  h1 .ln > span, .hero-sub, .hero-ctas { transform: none; opacity: 1; }
}
</style>
