<script setup lang="ts">
import { animate, createTimeline, stagger, text } from 'animejs'

const { zip } = useBrandAssets()

const root = useTemplateRef<HTMLElement>('root')

onMounted(() => {
  const el = root.value
  if (!el) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  el.classList.add('is-animated')

  const mark = el.querySelector<HTMLElement>('[data-hero-mark]')
  const title = el.querySelector<HTMLElement>('[data-hero-title]')
  const glow = el.querySelector<HTMLElement>('[data-hero-glow]')
  const meta = [...el.querySelectorAll<HTMLElement>('[data-hero-meta]')]

  const chars = title ? text.split(title, { chars: true }).chars : []

  const timeline = createTimeline({ defaults: { ease: 'out(3)' } })

  if (glow) {
    timeline.add(glow, { opacity: [0, 0.5], scale: [0.55, 1], duration: 1600 })
  }

  if (mark) {
    timeline.add(mark, {
      opacity: [0, 1],
      scale: [0.72, 1],
      rotate: [-7, 0],
      filter: ['blur(16px)', 'blur(0px)'],
      duration: 1300,
    }, '-=1400')
  }

  if (chars.length) {
    timeline.add(chars, {
      opacity: [0, 1],
      translateY: ['0.7em', '0em'],
      duration: 700,
      delay: stagger(35),
    }, '-=700')
  }

  if (meta.length) {
    timeline.add(meta, { opacity: [0, 1], translateY: [18, 0], duration: 700, delay: stagger(110) }, '-=350')
  }

  // Latido lento del halo dorado detrás del logosímbolo.
  if (glow) {
    animate(glow, {
      scale: [1, 1.1],
      opacity: [0.5, 0.3],
      duration: 4200,
      ease: 'inOut(2)',
      loop: true,
      alternate: true,
    })
  }
})
</script>

<template>
  <header
    ref="root"
    class="marca-hero relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] px-6 py-20 text-center sm:px-12 sm:py-28"
  >
    <div
      data-hero-glow
      class="pointer-events-none absolute left-1/2 top-1/3 -z-0 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/30 blur-[120px]"
    />

    <div class="relative z-10 flex flex-col items-center gap-8">
      <IconsFavicon data-hero-mark class="h-28 w-auto text-brand-500 sm:h-36" />

      <div class="space-y-3">
        <h1
          data-hero-title
          class="text-4xl font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Manual de Marca
        </h1>
        <p data-hero-meta class="text-sm uppercase tracking-[0.45em] text-brand-500 sm:text-base">
          Sincopados Producciones
        </p>
      </div>

      <p data-hero-meta class="max-w-2xl text-balance text-base leading-relaxed text-white/60 sm:text-lg">
        Identidad visual, versiones cromáticas, tipografía y aplicaciones.
        Todo el sistema gráfico en un solo lugar, listo para descargar.
      </p>

      <div data-hero-meta class="flex flex-wrap items-center justify-center gap-3">
        <UButton
          :to="zip"
          download
          external
          size="lg"
          color="primary"
          icon="i-lucide-download"
          label="Descargar kit completo"
        />
        <UButton
          to="#logotipo"
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-lucide-arrow-down"
          label="Explorar el manual"
        />
      </div>
    </div>
  </header>
</template>

<style scoped>
.marca-hero.is-animated [data-hero-mark],
.marca-hero.is-animated [data-hero-meta],
.marca-hero.is-animated [data-hero-glow] {
  opacity: 0;
}
</style>
