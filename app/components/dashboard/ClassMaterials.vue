<script setup lang="ts">
import type { CourseClassFile } from '~/types/db'

/**
 * Material de apoyo de una clase. Todos los que ven la clase pueden
 * descargarlo; sólo el superusuario sube y elimina archivos.
 */
const props = defineProps<{
  classId: string
  canManage?: boolean
}>()

const { files, previews, status, error, uploads, uploading, upload, dismissUpload, download, remove, removing }
  = useClassMaterials(() => props.classId)

// El selector se vacía en cuanto entrega archivos: la cola de abajo los sigue.
const picked = ref<File[]>([])
watch(picked, (list) => {
  if (!list?.length) return
  const batch = [...list]
  picked.value = []
  upload(batch)
})

const totalSize = computed(() => files.value.reduce((sum, f) => sum + f.size_bytes, 0))

const kindOf = (f: CourseClassFile) => classMaterialKindFromMime(f.mime_type)

const extensionLabel = (f: CourseClassFile) => fileExtension(f.name).toUpperCase()

const deleting = ref<(CourseClassFile & { title: string }) | null>(null)
const askDelete = (f: CourseClassFile) => {
  deleting.value = { ...f, title: f.name }
}
const onDelete = async (f: CourseClassFile) => {
  if (await remove(f)) deleting.value = null
}

const uploadLabel = (u: MaterialUpload) => {
  if (u.status === 'processing') return 'Preparando…'
  if (u.status === 'uploading') {
    return u.finalSize && u.finalSize < u.originalSize
      ? `Subiendo · ${formatBytes(u.originalSize)} → ${formatBytes(u.finalSize)}`
      : 'Subiendo…'
  }
  return u.error ?? ''
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="font-semibold">Material de apoyo</h2>
          <p class="text-sm text-muted">
            <template v-if="files.length">
              {{ files.length }} {{ files.length === 1 ? 'archivo' : 'archivos' }} · {{ formatBytes(totalSize) }}
            </template>
            <template v-else>Sin archivos todavía</template>
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <UFileUpload
        v-if="canManage"
        v-model="picked"
        multiple
        :accept="CLASS_MATERIAL_ACCEPT"
        :disabled="uploading"
        :preview="false"
        icon="i-lucide-upload"
        label="Arrastra archivos aquí o haz clic para elegirlos"
        :description="`${CLASS_MATERIAL_FORMATS_LABEL} · máx. 2 MB por archivo. Las imágenes se comprimen y convierten a WebP.`"
        class="min-h-36 w-full"
      />

      <!-- Cola de subida y errores -->
      <ul v-if="uploads.length" class="space-y-2" aria-live="polite">
        <li
          v-for="u in uploads"
          :key="u.id"
          class="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
          :class="u.status === 'error' ? 'border-error/40 bg-error/5' : 'border-default'"
        >
          <UIcon
            :name="u.status === 'error' ? 'i-lucide-circle-alert' : 'i-lucide-loader-circle'"
            class="size-4 shrink-0"
            :class="u.status === 'error' ? 'text-error' : 'animate-spin text-primary'"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium text-highlighted">{{ u.name }}</p>
            <p class="text-xs" :class="u.status === 'error' ? 'text-error' : 'text-muted'">{{ uploadLabel(u) }}</p>
          </div>
          <UButton
            v-if="u.status === 'error'"
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Descartar"
            @click="dismissUpload(u.id)"
          />
        </li>
      </ul>

      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="No se pudo cargar el material"
        :description="error.message"
      />

      <ul v-else-if="files.length" class="divide-y divide-default">
        <li v-for="f in files" :key="f.id" class="flex items-center gap-3 py-2.5">
          <div class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-elevated">
            <img
              v-if="kindOf(f) === 'image' && previews[f.storage_path]"
              :src="previews[f.storage_path]"
              :alt="f.name"
              loading="lazy"
              class="size-full object-cover"
            >
            <UIcon v-else :name="CLASS_MATERIAL_ICONS[kindOf(f)]" class="size-5 text-muted" />
          </div>

          <div class="min-w-0 flex-1">
            <button
              type="button"
              class="block max-w-full truncate text-left text-sm font-medium text-highlighted hover:text-primary"
              @click="download(f)"
            >
              {{ f.name }}
            </button>
            <p class="text-xs text-muted">{{ extensionLabel(f) }} · {{ formatBytes(f.size_bytes) }}</p>
          </div>

          <UButton
            icon="i-lucide-download"
            color="neutral"
            variant="ghost"
            size="sm"
            :aria-label="`Descargar ${f.name}`"
            @click="download(f)"
          />
          <UButton
            v-if="canManage"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            :loading="removing === f.id"
            :aria-label="`Eliminar ${f.name}`"
            @click="askDelete(f)"
          />
        </li>
      </ul>

      <div v-else-if="status === 'pending'" class="space-y-2">
        <USkeleton v-for="i in 2" :key="i" class="h-12 rounded-md" />
      </div>

      <p v-else-if="!canManage" class="text-sm italic text-dimmed">Esta clase no tiene material de apoyo.</p>
    </div>

    <DashboardDeleteModal
      v-model:item="deleting"
      title="Eliminar archivo"
      :loading="!!removing"
      @confirm="onDelete"
    />
  </UCard>
</template>
