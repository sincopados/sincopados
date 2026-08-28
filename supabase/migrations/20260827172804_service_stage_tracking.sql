-- Trazabilidad por etapas de cada servicio contratado.
--
-- El cliente ve en qué punto está su servicio; el superusuario y el responsable
-- asignado marcan cada etapa como cumplida. Las etapas viven en su propia tabla
-- y no en un JSON dentro de `client_services` porque cada una guarda quién la
-- cumplió y cuándo, y porque así la RLS puede decidir por fila.

-- -----------------------------------------------------------------------------
-- 1. Las etapas como enum: la lista es cerrada y la valida Postgres
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'service_stage') then
    create type public.service_stage as enum (
      'pre_produccion',
      'produccion',
      'pos_produccion',
      'correccion',
      'entrega',
      -- Sólo para servicios que gestionan redes sociales.
      'publicacion',
      'informe'
    );
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- 2. Tabla de etapas
-- -----------------------------------------------------------------------------
create table if not exists public.client_service_stages (
  id                uuid primary key default gen_random_uuid(),
  client_service_id uuid not null references public.client_services (id) on delete cascade,
  stage             public.service_stage not null,
  -- Orden dentro de la línea de tiempo. Se guarda en vez de derivarlo del enum
  -- para que reordenar las etapas en el futuro no obligue a recrear el tipo.
  position          smallint not null,
  completed_at      timestamptz,
  completed_by      uuid references public.profiles (id) on delete set null,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint client_service_stages_unique unique (client_service_id, stage)
);

-- Un autor sin fecha describe un estado que no existe. Al revés sí puede pasar:
-- una escritura sin sesión (la secret key en una ruta de servidor, o un script
-- de mantenimiento) deja la etapa cumplida y sin firmar, y eso es preferible a
-- que el UPDATE falle con un error de restricción.
alter table public.client_service_stages
  drop constraint if exists client_service_stages_completion_coherent;
alter table public.client_service_stages
  add constraint client_service_stages_completion_coherent check (
    completed_by is null or completed_at is not null
  );

create index if not exists client_service_stages_service_idx
  on public.client_service_stages (client_service_id, position);

