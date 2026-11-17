import type { CourseClassFile, Database } from '~/types/db'

export const CLASS_MATERIALS_BUCKET = 'class-materials'

/** Estado de cada archivo de la cola de subida, para la interfaz. */
export type MaterialUpload = {
  id: string
  name: string
  status: 'processing' | 'uploading' | 'done' | 'error'
  /** Tamaño original y, si era una imagen, el comprimido. */
  originalSize: number
  finalSize?: number
  error?: string
}

/**
 * Material de apoyo de una clase: listar, subir, descargar y borrar.
 *
 * Cada archivo vive en el bucket privado `class-materials` y tiene una ficha
 * en `course_class_files`. Las imágenes se comprimen y se convierten a WebP en
 * el navegador antes de subir; todo archivo debe quedar en 2 MB o menos.
 */
export const useClassMaterials = (classId: MaybeRefOrGetter<string | null | undefined>) => {
  const client = useSupabaseClient<Database>()
  const toast = useToast()
  const id = computed(() => toValue(classId) ?? null)

  const { data: files, status, error, refresh } = useAsyncData(
    () => `class-materials-${id.value ?? 'none'}`,
    async () => {
      if (!id.value) return []
      const { data, error } = await client
        .from('course_class_files')
        .select('*')
        .eq('class_id', id.value)
        .order('created_at')
      if (error) throw error
      return data
    },
    { watch: [id], default: () => [] as CourseClassFile[] },
  )

  /* --- Subida --- */

  const uploads = ref<MaterialUpload[]>([])
  const uploading = computed(() => uploads.value.some(u => u.status === 'processing' || u.status === 'uploading'))

  const patch = (uploadId: string, changes: Partial<MaterialUpload>) => {
    const item = uploads.value.find(u => u.id === uploadId)
    if (item) Object.assign(item, changes)
  }

  /** Valida, comprime si es imagen y deja el archivo listo para subir. */
  const prepare = async (file: File): Promise<{ file: File, mime: string } | string> => {
    const type = classMaterialType(file.name)
    if (!type) return `Formato no permitido. Usa ${CLASS_MATERIAL_FORMATS_LABEL}.`

    if (type.kind === 'image') {
      try {
        const compressed = await compressImage(file, { maxBytes: CLASS_MATERIAL_MAX_BYTES })
        if (!compressed) return 'No se pudo comprimir la imagen por debajo de 2 MB.'
        return { file: compressed, mime: compressed.type }
      }
      catch {
        return 'No se pudo leer la imagen.'
      }
    }

    if (file.size > CLASS_MATERIAL_MAX_BYTES) {
      return `Pesa ${formatBytes(file.size)}; el máximo es 2 MB.`
    }
    return { file, mime: type.mime }
  }

  const uploadOne = async (file: File, classIdValue: string, uploadId: string) => {
    const prepared = await prepare(file)
    if (typeof prepared === 'string') {
      patch(uploadId, { status: 'error', error: prepared })
      return false
    }

    patch(uploadId, { status: 'uploading', finalSize: prepared.file.size })
    const path = `${classIdValue}/${crypto.randomUUID()}-${storageSafeName(prepared.file.name)}`

    const { error: uploadError } = await client.storage
      .from(CLASS_MATERIALS_BUCKET)
      .upload(path, prepared.file, { contentType: prepared.mime, upsert: false })
    if (uploadError) {
      patch(uploadId, { status: 'error', error: uploadError.message })
      return false
    }

    const { error: insertError } = await client.from('course_class_files').insert({
      class_id: classIdValue,
      name: prepared.file.name,
      storage_path: path,
      mime_type: prepared.mime,
      size_bytes: prepared.file.size,
    })
    if (insertError) {
      // Sin ficha el archivo quedaría huérfano e invisible: se retira.
      await client.storage.from(CLASS_MATERIALS_BUCKET).remove([path])
      patch(uploadId, { status: 'error', error: insertError.message })
      return false
    }

    patch(uploadId, { status: 'done' })
    return true
  }

  /** Sube varios archivos a la vez; cada uno informa su propio resultado. */
  const upload = async (list: File[]) => {
    const classIdValue = id.value
    if (!classIdValue || !list.length) return

    const batch = list.map(file => ({
      file,
      item: {
        id: crypto.randomUUID(),
        name: file.name,
        status: 'processing',
        originalSize: file.size,
      } satisfies MaterialUpload,
    }))
    // Lo nuevo arriba; lo terminado de tandas anteriores se descarta.
    uploads.value = [...batch.map(b => b.item), ...uploads.value.filter(u => u.status === 'error')]

    const results = await Promise.all(batch.map(b => uploadOne(b.file, classIdValue, b.item.id)))
    const ok = results.filter(Boolean).length
    const failed = results.length - ok

    if (ok) {
      await refresh()
      toast.add({ title: ok === 1 ? 'Archivo subido' : `${ok} archivos subidos`, color: 'success' })
    }
    if (failed) {
      toast.add({
        title: failed === 1 ? 'Un archivo no se pudo subir' : `${failed} archivos no se pudieron subir`,
        description: 'Revisa el motivo en la lista.',
        color: 'error',
      })
    }
    // Los correctos ya aparecen en el listado: sólo se quedan los errores.
    uploads.value = uploads.value.filter(u => u.status !== 'done')
  }

  const dismissUpload = (uploadId: string) => {
    uploads.value = uploads.value.filter(u => u.id !== uploadId)
  }

  /* --- Descarga y vista previa --- */

  /** Enlace firmado de un minuto que descarga con el nombre original. */
  const download = async (file: CourseClassFile) => {
    const { data, error } = await client.storage
      .from(CLASS_MATERIALS_BUCKET)
      .createSignedUrl(file.storage_path, 60, { download: file.name })
    if (error || !data) {
      toast.add({ title: 'No se pudo descargar', description: error?.message, color: 'error' })
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  /** Miniaturas de las imágenes: enlaces firmados de una hora, en una sola llamada. */
  const { data: previews } = useAsyncData(
    () => `class-materials-previews-${id.value ?? 'none'}`,
    async () => {
      const paths = files.value.filter(f => f.mime_type.startsWith('image/')).map(f => f.storage_path)
      if (!paths.length) return {} as Record<string, string>
      const { data } = await client.storage.from(CLASS_MATERIALS_BUCKET).createSignedUrls(paths, 3600)
      return Object.fromEntries((data ?? []).flatMap(d => (d.path && d.signedUrl ? [[d.path, d.signedUrl]] : [])))
    },
    { watch: [files], server: false, default: () => ({}) as Record<string, string> },
  )

  /* --- Borrado --- */

  const removing = ref<string | null>(null)

  const remove = async (file: CourseClassFile) => {
    removing.value = file.id
    try {
      // Primero la ficha: si falla, el archivo sigue siendo accesible y coherente.
      const { error: rowError } = await client.from('course_class_files').delete().eq('id', file.id)
      if (rowError) {
        toast.add({ title: 'No se pudo eliminar el archivo', description: rowError.message, color: 'error' })
        return false
      }
      await client.storage.from(CLASS_MATERIALS_BUCKET).remove([file.storage_path])
      toast.add({ title: 'Archivo eliminado', color: 'success' })
      await refresh()
      return true
    }
    finally {
      removing.value = null
    }
  }

  return { files, previews, status, error, refresh, uploads, uploading, upload, dismissUpload, download, remove, removing }
}

/**
 * Borra del bucket los archivos de una o varias clases antes de borrarlas:
 * el `on delete cascade` limpia las fichas, pero no el Storage.
 */
export const removeClassMaterialObjects = async (
  client: ReturnType<typeof useSupabaseClient<Database>>,
  filter: { classId: string } | { moduleId: string },
) => {
  const query = 'classId' in filter
    ? client.from('course_class_files').select('storage_path').eq('class_id', filter.classId)
    : client.from('course_class_files').select('storage_path, course_classes!inner(module_id)').eq('course_classes.module_id', filter.moduleId)

  const { data } = await query
  const paths = (data ?? []).map(f => f.storage_path)
  if (paths.length) await client.storage.from(CLASS_MATERIALS_BUCKET).remove(paths)
}
