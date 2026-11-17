/**
 * Material de apoyo de las clases: qué se acepta y cuánto puede pesar.
 * Mismas reglas que el bucket `class-materials` y la tabla
 * `course_class_files` en Postgres.
 */

/** 2 MB: límite de cada archivo ya comprimido. */
export const CLASS_MATERIAL_MAX_BYTES = 2 * 1024 * 1024

export type ClassMaterialKind = 'pdf' | 'word' | 'excel' | 'csv' | 'image'

type MaterialType = { kind: ClassMaterialKind, mime: string }

/**
 * Tipo según la extensión, no según `file.type`: el navegador informa cosas
 * distintas para el mismo CSV o Excel según el sistema operativo.
 */
const BY_EXTENSION: Record<string, MaterialType> = {
  pdf: { kind: 'pdf', mime: 'application/pdf' },
  doc: { kind: 'word', mime: 'application/msword' },
  docx: { kind: 'word', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  xls: { kind: 'excel', mime: 'application/vnd.ms-excel' },
  xlsx: { kind: 'excel', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  csv: { kind: 'csv', mime: 'text/csv' },
  // Las imágenes se convierten a WebP antes de subir (ver compressImage).
  jpg: { kind: 'image', mime: 'image/jpeg' },
  jpeg: { kind: 'image', mime: 'image/jpeg' },
  png: { kind: 'image', mime: 'image/png' },
  webp: { kind: 'image', mime: 'image/webp' },
}

/** Para el `accept` del selector de archivos. */
export const CLASS_MATERIAL_ACCEPT = Object.keys(BY_EXTENSION).map(ext => `.${ext}`).join(',')

export const CLASS_MATERIAL_FORMATS_LABEL = 'PDF, Word, Excel, CSV o imágenes (JPG, PNG, WebP)'

export const fileExtension = (name: string) => name.split('.').pop()?.toLowerCase() ?? ''

export const classMaterialType = (name: string): MaterialType | null => BY_EXTENSION[fileExtension(name)] ?? null

/** Tipo de material a partir del MIME guardado, para elegir el ícono. */
export const classMaterialKindFromMime = (mime: string): ClassMaterialKind => {
  if (mime.startsWith('image/')) return 'image'
  if (mime === 'application/pdf') return 'pdf'
  if (mime === 'text/csv') return 'csv'
  if (mime.includes('word')) return 'word'
  return 'excel'
}

export const CLASS_MATERIAL_ICONS: Record<ClassMaterialKind, string> = {
  pdf: 'i-lucide-file-text',
  word: 'i-lucide-file-type',
  excel: 'i-lucide-file-spreadsheet',
  csv: 'i-lucide-sheet',
  image: 'i-lucide-file-image',
}

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

/** Nombre seguro para la ruta en Storage, conservando la extensión. */
export const storageSafeName = (name: string) => {
  const ext = fileExtension(name)
  const base = slugify(name.slice(0, name.length - ext.length - 1)) || 'archivo'
  return `${base.slice(0, 60)}.${ext}`
}
