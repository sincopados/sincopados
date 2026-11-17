import type { CourseClass, CourseModule, Database } from '~/types/db'

type ModuleWithClasses = Pick<CourseModule, 'id' | 'title' | 'slug' | 'is_active' | 'course_id'> & {
  course_classes: CourseClass[]
}

/**
 * Las clases de un módulo, identificado por su slug (único en el sistema):
 * lectura y CRUD.
 *
 * La página del módulo y la de cada clase comparten la clave de
 * `useAsyncData`, así que navegar entre ellas reutiliza los datos. Escribir
 * sólo lo permite la RLS de `course_classes` al superusuario.
 */
export const useModuleClasses = (moduleSlug: MaybeRefOrGetter<string>) => {
  const client = useSupabaseClient<Database>()
  const slug = computed(() => toValue(moduleSlug))

  const { data, status, error, refresh } = useAsyncData(
    () => `module-classes-${slug.value}`,
    async () => {
      const { data, error } = await client
        .from('course_modules')
        .select('id, title, slug, is_active, course_id, course_classes(*)')
        .eq('slug', slug.value)
        .order('created_at', { referencedTable: 'course_classes' })
        .maybeSingle()

      if (error) throw error
      return data as ModuleWithClasses | null
    },
    { watch: [slug] },
  )

  const classes = computed<CourseClass[]>(() => data.value?.course_classes ?? [])

  /** Clase por su slug, con su posición y vecinas para navegar. */
  const findClass = (classSlug: string) => {
    const index = classes.value.findIndex(c => c.slug === classSlug)
    if (index === -1) return null
    return {
      lesson: classes.value[index]!,
      position: index + 1,
      prev: classes.value[index - 1] ?? null,
      next: classes.value[index + 1] ?? null,
    }
  }

  /** Los opcionales vacíos se guardan como `null`, no como cadena vacía. */
  const toRow = (input: CourseClassFormData) => ({
    title: input.title,
    slug: input.slug,
    cover_url: input.cover_url || null,
    description: input.description || null,
    video_url: input.video_url || null,
    content: input.content || null,
    is_active: input.is_active,
  })

  const { saving, run } = useCrudAction({
    refresh,
    duplicate: 'Ese slug ya está en uso por otra clase.',
    forbidden: 'Sólo un superusuario puede modificar las clases.',
  })

  const create = (input: CourseClassFormData) => {
    const moduleId = data.value?.id
    if (!moduleId) return Promise.resolve(false)
    return run(
      () => client.from('course_classes').insert({ ...toRow(input), module_id: moduleId }),
      { ok: 'Clase agregada', fail: 'No se pudo agregar la clase' },
    )
  }

  const update = (classId: string, input: CourseClassFormData) =>
    run(
      () => client.from('course_classes').update(toRow(input)).eq('id', classId),
      { ok: 'Clase actualizada', fail: 'No se pudo actualizar la clase' },
    )

  const remove = (classId: string) =>
    run(
      async () => {
        // El cascade borra las fichas del material, no los archivos del bucket.
        await removeClassMaterialObjects(client, { classId })
        return client.from('course_classes').delete().eq('id', classId)
      },
      { ok: 'Clase eliminada', fail: 'No se pudo eliminar la clase' },
    )

  return { classes, findClass, status, error, refresh, saving, create, update, remove }
}
