import type { Database, ClientServicePayment } from '~/types/db'

/** Pago con el perfil de quien lo registró, tal como llega de la consulta. */
export type RecordedPayment = ClientServicePayment & {
  recorded_profile: { full_name: string | null, email: string } | null
}

export interface NewPayment {
  amount: number
  paid_at: string
  method: string
  notes: string
}

/**
 * Libro de pagos de un servicio contratado.
 *
 * Un servicio puede cobrarse en uno o varios pagos según la negociación, así
 * que el saldo se calcula sumando y no se guarda: un total almacenado se
 * desincroniza en cuanto alguien corrige un importe.
 *
 * `recorded_by` lo escribe el trigger `stamp_payment_author`, no esta consulta.
 */
export const useServicePayments = (
  clientServiceId: MaybeRefOrGetter<string>,
  contractedAmount: MaybeRefOrGetter<number>,
) => {
  const client = useSupabaseClient<Database>()
  const toast = useToast()

  const id = computed(() => toValue(clientServiceId))
  const saving = ref(false)
  const removing = ref<string | null>(null)

  const { data: payments, status, refresh } = useAsyncData<RecordedPayment[]>(
    () => `service-payments-${id.value}`,
    async () => {
      if (!id.value) return []

      const { data, error } = await client
        .from('client_service_payments')
        .select('*, recorded_profile:profiles(full_name, email)')
        .eq('client_service_id', id.value)
        .order('paid_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as unknown as RecordedPayment[]
    },
    { watch: [id] },
  )

  const paid = computed(() =>
    (payments.value ?? []).reduce((total, payment) => total + Number(payment.amount), 0),
  )

  const total = computed(() => Number(toValue(contractedAmount)) || 0)

  /** Puede quedar negativo si se cobró de más: conviene que se vea, no ocultarlo. */
  const balance = computed(() => total.value - paid.value)

  const progress = computed(() =>
    total.value > 0 ? Math.min(100, Math.round((paid.value / total.value) * 100)) : 0,
  )

  const isSettled = computed(() => total.value > 0 && paid.value >= total.value)

  const add = async (payment: NewPayment) => {
    saving.value = true

    const { error } = await client.from('client_service_payments').insert({
      client_service_id: id.value,
      amount: payment.amount,
      paid_at: new Date(payment.paid_at).toISOString(),
      method: payment.method || null,
      notes: payment.notes || null,
    })

    saving.value = false

    if (error) {
      toast.add({
        title: 'No se pudo registrar el pago',
        description: error.code === '42501'
          ? 'Sólo el superusuario puede registrar pagos.'
          : error.message,
        color: 'error',
      })
      return false
    }

    toast.add({ title: 'Pago registrado', color: 'success' })
    await refresh()
    return true
  }

  const remove = async (payment: RecordedPayment) => {
    removing.value = payment.id

    const { error } = await client
      .from('client_service_payments')
      .delete()
      .eq('id', payment.id)

    removing.value = null

    if (error) {
      toast.add({ title: 'No se pudo eliminar el pago', description: error.message, color: 'error' })
      return
    }

    toast.add({ title: 'Pago eliminado', color: 'success' })
    await refresh()
  }

  return { payments, status, refresh, add, remove, saving, removing, paid, total, balance, progress, isSettled }
}
