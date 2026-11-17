/** Número de atención por WhatsApp (el mismo del botón flotante). */
export const WHATSAPP_PHONE = '573105720977'

/** Enlace a WhatsApp con un mensaje ya escrito. */
export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
