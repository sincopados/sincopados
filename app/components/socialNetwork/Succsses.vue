<script setup lang="ts">
interface Metric {
  icon: string
  label: string
  value: string
}

interface ResultCard {
  platform: string
  platformColor: string
  logoPath: string
  handle: string
  followers: string
  followersGrowth: string
  metrics: Metric[]
}

const results: ResultCard[] = [
  {
    platform: 'Facebook',
    platformColor: '#1877F2',
    logoPath: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    handle: '@MarcaEjemplo',
    followers: '128K',
    followersGrowth: '+340%',
    metrics: [
      { icon: 'i-lucide-heart', label: 'Engagement', value: '6.4%' },
      { icon: 'i-lucide-eye', label: 'Alcance mensual', value: '2.1M' },
      { icon: 'i-lucide-share-2', label: 'Compartidos', value: '45K' },
      { icon: 'i-lucide-trending-up', label: 'Crecimiento', value: '+18K/mes' },
    ],
  },
  {
    platform: 'Instagram',
    platformColor: '#E1306C',
    logoPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
    handle: '@tienda_ropa_mx',
    followers: '89.4K',
    followersGrowth: '+520%',
    metrics: [
      { icon: 'i-lucide-heart', label: 'Engagement', value: '8.7%' },
      { icon: 'i-lucide-eye', label: 'Impresiones', value: '1.4M' },
      { icon: 'i-lucide-play', label: 'Reels vistos', value: '980K' },
      { icon: 'i-lucide-users', label: 'Nuevos seguidores', value: '+12K/mes' },
    ],
  },
  {
    platform: 'TikTok',
    platformColor: '#69C9D0',
    logoPath: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
    handle: '@restaurante_viral',
    followers: '215K',
    followersGrowth: '+1,200%',
    metrics: [
      { icon: 'i-lucide-heart', label: 'Likes totales', value: '4.8M' },
      { icon: 'i-lucide-eye', label: 'Vistas de video', value: '12.5M' },
      { icon: 'i-lucide-share-2', label: 'Compartidos', value: '320K' },
      { icon: 'i-lucide-trending-up', label: 'Crecimiento', value: '+35K/mes' },
    ],
  },
]

const globalStats = [
  { label: 'Seguidores generados', value: '432K+', icon: 'i-lucide-users' },
  { label: 'Vistas totales', value: '16M+', icon: 'i-lucide-eye' },
  { label: 'Clientes activos', value: '47', icon: 'i-lucide-trending-up' },
  { label: 'Reels producidos', value: '1,200+', icon: 'i-lucide-play' },
]
</script>

<template>
  <section class="py-24 bg-default">
    <div class="container mx-auto px-6">
      <!-- Header -->
      <div class="text-center mb-16 space-y-4">
        <UBadge color="primary" variant="outline" size="lg" class="uppercase tracking-widest">
          Resultados reales
        </UBadge>
        <h2 class="text-4xl lg:text-6xl font-extrabold text-highlighted text-balance">
          Nuestros <span class="text-primary">logros</span> en redes
        </h2>
        <p class="text-muted max-w-2xl mx-auto leading-relaxed">
          Datos de clientes reales. Sin filtros. Asi es como transformamos cuentas de cero en comunidades que venden.
        </p>
      </div>

      <!-- Global stats bar -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        <div
          v-for="stat in globalStats"
          :key="stat.label"
          class="bg-elevated border border-muted rounded-2xl p-6 text-center flex flex-col items-center gap-3 stat-card"
        >
          <UIcon :name="stat.icon" class="size-6 text-primary" />
          <p class="text-3xl font-extrabold text-highlighted">{{ stat.value }}</p>
          <p class="text-sm text-muted">{{ stat.label }}</p>
        </div>
      </div>

      <!-- Per-platform cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="result in results"
          :key="result.platform"
          class="relative rounded-3xl border bg-elevated overflow-hidden group"
          :style="{ borderColor: `${result.platformColor}30` }"
        >
          <!-- Top accent bar -->
          <div class="h-1 w-full" :style="{ background: result.platformColor }" />

          <!-- Card body -->
          <div class="p-6 space-y-5">
            <!-- Platform header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2" :style="{ color: result.platformColor }">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path :d="result.logoPath" />
                </svg>
                <span class="font-bold text-highlighted">{{ result.platform }}</span>
              </div>
              <span
                class="text-xs px-2 py-1 rounded-full font-semibold"
                :style="{ backgroundColor: `${result.platformColor}20`, color: result.platformColor }"
              >
                {{ result.handle }}
              </span>
            </div>

            <!-- Followers hero -->
            <div class="rounded-2xl p-4 text-center" :style="{ backgroundColor: `${result.platformColor}10` }">
              <p class="text-xs text-muted mb-1">Seguidores totales</p>
              <p class="text-4xl font-extrabold text-highlighted">{{ result.followers }}</p>
              <div class="flex items-center justify-center gap-1 mt-1">
                <UIcon name="i-lucide-trending-up" class="size-4" :style="{ color: result.platformColor }" />
                <span class="text-sm font-bold" :style="{ color: result.platformColor }">
                  {{ result.followersGrowth }} crecimiento
                </span>
              </div>
            </div>

            <!-- Metrics -->
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="metric in result.metrics"
                :key="metric.label"
                class="bg-muted/60 rounded-xl p-3 space-y-1"
              >
                <div class="flex items-center gap-1.5" :style="{ color: result.platformColor }">
                  <UIcon :name="metric.icon" class="size-4" />
                  <span class="text-xs text-muted">{{ metric.label }}</span>
                </div>
                <p class="text-base font-bold text-highlighted">{{ metric.value }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
