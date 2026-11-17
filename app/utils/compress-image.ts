/**
 * Comprime y convierte una imagen a WebP en el navegador, para que pese lo
 * menos posible y quepa en el límite de 2 MB del material de apoyo.
 *
 * Reduce primero el lado mayor a `maxSide` y la codifica con calidad 0.82;
 * si aún se pasa de `maxBytes`, baja la calidad y luego el tamaño hasta que
 * quepa. Si el navegador no sabe codificar WebP (Safari antiguo), usa JPEG.
 *
 * Devuelve `null` si no se consigue bajar del límite.
 */
export const compressImage = async (
  file: File,
  { maxBytes, maxSide = 1920 }: { maxBytes: number, maxSide?: number },
): Promise<File | null> => {
  const bitmap = await createImageBitmap(file)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('El navegador no permite procesar imágenes.')

  let type: 'image/webp' | 'image/jpeg' = 'image/webp'

  const encode = (side: number, quality: number) => {
    const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height))
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    // Fondo blanco: las transparencias de un PNG no se vuelven negras en JPEG.
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality))
  }

  try {
    let side = maxSide
    let quality = 0.82
    for (let attempt = 0; attempt < 10; attempt++) {
      const blob = await encode(side, quality)
      if (!blob) return null
      // `toBlob` devuelve PNG si no sabe codificar WebP: se pasa a JPEG.
      if (blob.type !== type) {
        type = 'image/jpeg'
        continue
      }
      if (blob.size <= maxBytes) {
        const ext = type === 'image/webp' ? 'webp' : 'jpg'
        const base = file.name.replace(/\.[^.]+$/, '')
        return new File([blob], `${base}.${ext}`, { type, lastModified: Date.now() })
      }
      // Primero calidad, después tamaño.
      if (quality > 0.6) quality -= 0.1
      else side = Math.round(side * 0.75)
    }
    return null
  }
  finally {
    bitmap.close()
  }
}
