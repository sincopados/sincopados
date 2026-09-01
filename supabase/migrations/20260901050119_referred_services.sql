-- Los servicios que un afiliado ha referido.
--
-- El afiliado no puede leer `client_services`: su RLS sólo deja ver los
-- contratos propios o los del equipo. Pero sí necesita saber qué ha generado
-- con su código, así que se expone por una función `security definer` que
-- filtra por `auth.uid()` y devuelve únicamente lo que le concierne.
--
-- Deliberadamente NO devuelve `client_id` ni ningún dato del cliente: al
-- afiliado le corresponde saber qué servicio se contrató y cuánto gana, no
-- quién lo contrató.

create or replace function public.get_referred_services()
returns table (
  earning_id        uuid,
  service_name      text,
  service_status    public.service_status,
  payment_status    public.payment_status,
  starts_at         timestamptz,
  ends_at           timestamptz,
  commission_amount numeric,
  commission_status public.referral_status,
  currency          text,
  total_stages      bigint,
  completed_stages  bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    e.id,
    s.name,
    cs.status,
    cs.payment_status,
    cs.starts_at,
    cs.ends_at,
    e.amount,
    e.status,
    e.currency,
    (
      select count(*) from public.client_service_stages st
       where st.client_service_id = cs.id
    ),
    (
      select count(*) from public.client_service_stages st
       where st.client_service_id = cs.id and st.completed_at is not null
    )
  from public.referral_earnings e
  join public.client_services cs on cs.id = e.source_id
  join public.services s on s.id = cs.service_id
  where e.referrer_id = (select auth.uid())
    and e.source_type = 'servicio'
  order by cs.starts_at desc;
$$;

-- Es un RPC legítimo, a diferencia de las funciones de trigger: el afiliado la
-- llama desde su panel. No acepta ningún identificador, así que sólo puede
-- devolver lo de quien la invoca.
revoke execute on function public.get_referred_services() from public, anon;
grant execute on function public.get_referred_services() to authenticated;
