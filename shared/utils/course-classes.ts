import * as z from 'zod'

// Mismas reglas que las restricciones `check` de `public.course_classes`.
// El patrón del slug es el mismo de los módulos (COURSE_MODULE_SLUG_PATTERN).

const optionalUrl = z.union([
  z.url({ protocol: /^https?$/, error: 'Escribe una URL que empiece por http:// o https://' }),
  z.literal(''),
])

export const courseClassSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Escribe un título de al menos 2 caracteres')
    .max(160, 'Máximo 160 caracteres'),
  slug: z
    .string()
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .max(80, 'Máximo 80 caracteres')
    .regex(COURSE_MODULE_SLUG_PATTERN, 'Sólo minúsculas, números y guiones simples'),
  cover_url: optionalUrl,
  description: z.string().trim().max(2000, 'Máximo 2000 caracteres'),
  video_url: optionalUrl,
  content: z.string().trim().max(50000, 'Máximo 50 000 caracteres'),
  is_active: z.boolean(),
})

/** Lo que edita el formulario: los opcionales llegan como cadena vacía. */
export type CourseClassFormState = z.input<typeof courseClassSchema>
export type CourseClassFormData = z.output<typeof courseClassSchema>

export const emptyCourseClass = (): CourseClassFormState => ({
  title: '',
  slug: '',
  cover_url: '',
  description: '',
  video_url: '',
  content: '',
  is_active: true,
})
