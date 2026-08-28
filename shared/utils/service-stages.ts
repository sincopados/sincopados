/** Etapas de trazabilidad de un servicio. Refleja el enum `service_stage`. */
export type ServiceStage
  = | 'pre_produccion'
    | 'produccion'
    | 'pos_produccion'
    | 'correccion'
    | 'entrega'
    | 'publicacion'
    | 'informe'

/** Etapas que recorre todo servicio contratado, en orden. */
export const BASE_SERVICE_STAGES = [
  'pre_produccion',
  'produccion',
  'pos_produccion',
  'correccion',
  'entrega',
] as const satisfies readonly ServiceStage[]

/** Etapas que se añaden cuando el servicio gestiona redes sociales. */
export const SOCIAL_SERVICE_STAGES = [
  'publicacion',
  'informe',
] as const satisfies readonly ServiceStage[]

export const SERVICE_STAGES = [
  ...BASE_SERVICE_STAGES,
  ...SOCIAL_SERVICE_STAGES,
] as const satisfies readonly ServiceStage[]

export const SERVICE_STAGE_LABELS: Record<ServiceStage, string> = {
  pre_produccion: 'Preproducción',
  produccion: 'Producción',
  pos_produccion: 'Posproducción',
  correccion: 'Corrección',
  entrega: 'Entrega',
  publicacion: 'Publicación',
  informe: 'Informe',
}

export const SERVICE_STAGE_DESCRIPTIONS: Record<ServiceStage, string> = {
  pre_produccion: 'Guion, plan de rodaje y preparación de la grabación.',
  produccion: 'Rodaje y captura del material.',
  pos_produccion: 'Montaje, color, sonido y grafismo.',
  correccion: 'Ajustes sobre la versión revisada por el cliente.',
  entrega: 'Envío de los archivos finales.',
  publicacion: 'Publicación de las piezas en las redes acordadas.',
  informe: 'Informe de resultados y métricas de la campaña.',
}

export const SERVICE_STAGE_ICONS: Record<ServiceStage, string> = {
  pre_produccion: 'i-lucide-clipboard-list',
  produccion: 'i-lucide-video',
  pos_produccion: 'i-lucide-clapperboard',
  correccion: 'i-lucide-pencil-ruler',
  entrega: 'i-lucide-package-check',
  publicacion: 'i-lucide-send',
  informe: 'i-lucide-chart-line',
}

/**
 * Espejo en TypeScript de `public.sync_client_service_stages()`.
 *
 * La base de datos sigue siendo la fuente de verdad: esto sólo sirve para saber
 * qué se espera ver antes de que lleguen las filas.
 */
export const stagesFor = (managesSocial: boolean): readonly ServiceStage[] =>
  managesSocial ? SERVICE_STAGES : BASE_SERVICE_STAGES
