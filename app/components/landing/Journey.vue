<script setup lang="ts">
const steps = [
  { phase: 'Atención', title: 'Descubre', text: 'Un Short, un Reel o un código QR en las calles de Medellín despierta tu curiosidad.' },
  { phase: 'Consideración', title: 'Explora', text: 'Mira el video de bienvenida en YouTube y súmate a los lives para ver el proceso de cerca, sin filtros.' },
  { phase: 'Acción', title: 'Actúa', text: 'Elige tu pilar, completa un formulario corto y recibe tus accesos por correo y WhatsApp.' },
  { phase: 'Recomendación', title: 'Crece', text: 'Aplica lo aprendido en tus canales, genera ingresos como afiliado y forma parte de una comunidad real de creadores.' },
]

const list = useTemplateRef<HTMLElement>('list')
const fill = useTemplateRef<HTMLElement>('fill')
const stepEls = useTemplateRef<HTMLElement[]>('stepEls')
const active = ref<boolean[]>(steps.map(() => false))

// El riel se llena con el scroll y cada paso se enciende al cruzar el 62 % de la pantalla.
useRafFn(() => {
  if (!list.value || !fill.value) return
  const vh = window.innerHeight
  const r = list.value.getBoundingClientRect()
  fill.value.style.transform = `scaleY(${fxClamp((vh * 0.6 - r.top) / r.height)})`
  ;(stepEls.value ?? []).forEach((s, i) => {
    const on = s.getBoundingClientRect().top < vh * 0.62
    if (active.value[i] !== on) active.value[i] = on
  })
})
</script>

<template>
  <section id="ruta" class="journey">
    <div class="wrap j-wrap">
      <div class="j-head">
        <p class="eyebrow">Tu ruta</p>
        <h2 class="h-lg">De la curiosidad a la <span class="mark">comunidad</span></h2>
        <p class="lead">Un recorrido simple, rápido y pensado para tu celular. Sin formularios eternos ni procesos lentos.</p>
      </div>
      <div ref="list" class="j-list">
        <div class="j-rail"><div ref="fill" class="j-fill" /></div>
        <div v-for="(s, i) in steps" :key="s.title" ref="stepEls" class="j-step" :class="{ on: active[i] }">
          <span class="j-dot" />
          <p class="j-phase">{{ s.phase }}</p>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.journey { padding: 120px 0; background: var(--white); color: var(--black); border-radius: 28px 28px 0 0; }
.eyebrow { color: var(--black); opacity: .6; }
.lead { color: rgba(0, 0, 0, .6); }
.mark { background: var(--gold); padding: 0 .12em; }
.j-head { display: grid; gap: 18px; margin-bottom: 56px; }
.j-list { position: relative; padding-left: 44px; }
.j-rail { position: absolute; left: 11px; top: 6px; bottom: 6px; width: 2px; background: rgba(0, 0, 0, .1); }
.j-fill { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: var(--black); transform-origin: top; transform: scaleY(0); }
.j-step { position: relative; padding-bottom: 52px; }
.j-step:last-child { padding-bottom: 0; }
.j-dot { position: absolute; left: -44px; top: 2px; width: 24px; height: 24px; border-radius: 50%; background: var(--white); border: 2px solid rgba(0, 0, 0, .18); transition: background .4s, border-color .4s, transform .5s var(--ease); }
.j-step.on .j-dot { background: var(--gold); border-color: var(--black); transform: scale(1.15); }
.j-phase { font-size: 12px; letter-spacing: .24em; text-transform: uppercase; opacity: .5; margin-bottom: 6px; }
.j-step h3 { font-weight: 700; text-transform: uppercase; font-size: clamp(32px, 7vw, 56px); line-height: 1; transition: opacity .4s; opacity: .25; }
.j-step.on h3 { opacity: 1; }
.j-step p:last-child { margin-top: 10px; font-weight: 300; font-size: 18px; max-width: 46ch; color: rgba(0, 0, 0, .7); }

@media (min-width: 960px) {
  .j-wrap { display: grid; grid-template-columns: 1fr 1.2fr; gap: 96px; align-items: start; }
  .j-head { position: sticky; top: 140px; }
}
</style>
