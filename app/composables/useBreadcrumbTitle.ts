/**
 * Título con el que una página sustituye el último tramo de la miga de pan.
 *
 * La miga se deriva de la ruta, así que en una ruta dinámica mostraría el UUID.
 * Una página de detalle escribe aquí el nombre legible y el `Navbar` lo usa.
 *
 * Se limpia al desmontar para que no se arrastre a la siguiente página.
 */
export const useBreadcrumbTitle = () => {
  const title = useState<string | null>('breadcrumb-title', () => null)

  onScopeDispose(() => {
    title.value = null
  })

  return title
}

/**
 * Nombres legibles para varios tramos de la miga, por valor del tramo:
 * `{ 'mi-curso': 'Mi curso', 'modulo-1': 'Módulo 1' }`.
 *
 * Al desmontar sólo borra las entradas que sigue teniendo esta página: si la
 * siguiente ya escribió las suyas (se monta antes de que esta se desmonte),
 * no se las quita.
 */
export const useBreadcrumbLabels = (labels: MaybeRefOrGetter<Record<string, string | null | undefined>>) => {
  const state = useState<Record<string, string>>('breadcrumb-labels', () => ({}))
  let mine: Record<string, string> = {}

  /** Quita del mapa las entradas que puso esta página y nadie ha cambiado. */
  const withoutMine = (map: Record<string, string>) =>
    Object.fromEntries(Object.entries(map).filter(([segment, label]) => mine[segment] !== label))

  watchEffect(() => {
    const next: Record<string, string> = {}
    for (const [segment, label] of Object.entries(toValue(labels))) {
      if (label) next[segment] = label
    }
    state.value = { ...withoutMine(state.value), ...next }
    mine = next
  })

  onScopeDispose(() => {
    state.value = withoutMine(state.value)
  })
}

/** Lectura del mapa, para el `Navbar`. */
export const useBreadcrumbLabelMap = () =>
  useState<Record<string, string>>('breadcrumb-labels', () => ({}))
