# Configurar el login con Google (Supabase OAuth)

Guía específica de este proyecto. El código de la aplicación ya está listo; lo
que falta es la configuración en Google Cloud y en Supabase.

## Datos que vas a necesitar

| Dato | Valor |
|---|---|
| Project ref de Supabase | `srhtxbpfnaradsspejul` |
| **URL de callback de OAuth** | `https://srhtxbpfnaradsspejul.supabase.co/auth/v1/callback` |
| Ruta de retorno en la app | `/confirm` (más sus variantes por idioma) |

> El error más común de toda esta configuración es registrar en Google la URL de
> tu aplicación en lugar de la de Supabase. Google debe redirigir **a Supabase**,
> y es Supabase quien luego redirige a tu app.

---

## Paso 1 — Crear las credenciales en Google Cloud

1. Entra en [Google Cloud Console](https://console.cloud.google.com/) y crea un
   proyecto (o selecciona uno existente).
2. Ve a **APIs y servicios → Pantalla de consentimiento de OAuth**.
3. Elige tipo **External** y rellena: nombre de la aplicación, correo de soporte
   y correo de contacto del desarrollador.
4. En **Scopes**, los tres por defecto bastan: `userinfo.email`,
   `userinfo.profile` y `openid`. No pidas más de lo necesario: cualquier scope
   sensible dispara una revisión manual de Google que tarda semanas.
5. Ve a **APIs y servicios → Credenciales → Crear credenciales → ID de cliente
   de OAuth**.
6. Tipo de aplicación: **Aplicación web**.
7. En **URI de redireccionamiento autorizados**, añade exactamente:

   ```
   https://srhtxbpfnaradsspejul.supabase.co/auth/v1/callback
   ```

8. Crea y copia el **Client ID** y el **Client Secret**.

### Publicar la aplicación

Mientras la pantalla de consentimiento esté en **Testing**, sólo podrán entrar
las cuentas que añadas en **Usuarios de prueba** (máximo 100). Cualquier otra
recibe `access_blocked`.

Para abrirlo a todo el mundo pulsa **Publicar aplicación**. Con sólo los scopes
básicos la verificación de Google no es necesaria y el cambio es inmediato.

---

## Paso 2 — Habilitar el proveedor en Supabase

1. Abre **Authentication → Sign In / Providers → Google**.
2. Activa el proveedor.
3. Pega el **Client ID** y el **Client Secret** del paso anterior.
4. Guarda.

Ahí mismo verás el campo **Callback URL (for OAuth)**: comprueba que coincide
carácter a carácter con lo que registraste en Google.

---

## Paso 3 — Autorizar las URLs de retorno

Este es el paso que más se olvida. Si `redirectTo` no está en la lista, Supabase
**ignora la petición en silencio** y manda al usuario al Site URL: aterriza en la
portada y parece que el login "no hizo nada".

En **Authentication → URL Configuration**:

**Site URL** — la URL de producción:

```
https://<tu-sitio>.netlify.app
```

**Redirect URLs** — añade una entrada por entorno:

```
http://localhost:3000/**
https://<tu-sitio>.netlify.app/**
https://<tu-dominio-propio>/**
```

### Por qué el comodín importa aquí

Este proyecto usa `@nuxtjs/i18n` con cuatro idiomas (`es` por defecto, más `en`,
`nl`, `fr`) y la estrategia `prefix_except_default`. `localePath('/confirm')`
genera una ruta distinta según el idioma activo:

```
/confirm      /en/confirm      /nl/confirm      /fr/confirm
```

El comodín `/**` cubre las cuatro. Si prefieres listarlas explícitamente, son
cuatro entradas **por cada entorno** — y olvidar una significa que el login falla
sólo en ese idioma, que es un fallo incómodo de diagnosticar.

---

## Paso 4 — Probar

```bash
pnpm dev
```

Abre `http://localhost:3000/login` y pulsa **Google**. El recorrido correcto es:

1. `localhost:3000/login` → pantalla de Google
2. Google → `srhtxbpfnaradsspejul.supabase.co/auth/v1/callback`
3. Supabase → `localhost:3000/confirm?code=…`
4. `/confirm` intercambia el código y te lleva a `/dashboard`

Después, comprueba en la base de datos que el perfil se creó bien:

```sql
select email, role, full_name, avatar_url, referral_code, referred_by
from public.profiles
order by created_at desc
limit 1;
```

Debe salir con `role = 'cliente'`, el nombre y el avatar de Google rellenos, y un
código de referido generado.

---

## Los errores que más frecuentemente rompen esto

| Síntoma | Causa | Solución |
|---|---|---|
| `redirect_uri_mismatch` | En Google registraste la URL de tu app | Debe ser `https://<ref>.supabase.co/auth/v1/callback` |
| Vuelves a la portada sin sesión | `redirectTo` no está en Redirect URLs | Añade el comodín del Paso 3 |
| `access_blocked` | Pantalla de consentimiento en Testing | Publica la app o añade la cuenta como usuario de prueba |
| Funciona en español pero no en `/en` | Falta el prefijo de idioma en Redirect URLs | Usa `/**` |
| Funciona en local pero no en Netlify | Falta el Site URL de producción | Paso 3 |
| `Unsupported provider` | El proveedor no está activo en Supabase | Paso 2 |

---

## Qué está ya resuelto en el código

No hace falta tocar nada de esto:

- **Los botones** de `/login` y `/register` ya llaman a `signInWithOAuth` con
  `redirectTo` apuntando a `/confirm` en el idioma activo.
- **La página `/confirm`** existe y queda fuera del `include` del redirect
  automático del módulo, así que el visitante puede aterrizar en ella sin sesión.
  El cliente de `@supabase/ssr` intercambia el código PKCE automáticamente.
- **El trigger `handle_new_user`** lee `full_name` (con `name` como alternativa) y
  `avatar_url` de los metadatos, que son exactamente los campos que Supabase
  normaliza desde Google.
- **El rol** queda en `cliente`, que es el valor correcto para un registro
  público: `app_metadata` no lleva rol y nadie puede asignárselo a sí mismo.

---

## Cómo se conserva el código de referido con Google

`signInWithOAuth` no admite enviar `user_metadata`: los metadatos los aporta el
proveedor. Como el trigger `handle_new_user` lee el código del referente desde
`raw_user_meta_data.referral_code`, un alta por Google llegaría sin referente y
el afiliado perdería su comisión.

El flujo se cierra en tres piezas:

1. **`useReferralCookie`** guarda el código en cuanto alguien abre
   `/register?ref=ABC123`, antes de saltar al proveedor. Usa `sameSite: 'lax'`,
   imprescindible para que la cookie vuelva desde el dominio de Google.
2. **`/confirm`** entrega ese código a `POST /api/referrals/claim` en cuanto hay
   sesión, y borra la cookie pase lo que pase. Un fallo aquí nunca impide entrar
   al panel.
3. **`/api/referrals/claim`** aplica el vínculo con la secret key, porque
   `guard_profile_changes` impide que nadie toque su propio `referred_by`.

Como esa ruta escribe saltándose la RLS, es la única barrera, y por eso rechaza:

| Situación | Respuesta |
|---|---|
| El perfil ya tiene referente | `ya_tiene_referente` — no se reemplaza nunca |
| El código es el suyo propio | `auto_referido` |
| El código no existe | `codigo_no_encontrado` |
| La cuenta tiene más de 15 minutos | `fuera_de_plazo` |
| Sin sesión | `401` |

La ventana de 15 minutos es lo que impide que el endpoint sirva para que una
cuenta antigua se atribuya un referente cuando le convenga. El alta por correo
sigue resolviéndose en el trigger como antes: al llegar a `/confirm` el perfil ya
tiene referente y la ruta responde `ya_tiene_referente` sin tocar nada.
