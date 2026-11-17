-- Material de apoyo de cada clase: PDF, Word, Excel, CSV e imágenes.
--
-- Los archivos viven en el bucket privado `class-materials`, en la ruta
-- `<class_id>/<uuid>-<nombre>`. La tabla `course_class_files` guarda su ficha
-- y decide quién los ve: quien puede ver la clase (RLS de `course_classes`)
-- puede ver y descargar su material; sólo el superusuario sube o borra.
--
-- Límite de 2 MB por archivo, aplicado en tres sitios: el formulario (que
-- además comprime y convierte las imágenes a WebP), el bucket y la tabla.

-- -----------------------------------------------------------------------------
-- 1. Bucket
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'class-materials',
  'class-materials',
  false,
  2097152,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'image/webp',
    'image/jpeg'
  ]
)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 2. Ficha de cada archivo
-- -----------------------------------------------------------------------------
create table if not exists public.course_class_files (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references public.course_classes (id) on delete cascade,
  -- Nombre que ve el alumno y con el que se descarga.
  name          text not null check (char_length(trim(name)) between 1 and 200),
  storage_path  text not null unique,
  mime_type     text not null,
  size_bytes    integer not null check (size_bytes > 0 and size_bytes <= 2097152),
  created_by    uuid references auth.users (id) on delete set null default auth.uid(),
  created_at    timestamptz not null default now()
);

-- Cubre la FK y el listado del material de una clase en orden de subida.
create index if not exists course_class_files_class_id_created_at_idx
  on public.course_class_files (class_id, created_at);

create index if not exists course_class_files_created_by_idx
  on public.course_class_files (created_by);

alter table public.course_class_files enable row level security;

-- La subconsulta pasa por la RLS de `course_classes`: el material sigue la
-- visibilidad de su clase (staff todo; alumnos sólo lo activo).
create policy course_class_files_select on public.course_class_files
  for select to authenticated
  using (
    exists (
      select 1 from public.course_classes c
      where c.id = course_class_files.class_id
    )
  );

create policy course_class_files_insert on public.course_class_files
  for insert to authenticated
  with check ((select private.is_superuser()));

create policy course_class_files_delete on public.course_class_files
  for delete to authenticated
  using ((select private.is_superuser()));

revoke all on public.course_class_files from anon;
grant select, insert, delete on public.course_class_files to authenticated;

-- -----------------------------------------------------------------------------
-- 3. Objetos del bucket
-- -----------------------------------------------------------------------------
-- Descargar: sólo si el archivo está registrado en una ficha visible.
create policy class_materials_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'class-materials'
    and exists (
      select 1 from public.course_class_files f
      where f.storage_path = storage.objects.name
    )
  );

create policy class_materials_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'class-materials' and (select private.is_superuser()));

create policy class_materials_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'class-materials' and (select private.is_superuser()));

-- El staff lee siempre los objetos del bucket: así puede retirar un archivo
-- después de borrar su ficha (aplicada aparte como `class_materials_staff_select`).
alter policy class_materials_select on storage.objects
  using (
    bucket_id = 'class-materials'
    and (
      (select private.is_staff())
      or exists (
        select 1 from public.course_class_files f
        where f.storage_path = storage.objects.name
      )
    )
  );
