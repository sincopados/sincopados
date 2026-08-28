import type { Database, ReferralBalance, WithdrawalRequest } from '~/types/db'

export type WithdrawalTicket = WithdrawalRequest & {
  referrer: { full_name: string | null, email: string } | null
  resolver: { full_name: string | null, email: string } | null
}

/**
 * Saldo de comisiones y solicitudes de retiro del usuario autenticado.
 *
 * El saldo lo calcula la vista `referral_balance` a partir del estado de cada
 * comisión, y ese estado lo mantienen los triggers de la base de datos: una
 * comisión sólo pasa a disponible cuando su servicio está pagado y con la
 * trazabilidad completa. Aquí no se decide nada, sólo se lee.
 */
export const useMyWithdrawals = () => {
  const client = useSupabaseClient<Database>()
  const userId = useAuthUserId()
  const toast = useToast()

  const requesting = ref(false)

  const { data: balance, refresh: refreshBalance } = useAsyncData<ReferralBalance | null>(
    'referral-balance',
    async () => {
      if (!userId.value) return null

      const { data, error } = await client
        .from('referral_balance')
        .select('*')
        .eq('profile_id', userId.value)
        .maybeSingle()

      if (error) throw error
      return data
    },
    { watch: [userId] },
  )

  const { data: requests, status, refresh: refreshRequests } = useAsyncData<WithdrawalRequest[]>(
    'my-withdrawals',
    async () => {
      if (!userId.value) return []

      const { data, error } = await client
        .from('withdrawal_requests')
        .select('*')
        .eq('referrer_id', userId.value)
        .order('requested_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    { watch: [userId] },
  )

  const available = computed(() => Number(balance.value?.available_amount ?? 0))
  const locked = computed(() => Number(balance.value?.locked_amount ?? 0))
  const requested = computed(() => Number(balance.value?.requested_amount ?? 0))
  const withdrawn = computed(() => Number(balance.value?.withdrawn_amount ?? 0))

  /** Solicitudes abiertas. Con retiros parciales puede haber varias. */
  const openRequests = computed(
    () => (requests.value ?? []).filter(r => r.status === 'en_proceso'),
  )

  const canRequest = computed(() => available.value >= MIN_WITHDRAWAL_AMOUNT)

  const refresh = async () => {
    await Promise.all([refreshBalance(), refreshRequests()])
  }

  const request = async (amount: number, accountId: string, notes: string) => {
    requesting.value = true

    // La base vuelve a validar el mínimo, el saldo y que la cuenta sea del
    // solicitante: lo que se manda desde aquí es una intención, no una verdad.
    const { error } = await client.rpc('request_commission_withdrawal', {
      p_amount: amount,
      p_account_id: accountId,
      p_notes: notes || undefined,
    })

    requesting.value = false

    if (error) {
      toast.add({ title: 'No se pudo solicitar el retiro', description: error.message, color: 'error' })
      return false
    }

    toast.add({
      title: 'Solicitud enviada',
      description: `Te responderemos en un plazo de ${DEFAULT_WITHDRAWAL_ETA_HOURS} horas.`,
      color: 'success',
    })
    await refresh()
    return true
  }

  return {
    balance, requests, status, refresh, request, requesting,
    available, locked, requested, withdrawn, openRequests, canRequest,
  }
}

/** Bandeja de tickets del superusuario. */
export const useWithdrawalTickets = () => {
  const client = useSupabaseClient<Database>()
  const toast = useToast()

  const saving = ref<string | null>(null)

  const { data: tickets, status, refresh } = useAsyncData<WithdrawalTicket[]>(
    'withdrawal-tickets',
    async () => {
      const { data, error } = await client
        .from('withdrawal_requests')
        .select(`
          *,
          referrer:profiles!withdrawal_requests_referrer_id_fkey(full_name, email),
          resolver:profiles!withdrawal_requests_resolved_by_fkey(full_name, email)
        `)
        .order('requested_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as unknown as WithdrawalTicket[]
    },
  )

  const pending = computed(() => (tickets.value ?? []).filter(t => t.status === 'en_proceso'))

  /**
   * Actualiza un ticket. El estado de las comisiones no se toca: lo retirado se
   * cuenta desde este libro de tickets, así que procesar descuenta del saldo y
   * cancelar lo devuelve, sin tener que partir ninguna comisión.
   */
  const update = async (
    ticket: WithdrawalTicket,
    patch: Partial<Pick<WithdrawalRequest, 'status' | 'eta_hours' | 'admin_notes'>>,
  ) => {
    saving.value = ticket.id

    const { error } = await client
      .from('withdrawal_requests')
      .update(patch)
      .eq('id', ticket.id)

    saving.value = null

    if (error) {
      toast.add({
        title: 'No se pudo actualizar la solicitud',
        description: error.code === '42501'
          ? 'Sólo el superusuario puede resolver solicitudes de retiro.'
          : error.message,
        color: 'error',
      })
      return
    }

    toast.add({ title: 'Solicitud actualizada', color: 'success' })
    await refresh()
  }

  return { tickets, pending, status, refresh, update, saving }
}
