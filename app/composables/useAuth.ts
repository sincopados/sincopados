import type { Database } from '~/types/db'

export const useAuth = () => {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const localePath = useLocalePath()
  const toast = useToast()

  const signOut = async () => {
    const { error } = await client.auth.signOut()

    if (error) {
      toast.add({ title: 'No se pudo cerrar sesión', description: error.message, color: 'error' })
      return
    }

    await navigateTo(localePath('/login'))
  }

  return { user, signOut }
}
