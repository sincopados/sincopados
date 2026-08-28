-- Estado de pago de un servicio contratado y su libro de pagos.
--
-- Una contratación puede cobrarse en uno o varios pagos según la negociación,
-- así que los importes viven en su propia tabla y el saldo se calcula sumando.
-- El estado (`payment_status`) lo fija el administrador: describe el acuerdo
-- comercial, que no siempre coincide con lo cobrado hasta la fecha.

-- -----------------------------------------------------------------------------
-- 1. Estado de pago como enum
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum (
      'espera',   -- pendiente de cobro, sin abonos
      'inicial',  -- se recibió el abono inicial
      'debe',     -- quedan cuotas por cobrar
      'pagado'    -- saldado
    );
  end if;
end
$$;

alter table public.client_services
  add column if not exists payment_status public.payment_status not null default 'espera';

-- -----------------------------------------------------------------------------
-- 2. Libro de pagos
-- -----------------------------------------------------------------------------
-- Sin columna `currency`: la moneda es la del servicio contratado, y duplicarla
-- aquí sólo abriría la puerta a que ambas discrepen.
create table if not exists public.client_service_payments (
  id                uuid primary key default gen_random_uuid(),
  client_service_id uuid not null references public.client_services (id) on delete cascade,
  amount            numeric(12, 2) not null check (amount > 0),
  paid_at           timestamptz not null default now(),
  method            text,
  notes             text,
  recorded_by       uuid references public.profiles (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists client_service_payments_service_idx
  on public.client_service_payments (client_service_id, paid_at desc);

drop trigger if exists set_updated_at on public.client_service_payments;
create trigger set_updated_at
  before update on public.client_service_payments
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Quién registró el pago lo decide el servidor
-- -----------------------------------------------------------------------------
-- Igual que la firma de las etapas: `recorded_by` no se acepta del cliente de
-- la API, para que un pago no pueda atribuirse a otra persona.
create or replace function public.stamp_payment_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.recorded_by := (select auth.uid());
  else
    new.recorded_by := old.recorded_by;
  end if;

  return new;
end;
$$;

revoke execute on function public.stamp_payment_author() from public, anon, authenticated;

drop trigger if exists stamp_payment_author on public.client_service_payments;
create trigger stamp_payment_author
  before insert or update on public.client_service_payments
  for each row execute function public.stamp_payment_author();

-- -----------------------------------------------------------------------------
-- 4. RLS
-- -----------------------------------------------------------------------------
alter table public.client_service_payments enable row level security;

-- Lectura: el cliente dueño del servicio ve lo que ha pagado; el equipo, todo.
drop policy if exists client_service_payments_select on public.client_service_payments;
create policy client_service_payments_select on public.client_service_payments
  for select
  to authenticated
  using (
    exists (
      select 1
        from public.client_services cs
       where cs.id = client_service_id
         and (cs.client_id = (select auth.uid()) or (select private.is_staff()))
    )
  );

-- Escritura: sólo el superusuario. Un pago es un hecho contable, y el tutor que
-- gestiona la producción de un servicio no responde por su cobro.
drop policy if exists client_service_payments_insert on public.client_service_payments;
create policy client_service_payments_insert on public.client_service_payments
  for insert
  to authenticated
  with check ((select private.is_superuser()));

drop policy if exists client_service_payments_update on public.client_service_payments;
create policy client_service_payments_update on public.client_service_payments
  for update
  to authenticated
  using ((select private.is_superuser()))
  with check ((select private.is_superuser()));

drop policy if exists client_service_payments_delete on public.client_service_payments;
create policy client_service_payments_delete on public.client_service_payments
  for delete
  to authenticated
  using ((select private.is_superuser()));

grant select on public.client_service_payments to authenticated;
-- El grant es por columnas: `recorded_by` lo escribe el trigger, y dejarlo
-- fuera impide que se atribuya un pago a otra persona.
grant insert (client_service_id, amount, paid_at, method, notes)
  on public.client_service_payments to authenticated;
grant update (amount, paid_at, method, notes)
  on public.client_service_payments to authenticated;
grant delete on public.client_service_payments to authenticated;
