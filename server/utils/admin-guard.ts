import type { H3Event } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { canManageRole } from '#shared/utils/roles'
import type { UserRole } from '#shared/utils/roles'
import type { Database } from '~~/app/types/db'

/**
 * Comprueba que quien llama esté autenticado y devuelve su rol, leído con la
 * secret key para que la RLS no pueda ocultarlo.
 *
 * Estas rutas existen porque crear o borrar un usuario de `auth.users` requiere
 * la Admin API, que nunca debe exponerse al navegador.
 */
export const requireActor = async (event: H3Event) => {
  // `serverSupabaseUser` devuelve el payload del JWT, no un objeto `User`:
  // el identificador está en `sub`.
  const claims = await serverSupabaseUser(event)

  if (!claims?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  const admin = serverSupabaseServiceRole<Database>(event)
  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', claims.sub)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (!profile) {
    throw createError({ statusCode: 403, statusMessage: 'Perfil no encontrado' })
  }

  return { admin, actorId: profile.id, actorRole: profile.role as UserRole }
}

/** Lanza 403 si el actor no puede administrar un perfil con ese rol. */
export const assertCanManage = (actorRole: UserRole, targetRole: UserRole) => {
  if (!canManageRole(actorRole, targetRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Un ${actorRole} no puede administrar usuarios con rol ${targetRole}`,
    })
  }
}
