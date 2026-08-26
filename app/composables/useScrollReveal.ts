import { animate, onScroll, stagger, utils } from 'animejs'

/**
 * Revela con anime.js los elementos marcados dentro de `root` a medida que
 * entran en el viewport.
 *
 * - `data-reveal`: el propio elemento entra desde abajo.
 * - `data-reveal-group`: sus hijos directos entran escalonados.
 *
 * Respeta `prefers-reduced-motion`: si el usuario la activa, el contenido se
 * muestra sin movimiento.
 */
export function useScrollReveal(root: Ref<HTMLElement | null>) {
  onMounted(() => {
    const el = root.value
    if (!el) return

    const targets = [
      ...el.querySelectorAll<HTMLElement>('[data-reveal]'),
      ...el.querySelectorAll<HTMLElement>('[data-reveal-group] > *'),
    ]
    if (!targets.length) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // La clase sólo se aplica desde el cliente: sin JS el contenido nunca queda
    // oculto, y el CSS puede esconder los objetivos antes del primer frame.
    el.classList.add('is-animated')
    utils.set(targets, { opacity: 0 })

    for (const target of el.querySelectorAll<HTMLElement>('[data-reveal]')) {
      animate(target, {
        opacity: [0, 1],
        translateY: [28, 0],
        filter: ['blur(6px)', 'blur(0px)'],
        duration: 900,
        ease: 'out(3)',
        autoplay: onScroll({ enter: 'bottom-=80 top', repeat: false }),
      })
    }

    for (const group of el.querySelectorAll<HTMLElement>('[data-reveal-group]')) {
      const children = [...group.children]
      if (!children.length) continue

      animate(children, {
        opacity: [0, 1],
        translateY: [36, 0],
        scale: [0.96, 1],
        duration: 850,
        ease: 'out(3)',
        delay: stagger(90),
        autoplay: onScroll({ enter: 'bottom-=60 top', repeat: false }),
      })
    }
  })
}
