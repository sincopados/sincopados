/** Medio por el que se paga un retiro. Refleja el enum `payout_method`. */
export type PayoutMethod = 'efectivo' | 'transferencia' | 'bre_b'

export const PAYOUT_METHODS = [
  'efectivo',
  'transferencia',
  'bre_b',
] as const satisfies readonly PayoutMethod[]

export const PAYOUT_METHOD_LABELS: Record<PayoutMethod, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  bre_b: 'Llave Bre-B',
}

export const PAYOUT_METHOD_DESCRIPTIONS: Record<PayoutMethod, string> = {
  efectivo: 'Se entrega en persona; no hace falta número de cuenta.',
  transferencia: 'A un banco o billetera digital.',
  bre_b: 'Pago inmediato con tu llave del sistema Bre-B.',
}

export const PAYOUT_METHOD_ICONS: Record<PayoutMethod, string> = {
  efectivo: 'i-lucide-banknote',
  transferencia: 'i-lucide-building-2',
  bre_b: 'i-lucide-key-round',
}

/**
 * Bancos y billeteras habituales en Colombia.
 *
 * Es una lista de conveniencia para el desplegable, no una validación: en la
 * base `provider` es texto libre, así que añadir una entidad nueva no exige
 * una migración. Por eso el selector deja escribir un valor que no esté aquí.
 */
export const PAYOUT_PROVIDERS = [
  // Billeteras y neobancos
  'Nequi',
  'Daviplata',
  'Lulo Bank',
  'Ualá',
  'Movii',
  'RappiPay',
  'Powwi',
  'Binance',
  // Bancos
  'Bancolombia',
  'Davivienda',
  'Banco de Bogotá',
  'BBVA Colombia',
  'Banco Popular',
  'Banco de Occidente',
  'Banco Caja Social',
  'Banco AV Villas',
  'Scotiabank Colpatria',
  'Itaú',
  'Banco Agrario',
  'Bancoomeva',
  'Banco Falabella',
  'Banco Pichincha',
  'Banco Serfinanza',
  'Confiar',
  'Coltefinanciera',
  'Bancamía',
  'Banco W',
  'Cooperativa Financiera de Antioquia',
] as const

/** Retiro mínimo, en pesos. Espejo de `v_min` en `request_commission_withdrawal`. */
export const MIN_WITHDRAWAL_AMOUNT = 10000

/** Resumen legible de una cuenta, para listarla y elegirla. */
export const describePayoutAccount = (account: {
  method: PayoutMethod
  provider?: string | null
  account_number?: string | null
}): string => {
  if (account.method === 'efectivo') return 'Efectivo'
  if (account.method === 'bre_b') return `Llave Bre-B ${account.account_number ?? ''}`.trim()
  return [account.provider, account.account_number].filter(Boolean).join(' · ')
}
