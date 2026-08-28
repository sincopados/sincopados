/** Estado de una solicitud de retiro. Refleja el enum `withdrawal_status`. */
export type WithdrawalStatus = 'en_proceso' | 'procesado' | 'cancelado'

export const WITHDRAWAL_STATUSES = [
  'en_proceso',
  'procesado',
  'cancelado',
] as const satisfies readonly WithdrawalStatus[]

export const WITHDRAWAL_STATUS_LABELS: Record<WithdrawalStatus, string> = {
  en_proceso: 'En proceso',
  procesado: 'Procesado',
  cancelado: 'Cancelado',
}

export const WITHDRAWAL_STATUS_DESCRIPTIONS: Record<WithdrawalStatus, string> = {
  en_proceso: 'Recibimos tu solicitud y la estamos gestionando.',
  procesado: 'El pago de tus comisiones se realizó.',
  cancelado: 'La solicitud se canceló y tus comisiones volvieron al saldo disponible.',
}

export const WITHDRAWAL_STATUS_COLORS: Record<WithdrawalStatus, 'warning' | 'success' | 'error'> = {
  en_proceso: 'warning',
  procesado: 'success',
  cancelado: 'error',
}

export const WITHDRAWAL_STATUS_ICONS: Record<WithdrawalStatus, string> = {
  en_proceso: 'i-lucide-loader-circle',
  procesado: 'i-lucide-circle-check-big',
  cancelado: 'i-lucide-circle-x',
}

/** Plazo de entrega por defecto que se compromete al solicitar, en horas. */
export const DEFAULT_WITHDRAWAL_ETA_HOURS = 72

/** Momento estimado de pago: la solicitud más su plazo comprometido. */
export const withdrawalDueAt = (requestedAt: string, etaHours: number): Date =>
  new Date(new Date(requestedAt).getTime() + etaHours * 60 * 60 * 1000)

/** Horas que faltan para el plazo; negativo si ya venció. */
export const hoursUntilDue = (requestedAt: string, etaHours: number): number =>
  Math.round((withdrawalDueAt(requestedAt, etaHours).getTime() - Date.now()) / 3_600_000)
