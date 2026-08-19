-- Postgres concede EXECUTE a PUBLIC en cada función nueva, lo que convierte a
-- toda función de `public` en un endpoint `/rest/v1/rpc/…`. Estas funciones sólo
-- deben dispararse como triggers, así que se revoca el acceso directo.
-- Los triggers siguen funcionando: Postgres comprueba EXECUTE al crear el
-- trigger, no en cada disparo.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.guard_profile_changes() from public, anon, authenticated;
revoke execute on function public.accrue_referral_earning() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- El código de referido lo asigna el trigger; nadie necesita pedirlo por RPC.
revoke execute on function public.generate_referral_code() from public, anon, authenticated;
