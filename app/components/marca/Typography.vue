<script setup lang="ts">
import { animate } from 'animejs'

interface Weight { value: number, name: string }

const weights: Weight[] = [
  { value: 300, name: 'Light' },
  { value: 400, name: 'Regular' },
  { value: 500, name: 'Medium' },
  { value: 700, name: 'Bold' },
]

// El manual fija Roboto Condensed Bold como estilo oficial.
const active = ref(700)
const sample = useTemplateRef<HTMLElement>('sample')

function select(weight: number) {
  active.value = weight

  if (!sample.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  animate(sample.value, {
    opacity: [0.4, 1],
    translateY: [10, 0],
    duration: 500,
    ease: 'out(3)',
  })
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const digits = '0123456789 & ? ! # @'
</script>

<template>
  <section id="tipografia" class="scroll-mt-24 space-y-10">
    <MarcaSectionHeading
      eyebrow="Fuente tipográfica"
      title="Roboto Condensed"
      description="La familia tipográfica de la marca. El estilo oficial para titulares y aplicaciones es Bold; los pesos restantes acompañan textos secundarios. Distribuida por Google Fonts."
    />

    <div data-reveal class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div class="flex flex-wrap gap-2 border-b border-white/10 p-5">
        <UButton
          v-for="weight in weights"
          :key="weight.value"
          size="sm"
          :color="active === weight.value ? 'primary' : 'neutral'"
          :variant="active === weight.value ? 'solid' : 'outline'"
          :label="`${weight.value} ${weight.name}`"
          @click="select(weight.value)"
        />
      </div>

      <div ref="sample" class="space-y-8 p-6 sm:p-10" :style="{ fontWeight: active }">
        <p class="text-[5rem] leading-none text-brand-500 sm:text-[9rem]">
          Aa
        </p>
        <p class="break-words text-2xl uppercase leading-tight tracking-wide text-white sm:text-4xl">
          {{ alphabet }}
        </p>
        <p class="break-words text-2xl leading-tight tracking-wide text-white/70 sm:text-4xl">
          {{ digits }}
        </p>
        <p class="max-w-3xl text-lg leading-relaxed text-white/60 sm:text-xl">
          Producimos vídeo y estrategia audiovisual en Medellín.
          Cada pieza sostiene el mismo sistema gráfico.
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-4 text-sm text-white/50">
        <span>Roboto Condensed · Google Fonts · Licencia Apache 2.0</span>
        <UButton
          to="https://fonts.google.com/specimen/Roboto+Condensed"
          target="_blank"
          external
          size="xs"
          color="neutral"
          variant="soft"
          icon="i-lucide-external-link"
          label="Obtener la fuente"
        />
      </div>
    </div>
  </section>
</template>
