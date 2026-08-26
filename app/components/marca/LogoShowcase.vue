<script setup lang="ts">
import type { BrandGroup } from '~/composables/useBrandAssets'

const props = defineProps<{
  id: string
  eyebrow: string
  title: string
  description: string
  group: BrandGroup
}>()

const { byGroup } = useBrandAssets()
const assets = computed(() => byGroup(props.group))

const previewHeight = computed(() => ({
  isotipo: 'h-40 sm:h-48',
  vertical: 'h-40 sm:h-48',
  horizontal: 'h-20 sm:h-24',
}[props.group]))
</script>

<template>
  <section :id="id" class="scroll-mt-24 space-y-10">
    <MarcaSectionHeading :eyebrow="eyebrow" :title="title" :description="description" />

    <div data-reveal-group class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="asset in assets"
        :key="asset.id"
        class="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-brand-500/50"
      >
        <div
          class="flex flex-1 items-center justify-center p-8 transition-transform duration-500 group-hover:scale-[1.03]"
          :style="{ backgroundColor: asset.background }"
        >
          <!-- SVG vectorial: no pasa por IPX, que sólo re-encodearía un vector. -->
          <img
            :src="asset.svg"
            :alt="`Logo Sincopados Producciones, versión ${asset.label.toLowerCase()}`"
            class="w-auto max-w-full"
            :class="previewHeight"
            loading="lazy"
          >
        </div>

        <div class="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
          <div>
            <p class="font-medium text-white">
              {{ asset.label }}
            </p>
            <p class="font-mono text-xs uppercase text-white/40">
              {{ asset.hex }}
            </p>
          </div>

          <MarcaDownloadButtons :asset="asset" />
        </div>
      </article>
    </div>
  </section>
</template>
