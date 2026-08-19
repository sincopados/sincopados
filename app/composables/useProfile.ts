import type { Database, Profile, UserRole } from '~/types/db'

/**
 * Perfil del usuario autenticado. Compartido entre componentes gracias a la
 * clave fija de `useAsyncData`, y revalidado cuando cambia la sesión.
 */
export const useProfile = () => {
  const userId = useAuthUserId()
  const client = useSupabaseClient<Database>()

  const { data: profile, refresh, status, error } = useAsyncData<Profile | null>(
    'current-profile',
    async () => {
      if (!userId.value) return null

      const { data, error: queryError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId.value)
        .maybeSingle()

      if (queryError) throw queryError
      return data
    },
    { watch: [userId] },
  )

  const role = computed<UserRole | null>(() => profile.value?.role ?? null)

  return {
    profile,
    role,
    status,
    error,
    refresh,
    isSuperuser: computed(() => role.value === 'superusuario'),
    isTutor: computed(() => role.value === 'tutor'),
    isStaff: computed(() => isStaff(role.value)),
    referralCode: computed(() => profile.value?.referral_code ?? ''),
  }
}
