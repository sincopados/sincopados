-- Interruptor de comisión por servicio contratado.
--
-- Hay contrataciones que no deben generar comisión de referido: una promoción,
-- un acuerdo puntual, un cliente que el afiliado no trajo realmente. El
-- superusuario apaga el interruptor y la comisión de ese contrato deja de
-- contar, sin tocar al afiliado ni al resto de sus comisiones.
--
-- Se aprovecha `anulado`, que ya existía en el enum `referral_status` sin uso y
-- describe exactamente esto. Así la comisión no se borra: queda registrada y
-- anulada, y volver a encender el interruptor la reactiva.

alter table public.client_services
  add column if not exists commission_enabled boolean not null default true;

comment on column public.client_services.commission_enabled is
  'Cuando es falso, la comisión de referido de este contrato queda anulada.';

-- -----------------------------------------------------------------------------
-- La regla de elegibilidad pasa a mirar el interruptor primero
-- -----------------------------------------------------------------------------
create or replace function public.refresh_referral_eligibility(p_client_service_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enabled  boolean;
  v_eligible boolean;
begin
  select
    cs.commission_enabled,
    cs.payment_status = 'pagado'
      and exists (
        select 1 from public.client_service_stages st
         where st.client_service_id = cs.id
      )
      and not exists (
        select 1 from public.client_service_stages st
         where st.client_service_id = cs.id and st.completed_at is null
      )
    into v_enabled, v_eligible
    from public.client_services cs
   where cs.id = p_client_service_id;

  if v_enabled is null then
    return;
  end if;

  -- Interruptor apagado: la comisión se anula sea cual sea el estado del
  -- servicio. `anulado` no suma ni en retenido ni en disponible.
  if not v_enabled then
    update public.referral_earnings
       set status = 'anulado'
     where source_type = 'servicio'
       and source_id = p_client_service_id
       and status <> 'anulado';

    return;
  end if;

  -- Encendido: se aplica la regla de siempre, y `anulado` vuelve al juego.
  if v_eligible then
    update public.referral_earnings
       set status = 'aprobado'
     where source_type = 'servicio'
       and source_id = p_client_service_id
       and status in ('pendiente', 'anulado');
  else
    update public.referral_earnings
       set status = 'pendiente'
     where source_type = 'servicio'
       and source_id = p_client_service_id
       and status in ('aprobado', 'anulado');
  end if;
end;
$$;

revoke execute on function public.refresh_referral_eligibility(uuid) from public, anon, authenticated;

-- El mismo trigger cubre ahora las dos columnas que cambian la elegibilidad.
drop trigger if exists refresh_referral_eligibility on public.client_services;
create trigger refresh_referral_eligibility
  after update of payment_status, commission_enabled on public.client_services
  for each row
  when (
    old.payment_status is distinct from new.payment_status
    or old.commission_enabled is distinct from new.commission_enabled
  )
  execute function public.refresh_eligibility_from_service();

-- -----------------------------------------------------------------------------
-- Una comisión anulada no cuenta como ganada
-- -----------------------------------------------------------------------------
-- `referral_balance` ya la ignora, porque sólo suma `pendiente` y `aprobado`.
-- El resumen sí la sumaba en `total_earned`, y eso prometía al afiliado un
-- dinero que no va a ver.
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
  select sum(amount) filter (where status <> 'anulado') as total_earned
  from public.referral_earnings where referrer_id = p.id
) e on true
left join lateral (
  select sum(amount) filter (where status = 'procesado') as withdrawn
  from public.withdrawal_requests where referrer_id = p.id
) w on true;

-- Puesta al día: nada cambia mientras nadie apague un interruptor, pero deja el
-- estado coherente con la definición nueva.
do $$
declare
  v_id uuid;
begin
  for v_id in select id from public.client_services loop
    perform public.refresh_referral_eligibility(v_id);
  end loop;
end
$$;
