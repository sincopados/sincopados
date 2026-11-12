import * as z from 'zod'

/** Vertientes de la convocatoria. Refleja el enum `media_network_interest`. */
export type MediaNetworkInterest =
  | 'produccion_contenido'
  | 'trabajo_remoto'
  | 'monetizacion'
  | 'publicacion_lanzamiento'

export const MEDIA_NETWORK_INTERESTS = [
  'produccion_contenido',
  'trabajo_remoto',
  'monetizacion',
  'publicacion_lanzamiento',
] as const satisfies readonly MediaNetworkInterest[]

export const MEDIA_NETWORK_INTEREST_LABELS: Record<MediaNetworkInterest, string> = {
  produccion_contenido: 'Producción de contenido',
  trabajo_remoto: 'Trabajo remoto',
  monetizacion: 'Monetización',
  publicacion_lanzamiento: 'Publicación y campañas de lanzamiento',
}

export const MEDIA_NETWORK_INTEREST_DESCRIPTIONS: Record<MediaNetworkInterest, string> = {
  produccion_contenido: 'Graba, edita y produce contenido de alto impacto con el equipo.',
  trabajo_remoto: 'Intégrate a la red como editor o talento digital, desde donde estés.',
  monetizacion: 'Convierte tu audiencia y tus activos digitales en ingresos.',
  publicacion_lanzamiento: 'Publica con estrategia y lanza campañas que generen tracción.',
}

export const MEDIA_NETWORK_INTEREST_ICONS: Record<MediaNetworkInterest, string> = {
  produccion_contenido: 'i-lucide-clapperboard',
  trabajo_remoto: 'i-lucide-laptop',
  monetizacion: 'i-lucide-hand-coins',
  publicacion_lanzamiento: 'i-lucide-rocket',
}

export const SINCOPADOS_YOUTUBE_CHANNEL = 'https://www.youtube.com/@SincopadosProducciones'
export const SINCOPADOS_YOUTUBE_VIDEOS = `${SINCOPADOS_YOUTUBE_CHANNEL}/videos`
export const SINCOPADOS_YOUTUBE_SUBSCRIBE = `${SINCOPADOS_YOUTUBE_CHANNEL}?sub_confirmation=1`

/**
 * Deja el número como `+<país><número>`. Un celular colombiano escrito sin
 * indicativo (10 dígitos que empiezan por 3) recibe el +57, que es el caso
 * normal de quien llega desde Medellín.
 */
export const normalizeWhatsapp = (raw: string) => {
  const digits = raw.replace(/\D/g, '')
  if (/^3\d{9}$/.test(digits)) return `+57${digits}`
  return `+${digits}`
}

/** Enlace directo al chat de WhatsApp con ese número. */
export const whatsappLink = (number: string) => `https://wa.me/${number.replace(/\D/g, '')}`

/** Paso 1: quién es. */
export const mediaNetworkContactSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Escribe tu nombre completo')
    .max(120, 'Máximo 120 caracteres'),
  whatsapp: z
    .string()
    .trim()
    .refine(value => /^\+[0-9]{8,15}$/.test(normalizeWhatsapp(value)), 'Escribe un número de WhatsApp válido'),
})

/** Paso 2: qué le interesa. */
export const mediaNetworkInterestsSchema = z.object({
  interests: z
    .array(z.enum(MEDIA_NETWORK_INTERESTS))
    .min(1, 'Elige al menos una opción')
    .max(MEDIA_NETWORK_INTERESTS.length),
})

/** Lo que recibe `POST /api/media-network/leads`. */
export const mediaNetworkLeadSchema = mediaNetworkContactSchema
  .extend(mediaNetworkInterestsSchema.shape)
  .extend({
    source: z.string().trim().max(120).optional(),
    // Campo trampa: invisible para personas, los bots lo rellenan.
    website: z.string().optional(),
  })

export type MediaNetworkLeadInput = z.input<typeof mediaNetworkLeadSchema>
