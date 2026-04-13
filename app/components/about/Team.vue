<script setup lang="ts">
const founders = ref([
  {
    name: 'Eleazar García',
    role: 'Creative Director',
    showAlt: false,
    imgMain: 'https://picsum.photos/400/500?random=11',
    imgAlt: 'https://picsum.photos/400/500?random=12'
  },
  {
    name: 'Steevens García',
    role: 'Digital Strategist',
    showAlt: false,
    imgMain: 'https://picsum.photos/400/500?random=21',
    imgAlt: 'https://picsum.photos/400/500?random=22'
  }
])
</script>

<template>
  <section class="text-center">
    <h2 class="text-3xl font-bold mb-16 underline decoration-primary-500 decoration-4 underline-offset-8">Los Cerebros</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
      <div 
        v-for="(founder, index) in founders" 
        :key="index"
        class="group cursor-pointer"
        @mouseenter="founder.showAlt = true"
        @mouseleave="founder.showAlt = false"
        @click="founder.showAlt = !founder.showAlt"
      >
        <div class="relative overflow-hidden rounded-[2.5rem] aspect-[4/5] border border-zinc-800 group-hover:border-primary-500 transition-all duration-500 shadow-xl">
          <Transition name="fade">
            <img 
              :src="founder.showAlt ? founder.imgAlt : founder.imgMain" 
              class="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          </Transition>
        </div>
        <div class="mt-6">
          <p class="text-primary-500 text-sm font-bold tracking-widest uppercase">{{ founder.role }}</p>
          <h3 class="text-2xl font-bold mt-1">{{ founder.name }}</h3>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>