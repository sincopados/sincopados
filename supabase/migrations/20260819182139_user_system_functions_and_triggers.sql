-- -----------------------------------------------------------------------------
-- 3. Funciones auxiliares (privadas, SECURITY DEFINER para evitar recursión RLS)
-- -----------------------------------------------------------------------------

-- Rol del usuario autenticado. SECURITY DEFINER porque las políticas de
-- `profiles` no pueden consultar `profiles` sin recursión infinita.
create or replace function private.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid());
$$;

create or replace function private.is_superuser()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'superusuario'
  );
$$;

-- Superusuario o tutor: los dos roles con permisos de gestión de usuarios.
create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('superusuario', 'tutor')
  );
$$;

-- Roles que un tutor puede administrar.
create or replace function private.tutor_manages(target public.user_role)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select target in ('cliente', 'alumno', 'afiliado');
$$;

-- ¿Puede el usuario autenticado administrar un perfil con este rol?
create or replace function private.can_manage_role(target public.user_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case private.current_role()
    when 'superusuario' then true
    when 'tutor' then target in ('cliente', 'alumno', 'afiliado')
    else false
  end;
$$;

-- Las políticas RLS se evalúan con los privilegios del rol que consulta, así
-- que `authenticated` necesita poder ejecutar estas funciones. Es seguro:
-- todas resuelven exclusivamente sobre `auth.uid()`, es decir, sobre la propia
-- fila de quien llama, y no aceptan un id de usuario arbitrario.
revoke execute on function
  private.current_role(),
  private.is_superuser(),
  private.is_staff(),
  private.tutor_manages(public.user_role),
  private.can_manage_role(public.user_role)
from public, anon;

grant usage on schema private to authenticated;

grant execute on function
  private.current_role(),
  private.is_superuser(),
  private.is_staff(),
  private.tutor_manages(public.user_role),
  private.can_manage_role(public.user_role)
to authenticated;

-- Generación de código de referido único (público: cualquiera puede pedir uno
-- para su propio registro, pero el trigger es quien realmente lo asigna).
create or replace function public.generate_referral_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- sin I, O, 0, 1
  candidate text;
  i int;
begin
  loop
    candidate := '';
    for i in 1..8 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.profiles p where p.referral_code = candidate);
  end loop;
  return candidate;
end;
$$;

-- -----------------------------------------------------------------------------
-- 4. Triggers
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'services', 'courses', 'client_services', 'enrollments', 'referral_earnings'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()', t
    );
  end loop;
end
$$;

-- 4.1 Crear el perfil automáticamente al registrarse un usuario.
--     El rol se toma de app_metadata (sólo escribible con la secret key desde
--     el servidor). NUNCA de user_metadata, que es editable por el usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role public.user_role;
  referrer_id uuid;
  incoming_code text;
begin
  begin
    requested_role := coalesce(
      (new.raw_app_meta_data ->> 'role')::public.user_role,
      'cliente'
    );
  exception when others then
    requested_role := 'cliente';
  end;

  -- El código de quien refirió sí puede venir de user_metadata: no otorga
  -- privilegios, sólo vincula el árbol de referidos.
  incoming_code := upper(nullif(trim(new.raw_user_meta_data ->> 'referral_code'), ''));

  if incoming_code is not null then
    select p.id into referrer_id
    from public.profiles p
    where p.referral_code = incoming_code;
  end if;

  insert into public.profiles (id, email, full_name, avatar_url, role, referral_code, referred_by)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')), ''),
    new.raw_user_meta_data ->> 'avatar_url',
    requested_role,
    public.generate_referral_code(),
    referrer_id
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4.2 Blindaje contra escalada de privilegios.
--     RLS `with check` no puede comparar contra el valor anterior de la fila,
--     así que la inmutabilidad de `role`, `referral_code` y `referred_by` se
--     hace aquí.
create or replace function public.guard_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Sin JWT no hay usuario: la petición viene de la secret key (rutas
  -- `server/api/admin/**`), que ya validó los permisos del solicitante.
  if (select auth.uid()) is null then
    return new;
  end if;

  if new.referral_code is distinct from old.referral_code and not private.is_superuser() then
    raise exception 'El código de referido no se puede modificar' using errcode = '42501';
  end if;

  if new.referred_by is distinct from old.referred_by and not private.is_superuser() then
    raise exception 'El referente no se puede modificar' using errcode = '42501';
  end if;

  if new.role is distinct from old.role then
    -- Se necesita poder administrar tanto el rol anterior como el nuevo.
    if not (private.can_manage_role(old.role) and private.can_manage_role(new.role)) then
      raise exception 'No tiene permisos para cambiar este rol' using errcode = '42501';
    end if;
    -- Nadie puede promoverse a sí mismo.
    if new.id = (select auth.uid()) then
      raise exception 'No puede cambiar su propio rol' using errcode = '42501';
    end if;
  end if;

  if new.id is distinct from old.id then
    raise exception 'El identificador del perfil es inmutable' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_changes on public.profiles;
create trigger guard_profile_changes
  before update on public.profiles
  for each row execute function public.guard_profile_changes();

-- 4.3 Generar la comisión de referido cuando se registra una compra.
create or replace function public.accrue_referral_earning()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid;
  referrer uuid;
  source text;
  rate numeric(5, 4);
begin
  if tg_table_name = 'client_services' then
    buyer_id := new.client_id;
    source := 'servicio';
    select s.commission_rate into rate from public.services s where s.id = new.service_id;
  else
    buyer_id := new.student_id;
    source := 'curso';
    select c.commission_rate into rate from public.courses c where c.id = new.course_id;
  end if;

  select p.referred_by into referrer from public.profiles p where p.id = buyer_id;

  if referrer is null or referrer = buyer_id then
    return new;
  end if;

  rate := coalesce(rate, 0.10);

  insert into public.referral_earnings (
    referrer_id, referred_id, source_type, source_id, base_amount, rate, amount, currency
  )
  values (
    referrer, buyer_id, source, new.id, new.amount, rate,
    round(new.amount * rate, 2), new.currency
  );

  return new;
end;
$$;

drop trigger if exists accrue_referral_earning on public.client_services;
create trigger accrue_referral_earning
  after insert on public.client_services
  for each row execute function public.accrue_referral_earning();

drop trigger if exists accrue_referral_earning on public.enrollments;
create trigger accrue_referral_earning
  after insert on public.enrollments
  for each row execute function public.accrue_referral_earning();

