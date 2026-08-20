import * as z from 'zod'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~~/app/types/db'

const bodySchema = z.object({
  code: z.string().min(6).max(12),
})

/** Margen para vincular el referido tras crear la cuenta. */
const CLAIM_WINDOW_MINUTES = 15

/**
 * Vincula al usuario recién registrado con el dueño del código de referido.
 *
 * Existe sólo para cerrar el hueco del alta por OAuth: con correo y contraseña
 * el vínculo lo hace el trigger `handle_new_user` a partir de `user_metadata`,
 * que `signInWithOAuth` no permite enviar.
 *
 * La escritura va con la secret key porque `guard_profile_changes` impide que
 * nadie cambie su propio `referred_by`. Por eso las reglas de abajo son la única
 * barrera, y son deliberadamente estrictas.
 */
export default defineEventHandler(async (event) => {
  const claims = await serverSupabaseUser(event)

  if (!claims?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  const { code } = bodySchema.parse(await readBody(event))
  const normalized = code.trim().toUpperCase()

  const admin = serverSupabaseServiceRole<Database>(event)

  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, referred_by, referral_code, created_at')
    .eq('id', claims.sub)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (!profile) {
    throw createError({ statusCode: 404, statusMessage: 'Perfil no encontrado' })
  }

  // Un referente ya asignado no se reemplaza: si no, cualquiera podría
  // reasignarse el suyo más tarde y desviar las comisiones de otro afiliado.
  if (profile.referred_by) {
    return { applied: false, reason: 'ya_tiene_referente' as const }
  }

  if (profile.referral_code === normalized) {
    return { applied: false, reason: 'auto_referido' as const }
  }

  // Sólo durante el alta. Sin esta ventana el endpoint permitiría a una cuenta
  // antigua atribuirse un referente en cualquier momento.
  const ageMinutes = (Date.now() - new Date(profile.created_at).getTime()) / 60000

  if (ageMinutes > CLAIM_WINDOW_MINUTES) {
    return { applied: false, reason: 'fuera_de_plazo' as const }
  }

  const { data: referrer } = await admin
    .from('profiles')
    .select('id')
    .eq('referral_code', normalized)
    .maybeSingle()

  if (!referrer) {
    return { applied: false, reason: 'codigo_no_encontrado' as const }
  }

  const { error: updateError } = await admin
    .from('profiles')
    .update({ referred_by: referrer.id })
    .eq('id', profile.id)
    .is('referred_by', null)

  if (updateError) {
    throw createError({ statusCode: 400, statusMessage: updateError.message })
  }

  return { applied: true as const }
})
