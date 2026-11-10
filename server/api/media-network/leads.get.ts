import { requireActor } from '~~/server/utils/admin-guard'

/**
 * Postulaciones a Sincopados Media Network, de la más reciente a la más
 * antigua. Sólo para el superusuario.
 *
 * La RLS de la tabla aplica la misma regla; aquí se repite porque la lectura va
 * con la secret key, que se salta la RLS.
 */
export default defineEventHandler(async (event) => {
  const { admin, actorRole } = await requireActor(event)

  if (actorRole !== 'superusuario') {
    throw createError({ statusCode: 403, statusMessage: 'Sólo el superusuario puede ver las postulaciones' })
  }

  const { data, error } = await admin
    .from('media_network_leads')
    .select('id, full_name, whatsapp, interests, source, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data ?? []
})
