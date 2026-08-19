# Base de datos

## Aplicar el esquema

Con la CLI de Supabase enlazada al proyecto:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

O, sin CLI: ejecuta los archivos de `migrations/` en orden de nombre desde el
SQL Editor del dashboard. Son idempotentes, así que pueden volver a correrse.

> Ya están aplicadas en el proyecto `srhtxbpfnaradsspejul`.

Después conviene revisar los avisos de seguridad:

```bash
supabase db advisors --type security
```

## Crear el primer superusuario

El trigger `handle_new_user` asigna el rol `cliente` por defecto, y ningún
usuario puede promoverse a sí mismo. El primero hay que hacerlo a mano:

1. Regístrate normalmente en `/register`.
2. En el SQL Editor, escribe el rol en `app_metadata`:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"superusuario"}'::jsonb
where email = 'tu-correo@ejemplo.com';
```

Basta con eso: el trigger `on_auth_user_app_metadata_changed` propaga el rol a
`public.profiles`. A partir de ahí, los demás usuarios se crean desde
`/dashboard/usuarios/nuevo`, que pasa por la Admin API en el servidor.

> `app_metadata` es la fuente de verdad del rol, porque es el único sitio que el
> propio usuario no puede escribir. `handle_new_user` lo lee al crear el perfil y
> `sync_role_from_app_metadata` lo mantiene sincronizado después: GoTrue inserta
> la fila en `auth.users` antes de escribir `app_metadata`, así que sin ese
> segundo trigger todo usuario nacería como `cliente`.

## Variables de entorno

Copia `.env.example` a `.env` y rellena las tres claves. `NUXT_SUPABASE_SECRET_KEY`
sólo se usa en rutas de servidor (`server/api/admin/**`) y nunca llega al navegador.

## Modelo de permisos

| Tabla | Lectura | Escritura |
|---|---|---|
| `profiles` | propio perfil, usuarios referidos, y los roles que el actor puede administrar | propio perfil; superusuario todos; tutor sólo cliente/alumno/afiliado |
| `services`, `courses` | activos para todos; todos para staff | superusuario y tutor |
| `client_services` | propios; todos para staff | superusuario y tutor |
| `enrollments` | propias; todas para staff | superusuario y tutor |
| `referral_earnings` | propias; todas para superusuario | sólo triggers; superusuario cambia el estado |

Reglas que la base de datos garantiza aunque el frontend falle:

- El rol nunca se lee de `user_metadata` (editable por el usuario), sólo de
  `app_metadata`, que requiere la secret key.
- `guard_profile_changes` impide cambiar el propio rol, el código de referido y
  el referente.
- Las comisiones las escribe únicamente el trigger `accrue_referral_earning`;
  no hay política de INSERT para `referral_earnings`.
- Ninguna función de trigger conserva el `EXECUTE` que Postgres concede a
  `PUBLIC` por defecto, así que no quedan expuestas como endpoints
  `/rest/v1/rpc/…`.

Verificado contra el proyecto real con usuarios de cada rol: un cliente sólo ve
su perfil, un afiliado ve además a quienes refirió, un tutor ve a
cliente/alumno/afiliado pero no a los superusuarios, y los intentos de
auto-ascenso o de cambiar el propio código de referido fallan con `42501`.
