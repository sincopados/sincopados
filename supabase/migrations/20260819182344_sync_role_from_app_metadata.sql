-- GoTrue inserta la fila en auth.users y sólo después escribe `app_metadata` en
-- un UPDATE aparte, así que `handle_new_user` (AFTER INSERT) todavía no ve el
-- rol y el perfil se quedaba en el valor por defecto `cliente`.
-- Este trigger cierra el hueco: `app_metadata.role` es la fuente de verdad.
create or replace function public.sync_role_from_app_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  incoming public.user_role;
begin
  begin
    incoming := (new.raw_app_meta_data ->> 'role')::public.user_role;
  exception when others then
    incoming := null;
  end;

  if incoming is null then
    return new;
  end if;

  update public.profiles p
  set role = incoming
  where p.id = new.id
    and p.role is distinct from incoming;

  return new;
end;
$$;

revoke execute on function public.sync_role_from_app_metadata() from public, anon, authenticated;

drop trigger if exists on_auth_user_app_metadata_changed on auth.users;
create trigger on_auth_user_app_metadata_changed
  after update of raw_app_meta_data on auth.users
  for each row
  when (new.raw_app_meta_data is distinct from old.raw_app_meta_data)
  execute function public.sync_role_from_app_metadata();
