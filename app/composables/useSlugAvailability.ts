import type { FormError } from '@nuxt/ui'
import type { Database } from '~/types/db'

/** Tablas cuyo `slug` es único en la base de datos. */
export type SluggedTable = 'courses' | 'course_modules' | 'course_classes'

/**
 * Comprueba antes de guardar que un slug no esté ya en uso.
 *
 * Es una ayuda para el formulario: la última palabra la tiene el índice único
 * de Postgres, que rechaza el duplicado aunque dos personas guarden a la vez.
 * Las respuestas se memorizan por slug para que validar en cada tecla no
 * repita la misma consulta.
 */
export const useSlugAvailability = (table: SluggedTable, excludeId?: MaybeRefOrGetter<string | null | undefined>) => {
  const client = useSupabaseClient<Database>()
  const cache = new Map<string, boolean>()

  const isTaken = async (slug: string) => {
    const exclude = toValue(excludeId) ?? ''
    const key = `${exclude}:${slug}`
    const hit = cache.get(key)
    if (hit !== undefined) return hit

    let query = client.from(table).select('id', { count: 'exact', head: true }).eq('slug', slug)
    if (exclude) query = query.neq('id', exclude)
    const { count, error } = await query
    // Si la consulta falla no se bloquea el formulario: lo frena la base de datos.
    if (error) return false

    const taken = (count ?? 0) > 0
    cache.set(key, taken)
    return taken
  }

  /** Validador para `UForm :validate`: marca el campo `slug` si ya existe. */
  const validateSlug = async (state: { slug?: string }): Promise<FormError[]> => {
    const slug = state.slug?.trim()
    if (!slug || slug.length < 2) return []
    return (await isTaken(slug))
      ? [{ name: 'slug', message: 'Este slug ya está en uso. Elige otro.' }]
      : []
  }

  /** Para refrescar tras guardar: el slug recién creado ya no está libre. */
  const reset = () => cache.clear()

  return { isTaken, validateSlug, reset }
}
