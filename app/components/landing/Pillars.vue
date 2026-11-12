<script setup lang="ts">
type Pillar = {
  num: string
  tag: string
  title: [string, string]
  text: string
  cta: string
  interest: string
  variant?: 'gold' | 'white'
}

const pillars: Pillar[] = [
  {
    num: '01', tag: 'Cupos limitados', title: ['Formación', 'y cursos'], cta: 'Reserva tu cupo', interest: 'Formación y cursos',
    text: 'Programa intensivo de edición de video con inteligencia artificial y monetización en plataformas. Cohortes de 15 a 20 personas, práctica real desde el primer día.',
  },
  {
    num: '02', tag: 'Recursos', title: ['Bodega de', 'contenidos'], cta: 'Quiero acceso', interest: 'Bodega de contenidos', variant: 'gold',
    text: 'Plantillas, recursos descargables y guiones optimizados para creadores que quieren producir más, mejor y en menos tiempo.',
  },
  {
    num: '03', tag: 'Trabajo remoto', title: ['Únete a', 'la red'], cta: 'Postúlate', interest: 'Únete a la red',
    text: '¿Eres editor o talento digital? Postúlate e intégrate al flujo de trabajo del centro de medios, sin oficinas y desde donde estés.',
  },
  {
    num: '04', tag: 'Comisiones', title: ['Programa de', 'afiliados'], cta: 'Ser afiliado', interest: 'Programa de afiliados', variant: 'white',
    text: 'Recomienda los activos de la red y genera comisiones con un panel claro y transparente para alumnos y aliados.',
  },
]

const { reduce, desktop } = useLandingMotion()
const pin = useTemplateRef<HTMLElement>('pin')
const track = useTemplateRef<HTMLElement>('track')
const cards = useTemplateRef<HTMLElement[]>('cards')

// Escritorio: la sección se fija y el scroll vertical desplaza la pista en
// horizontal. Móvil: tarjetas apiladas con `sticky` que se encogen y oscurecen
// cuando la siguiente las tapa.
watch(desktop, () => {
  if (track.value) track.value.style.transform = ''
  for (const c of cards.value ?? []) { c.style.transform = ''; c.style.filter = '' }
})

useRafFn(() => {
  if (!pin.value || !track.value) return
  const vh = window.innerHeight
  if (desktop.value) {
    const r = pin.value.getBoundingClientRect()
    const total = pin.value.offsetHeight - vh
    const p = fxClamp(-r.top / total)
    const dist = Math.max(0, track.value.scrollWidth - window.innerWidth)
    track.value.style.transform = `translate3d(${-dist * p}px,0,0)`
    return
  }
  if (reduce.value) return
  const list = cards.value ?? []
  list.forEach((c, i) => {
    const next = list[i + 1]
    if (!next) return
    const p = fxClamp(1 - (next.getBoundingClientRect().top - 120) / (vh * 0.7))
    c.style.transform = `scale(${1 - p * 0.06})`
    c.style.filter = `brightness(${1 - p * 0.35})`
  })
})
</script>

<template>
  <section id="ecosistema" class="pillars">
    <div ref="pin" class="pin" :style="{ '--n': pillars.length }">
      <div class="pin-sticky">
        <div class="wrap pillars-head">
          <div>
            <p class="eyebrow rv">El ecosistema</p>
            <h2 class="h-lg rv" data-d="1">4 pilares,<br>1 <span class="gold">red</span></h2>
          </div>
          <p class="lead rv" data-d="2">Elige por dónde entrar. Cada pilar te conecta con el resto del centro de medios.</p>
        </div>
        <div ref="track" class="p-track">
          <article
            v-for="p in pillars"
            ref="cards"
            :key="p.num"
            class="p-card"
            :class="{ 'gold-card': p.variant === 'gold', 'white-card': p.variant === 'white' }"
          >
            <div class="p-top">
              <span class="p-num">{{ p.num }}</span>
              <span class="p-tag">{{ p.tag }}</span>
            </div>
            <div>
              <h3>{{ p.title[0] }}<br>{{ p.title[1] }}</h3>
              <p>{{ p.text }}</p>
              <a href="#contacto" :data-interest="p.interest" class="p-link">{{ p.cta }} <span class="arr">→</span></a>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pillars { padding: 110px 0 40px; }
.pillars-head { margin-bottom: 40px; display: grid; gap: 18px; }
.p-track { display: grid; gap: 16px; padding: 0 var(--pad); }
.p-card {
  position: sticky; top: 84px; min-height: 72svh; border-radius: 22px; padding: 28px 24px; display: flex; flex-direction: column; justify-content: space-between;
  background: var(--ink); border: 1px solid var(--line); overflow: hidden; transform-origin: 50% 0; will-change: transform;
}
.p-card:nth-child(2) { top: 96px; }
.p-card:nth-child(3) { top: 108px; }
.p-card:nth-child(4) { top: 120px; }
.p-card.gold-card { background: var(--gold); color: var(--black); border-color: var(--gold); }
.p-card.white-card { background: var(--white); color: var(--black); border-color: var(--white); }
.p-num { font-weight: 700; font-size: clamp(90px, 26vw, 200px); line-height: .8; letter-spacing: -.04em; color: transparent; -webkit-text-stroke: 1px currentColor; opacity: .55; }
.gold-card .p-num, .white-card .p-num { -webkit-text-stroke: 1.5px var(--black); }
.p-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.p-tag { font-size: 12px; letter-spacing: .24em; text-transform: uppercase; border: 1px solid currentColor; border-radius: 999px; padding: 6px 12px; white-space: nowrap; opacity: .8; }
.p-card h3 { font-weight: 700; text-transform: uppercase; font-size: clamp(34px, 9vw, 70px); line-height: .95; margin: 24px 0 14px; }
.p-card p { font-weight: 300; font-size: 18px; max-width: 34ch; opacity: .85; }
.p-link { margin-top: 26px; display: inline-flex; align-items: center; gap: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .14em; font-size: 14px; border-bottom: 1px solid currentColor; padding-bottom: 4px; align-self: flex-start; }
.p-link .arr { transition: transform .4s var(--ease); }
.p-link:hover .arr { transform: translateX(5px); }

@media (min-width: 960px) {
  /* Pilares: scroll horizontal fijado */
  .pillars { padding: 0; }
  .pin { height: calc(var(--n, 4) * 85vh + 100vh); }
  .pin-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; display: flex; flex-direction: column; justify-content: center; padding-top: 60px; }
  .pillars-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
  .p-track { display: flex; gap: 24px; width: max-content; will-change: transform; }
  .p-card { position: relative; top: auto !important; width: min(44vw, 560px); min-height: auto; height: min(56vh, 520px); padding: 34px; }
  .p-num { font-size: clamp(90px, 10vw, 150px); }
}
</style>
