/** Redes que puede gestionar un servicio. Refleja el enum `social_network`. */
export type SocialNetwork = 'facebook' | 'instagram' | 'tiktok' | 'linkedin' | 'x' | 'youtube'

export const SOCIAL_NETWORKS = [
  'facebook',
  'instagram',
  'tiktok',
  'linkedin',
  'x',
  'youtube',
] as const satisfies readonly SocialNetwork[]

export const SOCIAL_NETWORK_LABELS: Record<SocialNetwork, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  x: 'X',
  youtube: 'YouTube',
}

export const SOCIAL_NETWORK_ICONS: Record<SocialNetwork, string> = {
  facebook: 'i-simple-icons-facebook',
  instagram: 'i-simple-icons-instagram',
  tiktok: 'i-simple-icons-tiktok',
  linkedin: 'i-simple-icons-linkedin',
  x: 'i-simple-icons-x',
  youtube: 'i-simple-icons-youtube',
}

/**
 * Convierte un nombre en un slug: sin acentos, en minúsculas y con guiones.
 * El catálogo lo deriva del nombre para que nadie tenga que escribirlo.
 */
export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
