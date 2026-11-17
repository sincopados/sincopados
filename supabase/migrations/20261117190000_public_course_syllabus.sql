-- Temario público de los cursos para /educacion.
--
-- Muestra a cualquiera (con o sin sesión) los módulos activos de cada curso
-- activo —título, descripción y portada— y sólo el TÍTULO de sus clases
-- activas. El video, el contenido y el material de apoyo siguen siendo
-- exclusivos de alumnos inscritos y staff (RLS de `course_classes` y
-- `course_class_files`).
--
-- Es una función `security definer` a propósito: los privilegios por columna
-- no distinguen entre un usuario inscrito y uno que no lo está, así que no se
-- puede abrir `course_classes` sin exponer `video_url` o `content`. La función
-- devuelve una lista cerrada de campos y nada más. El linter de Supabase la
-- marcará como «SECURITY DEFINER ejecutable por anon»: es intencionado.

create or replace function public.course_syllabus(p_course_ids uuid[] default null)
returns table (course_id uuid, modules jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id as course_id,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', m.id,
            'title', m.title,
            'description', m.description,
            'cover_url', m.cover_url,
            'classes', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'id', cl.id,
                    'title', cl.title,
                    'has_video', cl.video_url is not null
                  )
                  order by cl.created_at
                )
                from public.course_classes cl
                where cl.module_id = m.id and cl.is_active
              ),
              '[]'::jsonb
            )
          )
          order by m.created_at
        )
        from public.course_modules m
        where m.course_id = c.id and m.is_active
      ),
      '[]'::jsonb
    ) as modules
  from public.courses c
  where c.is_active
    and (p_course_ids is null or c.id = any (p_course_ids));
$$;

revoke all on function public.course_syllabus(uuid[]) from public;
grant execute on function public.course_syllabus(uuid[]) to anon, authenticated;
