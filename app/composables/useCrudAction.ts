type DbError = { code?: string, message: string }

/**
 * Ejecuta escrituras de Supabase con el mismo trato para todo el CRUD del
 * dashboard: estado `saving`, toast de éxito o error con un mensaje legible
 * para los códigos de Postgres más comunes, y recarga de los datos al acabar.
 */
export const useCrudAction = (options: {
  /** Recarga tras una escritura correcta. */
  refresh: () => Promise<unknown>
  /** Texto para un slug repetido (código 23505). */
  duplicate: string
  /** Texto para falta de permisos (código 42501). */
  forbidden: string
}) => {
  const toast = useToast()
  const saving = ref(false)

  const describe = (err: DbError) =>
    err.code === '23505'
      ? options.duplicate
      : err.code === '42501'
        ? options.forbidden
        : err.message

  const run = async (
    action: () => PromiseLike<{ error: DbError | null }>,
    messages: { ok: string, fail: string },
  ) => {
    saving.value = true
    try {
      const { error } = await action()
      if (error) {
        toast.add({ title: messages.fail, description: describe(error), color: 'error' })
        return false
      }
      toast.add({ title: messages.ok, color: 'success' })
      await options.refresh()
      return true
    }
    finally {
      saving.value = false
    }
  }

  return { saving, run }
}
