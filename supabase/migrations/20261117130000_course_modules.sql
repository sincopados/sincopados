-- Módulos de cada curso.
--
-- Sólo el superusuario los crea, edita o borra. El staff (superusuario y tutor)
-- los ve todos; el resto de usuarios autenticados sólo los de cursos activos,
-- para cuando el alumno consuma el curso desde su panel.

-- -----------------------------------------------------------------------------
-- 1. Tabla
-- -----------------------------------------------------------------------------
create table if not exists public.course_modules (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses (id) on delete cascade,
  title        text not null check (char_length(trim(title)) between 2 and 160),
  -- Minúsculas, números y guiones simples; único dentro del curso.
  slug         text not null check (
                 char_length(slug) between 2 and 80
                 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
               ),
  description  text check (description is null or char_length(description) <= 2000),
  cover_url    text check (cover_url is null or cover_url ~* '^https?://'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- El índice de esta restricción empieza por `course_id`, así que también
  -- sirve para la FK y para listar los módulos de un curso: no hace falta otro.
  constraint course_modules_course_slug_key unique (course_id, slug)
);

create trigger set_updated_at
  before update on public.course_modules
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. RLS
-- -----------------------------------------------------------------------------
alter table public.course_modules enable row level security;

create policy course_modules_select on public.course_modules
  for select to authenticated
  using (
    (select private.is_staff())
    or exists (
      select 1 from public.courses c
      where c.id = course_modules.course_id and c.is_active
    )
  );

create policy course_modules_insert on public.course_modules
  for insert to authenticated
  with check ((select private.is_superuser()));

create policy course_modules_update on public.course_modules
  for update to authenticated
  using ((select private.is_superuser()))
  with check ((select private.is_superuser()));

create policy course_modules_delete on public.course_modules
  for delete to authenticated
  using ((select private.is_superuser()));

-- -----------------------------------------------------------------------------
-- 3. Permisos del Data API
-- -----------------------------------------------------------------------------
revoke all on public.course_modules from anon;
grant select, insert, update, delete on public.course_modules to authenticated;
