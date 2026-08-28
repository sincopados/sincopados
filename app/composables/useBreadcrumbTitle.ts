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
