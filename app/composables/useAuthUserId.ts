/**
 * Identificador del usuario autenticado.
 *
 * `useSupabaseUser()` de @nuxtjs/supabase v2 expone el *payload del JWT*
 * (`auth.getClaims()`), no un objeto `User`: el id viaja en `sub`, y `id` no
 * existe. Centralizarlo aquí evita repetir esa trampa en cada consulta.
 */
export const useAuthUserId = () => {
  const user = useSupabaseUser()

  return computed<string | null>(() => user.value?.sub ?? null)
}
