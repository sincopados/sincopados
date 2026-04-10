<script setup lang="ts">
const features = [
  {
    icon: 'i-lucide-graduation-cap',
    title: 'Videos Educativos',
    description: 'Contenido didáctico que enseña y entretiene. Tutoriales, cursos y explicaciones visuales que enganchan a tu audiencia.'
  },
  {
    icon: 'i-lucide-sparkles',
    title: 'Videos LifeStyle',
    description: 'Vlogs, día a día y contenido aspiracional. Mostramos tu estilo de vida de manera auténtica y atractiva.'
  },
  {
    icon: 'i-lucide-mic',
    title: 'Videos Podcast',
    description: 'Producción profesional para tus conversaciones. Clips dinámicos, audiogramas y formato completo optimizado para YouTube.'
  },
  {
    icon: 'i-lucide-building-2',
    title: 'Videos Corporativos',
    description: 'Comunicación empresarial de alto nivel. Presentaciones, capacitaciones y contenido institucional que refleja tu marca.'
  },
  {
    icon: 'i-lucide-radio',
    title: 'Transmisiones en Vivo',
    description: 'Producción en tiempo real con calidad profesional. Eventos, webinars y streaming con múltiples cámaras y gráficos.'
  }
]
</script>

<template>
  <section id="servicios" class="bg-muted py-24 lg:py-32">
    <UContainer>
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <UBadge label="Nuestros Servicios" color="primary" variant="subtle" class="mb-4" />
        
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-highlighted mb-6 text-balance">
          Todo lo que necesitas para triunfar en YouTube
        </h2>
        
        <p class="text-lg text-muted text-pretty">
          Ofrecemos soluciones completas de producción audiovisual adaptadas a cada tipo de contenido. 
          Desde la conceptualización hasta la entrega final, nos encargamos de todo.
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
                ¿Listo para crear contenido increíble?
              </h3>
              <p class="text-inverted/70">
                Contáctanos hoy y recibe una cotización personalizada sin compromiso.
              </p>
            </div>
            
            <div class="flex gap-3">
              <UButton 
                label="Solicitar cotización" 
                color="primary"
                size="lg"
                to="#contacto"
              />
              <UButton 
                label="Ver ejemplos" 
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
