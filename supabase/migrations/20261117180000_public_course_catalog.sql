-- Catálogo público de cursos para /educacion.
--
-- Los visitantes sin sesión (`anon`) pueden leer los cursos activos, pero
-- sólo sus columnas públicas: la comisión de afiliados y el tutor asignado no
-- salen del panel. Los módulos y las clases siguen siendo sólo para alumnos
-- inscritos y staff.

-- `anon` tenía todos los privilegios de tabla por defecto (la RLS los frenaba
-- igual); se dejan sólo los de lectura de columnas públicas.
revoke all on public.courses from anon;
-- `is_active` también: el catálogo filtra por él, y filtrar exige poder leerlo.
grant select (id, title, slug, description, cover_url, price, currency, is_active, created_at)
  on public.courses to anon;

create policy courses_select_public on public.courses
  for select to anon
  using (is_active);
