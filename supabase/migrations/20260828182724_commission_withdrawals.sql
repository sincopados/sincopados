-- Retiro de comisiones de referido.
--
-- Regla de negocio: una comisión sólo es retirable cuando el servicio que la
-- generó está pagado y con toda su trazabilidad cumplida. Hasta entonces queda
-- en `pendiente`; al cumplirse ambas condiciones pasa a `aprobado`, que es el
-- saldo que el usuario puede solicitar.
--
-- El estado se calcula en la base de datos con triggers, no en el frontend: es
-- dinero, y el saldo no puede depender de que una pantalla se acuerde de
-- recalcularlo.

-- -----------------------------------------------------------------------------
-- 1. Estado de la solicitud de retiro
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'withdrawal_status') then
    create type public.withdrawal_status as enum (
      'en_proceso',  -- solicitada, a la espera de que el administrador la pague
      'procesado',   -- pagada al usuario
      'cancelado'    -- rechazada; las comisiones vuelven al saldo disponible
    );
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- 2. Solicitudes de retiro
-- -----------------------------------------------------------------------------
create table if not exists public.withdrawal_requests (
  id             uuid primary key default gen_random_uuid(),
  referrer_id    uuid not null references public.profiles (id) on delete cascade,
  amount         numeric(12, 2) not null check (amount > 0),
  currency       text not null default 'COP',
  status         public.withdrawal_status not null default 'en_proceso',
  -- Plazo de entrega comprometido, en horas. Variable por solicitud; el
  -- administrador puede ajustarlo si negocia otro plazo.
  eta_hours      integer not null default 72 check (eta_hours > 0 and eta_hours <= 8760),
  payout_method  text,
  notes          text,  -- lo que escribe quien solicita
  admin_notes    text,  -- la respuesta del administrador
  requested_at   timestamptz not null default now(),
  resolved_at    timestamptz,
  resolved_by    uuid references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists withdrawal_requests_referrer_idx
  on public.withdrawal_requests (referrer_id, requested_at desc);
create index if not exists withdrawal_requests_status_idx
  on public.withdrawal_requests (status);

-- Una sola solicitud abierta por usuario: si no, dos tickets simultáneos
-- podrían reclamar las mismas comisiones.
create unique index if not exists withdrawal_requests_one_open_per_user
  on public.withdrawal_requests (referrer_id)
  where status = 'en_proceso';

drop trigger if exists set_updated_at on public.withdrawal_requests;
create trigger set_updated_at
  before update on public.withdrawal_requests
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Vínculo entre comisión y solicitud
-- -----------------------------------------------------------------------------
-- Sin esto, la misma comisión podría retirarse dos veces. Al cancelar una
-- solicitud el vínculo se suelta y la comisión vuelve al saldo disponible.
alter table public.referral_earnings
  add column if not exists withdrawal_request_id uuid
    references public.withdrawal_requests (id) on delete set null;

create index if not exists referral_earnings_withdrawal_idx
  on public.referral_earnings (withdrawal_request_id);

-- -----------------------------------------------------------------------------
-- 4. La regla de negocio: cuándo una comisión es retirable
-- -----------------------------------------------------------------------------
-- Pagado + trazabilidad completa. Un servicio sin etapas no cuenta como
-- completo: sin hitos no hay nada que dar por cumplido.
create or replace function public.refresh_referral_eligibility(p_client_service_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_eligible boolean;
begin
  select cs.payment_status = 'pagado'
     and exists (
       select 1 from public.client_service_stages st
        where st.client_service_id = cs.id
     )
     and not exists (
       select 1 from public.client_service_stages st
        where st.client_service_id = cs.id and st.completed_at is null
     )
    into v_eligible
    from public.client_services cs
   where cs.id = p_client_service_id;

  if v_eligible is null then
    return;
  end if;

  if v_eligible then
    update public.referral_earnings
       set status = 'aprobado'
     where source_type = 'servicio'
       and source_id = p_client_service_id
       and status = 'pendiente'
       and withdrawal_request_id is null;
  else
    -- Sólo se revierte lo que aún no entró en una solicitud: una comisión ya
    -- solicitada o pagada no se retira por un cambio posterior en el servicio.
    update public.referral_earnings
       set status = 'pendiente'
     where source_type = 'servicio'
       and source_id = p_client_service_id
       and status = 'aprobado'
       and withdrawal_request_id is null;
  end if;
end;
$$;

revoke execute on function public.refresh_referral_eligibility(uuid) from public, anon, authenticated;

-- 4.1 Cambiar el estado de pago del servicio reevalúa sus comisiones
create or replace function public.refresh_eligibility_from_service()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.refresh_referral_eligibility(new.id);
  return new;
end;
$$;

revoke execute on function public.refresh_eligibility_from_service() from public, anon, authenticated;

drop trigger if exists refresh_referral_eligibility on public.client_services;
create trigger refresh_referral_eligibility
  after update of payment_status on public.client_services
  for each row
  when (old.payment_status is distinct from new.payment_status)
  execute function public.refresh_eligibility_from_service();

-- 4.2 Marcar o reabrir una etapa también las reevalúa
create or replace function public.refresh_eligibility_from_stage()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.refresh_referral_eligibility(
    coalesce(new.client_service_id, old.client_service_id)
  );
  return coalesce(new, old);
end;
$$;

revoke execute on function public.refresh_eligibility_from_stage() from public, anon, authenticated;

drop trigger if exists refresh_referral_eligibility on public.client_service_stages;
create trigger refresh_referral_eligibility
  after insert or update or delete on public.client_service_stages
  for each row execute function public.refresh_eligibility_from_stage();

-- 4.3 Puesta al día de lo ya existente
do $$
declare
  v_id uuid;
begin
  for v_id in select id from public.client_services loop
    perform public.refresh_referral_eligibility(v_id);
  end loop;
end
$$;

-- -----------------------------------------------------------------------------
-- 5. Solicitar el retiro
-- -----------------------------------------------------------------------------
-- Se retira el saldo aprobado completo, no una cantidad a elección: repartir
-- una comisión entre dos solicitudes obligaría a partirla, y el requisito es
-- justamente que sólo se pueda retirar lo que la regla ya aceptó.
--
-- Es `security definer` porque debe crear la solicitud y enganchar las
-- comisiones en una sola transacción, algo que la RLS no permitiría al usuario.
create or replace function public.request_commission_withdrawal(
  p_payout_method text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_amount numeric(12, 2);
  v_currency text;
  v_request_id uuid;
begin
  if v_user is null then
    raise exception 'Necesitas iniciar sesión para solicitar un retiro'
      using errcode = '28000';
  end if;

  if exists (
    select 1 from public.withdrawal_requests
     where referrer_id = v_user and status = 'en_proceso'
  ) then
    raise exception 'Ya tienes una solicitud de retiro en proceso'
      using errcode = '23505';
  end if;

  -- Se bloquean las filas para que dos peticiones simultáneas no reclamen la
  -- misma comisión. El bloqueo va en su propia sentencia porque `for update`
  -- no se admite junto a funciones de agregado.
  perform 1
     from public.referral_earnings e
    where e.referrer_id = v_user
      and e.status = 'aprobado'
      and e.withdrawal_request_id is null
      for update;

  select coalesce(sum(e.amount), 0), coalesce(min(e.currency), 'COP')
    into v_amount, v_currency
    from public.referral_earnings e
   where e.referrer_id = v_user
     and e.status = 'aprobado'
     and e.withdrawal_request_id is null;

  if v_amount <= 0 then
    raise exception 'No tienes comisiones disponibles para retirar'
      using errcode = 'P0001';
  end if;

  insert into public.withdrawal_requests (referrer_id, amount, currency, payout_method, notes)
  values (v_user, v_amount, v_currency, nullif(p_payout_method, ''), nullif(p_notes, ''))
  returning id into v_request_id;

  update public.referral_earnings
     set withdrawal_request_id = v_request_id
   where referrer_id = v_user
     and status = 'aprobado'
     and withdrawal_request_id is null;

  return v_request_id;
end;
$$;

revoke execute on function public.request_commission_withdrawal(text, text) from public, anon;
grant execute on function public.request_commission_withdrawal(text, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 6. Resolver la solicitud arrastra las comisiones
-- -----------------------------------------------------------------------------
create or replace function public.settle_withdrawal_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  -- La resolución la firma el servidor, igual que los pagos y las etapas.
  if new.status in ('procesado', 'cancelado') then
    new.resolved_at := now();
    new.resolved_by := (select auth.uid());
  else
    new.resolved_at := null;
    new.resolved_by := null;
  end if;

  if new.status = 'procesado' then
    update public.referral_earnings
       set status = 'pagado'
     where withdrawal_request_id = new.id;

  elsif new.status = 'cancelado' then
    -- Se sueltan para que vuelvan al saldo disponible: la comisión se ganó,
    -- lo que se rechazó es el retiro.
    update public.referral_earnings
       set status = 'aprobado', withdrawal_request_id = null
     where withdrawal_request_id = new.id;

  elsif new.status = 'en_proceso' then
    update public.referral_earnings
       set status = 'aprobado'
     where withdrawal_request_id = new.id;
  end if;

  return new;
end;
$$;

revoke execute on function public.settle_withdrawal_request() from public, anon, authenticated;

drop trigger if exists settle_withdrawal on public.withdrawal_requests;
create trigger settle_withdrawal
  before update on public.withdrawal_requests
  for each row execute function public.settle_withdrawal_request();

-- -----------------------------------------------------------------------------
-- 7. Saldo por usuario
-- -----------------------------------------------------------------------------
-- `security_invoker`: la vista hereda la RLS de `referral_earnings`, así que
-- cada quien sólo suma lo suyo y el superusuario lo ve todo.
create or replace view public.referral_balance
with (security_invoker = true) as
select
  e.referrer_id as profile_id,
  coalesce(sum(e.amount) filter (
    where e.status = 'pendiente'
  ), 0)::numeric(12, 2) as locked_amount,
  coalesce(sum(e.amount) filter (
    where e.status = 'aprobado' and e.withdrawal_request_id is null
  ), 0)::numeric(12, 2) as available_amount,
  coalesce(sum(e.amount) filter (
    where e.withdrawal_request_id is not null and e.status <> 'pagado'
  ), 0)::numeric(12, 2) as requested_amount,
  coalesce(sum(e.amount) filter (
    where e.status = 'pagado'
  ), 0)::numeric(12, 2) as withdrawn_amount
from public.referral_earnings e
group by e.referrer_id;

-- -----------------------------------------------------------------------------
-- 8. RLS
-- -----------------------------------------------------------------------------
alter table public.withdrawal_requests enable row level security;

-- Lectura: la suya, y el superusuario ve todos los tickets.
drop policy if exists withdrawal_requests_select on public.withdrawal_requests;
create policy withdrawal_requests_select on public.withdrawal_requests
  for select
  to authenticated
  using (
    referrer_id = (select auth.uid())
    or (select private.is_superuser())
  );

-- Sin política de INSERT: las solicitudes se crean sólo por
-- `request_commission_withdrawal()`, que valida el saldo. Sin política de
-- DELETE: un ticket resuelto es histórico contable y no se borra.
drop policy if exists withdrawal_requests_update on public.withdrawal_requests;
create policy withdrawal_requests_update on public.withdrawal_requests
  for update
  to authenticated
  using ((select private.is_superuser()))
  with check ((select private.is_superuser()));

grant select on public.withdrawal_requests to authenticated;
grant select on public.referral_balance to authenticated;

-- Por columnas: el importe lo fija la regla de negocio, no el administrador.
grant update (status, eta_hours, admin_notes, payout_method)
  on public.withdrawal_requests to authenticated;
