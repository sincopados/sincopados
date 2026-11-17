import * as z from 'zod'

/** Mismas reglas que las restricciones `check` de `public.course_modules`. */
export const COURSE_MODULE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// El slug se deriva del título con `slugify` (shared/utils/social-networks.ts).

export const courseModuleSchema = z.object({
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
  description: z
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres'),
  cover_url: z
    .union([z.url({ protocol: /^https?$/, error: 'Escribe una URL que empiece por http:// o https://' }), z.literal('')]),
  is_active: z.boolean(),
})

/** Lo que edita el formulario: los opcionales llegan como cadena vacía. */
export type CourseModuleFormState = z.input<typeof courseModuleSchema>
export type CourseModuleFormData = z.output<typeof courseModuleSchema>

export const emptyCourseModule = (): CourseModuleFormState => ({
  title: '',
  slug: '',
  description: '',
  cover_url: '',
  is_active: true,
})
