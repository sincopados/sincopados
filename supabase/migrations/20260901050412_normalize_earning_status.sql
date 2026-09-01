-- Normaliza el estado de las comisiones tras el cambio a libro mayor.
--
-- Antes de `payout_accounts`, resolver un retiro marcaba sus comisiones como
-- `pagado`. Con el libro mayor eso dejó de hacerse: lo retirado se cuenta
-- sumando los tickets, y una comisión sólo describe la regla de negocio
-- (`pendiente` mientras el servicio no esté pagado y entregado, `aprobado`
-- cuando lo está).
--
-- Las filas que quedaron en `pagado` rompen la aritmética del saldo:
--
--   disponible = aprobadas − (en proceso + procesadas)
--
-- Una comisión en `pagado` no suma en «aprobadas», así que su importe se
-- descuenta dos veces. En la práctica: si se cancelase el retiro asociado, el
-- dinero desaparecería del saldo del afiliado en vez de volver a estar
-- disponible.
update public.referral_earnings
   set status = 'aprobado'
 where status = 'pagado';

-- Y se recalcula la elegibilidad de todo, por si alguna quedó en un estado que
-- ya no corresponde a su servicio.
do $$
declare
  v_id uuid;
begin
  for v_id in select id from public.client_services loop
    perform public.refresh_referral_eligibility(v_id);
  end loop;
end
$$;
