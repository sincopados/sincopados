import type { Database, UserRole } from '~/types/db'

/**
 * Restringe una página a ciertos roles:
 *
 *   definePageMeta({ middleware: 'role', roles: ['superusuario', 'tutor'] })
 *
 * La comprobación real vive en la RLS de Postgres; esto sólo evita que el
 * usuario aterrice en una vista vacía.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const allowed = to.meta.roles as UserRole[] | undefined
  if (!allowed?.length) return

  const userId = useAuthUserId()
  const localePath = useLocalePath()

  if (!userId.value) {
    return navigateTo(localePath('/login'))
  }

  const id = userId.value

  // Cache por sesión: el rol sólo cambia cuando lo cambia un administrador,
  // y al recargar la página se vuelve a leer.
  const cached = useState<Record<string, UserRole | null>>('role-cache', () => ({}))

  if (!(id in cached.value)) {
    const client = useSupabaseClient<Database>()
    const { data } = await client
      .from('profiles')
      .select('role')
      .eq('id', id)
      .maybeSingle()

    cached.value[id] = data?.role ?? null
  }

  const role = cached.value[id]

  if (!role || !allowed.includes(role)) {
    return navigateTo(localePath('/dashboard'))
  }
})
