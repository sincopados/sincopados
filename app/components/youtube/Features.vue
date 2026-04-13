<script setup lang="ts">

const { t } = useI18n(); 

const features = [
  {
    icon: 'i-lucide-graduation-cap',
    title: t('youtubeFeaturesTitle1'),
    description: t('youtubeFeaturesDescription1')
  },
  {
    icon: 'i-lucide-sparkles',
    title: t('youtubeFeaturesTitle2'),
    description: t('youtubeFeaturesDescription2')
  },
  {
    icon: 'i-lucide-mic',
    title: t('youtubeFeaturesTitle3'),
    description: t('youtubeFeaturesDescription3')
  },
  {
    icon: 'i-lucide-building-2',
    title:  t('youtubeFeaturesTitle4'),
    description: t('youtubeFeaturesDescription4')
  },
  {
    icon: 'i-lucide-radio',
    title:  t('youtubeFeaturesTitle5'),
    description: t('youtubeFeaturesDescription5')
  },
  {
    icon: 'ic:twotone-confirmation-number',
    title:  t('youtubeFeaturesTitle6'),
    description: t('youtubeFeaturesDescription6')
  }
]
</script>

<template>
  <section id="servicios" class="bg-muted py-24 lg:py-32">
    <UContainer>
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <UBadge :label="$t('youtubeCTABadget')" color="primary" variant="subtle" class="mb-4" />
        
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-highlighted mb-6 text-balance">
          {{$t('youtubeFeaturesTitle')}}
        </h2>
        
        <p class="text-lg text-muted text-pretty">
          {{$t('youtubeFeaturesTitle')}}
          
        </p>
      </div>
      
      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="(feature, index) in features"
          :key="feature.title"
          :ui="{ 
            root: 'hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5',
            body: 'p-8'
          }"
        >
          <div class="space-y-4">
            <!-- Icon -->
            <div class="size-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <UIcon :name="feature.icon" class="size-7 text-primary" />
            </div>
            
            <!-- Content -->
            <h3 class="text-xl font-semibold text-highlighted">
              {{ feature.title }}
            </h3>
            
            <p class="text-muted leading-relaxed">
              {{ feature.description }}
            </p>
            
            <!-- Learn More Link -->
            <UButton 
              label="Saber más" 
              variant="link" 
              color="primary"
              trailing-icon="i-lucide-arrow-right"
              :padded="false"
            />
          </div>
        </UCard>
      </div>
      
      <!-- Bottom CTA -->
      <div class="mt-16 text-center">
        <UCard 
          :ui="{ 
            root: 'bg-inverted border-0',
            body: 'p-8 md:p-12'
          }"
        >
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="text-center md:text-left">
              <h3 class="text-2xl font-bold text-inverted mb-2">
                {{$t('youtubeFeaturesCTATitle')}}
              </h3>
              <p class="text-inverted/70">
                {{$t('youtubeFeaturesCTADescription')}}
              </p>
            </div>
            
            <div class="flex gap-3">
              <UButton 
                :label="$t('youtubeFeaturesCTAButton1')"
                color="primary"
                size="lg"
                to="#contacto"
              />
              <UButton 
                :label="$t('youtubeFeaturesCTAButton2')"
                color="neutral"
                variant="subtle"
                size="lg"
              />
            </div>
          </div>
        </UCard>
      </div>
    </UContainer>
  </section>
</template>
