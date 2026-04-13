<script setup lang="ts">
const items = [
  { label: '2019', description: 'Fundación y primeros experimentos audiovisuales.', icon: 'i-heroicons-sparkles' },
  { label: '2021', description: 'Pivote estratégico hacia contenido vertical y viralidad.', icon: 'i-heroicons-bolt' },
  { label: '2023', description: 'Consolidación del equipo creativo y nuevas oficinas.', icon: 'i-heroicons-user-group' },
  { label: '2026', description: 'Liderazgo regional en producción para marcas globales.', icon: 'i-heroicons-globe-americas' }
]
</script>

<template>
  <section class="max-w-3xl mx-auto">
    <h2 class="text-3xl font-bold text-center mb-16 italic">Evolución <span class="text-primary-500">Sincopada</span></h2>
    <div class="space-y-8">
      <div v-for="(item, index) in items" :key="index" class="flex gap-6 group">
        <div class="flex flex-col items-center">
          <div class="p-3 rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-primary-500 transition-colors">
            <UIcon :name="item.icon" class="w-6 h-6 text-primary-500" />
          </div>
          <div v-if="index !== items.length - 1" class="w-px h-full bg-zinc-800 mt-2"></div>
        </div>
        <UCard class="flex-1 mb-8 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 transition-colors">
          <h3 class="text-xl font-bold text-primary-500">{{ item.label }}</h3>
          <p class="text-gray-400 mt-2">{{ item.description }}</p>
        </UCard>
      </div>
    </div>
  </section>
</template>