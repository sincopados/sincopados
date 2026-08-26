<script setup lang="ts">
const sections = [
  { id: 'logotipo', label: 'Logotipo' },
  { id: 'horizontal', label: 'Horizontal' },
  { id: 'tipografia', label: 'Tipografía' },
  { id: 'colores', label: 'Colores' },
  { id: 'aplicaciones', label: 'Aplicaciones' },
  { id: 'descargas', label: 'Descargas' },
]

const active = ref(sections[0]!.id)
let observer: IntersectionObserver | undefined

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter(entry => entry.isIntersecting)
      if (visible.length) active.value = visible[0]!.target.id
    },
    // La banda estrecha marca como activa la sección que cruza el tercio superior.
    { rootMargin: '-20% 0px -70% 0px' },
  )

  for (const section of sections) {
    const el = document.getElementById(section.id)
    if (el) observer.observe(el)
  }
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <nav
    class="sticky top-16 z-20 -mx-4 mb-4 overflow-x-auto border-y border-white/10 bg-[#0a0a0a]/85 px-4 py-3 backdrop-blur"
    aria-label="Secciones del manual de marca"
  >
    <ul class="flex min-w-max items-center gap-1">
      <li v-for="section in sections" :key="section.id">
        <a
          :href="`#${section.id}`"
          class="block rounded-full px-4 py-1.5 text-sm uppercase tracking-widest transition-colors"
          :class="active === section.id ? 'bg-brand-500 text-black' : 'text-white/50 hover:text-white'"
          :aria-current="active === section.id ? 'true' : undefined"
        >
          {{ section.label }}
        </a>
      </li>
    </ul>
  </nav>
</template>
