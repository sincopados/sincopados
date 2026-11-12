<script setup lang="ts">
const props = defineProps<{ to: number }>()

const { reduce } = useLandingMotion()
const el = useTemplateRef<HTMLElement>('el')
const value = ref(0)

// Cuenta de 0 al valor final con ease-out cuártico la primera vez que se ve.
const { stop } = useIntersectionObserver(el, ([entry]) => {
  if (!entry?.isIntersecting) return
  stop()
  const t0 = performance.now()
  const d = reduce.value ? 1 : 1600
  const step = (t: number) => {
    const p = fxClamp((t - t0) / d)
    value.value = Math.round(props.to * (1 - Math.pow(1 - p, 4)))
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}, { threshold: 0.6 })
</script>

<template>
  <span ref="el">{{ value }}</span>
</template>
