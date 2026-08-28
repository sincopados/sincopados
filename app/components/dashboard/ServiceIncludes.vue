<script setup lang="ts">
import type { Service, SocialNetwork } from '~/types/db'

const props = defineProps<{ service: Service }>()

interface IncludedItem {
  icon: string
  value: string
  label: string
}

/** Sólo se listan las partidas con cantidad: un «0 carruseles» no aporta nada. */
const items = computed<IncludedItem[]>(() => {
  const hours = Number(props.service.shooting_hours)

  return [
    {
      icon: 'i-lucide-video',
      value: String(props.service.video_count),
      label: props.service.video_count === 1 ? 'Video' : 'Videos',
      show: props.service.video_count > 0,
    },
    {
      icon: 'i-lucide-image',
      value: String(props.service.image_count),
      label: props.service.image_count === 1 ? 'Imagen' : 'Imágenes',
      show: props.service.image_count > 0,
    },
    {
      icon: 'i-lucide-gallery-horizontal-end',
      value: String(props.service.carousel_count),
      label: props.service.carousel_count === 1 ? 'Carrusel' : 'Carruseles',
      show: props.service.carousel_count > 0,
    },
    {
      icon: 'i-lucide-clapperboard',
      value: `${hours} h`,
      label: 'De rodaje',
      show: hours > 0,
    },
  ].filter(item => item.show).map(({ icon, value, label }) => ({ icon, value, label }))
})

const networks = computed(() => props.service.social_networks as SocialNetwork[])
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <div class="border-b border-default bg-primary/5 px-6 py-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="flex size-10 items-center justify-center rounded-full bg-primary/15">
            <UIcon name="i-lucide-package-open" class="size-5 text-primary" />
          </span>
          <div>
            <h2 class="text-xl font-bold text-highlighted">Tu paquete incluye</h2>
            <p class="text-sm text-muted">Todo lo que entra en este servicio.</p>
          </div>
        </div>

        <UBadge v-if="service.manages_social" color="primary" variant="subtle" size="lg">
          <UIcon name="i-lucide-share-2" class="mr-1 size-4" />
          Gestión de redes
        </UBadge>
      </div>
    </div>

    <div v-if="items.length" class="grid gap-px bg-default sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="item in items"
        :key="item.label"
        class="flex flex-col items-center gap-1 bg-default px-4 py-8 text-center transition-colors hover:bg-elevated"
      >
        <UIcon :name="item.icon" class="size-7 text-primary" />
        <p class="mt-2 text-4xl font-bold leading-none text-highlighted">
          {{ item.value }}
        </p>
        <p class="text-sm uppercase tracking-wide text-muted">
          {{ item.label }}
        </p>
      </div>
    </div>

    <p v-else class="px-6 py-8 text-center text-muted">
      Este servicio no detalla cantidades.
    </p>

    <div v-if="service.manages_social && networks.length" class="border-t border-default px-6 py-5">
      <p class="text-xs uppercase tracking-wide text-muted">Publicamos en</p>
      <div class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="network in networks"
          :key="network"
          class="flex items-center gap-2 rounded-full border border-default bg-elevated px-3 py-1.5 text-sm font-medium text-toned"
        >
          <UIcon :name="SOCIAL_NETWORK_ICONS[network]" class="size-4 text-primary" />
          {{ SOCIAL_NETWORK_LABELS[network] }}
        </span>
      </div>
    </div>
  </UCard>
</template>
