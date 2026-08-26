<script setup lang="ts">
import { animate } from 'animejs'
import type { BrandGroup, BrandTone } from '~/composables/useBrandAssets'

const { assets } = useBrandAssets()

interface Surface {
  id: string
  label: string
  /** Versión cromática que contrasta con esta superficie. */
  tone: BrandTone
  tee: string
  cap: string
}

const surfaces: Surface[] = [
  {
    id: 'negro',
    label: 'Prenda negra',
    tone: 'dorado',
    tee: '/marca/aplicaciones/camiseta-negra.webp',
    cap: '/marca/aplicaciones/gorra-negra.webp',
  },
  {
    id: 'blanco',
    label: 'Prenda blanca',
    tone: 'negro',
    tee: '/marca/aplicaciones/camiseta-blanca.webp',
    cap: '/marca/aplicaciones/gorra-blanca.webp',
  },
  {
    id: 'dorado',
    label: 'Prenda dorada',
    tone: 'negro',
    tee: '/marca/aplicaciones/camiseta-dorada.webp',
    cap: '/marca/aplicaciones/gorra-dorada.webp',
  },
]

const versions: Array<{ id: BrandGroup, label: string }> = [
  { id: 'vertical', label: 'Vertical' },
  { id: 'horizontal', label: 'Horizontal' },
  { id: 'isotipo', label: 'Logosímbolo' },
]

const surface = ref<Surface>(surfaces[0]!)
const version = ref<BrandGroup>('vertical')

function logoFor(tone: BrandTone) {
  return assets.find(asset => asset.group === version.value && asset.tone === tone)
}

const logo = computed(() => logoFor(surface.value.tone))

// El montaje de evento siempre va sobre negro, así que usa la versión dorada
// con independencia de la prenda elegida.
const stageLogo = computed(() => logoFor('dorado'))

const stage = useTemplateRef<HTMLElement>('stage')

function selectVersion(id: BrandGroup) {
  version.value = id
}

function selectSurface(item: Surface) {
  surface.value = item
}

function pulse() {
  if (!stage.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  animate(stage.value.querySelectorAll('figure'), {
    opacity: [0.35, 1],
    scale: [0.97, 1],
    duration: 550,
    ease: 'out(3)',
  })
}

watch([surface, version], () => nextTick(pulse))
</script>

<template>
  <section id="aplicaciones" class="scroll-mt-24 space-y-10">
    <MarcaSectionHeading
      eyebrow="Aplicaciones"
      title="La marca sobre cualquier superficie"
      description="Combina versión y prenda para comprobar cómo se comporta la identidad en merchandising y montajes de evento. Sobre superficies oscuras se usa la versión dorada o blanca; sobre claras, la negra."
    />

    <div data-reveal class="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <div class="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:self-start">
        <div class="space-y-3">
          <p class="text-xs uppercase tracking-[0.3em] text-white/40">
            Versión
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="item in versions"
              :key="item.id"
              size="sm"
              :color="version === item.id ? 'primary' : 'neutral'"
              :variant="version === item.id ? 'solid' : 'outline'"
              :label="item.label"
              @click="selectVersion(item.id)"
            />
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-xs uppercase tracking-[0.3em] text-white/40">
            Superficie
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="item in surfaces"
              :key="item.id"
              size="sm"
              :color="surface.id === item.id ? 'primary' : 'neutral'"
              :variant="surface.id === item.id ? 'solid' : 'outline'"
              :label="item.label"
              @click="selectSurface(item)"
            />
          </div>
        </div>

        <p v-if="logo" class="border-t border-white/10 pt-5 text-sm leading-relaxed text-white/50">
          Sobre {{ surface.label.toLowerCase() }} corresponde la versión
          <span class="text-brand-500">{{ logo.label.toLowerCase() }}</span>.
        </p>
      </div>

      <div ref="stage" class="grid gap-6 sm:grid-cols-2">
        <MarcaMockupSurface
          v-if="logo"
          :photo="surface.tee"
          :logo="logo.svg"
          caption="Camiseta"
          :alt="`Camiseta ${surface.label.toLowerCase()} con el logotipo de Sincopados Producciones`"
          :area="{ x: 50, y: 40, width: 30, height: 20 }"
          sizes="sm:90vw lg:45vw 2xl:32vw"
        />
        <MarcaMockupSurface
          v-if="logo"
          :photo="surface.cap"
          :logo="logo.svg"
          caption="Gorra"
          :alt="`Gorra ${surface.label.toLowerCase()} con el logotipo de Sincopados Producciones`"
          :area="{ x: 50, y: 43, width: 26, height: 17 }"
          sizes="sm:90vw lg:45vw 2xl:32vw"
        />
        <MarcaMockupSurface
          v-if="stageLogo"
          photo="/marca/aplicaciones/escenario.webp"
          :logo="stageLogo.svg"
          caption="Montaje de evento"
          alt="Escenario de evento en directo con el logotipo de Sincopados Producciones proyectado en la pantalla"
          :area="{ x: 50, y: 63, width: 26, height: 16 }"
          ratio="aspect-[16/9]"
          sizes="lg:90vw 2xl:65vw"
          class="sm:col-span-2"
        />
      </div>
    </div>
  </section>
</template>
