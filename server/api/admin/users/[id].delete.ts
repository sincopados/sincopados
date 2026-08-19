import { assertCanManage, requireActor } from '~~/server/utils/admin-guard'

export default defineEventHandler(async (event) => {
  const { admin, actorId, actorRole } = await requireActor(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador' })
  }

  if (id === actorId) {
    throw createError({ statusCode: 403, statusMessage: 'No puede eliminar su propia cuenta' })
  }

  const { data: target, error: targetError } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', id)
    .maybeSingle()

  if (targetError || !target) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }

  assertCanManage(actorRole, target.role)

  // Borrar el auth.user arrastra el perfil por `on delete cascade`.
  const { error } = await admin.auth.admin.deleteUser(id)

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { id, deleted: true }
})
