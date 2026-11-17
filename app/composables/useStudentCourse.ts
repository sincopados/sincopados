import type { Course, CourseClass, CourseModule, Database, Enrollment } from '~/types/db'

export type StudentModule = CourseModule & { course_classes: CourseClass[] }

type StudentCourseRow = Pick<Course, 'id' | 'title' | 'slug' | 'description' | 'cover_url'> & {
  enrollments: Pick<Enrollment, 'status' | 'progress' | 'enrolled_at'>[]
  course_modules: StudentModule[]
}

/**
 * Un curso tal como lo ve el alumno: sólo lectura.
 *
 * Una sola consulta trae el curso, la inscripción del alumno y sus módulos con
 * las clases. La RLS ya filtra: `enrollments` sólo devuelve la propia y
 * módulos y clases sólo llegan si está inscrito (activo o completado) y están
 * activos. Las páginas del curso, el módulo y la clase comparten la clave, así
 * que navegar entre ellas no repite la consulta.
 */
export const useStudentCourse = (courseSlug: MaybeRefOrGetter<string>) => {
  const client = useSupabaseClient<Database>()
  const userId = useAuthUserId()
  const slug = computed(() => toValue(courseSlug))

  const { data, status, error } = useAsyncData(
    () => `student-course-${slug.value}`,
    async () => {
      if (!userId.value) return null
      const { data, error } = await client
        .from('courses')
        .select(`
          id, title, slug, description, cover_url,
          enrollments(status, progress, enrolled_at),
          course_modules(*, course_classes(*))
        `)
        .eq('slug', slug.value)
        .eq('enrollments.student_id', userId.value)
        .order('created_at', { referencedTable: 'course_modules' })
        .order('created_at', { referencedTable: 'course_modules.course_classes' })
        .maybeSingle()

      if (error) throw error
      return data as StudentCourseRow | null
    },
    { watch: [slug, userId] },
  )

  const enrollment = computed(() =>
    data.value?.enrollments.find(e => e.status === 'activo' || e.status === 'completado') ?? null,
  )

  /** El curso sólo si el alumno tiene acceso; si no, `null`. */
  const course = computed(() => (data.value && enrollment.value ? data.value : null))
  const modules = computed<StudentModule[]>(() => course.value?.course_modules ?? [])
  const classCount = computed(() => modules.value.reduce((sum, m) => sum + m.course_classes.length, 0))

  /** Terminó de cargar y el alumno no puede entrar (no existe o no está inscrito). */
  const denied = computed(() => status.value === 'success' && !course.value)

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

  /**
   * Clase dentro de un módulo, con sus vecinas. Al llegar al final de un
   * módulo, «siguiente» salta a la primera clase del módulo siguiente.
   */
  const findClass = (moduleSlug: string, classSlug: string) => {
    const flat = modules.value.flatMap(m => m.course_classes.map(c => ({ module: m, lesson: c })))
    const index = flat.findIndex(x => x.module.slug === moduleSlug && x.lesson.slug === classSlug)
    if (index === -1) return null
    const current = flat[index]!
    return {
      module: current.module,
      lesson: current.lesson,
      position: current.module.course_classes.indexOf(current.lesson) + 1,
      prev: flat[index - 1] ?? null,
      next: flat[index + 1] ?? null,
    }
  }

  return { course, enrollment, modules, classCount, denied, status, error, findModule, findClass }
}
