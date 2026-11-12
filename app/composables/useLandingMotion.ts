/**
 * Estado de movimiento compartido por las secciones de la landing.
 *
 * - `reduce`: el usuario pidió menos movimiento; las secciones dejan el
 *   contenido en su estado final y no corren parallax.
 * - `desktop`: a partir de 960 px los pilares pasan a scroll horizontal fijado.
 * - `finePointer`: hay ratón; sólo entonces hay tilt y botones magnéticos.
 *
 * Todo arranca en `false` en el servidor y se resuelve al hidratar, así el
 * HTML de SSR es el de móvil sin animaciones, que es el estado seguro.
 */
export function useLandingMotion() {
  const reduce = computed(() => usePreferredReducedMotion().value === 'reduce')
  const desktop = useMediaQuery('(min-width: 960px)')
  const finePointer = useMediaQuery('(pointer: fine)')
  return { reduce, desktop, finePointer }
}

/** Interés preseleccionado en el formulario; lo fija cualquier CTA con `data-interest`. */
export function useLandingInterest() {
  return useState<string>('landing-interest', () => 'Masterclass gratuita')
}

export const fxClamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const fxLerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Efectos transversales de la página, delegados desde su raíz:
 * revelado `.rv` al entrar en pantalla, botones `.magnetic` y CTAs
 * `[data-interest]` que preseleccionan el interés del formulario.
 */
export function useLandingFx(root: Ref<HTMLElement | null>) {
  const { reduce, finePointer } = useLandingMotion()
  const interest = useLandingInterest()

  useEventListener(root, 'click', (e: MouseEvent) => {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-interest]')
    if (el?.dataset.interest) interest.value = el.dataset.interest
  })

  onMounted(() => {
    const el = root.value
    if (!el) return

    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('in')
        io.unobserve(e.target)
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })
    el.querySelectorAll('.rv').forEach(n => io.observe(n))
    onBeforeUnmount(() => io.disconnect())

    if (!finePointer.value || reduce.value) return
    for (const b of el.querySelectorAll<HTMLElement>('.magnetic')) {
      useEventListener(b, 'mousemove', (e: MouseEvent) => {
        const r = b.getBoundingClientRect()
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`
      })
      useEventListener(b, 'mouseleave', () => { b.style.transform = '' })
    }
  })
}
