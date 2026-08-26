<script setup lang="ts">
const { assets, zip } = useBrandAssets()

const groupLabels: Record<string, string> = {
  isotipo: 'Logosímbolo',
  vertical: 'Logotipo vertical',
  horizontal: 'Aplicación horizontal',
}
</script>

<template>
  <section id="descargas" class="scroll-mt-24 space-y-10">
    <MarcaSectionHeading
      eyebrow="Descargas"
      title="Archivos del manual"
      description="Cada versión está disponible en SVG vectorial (escalable, ideal para impresión y web) y en PNG con fondo transparente."
    />

    <div data-reveal class="overflow-hidden rounded-2xl border border-white/10">
      <div class="flex flex-col gap-4 border-b border-white/10 bg-brand-500/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-lg font-bold uppercase tracking-wide text-white">
            Kit completo
          </p>
          <p class="text-sm text-white/60">
            Las {{ assets.length * 2 }} piezas en un único archivo comprimido.
          </p>
        </div>
        <UButton
          :to="zip"
          download
          external
          color="primary"
          icon="i-lucide-folder-down"
          label="Descargar .zip"
        />
      </div>

      <ul class="divide-y divide-white/10">
        <li
          v-for="asset in assets"
          :key="asset.id"
          class="flex flex-wrap items-center justify-between gap-4 bg-white/[0.02] px-6 py-4 transition-colors hover:bg-white/[0.05]"
        >
          <div class="flex items-center gap-4">
            <span
              class="size-8 shrink-0 rounded-full border border-white/15"
              :style="{ backgroundColor: asset.hex }"
            />
            <div>
              <p class="font-medium text-white">
                {{ groupLabels[asset.group] }} · {{ asset.label }}
              </p>
              <p class="font-mono text-xs text-white/40">
                SVG vectorial · PNG {{ asset.pngWidth }} px
              </p>
            </div>
          </div>

          <MarcaDownloadButtons :asset="asset" />
        </li>
      </ul>
    </div>
  </section>
</template>
