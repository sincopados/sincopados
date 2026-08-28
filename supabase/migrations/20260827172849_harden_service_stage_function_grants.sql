-- La migración anterior revocó EXECUTE de `public, anon` en las funciones de
-- trazabilidad, pero se dejó fuera `authenticated` -- el mismo patrón que ya
-- corrigió `harden_function_execute_grants` para el resto de triggers. Sin
-- esto, cualquier usuario autenticado podía invocar
-- `sync_client_service_stages(uuid)` por RPC con un `client_service_id`
-- ajeno y forzar el sembrado o borrado de sus etapas.
revoke execute on function public.sync_client_service_stages(uuid) from authenticated;
revoke execute on function public.seed_client_service_stages() from authenticated;
revoke execute on function public.resync_service_stages() from authenticated;
revoke execute on function public.stamp_stage_completion() from authenticated;
