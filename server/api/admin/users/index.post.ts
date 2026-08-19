import * as z from 'zod'
import { USER_ROLES } from '#shared/utils/roles'
import { assertCanManage, requireActor } from '~~/server/utils/admin-guard'

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  full_name: z.string().min(2).max(120),
  role: z.enum(USER_ROLES),
  phone: z.string().max(40).optional(),
  referral_code: z.string().max(12).optional(),
})

export default defineEventHandler(async (event) => {
  const { admin, actorRole } = await requireActor(event)
  const body = bodySchema.parse(await readBody(event))

  assertCanManage(actorRole, body.role)

  // El rol viaja en app_metadata porque user_metadata es editable por el propio
  // usuario y no sirve para decisiones de autorización.
  const { data, error } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    app_metadata: { role: body.role },
    user_metadata: {
      full_name: body.full_name,
      referral_code: body.referral_code?.toUpperCase(),
    },
  })

  if (error || !data.user) {
    throw createError({ statusCode: 400, statusMessage: error?.message ?? 'No se pudo crear el usuario' })
  }

  // El trigger `on_auth_user_created` ya insertó el perfil; aquí sólo se
  // completan los campos que no viajan en la metadata.
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .update({ full_name: body.full_name, phone: body.phone ?? null, role: body.role })
    .eq('id', data.user.id)
    .select('*')
    .single()

  if (profileError) {
    throw createError({ statusCode: 400, statusMessage: profileError.message })
  }

  return profile
})
