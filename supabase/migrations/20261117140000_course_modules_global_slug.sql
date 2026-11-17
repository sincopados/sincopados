-- El slug de un módulo es único en todo el sistema, no sólo dentro de su curso:
-- identifica al módulo en la URL y no se puede repetir.
--
-- La restricción `course_modules_course_slug_key (course_id, slug)` se conserva:
-- ya no añade unicidad, pero su índice, que empieza por `course_id`, es el que
-- cubre la FK y el listado de módulos de un curso.
create unique index if not exists course_modules_slug_key
  on public.course_modules (slug);
