<script setup lang="ts">
import { animate } from 'animejs'

const { colors } = useBrandAssets()
const toast = useToast()

async function copy(hex: string, event: MouseEvent) {
  // `currentTarget` se anula al salir del despacho del evento: hay que
  // guardarlo antes del primer `await`.
  const card = event.currentTarget as HTMLElement | null

  try {
    await navigator.clipboard.writeText(hex)
    toast.add({ title: `${hex} copiado`, icon: 'i-lucide-check', color: 'primary' })
  }
  catch {
    toast.add({ title: `Copia manualmente: ${hex}`, icon: 'i-lucide-clipboard-x', color: 'warning' })
    return
  }

  if (!card) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  animate(card, { scale: [1, 0.97, 1], duration: 400, ease: 'out(3)' })
}
</script>

<template>
  <section id="colores" class="scroll-mt-24 space-y-10">
    <MarcaSectionHeading
      eyebrow="Colores"
      title="Paleta institucional"
      description="Tres colores sostienen toda la identidad. Pulsa cualquier tarjeta para copiar su valor hexadecimal."
    />

    <div data-reveal-group class="grid gap-6 sm:grid-cols-3">
      <button
        v-for="color in colors"
        :key="color.hex"
        type="button"
        class="group overflow-hidden rounded-2xl border border-white/10 text-left transition-all duration-300 hover:border-brand-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        @click="copy(color.hex, $event)"
      >
        <div
          class="flex h-44 items-end justify-end p-4"
          :style="{ backgroundColor: color.hex }"
        >
          <span
            class="rounded-full px-3 py-1 text-xs uppercase tracking-widest opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            :class="color.light ? 'bg-black/10 text-black/70' : 'bg-white/10 text-white/80'"
          >
            Copiar
          </span>
        </div>

        <div class="space-y-1 bg-white/[0.03] px-5 py-4">
          <p class="text-lg font-bold uppercase tracking-wide text-white">
            {{ color.name }}
          </p>
          <p class="font-mono text-sm text-brand-500">
            {{ color.hex }}
          </p>
          <p class="font-mono text-xs text-white/40">
            {{ color.cmyk }}
          </p>
        </div>
      </button>
    </div>
  </section>
</template>
