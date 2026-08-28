-- Cuentas de retiro guardadas y retiros parciales.
--
-- Cambia dos cosas del diseño anterior:
--
-- 1. El retiro deja de ser «todo el saldo aprobado» y pasa a ser una cantidad
--    a elección, desde un mínimo. Eso obliga a abandonar el enganche de cada
--    comisión a un ticket (una comisión no se puede partir en dos) y a llevar
--    un libro mayor: disponible = comisiones aprobadas − retiros comprometidos.
--
-- 2. El medio de pago deja de ser texto libre: se elige entre efectivo,
--    transferencia y llave Bre-B, y la cuenta queda guardada para reutilizarla.

-- -----------------------------------------------------------------------------
-- 1. Medio de pago
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payout_method') then
    create type public.payout_method as enum ('efectivo', 'transferencia', 'bre_b');
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- 2. Cuentas guardadas
-- -----------------------------------------------------------------------------
-- `provider` es texto y no un enum: la lista de bancos y billeteras cambia sola
-- (aparece una nueva, se fusiona otra) y no merece una migración cada vez. La
-- lista que se ofrece en pantalla vive en el frontend.
create table if not exists public.payout_accounts (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references public.profiles (id) on delete cascade,
  method         public.payout_method not null,
  provider       text,
  account_number text,
  holder_name    text,
  label          text,
  is_default     boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  -- Una transferencia sin banco ni número no se puede pagar.
  constraint payout_accounts_transfer_complete check (
    method <> 'transferencia'
    or (nullif(trim(provider), '') is not null and nullif(trim(account_number), '') is not null)
  ),
  -- La llave Bre-B es el propio identificador de destino.
  constraint payout_accounts_breb_needs_key check (
    method <> 'bre_b' or nullif(trim(account_number), '') is not null
  )
);

create index if not exists payout_accounts_profile_idx
  on public.payout_accounts (profile_id, created_at desc);

drop trigger if exists set_updated_at on public.payout_accounts;
create trigger set_updated_at
  before update on public.payout_accounts
  for each row execute function public.set_updated_at();

-- Una sola cuenta predeterminada por usuario. En vez de dejar que el índice
-- único falle, el trigger apaga la anterior: marcar una nueva por defecto es
-- una acción normal, no un error.
create unique index if not exists payout_accounts_one_default
  on public.payout_accounts (profile_id) where is_default;

create or replace function public.enforce_single_default_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_default then
    update public.payout_accounts
       set is_default = false
     where profile_id = new.profile_id
       and id <> new.id
       and is_default;
  end if;

  return new;
end;
$$;

revoke execute on function public.enforce_single_default_account() from public, anon, authenticated;

drop trigger if exists single_default_account on public.payout_accounts;
create trigger single_default_account
  before insert or update of is_default on public.payout_accounts
  for each row execute function public.enforce_single_default_account();

-- -----------------------------------------------------------------------------
-- 3. El ticket guarda cómo se pagó
-- -----------------------------------------------------------------------------
-- Además de apuntar a la cuenta, se copian sus datos. Si el usuario borra la
-- cuenta más adelante, el histórico contable debe seguir explicando a dónde
-- fue el dinero.
alter table public.withdrawal_requests
  drop column if exists payout_method;

alter table public.withdrawal_requests
  add column if not exists payout_account_id uuid
    references public.payout_accounts (id) on delete set null,
  add column if not exists payout_method public.payout_method,
  add column if not exists payout_provider text,
  add column if not exists payout_account_number text,
  add column if not exists payout_holder text;

-- Ya no hay una sola solicitud abierta por usuario: con retiros parciales es
-- razonable pedir dos, y el libro mayor impide que sumen más que el saldo.
drop index if exists public.withdrawal_requests_one_open_per_user;

-- -----------------------------------------------------------------------------
-- 4. El enganche comisión↔ticket sobra
-- -----------------------------------------------------------------------------
-- Con retiros parciales una comisión podría quedar repartida entre dos tickets,
-- así que el vínculo uno-a-uno deja de tener sentido. El saldo pasa a salir de
-- restar los retiros comprometidos.
-- La vista del saldo lee esa columna, así que se retira antes y se vuelve a
-- crear más abajo con la forma nueva.
drop view if exists public.referral_balance;