drop trigger if exists set_updated_at on public.client_service_stages;
create trigger set_updated_at
  before update on public.client_service_stages
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Sembrado de etapas
-- -----------------------------------------------------------------------------
-- Las cinco etapas base siempre; `publicacion` e `informe` sólo si el servicio
-- del catálogo gestiona redes sociales.
create or replace function public.sync_client_service_stages(p_client_service_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_manages_social boolean;
begin
  select s.manages_social
    into v_manages_social
    from public.client_services cs
    join public.services s on s.id = cs.service_id
   where cs.id = p_client_service_id;

  if not found then
    return;
  end if;

  -- El alias de columna es `ordinal` y no `position` porque POSITION es palabra
  -- reservada de SQL y en una lista de alias habría que entrecomillarla.
  insert into public.client_service_stages (client_service_id, stage, position)
  select p_client_service_id, base.stage, base.ordinal
    from (values
      ('pre_produccion'::public.service_stage, 1::smallint),
      ('produccion',                           2::smallint),
      ('pos_produccion',                       3::smallint),
      ('correccion',                           4::smallint),
      ('entrega',                              5::smallint),
      ('publicacion',                          6::smallint),
      ('informe',                              7::smallint)
    ) as base (stage, ordinal)
   where v_manages_social or base.stage not in ('publicacion', 'informe')
  on conflict (client_service_id, stage) do nothing;

  -- Si el servicio deja de gestionar redes, las dos etapas extra sobran. Sólo
  -- se borran las que nadie ha cumplido todavía: un histórico ya marcado no se
  -- descarta por un cambio en el catálogo.
  if not v_manages_social then
    delete from public.client_service_stages
     where client_service_id = p_client_service_id
       and stage in ('publicacion', 'informe')
       and completed_at is null;
  end if;
end;
$$;

revoke execute on function public.sync_client_service_stages(uuid) from public, anon, authenticated;

-- 3.1 Al contratar un servicio se crean sus etapas
create or replace function public.seed_client_service_stages()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.sync_client_service_stages(new.id);
  return new;
end;
$$;

revoke execute on function public.seed_client_service_stages() from public, anon, authenticated;

drop trigger if exists seed_stages on public.client_services;
create trigger seed_stages
  after insert on public.client_services
  for each row execute function public.seed_client_service_stages();

-- 3.2 Cambiar `manages_social` en el catálogo re-sincroniza lo ya contratado
create or replace function public.resync_service_stages()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  for v_id in
    select cs.id from public.client_services cs where cs.service_id = new.id
  loop
    perform public.sync_client_service_stages(v_id);
  end loop;

  return new;
end;
$$;

revoke execute on function public.resync_service_stages() from public, anon, authenticated;

drop trigger if exists resync_stages on public.services;
create trigger resync_stages
  after update of manages_social on public.services
  for each row
  when (old.manages_social is distinct from new.manages_social)
  execute function public.resync_service_stages();

-- 3.3 Relleno de los servicios ya contratados antes de esta migración
do $$
declare
  v_id uuid;
begin
  for v_id in select id from public.client_services loop
    perform public.sync_client_service_stages(v_id);
  end loop;
end
$$;

-- -----------------------------------------------------------------------------
-- 3.4 La firma de la etapa la pone el servidor
-- -----------------------------------------------------------------------------
-- El cliente de la API sólo expresa la intención escribiendo `completed_at`; la
-- marca de tiempo real y el autor los decide Postgres. Así `completed_by` no se
-- puede falsificar ni hace falta concederlo en el `grant` de columnas.
create or replace function public.stamp_stage_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.completed_at is null then
    new.completed_by := null;
  elsif old.completed_at is null then
    new.completed_at := now();
    new.completed_by := (select auth.uid());
  else
    -- Ya estaba cumplida: se conserva la firma original.
    new.completed_at := old.completed_at;
    new.completed_by := old.completed_by;
  end if;

  return new;
end;
$$;

revoke execute on function public.stamp_stage_completion() from public, anon, authenticated;

drop trigger if exists stamp_completion on public.client_service_stages;
create trigger stamp_completion
  before update on public.client_service_stages
  for each row execute function public.stamp_stage_completion();

-- -----------------------------------------------------------------------------
-- 4. Quién puede marcar una etapa
-- -----------------------------------------------------------------------------
-- El superusuario, y el responsable asignado a ese servicio concreto. Un tutor
-- que no sea el responsable puede leer la trazabilidad, pero no firmarla: si
-- pudiera, `manager_id` no significaría nada.
create or replace function private.can_track_service(p_client_service_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.client_services cs
     where cs.id = p_client_service_id
       and (
         (select private.is_superuser())
         or cs.manager_id = (select auth.uid())
       )
  );
$$;

revoke execute on function private.can_track_service(uuid) from public, anon;
grant execute on function private.can_track_service(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 5. RLS
-- -----------------------------------------------------------------------------
alter table public.client_service_stages enable row level security;

-- Lectura: el cliente dueño del servicio, y el equipo interno.
drop policy if exists client_service_stages_select on public.client_service_stages;
create policy client_service_stages_select on public.client_service_stages
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

-- Escritura: sólo marcar o desmarcar etapas, y sólo quien responde por ellas.
-- No hay política de INSERT ni de DELETE: las filas las crea el trigger, que es
-- `security definer` y no pasa por RLS.
drop policy if exists client_service_stages_update on public.client_service_stages;
create policy client_service_stages_update on public.client_service_stages
  for update
  to authenticated
  using ((select private.can_track_service(client_service_id)))
  with check ((select private.can_track_service(client_service_id)));

grant select on public.client_service_stages to authenticated;

-- El grant es por columnas: sin esto, `for update` dejaría mover una etapa a
-- otro servicio reescribiendo `client_service_id`, o alterar su posición.
grant update (completed_at, notes) on public.client_service_stages to authenticated;
