<script setup lang="ts">
// CTA fijo en móvil: aparece pasado el hero y se esconde al llegar al formulario.
const show = ref(false)
let contact: HTMLElement | null = null
onMounted(() => { contact = document.getElementById('contacto') })

useRafFn(() => {
  const vh = window.innerHeight
  const cTop = contact?.getBoundingClientRect().top ?? Infinity
  show.value = window.scrollY > vh * 0.7 && cTop > vh * 0.4
})
</script>

<template>
  <div class="dock" :class="{ show }">
    <a href="#contacto" data-interest="Masterclass gratuita" class="btn">Masterclass gratuita <span class="arr">→</span></a>
    <a href="https://wa.me/573105720977" target="_blank" rel="noopener" class="btn ghost wa" aria-label="Escríbenos por WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.5-.3z" /></svg>
    </a>
  </div>
</template>

<style scoped>
.dock {
  position: fixed; left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom)); z-index: 70; display: flex; gap: 8px; padding: 8px; border-radius: 999px;
  background: rgba(12, 12, 12, .82); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid var(--line);
  transform: translateY(140%); transition: transform .6s var(--ease);
}
.dock.show { transform: none; }
.dock .btn { flex: 1; min-height: 48px; font-size: 13px; padding: 0 12px; }
.dock .wa { flex: none; width: 48px; min-height: 48px; padding: 0; border-radius: 50%; }
.dock .wa svg { width: 22px; height: 22px; }

@media (min-width: 960px) {
  .dock { display: none; }
}
</style>
