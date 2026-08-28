import * as z from 'zod'
import type { Service, SocialNetwork } from '~/types/db'

/**
 * Formulario del catálogo de servicios, compartido entre el alta y la edición.
 *
 * El slug no entra en el esquema: se deriva del nombre en ambos casos, así que
 * nadie lo escribe a mano. La comisión se maneja en porcentaje (0-100) porque
 * es como se lee; la base de datos la guarda como fracción (0-1).
 */
export const serviceSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  description: z.string().max(500).optional().or(z.literal('')),
  price: z.number().min(0),
  commission_rate: z.number().min(0).max(100),
  video_count: z.number().int().min(0).max(999),
  image_count: z.number().int().min(0).max(999),
  carousel_count: z.number().int().min(0).max(999),
  shooting_hours: z.number().min(0).max(9999),
  manages_social: z.boolean(),
  social_networks: z.array(z.enum(SOCIAL_NETWORKS)),
})

export type ServiceSchema = z.output<typeof serviceSchema>

export const emptyServiceForm = (): ServiceSchema => ({
  name: '',
  description: '',
  price: 0,
  commission_rate: 10,
  video_count: 0,
  image_count: 0,
  carousel_count: 0,
  shooting_hours: 0,
  manages_social: false,
  social_networks: [] as SocialNetwork[],
})

/** Vuelca un servicio del catálogo en el estado del formulario. */
export const serviceToForm = (service: Service): ServiceSchema => ({
  name: service.name,
  description: service.description ?? '',
  price: Number(service.price),
  // De fracción a porcentaje: la base guarda 0.1, el formulario muestra 10.
  commission_rate: Number(service.commission_rate) * 100,
  video_count: service.video_count,
  image_count: service.image_count,
  carousel_count: service.carousel_count,
  shooting_hours: Number(service.shooting_hours),
  manages_social: service.manages_social,
  social_networks: [...service.social_networks],
})

/** Traduce el estado del formulario a las columnas de `services`. */
export const formToService = (data: ServiceSchema) => ({
  name: data.name,
  slug: slugify(data.name),
  description: data.description || null,
  price: data.price,
  commission_rate: data.commission_rate / 100,
  video_count: data.video_count,
  image_count: data.image_count,
  carousel_count: data.carousel_count,
  shooting_hours: data.shooting_hours,
  manages_social: data.manages_social,
  // Sin manejo de redes no puede haber redes: la base lo rechaza con un CHECK,
  // así que conviene no llegar a enviarlo.
  social_networks: data.manages_social ? data.social_networks : [],
})
