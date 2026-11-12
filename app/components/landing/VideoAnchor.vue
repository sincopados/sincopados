<script setup lang="ts">
const { reduce, desktop } = useLandingMotion()

/** Enlace del video principal; cámbialo cuando esté publicado. */
const VIDEO_URL = 'https://www.youtube.com/@SincopadosProducciones'

const frame = useTemplateRef<HTMLElement>('frame')
const inner = useTemplateRef<HTMLElement>('inner')
const tc = useTemplateRef<HTMLElement>('tc')

const pad = (n: number) => String(n).padStart(2, '0')
let start = 0
onMounted(() => { start = performance.now() })

useRafFn(() => {
  // Timecode del visor a 24 fps.
  const f = Math.floor((performance.now() - start) / (1000 / 24))
  if (tc.value) {
    tc.value.textContent = `${pad(Math.floor(f / 86400) % 24)}:${pad(Math.floor(f / 1440) % 60)}:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`
  }

  if (reduce.value || !frame.value || !inner.value) return
  // El visor crece y redondea menos a medida que entra; el fondo hace parallax.
  const vh = window.innerHeight
  const r = frame.value.getBoundingClientRect()
  const p = fxClamp(1 - (r.top - vh * 0.15) / (vh * 0.75))
  frame.value.style.transform = `scale(${fxLerp(0.86, 1, p)})`
  frame.value.style.borderRadius = `${fxLerp(desktop.value ? 48 : 34, desktop.value ? 28 : 22, p)}px`
  inner.value.style.transform = `translate3d(0,${(r.top + r.height / 2 - vh / 2) * -0.12}px,0) scale(${fxLerp(1.1, 1, p)})`
})
</script>

<template>
  <section id="video" class="anchor">
    <div class="wrap">
      <div class="anchor-head">
        <div>
          <p class="eyebrow rv">El modelo en 1 video</p>
          <h2 class="h-lg rv" data-d="1">Mira cómo <span class="gold">funciona</span></h2>
        </div>
        <p class="lead rv" data-d="2">
          Cómo se construyen sistemas de contenido con alta retención y por qué no dependemos de la prospección tradicional.
        </p>
      </div>
      <div ref="frame" class="frame">
        <div ref="inner" class="frame-inner">
          <img src="/marca/sincopados-logo-vertical-dorado.svg" alt="">
        </div>
        <span class="corner c1" /><span class="corner c2" /><span class="corner c3" /><span class="corner c4" />
        <div class="frame-ui">
          <div class="top"><span class="rec"><b /> REC</span><span>4K · 24 FPS</span></div>
          <div class="bot"><span>@SincopadosProducciones</span><span ref="tc">00:00:00:00</span></div>
        </div>
        <a class="play" :href="VIDEO_URL" target="_blank" rel="noopener" aria-label="Ver el video en YouTube">
          <svg viewBox="0 0 24 24" fill="#000" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.anchor { padding: 40px 0 120px; }
.anchor-head { display: flex; flex-direction: column; gap: 18px; margin-bottom: 34px; }
.frame { position: relative; aspect-ratio: 16 / 9; width: 100%; border-radius: 22px; overflow: hidden; background: var(--ink); border: 1px solid var(--line); will-change: transform, border-radius; }
.frame-inner {
  position: absolute; inset: -12%; display: grid; place-items: center; will-change: transform;
  background: radial-gradient(60% 70% at 70% 30%, rgba(212, 170, 0, .28), transparent 60%), radial-gradient(50% 60% at 20% 80%, rgba(255, 255, 255, .07), transparent 60%), #050505;
}
.frame-inner img { width: 32%; opacity: .9; }
.frame-ui { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 16px 18px; font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.frame-ui .top, .frame-ui .bot { display: flex; justify-content: space-between; align-items: center; }
.corner { position: absolute; width: 18px; height: 18px; border-color: var(--gold); border-style: solid; }
.c1 { top: 12px; left: 12px; border-width: 2px 0 0 2px; }
.c2 { top: 12px; right: 12px; border-width: 2px 2px 0 0; }
.c3 { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; }
.c4 { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; }
.play {
  position: absolute; left: 50%; top: 50%; width: 84px; height: 84px; margin: -42px 0 0 -42px; border-radius: 50%; background: var(--gold); display: grid; place-items: center; z-index: 3;
  box-shadow: 0 0 0 0 rgba(212, 170, 0, .5); animation: pulse 2.4s infinite; transition: transform .4s var(--ease);
}
.play:hover { transform: scale(1.08); }
.play svg { width: 26px; height: 26px; margin-left: 4px; }
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(212, 170, 0, .45); }
  70% { box-shadow: 0 0 0 26px rgba(212, 170, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(212, 170, 0, 0); }
}

@media (min-width: 640px) {
  .frame-ui { padding: 24px; font-size: 12px; }
}
@media (min-width: 960px) {
  .anchor-head { flex-direction: row; justify-content: space-between; align-items: flex-end; }
  .frame { border-radius: 28px; }
}
</style>
