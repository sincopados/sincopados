import type { Course, Database, EnrollmentStatus } from '~/types/db'

/** Lo que el catálogo público puede leer de un curso (ver migración 20261117180000). */
export type PublicCourse = Pick<Course, 'id' | 'title' | 'slug' | 'description' | 'cover_url' | 'price' | 'currency' | 'created_at'>

/**
 * Columnas pedidas una a una: el rol `anon` sólo tiene permiso sobre éstas,
 * así que un `select('*')` fallaría para un visitante sin sesión.
 */
const PUBLIC_COURSE_COLUMNS = 'id, title, slug, description, cover_url, price, currency, created_at'

/** Cursos activos para /educacion, de más nuevo a más antiguo. */
export const useCourseCatalog = () => {
  const client = useSupabaseClient<Database>()

  return useAsyncData('course-catalog', async () => {
    const { data, error } = await client
      .from('courses')
      .select(PUBLIC_COURSE_COLUMNS)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as PublicCourse[]
  }, { default: () => [] as PublicCourse[] })
}

/** Un curso activo por su slug, o `null` si no existe o no está publicado. */
export const usePublicCourse = (slug: MaybeRefOrGetter<string>) => {
  const client = useSupabaseClient<Database>()
  const key = computed(() => toValue(slug))

  return useAsyncData(() => `public-course-${key.value}`, async () => {
    const { data, error } = await client
      .from('courses')
      .select(PUBLIC_COURSE_COLUMNS)
      .eq('slug', key.value)
      .eq('is_active', true)
      .maybeSingle()
    if (error) throw error
    return data as PublicCourse | null
  }, { watch: [key] })
}

/**
 * Inscripción del usuario con sesión en un curso, para cambiar «Quiero
 * inscribirme» por «Entrar al curso». Sin sesión devuelve `null` sin consultar.
 */
export const useMyEnrollmentStatus = (courseId: MaybeRefOrGetter<string | null | undefined>) => {
  const client = useSupabaseClient<Database>()
  const userId = useAuthUserId()
  const id = computed(() => toValue(courseId) ?? null)

  return useAsyncData(() => `my-enrollment-${id.value ?? 'none'}-${userId.value ?? 'anon'}`, async () => {
    if (!id.value || !userId.value) return null
    const { data } = await client
      .from('enrollments')
      .select('status')
      .eq('course_id', id.value)
      .eq('student_id', userId.value)
      .maybeSingle()
    return (data?.status ?? null) as EnrollmentStatus | null
  }, { watch: [id, userId], server: false, default: () => null })
}

/** Temario público: módulos activos y sólo el título de sus clases. */
export type SyllabusClass = { id: string, title: string, has_video: boolean }
export type SyllabusModule = {
  id: string
  title: string
  description: string | null
  cover_url: string | null
  classes: SyllabusClass[]
}

/**
 * Temario de varios cursos (o de todos, sin ids) indexado por curso, en una
 * sola llamada a `course_syllabus`. Esa función de Postgres nunca devuelve el
 * video, el contenido ni el material de las clases.
 */
export const useCourseSyllabus = (courseIds?: MaybeRefOrGetter<string[] | undefined>) => {
  const client = useSupabaseClient<Database>()
  const ids = computed(() => toValue(courseIds))

  return useAsyncData(
    () => `course-syllabus-${ids.value?.join(',') ?? 'all'}`,
    async () => {
      const { data, error } = await client.rpc('course_syllabus', ids.value ? { p_course_ids: ids.value } : {})
      if (error) throw error
      return Object.fromEntries(
        (data ?? []).map(row => [row.course_id, row.modules as unknown as SyllabusModule[]]),
      ) as Record<string, SyllabusModule[]>
    },
    { watch: [ids], default: () => ({}) as Record<string, SyllabusModule[]> },
  )
}

/** Totales de un temario, para «3 módulos · 12 clases». */
export const syllabusTotals = (modules: SyllabusModule[] = []) => ({
  modules: modules.length,
  classes: modules.reduce((sum, m) => sum + m.classes.length, 0),
})
