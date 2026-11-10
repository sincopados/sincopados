import type { MediaNetworkLead } from '~/types/db'

export type MediaNetworkStep = 'contacto' | 'intereses' | 'gracias'

/**
 * Estado del formulario de dos pasos de la landing. Cada paso valida con su
 * propio esquema de `shared/utils/media-network.ts`, el mismo que vuelve a
 * aplicar el servidor.
 */
export const useMediaNetworkForm = () => {
  const route = useRoute()
  const toast = useToast()

  const step = ref<MediaNetworkStep>('contacto')
  const submitting = ref(false)

  const state = reactive({
    full_name: '',
    whatsapp: '',
    interests: [] as MediaNetworkInterest[],
    website: '',
  })

  /** Canal que trajo la visita: `?utm_source=` o `?src=`. */
  const source = computed(() => {
    const value = route.query.utm_source ?? route.query.src
    return typeof value === 'string' ? value.slice(0, 120) : undefined
  })

  const goToInterests = () => {
    step.value = 'intereses'
  }

  const back = () => {
    step.value = 'contacto'
  }

  const submit = async () => {
    submitting.value = true

    try {
      await $fetch('/api/media-network/leads', {
        method: 'POST',
        body: { ...state, source: source.value },
      })
      step.value = 'gracias'
    }
    catch (error) {
      const message = (error as { data?: { statusMessage?: string } }).data?.statusMessage
      toast.add({
        title: 'No pudimos enviar tu postulación',
        description: message ?? 'Inténtalo de nuevo en unos segundos.',
        color: 'error',
      })
    }
    finally {
      submitting.value = false
    }
  }

  const reset = () => {
    Object.assign(state, { full_name: '', whatsapp: '', interests: [], website: '' })
    step.value = 'contacto'
  }

  return { step, state, submitting, goToInterests, back, submit, reset }
}

/** Bandeja de postulaciones del superusuario. */
export const useMediaNetworkLeads = () => {
  const interest = ref<MediaNetworkInterest | 'todos'>('todos')
  const search = ref('')

  const { data: leads, status, error, refresh } = useFetch<MediaNetworkLead[]>(
    '/api/media-network/leads',
    { key: 'media-network-leads', default: () => [] },
  )

  const filtered = computed(() => {
    const term = search.value.trim().toLowerCase()

    return leads.value.filter((lead) => {
      if (interest.value !== 'todos' && !lead.interests.includes(interest.value)) return false
      if (!term) return true
      return lead.full_name.toLowerCase().includes(term) || lead.whatsapp.includes(term)
    })
  })

  /** Cuántas postulaciones marcó cada vertiente (una persona puede marcar varias). */
  const countByInterest = computed(() => {
    const counts = Object.fromEntries(MEDIA_NETWORK_INTERESTS.map(key => [key, 0])) as Record<MediaNetworkInterest, number>
    for (const lead of leads.value) {
      for (const key of lead.interests) counts[key]++
    }
    return counts
  })

  return { leads, filtered, status, error, refresh, interest, search, countByInterest }
}
