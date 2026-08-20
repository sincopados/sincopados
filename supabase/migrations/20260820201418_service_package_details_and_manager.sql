-- Detalle del paquete que incluye cada servicio del catálogo, y el gestor
-- responsable de cada servicio contratado por un cliente.

-- -----------------------------------------------------------------------------
-- 1. Redes sociales como enum: la lista es cerrada y así la valida Postgres
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'social_network') then
    create type public.social_network as enum (
      'facebook', 'instagram', 'tiktok', 'linkedin', 'x', 'youtube'
    );
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- 2. Qué incluye el servicio (catálogo)
-- -----------------------------------------------------------------------------
alter table public.services
  add column if not exists video_count     smallint not null default 0,
  add column if not exists image_count     smallint not null default 0,
  add column if not exists carousel_count  smallint not null default 0,
  add column if not exists shooting_hours  numeric(6, 2) not null default 0,
  add column if not exists manages_social  boolean not null default false,
  add column if not exists social_networks public.social_network[] not null default '{}';

alter table public.services
  drop constraint if exists services_counts_non_negative;
alter table public.services
  add constraint services_counts_non_negative check (
    video_count >= 0 and image_count >= 0 and carousel_count >= 0 and shooting_hours >= 0
  );

-- Sin manejo de redes no puede haber redes seleccionadas: así la incoherencia
-- no depende de que el formulario se acuerde de limpiar el array.
alter table public.services
  drop constraint if exists services_social_consistency;
alter table public.services
  add constraint services_social_consistency check (
    manages_social or cardinality(social_networks) = 0
  );

-- -----------------------------------------------------------------------------
-- 3. Responsable del servicio contratado
-- -----------------------------------------------------------------------------
-- Va en `client_services` y no en el catálogo porque cambia en cada
-- contratación. Las fechas de inicio y fin ya viven aquí (`starts_at`/`ends_at`).
alter table public.client_services
  add column if not exists manager_id uuid references public.profiles (id) on delete set null;

create index if not exists client_services_manager_id_idx
  on public.client_services (manager_id);
