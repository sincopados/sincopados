import { serverSupabaseServiceRole } from '#supabase/server'
import { mediaNetworkLeadSchema, normalizeWhatsapp } from '#shared/utils/media-network'
import type { Database } from '~~/app/types/db'

/** Una misma persona reenviando el formulario no debe duplicar la fila. */
const DUPLICATE_WINDOW_MINUTES = 10

/**
 * Postulación pública a la convocatoria de Sincopados Media Network.
 *
 * Es anónima, así que escribe con la secret key: la tabla no tiene política de
 * inserción para `anon`, y este handler es la única puerta de entrada. Por eso
 * valida todo lo que llega en vez de confiar en el formulario.
 */
export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, body => mediaNetworkLeadSchema.safeParse(body))

  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Datos inválidos',
      data: result.error.flatten().fieldErrors,
    })
  }

  const { full_name, whatsapp, interests, source, website } = result.data

  // Bot: se responde como si todo hubiera ido bien para no darle pistas.
  if (website) {
    return { ok: true as const }
  }

  const admin = serverSupabaseServiceRole<Database>(event)
  const number = normalizeWhatsapp(whatsapp)

  const since = new Date(Date.now() - DUPLICATE_WINDOW_MINUTES * 60_000).toISOString()
  const { data: recent } = await admin
    .from('media_network_leads')
    .select('id')
    .eq('whatsapp', number)
    .gte('created_at', since)
    .limit(1)
    .maybeSingle()

  if (recent) {
    return { ok: true as const }
  }

  const { error } = await admin.from('media_network_leads').insert({
    full_name,
    whatsapp: number,
    interests: [...new Set(interests)],
    source: source || null,
  })

  if (error) {
    console.error('[media-network] insert failed', error)
    throw createError({ statusCode: 500, statusMessage: 'No se pudo registrar la postulación' })
  }

  setResponseStatus(event, 201)
  return { ok: true as const }
})
