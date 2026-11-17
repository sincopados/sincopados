<script setup lang="ts" generic="T extends { title: string }">
/**
 * Confirmación de borrado reutilizable: se abre mientras haya un `item`.
 * Sirve para cualquier registro con `title` (módulos, clases…).
 */
const item = defineModel<T | null>('item', { default: null })

defineProps<{
  /** Título del modal, p. ej. «Eliminar módulo». */
  title: string
  /** Aviso extra bajo la pregunta, p. ej. qué más se borra en cascada. */
  warning?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: [item: T]
}>()

const open = computed({
  get: () => !!item.value,
  set: (value: boolean) => {
    if (!value) item.value = null
  },
})

const cancel = () => {
  item.value = null
}

const confirm = () => {
  if (item.value) emit('confirm', item.value)
}
</script>

<template>
  <UModal v-model:open="open" :title="title">
    <template #body>
      <p class="text-muted">
        ¿Eliminar <span class="font-semibold text-highlighted">{{ item?.title }}</span>? Esta acción no se puede deshacer.
      </p>
      <p v-if="warning" class="mt-2 text-sm text-warning">{{ warning }}</p>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton label="Cancelar" color="neutral" variant="ghost" @click="cancel" />
        <UButton label="Eliminar" icon="i-lucide-trash-2" color="error" :loading="loading" @click="confirm" />
      </div>
    </template>
  </UModal>
</template>
