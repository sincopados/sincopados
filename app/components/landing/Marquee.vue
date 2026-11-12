<script setup lang="ts">
const props = withDefaults(defineProps<{
  items: string[]
  /** -1 hacia la izquierda, 1 hacia la derecha. */
  dir?: -1 | 1
  outline?: boolean
}>(), { dir: -1, outline: false })

const { reduce } = useLandingMotion()
const track = useTemplateRef<HTMLElement>('track')

// La cinta se repite dos veces; al recorrer media anchura vuelve al inicio
// sin salto. La velocidad del scroll la acelera.
let x = 0, w = 0, vel = 0, lastY = 0
const measure = () => { w = (track.value?.scrollWidth ?? 0) / 2 }
onMounted(() => { lastY = window.scrollY; measure() })
useEventListener(window, 'resize', measure, { passive: true })

useRafFn(() => {
  if (reduce.value || !track.value) return
  const y = window.scrollY
  vel = fxLerp(vel, y - lastY, 0.1)
  lastY = y
  x += (0.6 + Math.abs(vel) * 0.35) * props.dir
  if (w) {
    if (x <= -w) x += w
    if (x >= 0 && props.dir > 0) x -= w
  }
  track.value.style.transform = `translate3d(${x}px,0,0)`
})
</script>

<template>
  <div class="marquee" :class="{ outline }" aria-hidden="true">
    <div ref="track" class="marquee-track">
      <span v-for="(item, i) in [...items, ...items]" :key="i">{{ item }}</span>
    </div>
  </div>
</template>

<style scoped>
.marquee { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); overflow: hidden; padding: 18px 0; background: var(--black); }
.marquee-track { display: flex; width: max-content; will-change: transform; }
.marquee-track span { font-weight: 700; text-transform: uppercase; font-size: clamp(22px, 5vw, 44px); white-space: nowrap; padding: 0 22px; display: flex; align-items: center; gap: 44px; }
.marquee-track span::after { content: ''; width: 12px; height: 12px; background: var(--gold); transform: rotate(45deg); flex: none; }
.outline .marquee-track span { color: transparent; -webkit-text-stroke: 1px rgba(255, 255, 255, .4); }
</style>
