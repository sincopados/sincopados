-- Convocatoria abierta de Sincopados Media Network.
--
-- La landing `/sincopados-media-network` es el filtro obligatorio previo a la
-- consulta estratégica: quien llega deja su nombre, su WhatsApp y en qué
-- vertiente le interesa participar. Sólo el superusuario lee la lista.
--
-- La escritura no se abre al rol `anon`: el formulario envía a
-- `server/api/media-network/leads.post.ts`, que valida y escribe con la secret
-- key. Así un visitante no puede leer, editar ni volcar filas directamente
-- contra la API REST de Supabase.

-- -----------------------------------------------------------------------------
-- 1. Vertientes de negocio
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'media_network_interest') then
    create type public.media_network_interest as enum (
      'trabaja_con_nosotros',  -- reclutamiento de editores y creadores
      'clases_edicion',        -- clases grupales virtuales de edición
      'programa_afiliados',    -- venta de activos digitales y monetización remota
      'bodega_contenidos'      -- contenidos pregrabados
    );
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- 2. Postulaciones
-- -----------------------------------------------------------------------------
create table if not exists public.media_network_leads (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null check (char_length(trim(full_name)) between 2 and 120),
  -- Normalizado en el servidor a `+<código país><número>`.
  whatsapp    text not null check (whatsapp ~ '^\+[0-9]{8,15}$'),
  interests   public.media_network_interest[] not null
                check (cardinality(interests) between 1 and 4),
  -- Origen de la visita (utm_source o similar), para medir qué canal convierte.
  source      text check (source is null or char_length(source) <= 120),
  created_at  timestamptz not null default now()
);

create index if not exists media_network_leads_created_idx
  on public.media_network_leads (created_at desc);

-- Para filtrar por vertiente desde el dashboard.
create index if not exists media_network_leads_interests_idx
  on public.media_network_leads using gin (interests);

-- -----------------------------------------------------------------------------
-- 3. Permisos
-- -----------------------------------------------------------------------------
alter table public.media_network_leads enable row level security;

revoke all on public.media_network_leads from anon;
revoke insert, update, delete on public.media_network_leads from authenticated;
grant select on public.media_network_leads to authenticated;

drop policy if exists media_network_leads_select on public.media_network_leads;
create policy media_network_leads_select on public.media_network_leads
  for select to authenticated
  using ((select private.is_superuser()));
