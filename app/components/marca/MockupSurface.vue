<script setup lang="ts">
/**
 * Fotografía de aplicación con el logotipo real superpuesto.
 *
 * El logo nunca va incrustado en la imagen: se compone en CSS sobre el área de
 * marcaje (`area`), de modo que al cambiar de versión o color siempre se ve el
 * archivo oficial y no una reproducción aproximada.
 */
const props = defineProps<{
  photo: string
  logo: string
  caption: string
  alt: string
  /** Área de marcaje en porcentaje de la foto: centro y caja del logotipo. */
  area: { x: number, y: number, width: number, height: number }
  /** Proporción de la fotografía. */
  ratio?: string
  /** Anchos candidatos para el `srcset` responsive. */
  sizes: string
}>()

const areaStyle = computed(() => ({
  left: `${props.area.x}%`,
  top: `${props.area.y}%`,
  width: `${props.area.width}%`,
  height: `${props.area.height}%`,
}))
</script>

<template>
  <figure class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4">
    <div class="relative w-full overflow-hidden rounded-xl" :class="ratio ?? 'aspect-square'">
      <NuxtPicture
        :src="photo"
        :alt="alt"
        :sizes="sizes"
        class="absolute inset-0 block size-full"
        :img-attrs="{ class: 'size-full object-cover' }"
        loading="lazy"
        decoding="async"
      />
      <img
        :src="logo"
        alt=""
        class="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 object-contain"
        :style="areaStyle"
      >
    </div>

    <figcaption class="mt-3 text-center text-sm uppercase tracking-[0.3em] text-white/40">
      {{ caption }}
    </figcaption>
  </figure>
</template>
