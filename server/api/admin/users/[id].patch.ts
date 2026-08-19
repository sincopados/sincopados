import * as z from 'zod'
import { USER_ROLES } from '#shared/utils/roles'
import { assertCanManage, requireActor } from '~~/server/utils/admin-guard'

const bodySchema = z.object({
  email: z.email().optional(),
  password: z.string().min(8).optional(),
  full_name: z.string().min(2).max(120).optional(),
  phone: z.string().max(40).nullable().optional(),
  role: z.enum(USER_ROLES).optional(),
  is_active: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const { admin, actorId, actorRole } = await requireActor(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador' })
  }

  const body = bodySchema.parse(await readBody(event))

  const { data: target, error: targetError } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', id)
    .maybeSingle()

  if (targetError || !target) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }

  assertCanManage(actorRole, target.role)

  if (body.role && body.role !== target.role) {
    assertCanManage(actorRole, body.role)

    if (id === actorId) {
      throw createError({ statusCode: 403, statusMessage: 'No puede cambiar su propio rol' })
    }
  }

  if (body.email || body.password || body.role) {
    const { error } = await admin.auth.admin.updateUserById(id, {
      ...(body.email ? { email: body.email, email_confirm: true } : {}),
      ...(body.password ? { password: body.password } : {}),
      ...(body.role ? { app_metadata: { role: body.role } } : {}),
    })

    if (error) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
  }

  const patch = {
    ...(body.email ? { email: body.email } : {}),
    ...(body.full_name ? { full_name: body.full_name } : {}),
    ...(body.phone !== undefined ? { phone: body.phone } : {}),
    ...(body.role ? { role: body.role } : {}),
    ...(body.is_active !== undefined ? { is_active: body.is_active } : {}),
  }

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()

  if (profileError) {
    throw createError({ statusCode: 400, statusMessage: profileError.message })
  }

  return profile
})
