import type { Course, CourseModule, Database } from '~/types/db'

/** Curso tal como lo necesitan las páginas de módulos. */
export type CourseHeader = Pick<Course, 'id' | 'title' | 'slug' | 'description' | 'cover_url' | 'is_active'>

type CourseWithModules = CourseHeader & { course_modules: CourseModule[] }

/**
 * Un curso, identificado por su slug, con sus módulos: lectura y CRUD.
 *
 * La página del curso y la de cada módulo comparten la misma clave de
 * `useAsyncData`, así que navegar entre ellas reutiliza los datos.
 *
 * Quién puede escribir lo decide la RLS de `course_modules` (sólo el
 * superusuario); la interfaz esconde los botones al resto, pero un error de
 * permisos se muestra igual si llega a ocurrir.
 */
export const useCourseModules = (courseSlug: MaybeRefOrGetter<string>) => {
  const client = useSupabaseClient<Database>()

  const slug = computed(() => toValue(courseSlug))

  const { data, status, error, refresh } = useAsyncData(
    () => `course-modules-${slug.value}`,
    async () => {
      // Una sola consulta: el curso y sus módulos embebidos, en orden de alta.
      const { data, error } = await client
        .from('courses')
        .select('id, title, slug, description, cover_url, is_active, course_modules(*)')
        .eq('slug', slug.value)
        .order('created_at', { referencedTable: 'course_modules' })
        .maybeSingle()

      if (error) throw error
      return data as CourseWithModules | null
    },
    { watch: [slug] },
  )

  const course = computed<CourseHeader | null>(() => data.value ?? null)
  const modules = computed<CourseModule[]>(() => data.value?.course_modules ?? [])

  /** Módulo por su slug, con su posición y vecinos para navegar. */
  const findModule = (moduleSlug: string) => {
    const index = modules.value.findIndex(m => m.slug === moduleSlug)
    if (index === -1) return null
    return {
      module: modules.value[index]!,
      position: index + 1,
      prev: modules.value[index - 1] ?? null,
      next: modules.value[index + 1] ?? null,
    }
  }

  /** Los opcionales vacíos se guardan como `null`, no como cadena vacía. */
  const toRow = (input: CourseModuleFormData) => ({
    title: input.title,
    slug: input.slug,
    description: input.description || null,
    cover_url: input.cover_url || null,
    is_active: input.is_active,
  })

  const { saving, run } = useCrudAction({
    refresh,
    duplicate: 'Ese slug ya está en uso por otro módulo.',
    forbidden: 'Sólo un superusuario puede modificar los módulos.',
  })

  const create = (input: CourseModuleFormData) => {
    const courseId = course.value?.id
    if (!courseId) return Promise.resolve(false)
    return run(
      () => client.from('course_modules').insert({ ...toRow(input), course_id: courseId }),
      { ok: 'Módulo agregado', fail: 'No se pudo agregar el módulo' },
    )
  }

  const update = (moduleId: string, input: CourseModuleFormData) =>
    run(
      () => client.from('course_modules').update(toRow(input)).eq('id', moduleId),
      { ok: 'Módulo actualizado', fail: 'No se pudo actualizar el módulo' },
    )

  const remove = (moduleId: string) =>
    run(
      async () => {
        // El cascade borra clases y fichas, no los archivos del bucket.
        await removeClassMaterialObjects(client, { moduleId })
        return client.from('course_modules').delete().eq('id', moduleId)
      },
      { ok: 'Módulo eliminado', fail: 'No se pudo eliminar el módulo' },
    )

  return { course, modules, findModule, status, error, refresh, saving, create, update, remove }
}
