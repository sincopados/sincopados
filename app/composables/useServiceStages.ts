import type { Database, ClientServiceStage, ServiceStage } from '~/types/db'

/** Etapa con el perfil de quien la firmó, tal como llega de la consulta. */
export type TrackedStage = ClientServiceStage & {
  completed_profile: { full_name: string | null, email: string } | null
}

/**
 * Trazabilidad de un servicio contratado.
 *
 * Las filas las siembra el trigger `seed_client_service_stages` al contratar,
 * así que aquí sólo se leen y se marcan. La marca de tiempo y el autor los pone
 * Postgres en `stamp_stage_completion`: mandar `completed_at` es sólo la forma
 * de expresar la intención.
 */
export const useServiceStages = (clientServiceId: MaybeRefOrGetter<string>) => {
  const client = useSupabaseClient<Database>()
  const toast = useToast()

  const id = computed(() => toValue(clientServiceId))
  const saving = ref<ServiceStage | null>(null)

  const { data: stages, status, refresh } = useAsyncData<TrackedStage[]>(
    () => `service-stages-${id.value}`,
    async () => {
      if (!id.value) return []

      const { data, error } = await client
        .from('client_service_stages')
        .select('*, completed_profile:profiles(full_name, email)')
        .eq('client_service_id', id.value)
        .order('position')

      if (error) throw error
      return (data ?? []) as unknown as TrackedStage[]
    },
    { watch: [id] },
  )

  const total = computed(() => stages.value?.length ?? 0)
  const completed = computed(() => (stages.value ?? []).filter(s => s.completed_at).length)

  /** Porcentaje de avance, para la barra de progreso. */
  const progress = computed(() => (total.value ? Math.round((completed.value / total.value) * 100) : 0))

  /**
   * Etapa en curso: la primera sin cumplir. Se calcula así, y no como «la
   * siguiente a la última cumplida», para que marcar una etapa fuera de orden
   * no dé por hechas las anteriores.
   */
  const current = computed<TrackedStage | null>(
    () => (stages.value ?? []).find(s => !s.completed_at) ?? null,
  )

  const isFinished = computed(() => total.value > 0 && completed.value === total.value)

  const toggle = async (stage: TrackedStage) => {
    saving.value = stage.stage
    const markDone = !stage.completed_at

    const { error } = await client
      .from('client_service_stages')
      // El valor enviado da igual mientras no sea nulo: el trigger lo reemplaza
      // por `now()`. Se manda la hora local sólo para que el payload sea legible.
      .update({ completed_at: markDone ? new Date().toISOString() : null })
      .eq('id', stage.id)

    saving.value = null

    if (error) {
      toast.add({
        title: 'No se pudo actualizar la etapa',
        description: error.code === '42501'
          ? 'Sólo el superusuario y el responsable del servicio pueden marcar etapas.'
          : error.message,
        color: 'error',
      })
      return
    }

    toast.add({
      title: markDone
        ? `${SERVICE_STAGE_LABELS[stage.stage]} marcada como cumplida`
        : `${SERVICE_STAGE_LABELS[stage.stage]} reabierta`,
      color: 'success',
    })

    await refresh()
  }

  return { stages, status, refresh, toggle, saving, progress, completed, total, current, isFinished }
}
