export const  formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(value );
}

/**
 * Precio de un curso en su propia moneda (COP sin decimales, por ejemplo).
 * Un precio 0 se muestra como «Gratis».
 */
export const formatCoursePrice = (value: number, currency = 'COP') => {
  if (!value) return 'Gratis'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'COP' ? 0 : 2,
  }).format(value)
}