alter table public.referral_earnings
  drop column if exists withdrawal_request_id;

-- -----------------------------------------------------------------------------
-- 4.1 La regla de elegibilidad ya no mira el enganche
-- -----------------------------------------------------------------------------
-- Hay que redefinirla: seguía filtrando por `withdrawal_request_id`, que acaba
-- de desaparecer, y sin esto cualquier alta de servicio falla al dispararse el
-- trigger de sembrado de etapas.
--
-- Al revertir ya no se excluye lo retirado: si un servicio deja de estar
-- pagado, su comisión vuelve a `pendiente` aunque el usuario tenga retiros
-- comprometidos. El saldo disponible puede quedar así en cero, que es lo
-- correcto, y la vista lo acota con `greatest(..., 0)`.
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
       and status = 'pendiente';
  else
    update public.referral_earnings
       set status = 'pendiente'
     where source_type = 'servicio'
       and source_id = p_client_service_id
       and status = 'aprobado';
  end if;
end;
$$;

revoke execute on function public.refresh_referral_eligibility(uuid) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5. Solicitar un retiro parcial
-- -----------------------------------------------------------------------------
create or replace function public.request_commission_withdrawal(
  p_amount numeric,
  p_account_id uuid,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_min       constant numeric := 10000;  -- mínimo de retiro, en pesos
  v_user      uuid := (select auth.uid());
  v_eligible  numeric(12, 2);
  v_committed numeric(12, 2);
  v_available numeric(12, 2);
  v_currency  text;
  v_account   public.payout_accounts%rowtype;
  v_request_id uuid;
begin
  if v_user is null then
    raise exception 'Necesitas iniciar sesión para solicitar un retiro'
      using errcode = '28000';
  end if;

  if p_amount is null or p_amount < v_min then
    raise exception 'El retiro mínimo es de % pesos', v_min
      using errcode = 'P0001';
  end if;

  -- La cuenta tiene que ser del propio solicitante.
  select * into v_account
    from public.payout_accounts
   where id = p_account_id and profile_id = v_user;

  if not found then
    raise exception 'La cuenta de retiro no existe o no es tuya'
      using errcode = 'P0001';
  end if;

  -- Se bloquean las comisiones para que dos peticiones simultáneas no gasten
  -- el mismo saldo. El bloqueo va aparte porque `for update` no se admite
  -- junto a funciones de agregado.
  perform 1
     from public.referral_earnings e
    where e.referrer_id = v_user and e.status = 'aprobado'
      for update;

  select coalesce(sum(e.amount), 0), coalesce(min(e.currency), 'COP')
    into v_eligible, v_currency
    from public.referral_earnings e
   where e.referrer_id = v_user and e.status = 'aprobado';

  -- Comprometido: lo que ya está pedido o pagado. Un ticket cancelado libera.
  select coalesce(sum(w.amount), 0)
    into v_committed
    from public.withdrawal_requests w
   where w.referrer_id = v_user
     and w.status in ('en_proceso', 'procesado');

  v_available := v_eligible - v_committed;

  if p_amount > v_available then
    raise exception 'Sólo tienes % disponible para retirar', v_available
      using errcode = 'P0001';
  end if;

  insert into public.withdrawal_requests (
    referrer_id, amount, currency, notes,
    payout_account_id, payout_method, payout_provider, payout_account_number, payout_holder
  )
  values (
    v_user, p_amount, v_currency, nullif(p_notes, ''),
    v_account.id, v_account.method, v_account.provider,
    v_account.account_number, v_account.holder_name
  )
  returning id into v_request_id;

  return v_request_id;
end;
$$;

-- La firma anterior (sin importe ni cuenta) queda obsoleta.
drop function if exists public.request_commission_withdrawal(text, text);

revoke execute on function public.request_commission_withdrawal(numeric, uuid, text) from public, anon;
grant execute on function public.request_commission_withdrawal(numeric, uuid, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 6. Resolver el ticket ya no toca las comisiones
-- -----------------------------------------------------------------------------
-- Antes se marcaban como pagadas; ahora el estado de una comisión sólo refleja
-- la regla de negocio (pendiente / aprobado) y lo retirado sale del libro de
-- tickets. Así un retiro parcial no obliga a partir ninguna comisión.
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

  if new.status in ('procesado', 'cancelado') then
    new.resolved_at := now();
    new.resolved_by := (select auth.uid());
  else
    new.resolved_at := null;
    new.resolved_by := null;
  end if;

  return new;
end;
$$;

revoke execute on function public.settle_withdrawal_request() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 7. Saldo por usuario, como libro mayor
-- -----------------------------------------------------------------------------
create view public.referral_balance
with (security_invoker = true) as
select
  p.id as profile_id,
  coalesce(e.locked, 0)::numeric(12, 2)    as locked_amount,
  coalesce(w.requested, 0)::numeric(12, 2) as requested_amount,
  coalesce(w.withdrawn, 0)::numeric(12, 2) as withdrawn_amount,
  -- Disponible: lo aprobado menos lo ya pedido o pagado.
  greatest(
    coalesce(e.eligible, 0) - coalesce(w.requested, 0) - coalesce(w.withdrawn, 0),
    0
  )::numeric(12, 2) as available_amount
from public.profiles p
left join lateral (
  select
    sum(amount) filter (where status = 'pendiente') as locked,
    sum(amount) filter (where status = 'aprobado')  as eligible
  from public.referral_earnings
  where referrer_id = p.id
) e on true
left join lateral (
  select
    sum(amount) filter (where status = 'en_proceso') as requested,
    sum(amount) filter (where status = 'procesado')  as withdrawn
  from public.withdrawal_requests
  where referrer_id = p.id
) w on true;

-- -----------------------------------------------------------------------------
-- 8. Resumen de referidos
-- -----------------------------------------------------------------------------
-- Se reescribe con subconsultas laterales por un fallo que arrastraba: unir a
-- la vez los perfiles referidos y las comisiones multiplicaba las filas, así
-- que `total_earned` se inflaba por el número de referidos. Con un referido no
-- se notaba; con tres, el total salía por triple.
--
-- `paid_earned` pasa a leerse de los retiros procesados, porque una comisión ya
-- no cambia a `pagado` al retirarse.
create or replace view public.referral_summary
with (security_invoker = true) as
select
  p.id            as profile_id,
  p.full_name,
  p.email,
  p.role,
  p.referral_code,
  coalesce(r.referred_count, 0)                     as referred_count,
  coalesce(e.total_earned, 0)::numeric(12, 2)       as total_earned,
  greatest(coalesce(e.total_earned, 0) - coalesce(w.withdrawn, 0), 0)::numeric(12, 2) as pending_earned,
  coalesce(w.withdrawn, 0)::numeric(12, 2)          as paid_earned
from public.profiles p
left join lateral (
  select count(*) as referred_count
  from public.profiles r where r.referred_by = p.id
) r on true
left join lateral (
  select sum(amount) as total_earned
  from public.referral_earnings where referrer_id = p.id
) e on true
left join lateral (
  select sum(amount) filter (where status = 'procesado') as withdrawn
  from public.withdrawal_requests where referrer_id = p.id
) w on true;

-- -----------------------------------------------------------------------------
-- 9. RLS de las cuentas
-- -----------------------------------------------------------------------------
alter table public.payout_accounts enable row level security;

-- Sólo el dueño. El administrador no necesita leerlas: el ticket lleva copiados
-- los datos con los que se debe pagar.
drop policy if exists payout_accounts_select on public.payout_accounts;
create policy payout_accounts_select on public.payout_accounts
  for select to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists payout_accounts_insert on public.payout_accounts;
create policy payout_accounts_insert on public.payout_accounts
  for insert to authenticated
  with check (profile_id = (select auth.uid()));

drop policy if exists payout_accounts_update on public.payout_accounts;
create policy payout_accounts_update on public.payout_accounts
  for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

drop policy if exists payout_accounts_delete on public.payout_accounts;
create policy payout_accounts_delete on public.payout_accounts
  for delete to authenticated
  using (profile_id = (select auth.uid()));

grant select, insert, update, delete on public.payout_accounts to authenticated;
