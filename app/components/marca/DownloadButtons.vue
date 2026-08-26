<script setup lang="ts">
import type { BrandAsset } from '~/composables/useBrandAssets'

defineProps<{ asset: BrandAsset }>()
</script>

<template>
  <div class="flex shrink-0 items-center gap-2">
    <UButton
      :to="asset.svg"
      download
      external
      size="xs"
      color="primary"
      variant="soft"
      label="SVG"
      :aria-label="`Descargar ${asset.label} en SVG`"
    />
    <UButton
      :to="asset.png"
      download
      external
      size="xs"
      color="neutral"
      variant="soft"
      label="PNG"
      :aria-label="`Descargar ${asset.label} en PNG de ${asset.pngWidth} píxeles de ancho`"
    />
  </div>
</template>
