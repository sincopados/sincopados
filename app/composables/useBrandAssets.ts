/**
 * Catálogo del kit de marca publicado en `public/marca/`.
 *
 * Los SVG se generan a partir de los componentes de `app/components/icons/`
 * sustituyendo `currentColor` por el color de cada versión, y los PNG son su
 * rasterizado con fondo transparente.
 */

export type BrandTone = 'negro' | 'dorado' | 'blanco'
export type BrandGroup = 'isotipo' | 'vertical' | 'horizontal'

export interface BrandAsset {
  id: string
  group: BrandGroup
  tone: BrandTone
  /** Etiqueta de la versión cromática. */
  label: string
  /** Color de la marca en esta versión. */
  hex: string
  /** Fondo sobre el que debe presentarse y previsualizarse. */
  background: string
  /** Ancho del PNG exportado, en píxeles. */
  pngWidth: number
  svg: string
  png: string
}

const TONES: Array<{ tone: BrandTone, label: string, hex: string, background: string }> = [
  { tone: 'negro', label: 'Negro', hex: '#000000', background: '#FFFFFF' },
  { tone: 'blanco', label: 'Blanco', hex: '#FFFFFF', background: '#0A0A0A' },
  { tone: 'dorado', label: 'Dorado', hex: '#D4AA00', background: '#141414' },
]

const GROUPS: Array<{ group: BrandGroup, file: string, pngWidth: number }> = [
  { group: 'isotipo', file: 'isotipo', pngWidth: 1200 },
  { group: 'vertical', file: 'logo-vertical', pngWidth: 1400 },
  { group: 'horizontal', file: 'logo-horizontal', pngWidth: 2000 },
]

const ASSETS: BrandAsset[] = GROUPS.flatMap(({ group, file, pngWidth }) =>
  TONES.map(({ tone, label, hex, background }) => ({
    id: `${group}-${tone}`,
    group,
    tone,
    label,
    hex,
    background,
    pngWidth,
    svg: `/marca/sincopados-${file}-${tone}.svg`,
    png: `/marca/sincopados-${file}-${tone}.png`,
  })),
)

export const BRAND_KIT_ZIP = '/marca/sincopados-kit-marca.zip'

export interface BrandColor {
  name: string
  hex: string
  cmyk: string
  /** `true` cuando el color necesita texto oscuro encima. */
  light?: boolean
}

export const BRAND_COLORS: BrandColor[] = [
  { name: 'Blanco', hex: '#FFFFFF', cmyk: 'C 0 · M 0 · Y 0 · K 0', light: true },
  { name: 'Negro', hex: '#000000', cmyk: 'C 0 · M 0 · Y 0 · K 100' },
  { name: 'Dorado', hex: '#D4AA00', cmyk: 'C 0 · M 28 · Y 100 · K 17', light: true },
]

export function useBrandAssets() {
  const byGroup = (group: BrandGroup) => ASSETS.filter(asset => asset.group === group)

  return { assets: ASSETS, byGroup, colors: BRAND_COLORS, zip: BRAND_KIT_ZIP }
}
