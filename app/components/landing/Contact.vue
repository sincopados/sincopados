<script setup lang="ts">
const WHATSAPP = '573105720977'

const interests = [
  { value: 'Masterclass gratuita', label: 'Masterclass gratuita' },
  { value: 'Consulta estratégica', label: 'Consulta estratégica' },
  { value: 'Formación y cursos', label: 'Formación' },
  { value: 'Bodega de contenidos', label: 'Bodega' },
  { value: 'Únete a la red', label: 'Unirme a la red' },
  { value: 'Programa de afiliados', label: 'Afiliados' },
]
const profiles = ['Creador de contenido', 'Editor de video', 'Emprendedor o negocio', 'Estudiante', 'Artista']

const interest = useLandingInterest()
const nombre = ref('')
const perfil = ref(profiles[0])
const ciudad = ref('')
const consent = ref(false)
const error = ref('')
const nombreInput = useTemplateRef<HTMLInputElement>('nombreInput')

function submit() {
  const name = nombre.value.trim()
  if (!name) {
    error.value = 'Escribe tu nombre para continuar.'
    nombreInput.value?.focus()
    return
  }
  if (!consent.value) {
    error.value = 'Necesitamos tu autorización de tratamiento de datos.'
    return
  }
  error.value = ''
  const city = ciudad.value.trim()
  const msg = `Hola, soy ${name}${city ? ` de ${city}` : ''}. Perfil: ${perfil.value}. Me interesa: ${interest.value}.`
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
}

// La marca de fondo sube más despacio que la sección.
const { reduce } = useLandingMotion()
const mark = useTemplateRef<HTMLElement>('mark')
useRafFn(() => {
  if (reduce.value || !mark.value?.parentElement) return
  const base = (mark.value.parentElement.getBoundingClientRect().top - window.innerHeight) * -0.12
  mark.value.style.transform = `translateX(-50%) translate3d(0,${base}px,0)`
})
</script>

<template>
  <section id="contacto" class="final">
    <img ref="mark" class="final-mark" src="/marca/sincopados-isotipo-blanco.svg" alt="" aria-hidden="true">
    <div class="wrap final-in">
      <div>
        <p class="eyebrow rv">Da el primer paso</p>
        <h2 class="h-xl rv" data-d="1">Tu lugar<br>en la <span class="gold">red</span><br>te espera.</h2>
        <p class="lead rv" data-d="2" style="margin-top:24px">Cuéntanos qué te interesa y te respondemos por WhatsApp con el siguiente paso.</p>
      </div>
      <form class="form rv" data-d="2" novalidate @submit.prevent="submit">
        <fieldset>
          <legend>¿Qué te interesa?</legend>
          <div class="chips">
            <label v-for="o in interests" :key="o.value" class="chip">
              <input v-model="interest" type="radio" name="interes" :value="o.value">
              <span>{{ o.label }}</span>
            </label>
          </div>
        </fieldset>
        <div class="row2">
          <div class="field">
            <label class="lbl" for="nombre">Nombre</label>
            <input id="nombre" ref="nombreInput" v-model="nombre" name="nombre" autocomplete="name" placeholder="¿Cómo te llamas?" required>
          </div>
          <div class="field">
            <label class="lbl" for="perfil">Tu perfil</label>
            <select id="perfil" v-model="perfil" name="perfil">
              <option v-for="p in profiles" :key="p">{{ p }}</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label class="lbl" for="ciudad">Ciudad</label>
          <input id="ciudad" v-model="ciudad" name="ciudad" autocomplete="address-level2" placeholder="Medellín">
        </div>
        <label class="consent">
          <input v-model="consent" type="checkbox" required>
          <span>Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 (Habeas Data) para recibir información de Sincopados Producciones.</span>
        </label>
        <p class="err" role="alert">{{ error }}</p>
        <button class="btn magnetic" type="submit">Enviar por WhatsApp <span class="arr">→</span></button>
        <p class="form-note">Respuesta directa con el equipo. Sin spam.</p>
      </form>
    </div>
  </section>
</template>

<style scoped>
.final { padding: 120px 0 130px; overflow: hidden; }
.final-mark { position: absolute; left: 50%; top: 0; width: min(150vw, 1100px); max-width: none; transform: translateX(-50%); opacity: .05; pointer-events: none; will-change: transform; }
.final-in { position: relative; z-index: 2; display: grid; gap: 48px; }
.form { background: var(--ink); border: 1px solid var(--line); border-radius: 22px; padding: 24px 20px; display: grid; gap: 18px; }
fieldset { border: 0; display: grid; gap: 10px; min-width: 0; }
legend, .lbl { font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip input { position: absolute; opacity: 0; pointer-events: none; }
.chip span { display: inline-flex; align-items: center; min-height: 42px; padding: 0 16px; border-radius: 999px; border: 1px solid rgba(255, 255, 255, .22); font-size: 15px; cursor: pointer; transition: all .3s var(--ease); user-select: none; }
.chip input:checked + span { background: var(--gold); border-color: var(--gold); color: var(--black); font-weight: 700; }
.chip input:focus-visible + span { outline: 2px solid var(--gold); outline-offset: 2px; }
.field { display: grid; gap: 8px; }
.field input, .field select { width: 100%; min-height: 54px; padding: 0 16px; border-radius: 12px; background: var(--black); border: 1px solid rgba(255, 255, 255, .18); font-size: 16px; color: var(--white); transition: border-color .3s; }
.field select option { background: var(--black); }
.field input::placeholder { color: rgba(255, 255, 255, .35); }
.field input:focus, .field select:focus { border-color: var(--gold); outline: none; }
.row2 { display: grid; gap: 18px; }
.consent { display: flex; gap: 12px; align-items: flex-start; font-size: 14px; color: var(--muted); line-height: 1.45; cursor: pointer; }
.consent input { appearance: none; -webkit-appearance: none; flex: none; width: 22px; height: 22px; border: 1px solid rgba(255, 255, 255, .35); border-radius: 6px; margin-top: 1px; display: grid; place-items: center; cursor: pointer; transition: all .3s; }
.consent input:checked { background: var(--gold); border-color: var(--gold); }
.consent input:checked::after { content: ''; width: 6px; height: 11px; border: solid var(--black); border-width: 0 2px 2px 0; transform: rotate(45deg) translate(-1px, -1px); }
.form .btn { width: 100%; }
.form-note { font-size: 13px; color: var(--muted); text-align: center; }
.err { color: var(--gold); font-size: 14px; min-height: 20px; }

@media (min-width: 640px) {
  .row2 { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 960px) {
  .final-in { grid-template-columns: 1fr 1fr; align-items: center; gap: 80px; }
  .form { padding: 36px; }
}
</style>
