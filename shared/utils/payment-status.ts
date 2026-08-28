/** Estado de pago de un servicio contratado. Refleja el enum `payment_status`. */
export type PaymentStatus = 'espera' | 'inicial' | 'debe' | 'pagado'

export const PAYMENT_STATUSES = [
  'espera',
  'inicial',
  'debe',
  'pagado',
] as const satisfies readonly PaymentStatus[]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  espera: 'En espera',
  inicial: 'Abono inicial',
  debe: 'Pendiente de saldo',
  pagado: 'Pagado',
}

export const PAYMENT_STATUS_DESCRIPTIONS: Record<PaymentStatus, string> = {
  espera: 'Todavía no se ha recibido ningún pago.',
  inicial: 'Se recibió el abono inicial acordado.',
  debe: 'Quedan cuotas por cobrar.',
  pagado: 'El servicio está saldado por completo.',
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, 'neutral' | 'warning' | 'info' | 'success'> = {
  espera: 'neutral',
  inicial: 'info',
  debe: 'warning',
  pagado: 'success',
}

export const PAYMENT_STATUS_ICONS: Record<PaymentStatus, string> = {
  espera: 'i-lucide-clock',
  inicial: 'i-lucide-hand-coins',
  debe: 'i-lucide-circle-alert',
  pagado: 'i-lucide-circle-check-big',
}
