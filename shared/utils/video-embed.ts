/** Cómo mostrar un video según su URL. */
export type VideoSource =
  | { kind: 'iframe', src: string, provider: 'youtube' | 'vimeo' | 'drive' }
  | { kind: 'file', src: string }
  | { kind: 'link', src: string }

const YOUTUBE_ID = /^[\w-]{11}$/

/**
 * Traduce la URL que pega el superusuario a algo reproducible: el reproductor
 * embebido de YouTube, Vimeo o Google Drive, un `<video>` para archivos
 * directos, o un simple enlace si no se reconoce.
 */
export const toVideoSource = (raw: string): VideoSource | null => {
  let url: URL
  try {
    url = new URL(raw.trim())
  }
  catch {
    return null
  }

  const host = url.hostname.replace(/^(www\.|m\.)/, '')

  if (host === 'youtu.be' || host.endsWith('youtube.com') || host === 'youtube-nocookie.com') {
    const id = host === 'youtu.be'
      ? url.pathname.slice(1)
      : url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]
    if (id && YOUTUBE_ID.test(id)) {
      return { kind: 'iframe', provider: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}` }
    }
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = url.pathname.match(/(\d{6,})/)?.[1]
    if (id) return { kind: 'iframe', provider: 'vimeo', src: `https://player.vimeo.com/video/${id}` }
  }

  if (host === 'drive.google.com') {
    const id = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1]
    if (id) return { kind: 'iframe', provider: 'drive', src: `https://drive.google.com/file/d/${id}/preview` }
  }

  if (/\.(mp4|webm|ogg|mov|m3u8)$/i.test(url.pathname)) return { kind: 'file', src: url.href }

  return { kind: 'link', src: url.href }
}
