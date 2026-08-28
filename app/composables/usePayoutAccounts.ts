import type { Database, PayoutAccount, PayoutMethod } from '~/types/db'

export interface NewPayoutAccount {
  method: PayoutMethod
  provider: string
  account_number: string
  holder_name: string
  label: string
  is_default: boolean
}

/**
 * Cuentas de retiro guardadas del usuario autenticado.
 *
 * La RLS las limita a las propias, y el trigger `single_default_account` se
 * encarga de que sólo una quede marcada por defecto.
 */
export const usePayoutAccounts = () => {
  const client = useSupabaseClient<Database>()
  const userId = useAuthUserId()
  const toast = useToast()

  const saving = ref(false)
  const removing = ref<string | null>(null)

  const { data: accounts, status, refresh } = useAsyncData<PayoutAccount[]>(
    'payout-accounts',
    async () => {
      if (!userId.value) return []

      const { data, error } = await client
        .from('payout_accounts')
        .select('*')
        .eq('profile_id', userId.value)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    { watch: [userId] },
  )

  const defaultAccount = computed(
    () => (accounts.value ?? []).find(a => a.is_default) ?? accounts.value?.[0] ?? null,
  )

  const add = async (account: NewPayoutAccount) => {
    if (!userId.value) return false

    saving.value = true

    // Efectivo no lleva entidad ni número, y una transferencia sin ellos la
    // rechaza el CHECK de la base: se limpian antes de enviar.
    const isTransfer = account.method === 'transferencia'
    const needsNumber = account.method !== 'efectivo'

    const { error } = await client.from('payout_accounts').insert({
      profile_id: userId.value,
      method: account.method,
      provider: isTransfer ? account.provider.trim() || null : null,
      account_number: needsNumber ? account.account_number.trim() || null : null,
      holder_name: account.holder_name.trim() || null,
      label: account.label.trim() || null,
      is_default: account.is_default,
    })

    saving.value = false

    if (error) {
      toast.add({
        title: 'No se pudo guardar la cuenta',
        description: error.message.includes('payout_accounts_transfer_complete')
          ? 'Una transferencia necesita entidad y número de cuenta.'
          : error.message,
        color: 'error',
      })
      return false
    }

    toast.add({ title: 'Cuenta guardada', color: 'success' })
    await refresh()
    return true
  }

  const makeDefault = async (account: PayoutAccount) => {
    const { error } = await client
      .from('payout_accounts')
      .update({ is_default: true })
      .eq('id', account.id)

    if (error) {
      toast.add({ title: 'No se pudo marcar por defecto', description: error.message, color: 'error' })
      return
    }

    await refresh()
  }

  const remove = async (account: PayoutAccount) => {
    removing.value = account.id

    const { error } = await client.from('payout_accounts').delete().eq('id', account.id)

    removing.value = null

    if (error) {
      toast.add({ title: 'No se pudo eliminar la cuenta', description: error.message, color: 'error' })
      return
    }

    // Los retiros ya solicitados conservan copiados los datos de pago, así que
    // borrar la cuenta no deja huecos en el histórico.
    toast.add({ title: 'Cuenta eliminada', color: 'success' })
    await refresh()
  }

  return { accounts, status, refresh, add, makeDefault, remove, saving, removing, defaultAccount }
}
