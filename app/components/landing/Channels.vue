<script setup lang="ts">
const channels = [
  { role: 'Estación central', name: 'Sincopados Producciones', text: 'Lanzamientos, manifiesto y casos de éxito.', href: 'https://www.youtube.com/@SincopadosProducciones' },
  { role: 'Builder', name: 'Eleazar Maldonado', text: 'IA, automatización y estrategia de creadores.' },
  { role: 'Estilo de vida', name: 'con eleazar', text: 'Vida de creador, trabajo remoto y la Ruta Creadora.' },
  { role: 'Oficios', name: 'Barbería 420', text: 'De la barbería a YouTube: un oficio convertido en canal.' },
  { role: 'Música', name: 'Elrakmc', text: 'Lanzamientos musicales originales y cultura urbana.' },
  { role: 'En vivo', name: 'Emergentes XTV', text: 'Vitrina de artistas emergentes y transmisiones en vivo.' },
]
</script>

<template>
  <section id="red" class="eco">
    <div class="wrap">
      <div class="eco-head">
        <div>
          <p class="eyebrow rv">La red en movimiento</p>
          <h2 class="h-lg rv" data-d="1">Un sistema, <br>muchas voces</h2>
        </div>
        <p class="lead rv" data-d="2">La metodología Sincopados ya opera en canales de educación, estilo de vida, oficios, música y talento en vivo.</p>
      </div>
      <div class="eco-grid">
        <component
          :is="c.href ? 'a' : 'div'"
          v-for="(c, i) in channels"
          :key="c.name"
          class="chan rv"
          :data-d="i % 3 || undefined"
          v-bind="c.href ? { href: c.href, target: '_blank', rel: 'noopener' } : {}"
        >
          <span class="role">{{ c.role }}</span>
          <div>
            <h4>{{ c.name }}</h4>
            <p>{{ c.text }}</p>
          </div>
        </component>
      </div>
    </div>
  </section>
</template>

<style scoped>
.eco { padding: 120px 0; background: var(--white); color: var(--black); }
.eyebrow { color: var(--black); opacity: .6; }
.lead { color: rgba(0, 0, 0, .6); }
.eco-head { display: grid; gap: 18px; margin-bottom: 44px; }
.eco-grid { display: grid; gap: 12px; }
.chan { position: relative; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px; padding: 22px 20px; border-radius: 16px; background: #f3f3f3; overflow: hidden; isolation: isolate; transition: color .5s var(--ease); }
.chan::before { content: ''; position: absolute; inset: 0; background: var(--black); transform: scaleY(0); transform-origin: bottom; transition: transform .55s var(--ease); z-index: -1; }
.chan:hover { color: var(--white); }
.chan:hover::before { transform: none; }
.chan h4 { font-weight: 700; text-transform: uppercase; font-size: clamp(20px, 5vw, 28px); line-height: 1.05; }
.chan p { font-weight: 300; font-size: 15px; opacity: .7; margin-top: 4px; }
.role { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; padding: 6px 10px; border-radius: 999px; background: var(--gold); color: var(--black); white-space: nowrap; order: 1; }

@media (min-width: 640px) {
  .eco-grid { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 960px) {
  .eco-head { grid-template-columns: 1.2fr 1fr; align-items: end; }
  .eco-grid { grid-template-columns: repeat(3, 1fr); }
  .chan { grid-template-columns: 1fr; align-content: space-between; min-height: 200px; padding: 26px; }
  .role { justify-self: start; order: -1; }
}
</style>
