-- Las políticas `for all` también aplican a SELECT, así que cada lectura
-- evaluaba dos políticas permisivas (la de lectura y la de escritura).
-- Se separan por acción para que el SELECT sólo pase por `*_select`.
do $$
declare
  t text;
begin
  foreach t in array array['services', 'courses', 'client_services', 'enrollments']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_write', t);

    execute format(
      'create policy %I on public.%I for insert to authenticated
       with check ((select private.is_staff()))', t || '_insert', t);

    execute format(
      'create policy %I on public.%I for update to authenticated
       using ((select private.is_staff())) with check ((select private.is_staff()))',
      t || '_update', t);

    execute format(
      'create policy %I on public.%I for delete to authenticated
       using ((select private.is_staff()))', t || '_delete', t);
  end loop;
end
$$;
