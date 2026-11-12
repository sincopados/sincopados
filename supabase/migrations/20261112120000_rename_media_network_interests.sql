-- Nuevas vertientes de Sincopados Media Network.
--
-- Se renombran los valores del enum en lugar de recrearlo: las postulaciones
-- ya guardadas pasan a la vertiente nueva más cercana sin tocar las filas.
--
--   trabaja_con_nosotros → trabajo_remoto
--   bodega_contenidos    → produccion_contenido
--   programa_afiliados   → monetizacion
--   clases_edicion       → publicacion_lanzamiento

alter type public.media_network_interest rename value 'trabaja_con_nosotros' to 'trabajo_remoto';
alter type public.media_network_interest rename value 'bodega_contenidos' to 'produccion_contenido';
alter type public.media_network_interest rename value 'programa_afiliados' to 'monetizacion';
alter type public.media_network_interest rename value 'clases_edicion' to 'publicacion_lanzamiento';
