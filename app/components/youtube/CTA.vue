<script setup lang="ts">
const shortVideoId = 'ei_2rfHyqCU'
const horizontalVideoId = 'dQw4w9WgXcQ'
</script>

<template>
  <section class="relative overflow-hidden bg-default py-24 lg:py-32">
    <!-- Background gradient -->
    <div class="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
    
    <UContainer>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Text Content -->
        <div class="text-center lg:text-left space-y-6">
          <UBadge label="Producción Profesional" color="primary" variant="subtle" />
          
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-highlighted tracking-tight text-balance">
            Creamos videos que
            <span class="text-primary">impulsan tu marca</span>
          </h1>
          
          <p class="text-lg text-muted max-w-xl mx-auto lg:mx-0 text-pretty">
            Transformamos tus ideas en contenido visual de alto impacto para YouTube. 
            Desde shorts virales hasta videos completos que enganchan a tu audiencia.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <UButton 
              label="Contratar servicio" 
              size="xl"
              icon="i-lucide-rocket"
              to="#contacto"
            />
            <UButton 
              label="Ver portafolio" 
              color="neutral" 
              variant="outline"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
            />
          </div>
          
          <!-- Stats -->
          <div class="flex flex-wrap gap-8 justify-center lg:justify-start pt-6">
            <div class="text-center">
              <p class="text-3xl font-bold text-highlighted">500+</p>
              <p class="text-sm text-muted">Videos creados</p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-highlighted">50M+</p>
              <p class="text-sm text-muted">Visualizaciones</p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-highlighted">98%</p>
              <p class="text-sm text-muted">Clientes satisfechos</p>
            </div>
          </div>
        </div>
        
        <!-- Device Mockups -->
        <div class="relative flex items-center justify-center">
          <!-- Phone Mockup - YouTube Short -->
          <div class="relative z-20 -mr-16">
            <div class="relative w-48 md:w-56 h-[400px] md:h-[480px] bg-inverted rounded-[2.5rem] p-2 shadow-2xl">
              <!-- Phone Notch -->
              <div class="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-inverted rounded-full z-10" />
              
              <!-- Screen -->
              <div class="relative w-full h-full bg-muted rounded-[2rem] overflow-hidden">
                <!-- YouTube Short Player -->
                <div class="absolute inset-0 flex flex-col">
                  <!-- Video Area -->
                  <div class="flex-1 relative bg-neutral-900">
                    <iframe
                      :src="`https://www.youtube.com/embed/${shortVideoId}?autoplay=0&mute=1&loop=1&playlist=${shortVideoId}&controls=0`"
                      class="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    />
                    
                    <!-- Overlay UI -->
                    <div class="absolute bottom-4 right-3 flex flex-col gap-4">
                      <div class="flex flex-col items-center gap-1">
                        <UIcon name="i-lucide-heart" class="size-6 text-white drop-shadow-lg" />
                        <span class="text-white text-xs font-medium drop-shadow-lg">125K</span>
                      </div>
                      <div class="flex flex-col items-center gap-1">
                        <UIcon name="i-lucide-message-circle" class="size-6 text-white drop-shadow-lg" />
                        <span class="text-white text-xs font-medium drop-shadow-lg">2.3K</span>
                      </div>
                      <div class="flex flex-col items-center gap-1">
                        <UIcon name="i-lucide-share" class="size-6 text-white drop-shadow-lg" />
                        <span class="text-white text-xs font-medium drop-shadow-lg">Share</span>
                      </div>
                    </div>
                    
                    <!-- Shorts Badge -->
                    <div class="absolute top-3 left-3 bg-primary px-2 py-1 rounded-sm">
                      <span class="text-white text-xs font-bold">Shorts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Horizontal Video Player -->
          <div class="relative z-10">
            <div class="w-72 md:w-96 aspect-video bg-inverted rounded-2xl p-2 shadow-2xl">
              <div class="relative w-full h-full bg-neutral-900 rounded-xl overflow-hidden">
                <iframe
                  :src="`https://www.youtube.com/embed/${horizontalVideoId}?autoplay=0&mute=1`"
                  class="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                />
                
                <!-- YouTube Logo Overlay -->
                <div class="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded">
                  <UIcon name="i-simple-icons-youtube" class="size-4 text-red-500" />
                  <span class="text-white text-xs font-medium">YouTube</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Decorative Elements -->
          <div class="absolute -top-8 -right-8 size-32 bg-primary/20 rounded-full blur-3xl" />
          <div class="absolute -bottom-8 -left-8 size-24 bg-primary/10 rounded-full blur-2xl" />
        </div>
      </div>
    </UContainer>
  </section>
</template>
