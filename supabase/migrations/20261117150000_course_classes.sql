-- Estado de los módulos y clases dentro de cada módulo.
--
-- Igual que los módulos: el superusuario escribe, el staff lo ve todo y el
-- resto de usuarios autenticados sólo ve lo activo de cursos activos.

-- -----------------------------------------------------------------------------
-- 1. Estado del módulo
-- -----------------------------------------------------------------------------
alter table public.course_modules
  add column if not exists is_active boolean not null default true;

-- Un módulo inactivo deja de verse para los alumnos (el staff lo sigue viendo).
alter policy course_modules_select on public.course_modules
  using (
    (select private.is_staff())
    or (
      is_active
      and exists (
        select 1 from public.courses c
        where c.id = course_modules.course_id and c.is_active
      )
    )
  );

-- -----------------------------------------------------------------------------
-- 2. Clases
-- -----------------------------------------------------------------------------
create table if not exists public.course_classes (
  id           uuid primary key default gen_random_uuid(),
  module_id    uuid not null references public.course_modules (id) on delete cascade,
  title        text not null check (char_length(trim(title)) between 2 and 160),
  -- Único en todo el sistema (índice más abajo): la URL de la clase lo usa.
  slug         text not null check (
                 char_length(slug) between 2 and 80
                 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
               ),
  description  text check (description is null or char_length(description) <= 2000),
  cover_url    text check (cover_url is null or cover_url ~* '^https?://'),
  video_url    text check (video_url is null or video_url ~* '^https?://'),
  content      text check (content is null or char_length(content) <= 50000),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index if not exists course_classes_slug_key
  on public.course_classes (slug);

-- Cubre la FK y el listado de clases de un módulo en orden de alta.
create index if not exists course_classes_module_id_created_at_idx
  on public.course_classes (module_id, created_at);

create trigger set_updated_at
  before update on public.course_classes
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. RLS
-- -----------------------------------------------------------------------------
alter table public.course_classes enable row level security;

create policy course_classes_select on public.course_classes
  for select to authenticated
  using (
    (select private.is_staff())
    or (
      is_active
      and exists (
        select 1
        from public.course_modules m
        join public.courses c on c.id = m.course_id
        where m.id = course_classes.module_id
          and m.is_active
          and c.is_active
      )
    )
  );

create policy course_classes_insert on public.course_classes
  for insert to authenticated
  with check ((select private.is_superuser()));

create policy course_classes_update on public.course_classes
  for update to authenticated
  using ((select private.is_superuser()))
  with check ((select private.is_superuser()));

create policy course_classes_delete on public.course_classes
  for delete to authenticated
  using ((select private.is_superuser()));

-- -----------------------------------------------------------------------------
-- 4. Permisos del Data API
-- -----------------------------------------------------------------------------
revoke all on public.course_classes from anon;
grant select, insert, update, delete on public.course_classes to authenticated;
