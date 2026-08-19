// `shared/` no puede importar de `app/`, así que la unión se declara aquí y
// `app/types/database.types.ts` la refleja para el cliente de Supabase.
export type UserRole = 'superusuario' | 'tutor' | 'cliente' | 'alumno' | 'afiliado'

export const USER_ROLES = [
  'superusuario',
  'tutor',
  'cliente',
  'alumno',
  'afiliado',
] as const satisfies readonly UserRole[]

export const ROLE_LABELS: Record<UserRole, string> = {
  superusuario: 'Superusuario',
  tutor: 'Tutor',
  cliente: 'Cliente',
  alumno: 'Alumno',
  afiliado: 'Afiliado',
}

export const ROLE_COLORS: Record<UserRole, 'primary' | 'secondary' | 'success' | 'warning' | 'neutral'> = {
  superusuario: 'primary',
  tutor: 'secondary',
  cliente: 'success',
  alumno: 'warning',
  afiliado: 'neutral',
}

/** Roles que un tutor puede crear, editar y eliminar. */
export const TUTOR_MANAGED_ROLES: readonly UserRole[] = ['cliente', 'alumno', 'afiliado']

/** Espejo en TypeScript de `private.can_manage_role()`. La base de datos sigue
 *  siendo la fuente de verdad: esto sólo evita mostrar acciones imposibles. */
export const canManageRole = (actor: UserRole | null | undefined, target: UserRole): boolean => {
  if (actor === 'superusuario') return true
  if (actor === 'tutor') return TUTOR_MANAGED_ROLES.includes(target)
  return false
}

export const manageableRoles = (actor: UserRole | null | undefined): UserRole[] => {
  if (actor === 'superusuario') return [...USER_ROLES]
  if (actor === 'tutor') return [...TUTOR_MANAGED_ROLES]
  return []
}

export const isStaff = (role: UserRole | null | undefined): boolean =>
  role === 'superusuario' || role === 'tutor'
