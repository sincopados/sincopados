-- Acceso de solo lectura del alumno al contenido de sus cursos.
--
-- Antes cualquier usuario autenticado veía los módulos y clases activos de un
-- curso activo. Ahora, además del staff, sólo quien tiene una inscripción
-- activa o completada en ese curso. El material de apoyo y sus archivos
-- heredan esta regla porque sus políticas pasan por `course_classes`.
--
-- Escribir sigue siendo exclusivo del superusuario: no se toca ninguna
-- política de insert, update o delete.

-- -----------------------------------------------------------------------------
-- 1. ¿El usuario actual está inscrito en el curso?
-- -----------------------------------------------------------------------------
-- `security definer` para no encadenar la RLS de `enrollments` en cada fila;
-- vive en `private`, que no expone el Data API.
create or replace function private.is_enrolled(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.enrollments e
    where e.course_id = p_course_id
      and e.student_id = (select auth.uid())
      and e.status in ('activo', 'completado')
  );
$$;

revoke all on function private.is_enrolled(uuid) from public, anon;
grant execute on function private.is_enrolled(uuid) to authenticated;

-- La búsqueda usa el índice único `enrollments_student_id_course_id_key`.

-- -----------------------------------------------------------------------------
-- 2. Módulos y clases: staff o alumno inscrito
-- -----------------------------------------------------------------------------
alter policy course_modules_select on public.course_modules
  using (
    (select private.is_staff())
    or (
      is_active
      and private.is_enrolled(course_id)
      and exists (
        select 1 from public.courses c
        where c.id = course_modules.course_id and c.is_active
      )
    )
  );

alter policy course_classes_select on public.course_classes
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
          and private.is_enrolled(c.id)
      )
    )
  );
