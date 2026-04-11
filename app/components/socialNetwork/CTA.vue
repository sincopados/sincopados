<script setup lang="ts">
const socialIcons = [
  {
    name: 'Facebook',
    color: '#1877F2',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    name: 'Instagram',
    color: '#E1306C',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  {
    name: 'TikTok',
    color: '#69C9D0',
    path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  },
]

const currentIcon = ref(0)
const isAnimating = ref(false)

const current = computed(() => socialIcons[currentIcon.value])

let interval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  interval = setInterval(() => {
    isAnimating.value = true
    setTimeout(() => {
      currentIcon.value = (currentIcon.value + 1) % socialIcons.length
      isAnimating.value = false
    }, 300)
  }, 2000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

function selectIcon(index: number) {
  currentIcon.value = index
}
</script>

<template>
  <section class="relative min-h-screen flex items-center overflow-hidden bg-default">
    <!-- Background glow blobs -->
    <div
      class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-600"
      :style="{ background: current?.color }"
    />
    <div class="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none bg-primary" />

    <div class="container mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-16">
      <!-- Left: Copy -->
      <div class="flex-1 text-center lg:text-left space-y-6 z-10">
        <UBadge color="primary" variant="outline" size="lg" class="uppercase tracking-widest">
          Video Marketing
        </UBadge>
        
        <h1 class="text-5xl lg:text-7xl font-extrabold text-highlighted leading-tight text-balance">
          Conecta con tu
          <span class="text-primary">audiencia</span>
          donde importa
        </h1>
        
        <p class="text-lg text-muted max-w-lg leading-relaxed">
          Creamos reels y contenido de alto impacto para Facebook, Instagram y TikTok que convierte seguidores en clientes. Planes mensuales sin contratos de largo plazo.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <UButton size="xl" class="font-bold rounded-full">
            Ver Planes Mensuales
            <UIcon name="i-lucide-arrow-right" class="size-5" />
          </UButton>
          <UButton variant="outline" color="neutral" size="xl" class="font-semibold rounded-full">
            <UIcon name="i-lucide-play" class="size-5" />
            Ver Demo
          </UButton>
        </div>

        <!-- Platform badges -->
        <div class="flex items-center gap-4 justify-center lg:justify-start pt-4">
          <button
            v-for="(icon, i) in socialIcons"
            :key="icon.name"
            class="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border transition-all duration-200"
            :style="{
              borderColor: currentIcon === i ? icon.color : 'oklch(0.25 0.01 260)',
              color: currentIcon === i ? icon.color : 'oklch(0.6 0.01 260)',
              backgroundColor: currentIcon === i ? `${icon.color}15` : 'transparent',
            }"
            @click="selectIcon(i)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" :style="{ color: icon.color }">
              <path :d="icon.path" />
            </svg>
            {{ icon.name }}
          </button>
        </div>
      </div>

      <!-- Right: Phone Mockup -->
      <div class="flex-shrink-0 relative z-10">
        <!-- Phone frame -->
        <div class="relative w-64 h-[520px] rounded-[3rem] border-4 border-muted bg-elevated shadow-2xl overflow-hidden">
          <!-- Phone notch -->
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-default rounded-b-2xl z-30" />

          <!-- Screen content - Reel simulation -->
          <div class="absolute inset-0 bg-gradient-to-b from-muted to-default">
            <!-- Simulated reel thumbnail -->
            <div class="absolute inset-0 flex flex-col">
              <div class="flex-1 bg-gradient-to-b from-secondary/30 to-primary/20 flex items-center justify-center relative overflow-hidden">
                <!-- Animated lines to simulate video -->
                <div class="absolute inset-0 opacity-10">
                  <div
                    v-for="n in 8"
                    :key="n"
                    class="absolute w-full h-px bg-highlighted"
                    :style="{ top: `${n * 14}%` }"
                  />
                </div>

                <!-- Play icon in center of reel -->
                <div class="w-16 h-16 rounded-full bg-highlighted/20 flex items-center justify-center backdrop-blur-sm">
                  <UIcon name="i-lucide-play" class="size-8 text-highlighted ml-1" />
                </div>
              </div>

              <!-- Reel overlay controls -->
              <div class="absolute right-3 bottom-20 flex flex-col items-center gap-4">
                <!-- Animated social icon -->
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                  :style="{
                    color: current?.color,
                    opacity: isAnimating ? 0 : 1,
                    transform: isAnimating ? 'scale(0.5) rotate(-20deg)' : 'scale(1) rotate(0deg)',
                  }"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12">
                    <path :d="current?.path" />
                  </svg>
                </div>
                <!-- Like -->
                <div class="flex flex-col items-center gap-0.5">
                  <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <UIcon name="i-lucide-heart" class="size-4 text-primary" />
                  </div>
                  <span class="text-highlighted text-xs">24.5K</span>
                </div>
                <!-- Comment -->
                <div class="flex flex-col items-center gap-0.5">
                  <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <UIcon name="i-lucide-message-circle" class="size-4 text-highlighted" />
                  </div>
                  <span class="text-highlighted text-xs">1.2K</span>
                </div>
                <!-- Share -->
                <div class="flex flex-col items-center gap-0.5">
                  <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <UIcon name="i-lucide-share-2" class="size-4 text-highlighted" />
                  </div>
                  <span class="text-highlighted text-xs">847</span>
                </div>
              </div>

              <!-- Bottom caption -->
              <div class="absolute bottom-4 left-3 right-14 space-y-1">
                <p class="text-highlighted text-xs font-semibold">@tuempresa</p>
                <p class="text-highlighted text-xs opacity-80 leading-tight">
                  Nuestro mejor reel del mes #viral #marketing
                </p>
                <!-- Progress bar -->
                <UProgress :model-value="66" size="xs" class="mt-2" />
              </div>
            </div>
          </div>

          <!-- Platform label at top -->
          <div
            class="absolute top-8 left-0 right-0 flex justify-center z-20 transition-all duration-300"
            :style="{ opacity: isAnimating ? 0 : 1 }"
          >
            <span
              class="text-xs font-bold tracking-wide px-3 py-1 rounded-full"
              :style="{ color: current?.color, backgroundColor: `${current?.color}20` }"
            >
              {{ current?.name }}
            </span>
          </div>

          <!-- Home indicator -->
          <div class="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-highlighted/30 rounded-full" />
        </div>

        <!-- Decorative floating metrics -->
        <div class="absolute -right-8 top-16 bg-elevated border border-muted rounded-2xl px-4 py-3 shadow-xl stat-card">
          <p class="text-xs text-muted">Alcance</p>
          <p class="text-xl font-bold text-primary">+340%</p>
        </div>
        <div class="absolute -left-10 bottom-24 bg-elevated border border-muted rounded-2xl px-4 py-3 shadow-xl stat-card">
          <p class="text-xs text-muted">Engagement</p>
          <p class="text-xl font-bold text-secondary">8.7%</p>
        </div>
      </div>
    </div>
  </section>
</template>
