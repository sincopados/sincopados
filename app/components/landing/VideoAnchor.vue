<script setup lang="ts">
const { reduce, desktop } = useLandingMotion()

/** Video principal de la landing: para cambiarlo basta con su id de YouTube. */
const VIDEO_ID = 'FrCiMjpim-M'
const VIDEO_TITLE = 'Tu talento, monetizado sin fronteras'

// El reproductor sólo se carga al pulsar «play»: la portada no arrastra el
// peso ni las cookies de YouTube mientras nadie quiera ver el video.
const playing = ref(false)
const play = () => {
  playing.value = true
}

const frame = useTemplateRef<HTMLElement>('frame')

useRafFn(() => {
  if (reduce.value || !frame.value) return
  // El visor crece y redondea menos a medida que entra.
  const vh = window.innerHeight
  const r = frame.value.getBoundingClientRect()
  const p = fxClamp(1 - (r.top - vh * 0.15) / (vh * 0.75))
  frame.value.style.transform = `scale(${fxLerp(0.86, 1, p)})`
  frame.value.style.borderRadius = `${fxLerp(desktop.value ? 48 : 34, desktop.value ? 28 : 22, p)}px`
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
        <iframe
          v-if="playing"
          class="player"
          :src="`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&playsinline=1`"
          :title="VIDEO_TITLE"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin"
        />
        <button v-else type="button" class="poster" :aria-label="`Reproducir el video: ${VIDEO_TITLE}`" @click="play">
          <img :src="`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`" alt="" loading="lazy" decoding="async">
          <span class="play">
            <svg viewBox="0 0 24 24" fill="#000" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.anchor { padding: 40px 0 120px; }
.anchor-head { display: flex; flex-direction: column; gap: 18px; margin-bottom: 34px; }
.frame { position: relative; aspect-ratio: 16 / 9; width: 100%; border-radius: 22px; overflow: hidden; background: #000; border: 1px solid var(--line); will-change: transform, border-radius; }
.player, .poster { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.poster { display: block; padding: 0; background: none; cursor: pointer; }
.poster img { width: 100%; height: 100%; object-fit: cover; }
.play {
  position: absolute; left: 50%; top: 50%; width: 64px; height: 64px; margin: -32px 0 0 -32px; border-radius: 50%; background: var(--gold); display: grid; place-items: center;
  box-shadow: 0 0 0 0 rgba(212, 170, 0, .5); animation: pulse 2.4s infinite; transition: transform .4s var(--ease);
}
.poster:hover .play, .poster:focus-visible .play { transform: scale(1.08); }
.poster:focus-visible { outline: 2px solid var(--gold); outline-offset: -4px; }
.play svg { width: 26px; height: 26px; margin-left: 4px; }
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(212, 170, 0, .45); }
  70% { box-shadow: 0 0 0 26px rgba(212, 170, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(212, 170, 0, 0); }
}

@media (min-width: 640px) {
  .play { width: 84px; height: 84px; margin: -42px 0 0 -42px; }
}
@media (min-width: 960px) {
  .anchor-head { flex-direction: row; justify-content: space-between; align-items: flex-end; }
  .frame { border-radius: 28px; }
}
</style>
