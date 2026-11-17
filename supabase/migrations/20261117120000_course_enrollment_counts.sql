-- Alumnos inscritos por curso, para el dashboard de superusuario y tutor.
--
-- `security_invoker` hace que la vista se evalúe con los permisos de quien
-- consulta: la RLS de `courses` y `enrollments` sigue decidiendo qué filas
-- cuentan. El staff ve todos los cursos y todas las inscripciones; cualquier
-- otro usuario sólo vería los cursos activos con sus propias inscripciones.

create or replace view public.course_enrollment_counts
with (security_invoker = true) as
select
  c.id as course_id,
  c.title,
  c.slug,
  c.is_active,
  c.tutor_id,
  count(e.id)::int as total,
  (count(e.id) filter (where e.status = 'activo'))::int as active,
  (count(e.id) filter (where e.status = 'completado'))::int as completed,
  (count(e.id) filter (where e.status = 'cancelado'))::int as cancelled
from public.courses c
left join public.enrollments e on e.course_id = c.id
group by c.id;

revoke all on public.course_enrollment_counts from anon;
grant select on public.course_enrollment_counts to authenticated;
