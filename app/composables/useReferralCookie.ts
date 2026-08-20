/**
 * Código de referido pendiente de aplicar, guardado en cookie.
 *
 * En el alta con correo y contraseña el código viaja en `user_metadata` y lo
 * resuelve el trigger `handle_new_user`. Con OAuth eso no es posible:
 * `signInWithOAuth` no admite metadatos propios, los aporta el proveedor. La
 * cookie es lo único que sobrevive al viaje de ida y vuelta hasta Google.
 *
 * `sameSite: 'lax'` es imprescindible: con `strict` el navegador no la enviaría
 * al volver desde el dominio de Google.
 */
export const useReferralCookie = () => useCookie<string | null>('sincopados-ref', {
  maxAge: 60 * 30,
  sameSite: 'lax',
  secure: !import.meta.dev,
  path: '/',
})
