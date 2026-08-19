-- -----------------------------------------------------------------------------
-- 5. Row Level Security
-- -----------------------------------------------------------------------------

alter table public.profiles          enable row level security;
alter table public.services          enable row level security;
alter table public.courses           enable row level security;
alter table public.client_services   enable row level security;
alter table public.enrollments       enable row level security;
alter table public.referral_earnings enable row level security;

-- 5.1 profiles ---------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())                    -- su propio perfil
    or referred_by = (select auth.uid())        -- los usuarios que refirió
    or (select private.can_manage_role(role))   -- superusuario: todos; tutor: cliente/alumno/afiliado
  );

-- No hay política de INSERT a propósito: los perfiles se crean únicamente por
-- el trigger `on_auth_user_created`, disparado desde el endpoint de servidor
-- que usa la secret key. Así el perfil nunca puede existir sin su auth.user.

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update
  to authenticated
  using (
    id = (select auth.uid())
    or (select private.can_manage_role(role))
  )
  with check (
    id = (select auth.uid())
    or (select private.can_manage_role(role))
  );

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete
  to authenticated
  using (
    id <> (select auth.uid())
    and (select private.can_manage_role(role))
  );

-- 5.2 services ---------------------------------------------------------------
drop policy if exists services_select on public.services;
create policy services_select on public.services
  for select
  to authenticated
  using (is_active or (select private.is_staff()));

drop policy if exists services_write on public.services;
create policy services_write on public.services
  for all
  to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

-- 5.3 courses ----------------------------------------------------------------
drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses
  for select
  to authenticated
  using (is_active or (select private.is_staff()));

drop policy if exists courses_write on public.courses;
create policy courses_write on public.courses
  for all
  to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

-- 5.4 client_services --------------------------------------------------------
drop policy if exists client_services_select on public.client_services;
create policy client_services_select on public.client_services
  for select
  to authenticated
  using (
    client_id = (select auth.uid())
    or (select private.is_staff())
  );

drop policy if exists client_services_write on public.client_services;
create policy client_services_write on public.client_services
  for all
  to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

-- 5.5 enrollments ------------------------------------------------------------
drop policy if exists enrollments_select on public.enrollments;
create policy enrollments_select on public.enrollments
  for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or (select private.is_staff())
  );

drop policy if exists enrollments_write on public.enrollments;
create policy enrollments_write on public.enrollments
  for all
  to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

-- 5.6 referral_earnings ------------------------------------------------------
-- Las comisiones las escribe únicamente el trigger `accrue_referral_earning`
-- (SECURITY DEFINER), nunca el cliente.
drop policy if exists referral_earnings_select on public.referral_earnings;
create policy referral_earnings_select on public.referral_earnings
  for select
  to authenticated
  using (
    referrer_id = (select auth.uid())
    or (select private.is_superuser())
  );

drop policy if exists referral_earnings_update on public.referral_earnings;
create policy referral_earnings_update on public.referral_earnings
  for update
  to authenticated
  using ((select private.is_superuser()))
  with check ((select private.is_superuser()));

-- -----------------------------------------------------------------------------
-- 6. Vistas de apoyo (security_invoker: heredan la RLS de las tablas base)
-- -----------------------------------------------------------------------------

-- Resumen por usuario: cuánto ha generado con su código de referido.
create or replace view public.referral_summary
with (security_invoker = true) as
select
  p.id                                                as profile_id,
  p.full_name,
  p.email,
  p.role,
  p.referral_code,
  count(distinct r.id)                                as referred_count,
  coalesce(sum(e.amount), 0)::numeric(12, 2)          as total_earned,
  coalesce(sum(e.amount) filter (where e.status = 'pendiente'), 0)::numeric(12, 2) as pending_earned,
  coalesce(sum(e.amount) filter (where e.status = 'pagado'), 0)::numeric(12, 2)    as paid_earned
from public.profiles p
left join public.profiles r on r.referred_by = p.id
left join public.referral_earnings e on e.referrer_id = p.id
group by p.id, p.full_name, p.email, p.role, p.referral_code;

-- -----------------------------------------------------------------------------
-- 7. Permisos del Data API
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  public.profiles, public.services, public.courses,
  public.client_services, public.enrollments
to authenticated;

grant select, update on public.referral_earnings to authenticated;
grant select on public.referral_summary to authenticated;
