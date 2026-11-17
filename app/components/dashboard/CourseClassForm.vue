<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  /** Valores iniciales; sin ellos el formulario es de alta. */
  initial?: CourseClassFormState
  /** Id de la clase que se edita, para no contarla como slug repetido. */
  classId?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CourseClassFormData]
  cancel: []
}>()

const state = reactive<CourseClassFormState>({ ...(props.initial ?? emptyCourseClass()) })
const editing = computed(() => !!props.initial)

// En el alta el slug sigue al título hasta que alguien lo edita a mano.
const slugTouched = ref(editing.value)
watch(() => state.title, (title) => {
  if (!slugTouched.value) state.slug = slugify(title)
})

// Único en todo el sistema: se comprueba antes de guardar.
const { validateSlug } = useSlugAvailability('course_classes', () => props.classId)

const coverOk = ref(true)
watch(() => state.cover_url, () => { coverOk.value = true })

const video = computed(() => (state.video_url ? toVideoSource(state.video_url) : null))

const onSubmit = (event: FormSubmitEvent<CourseClassFormData>) => emit('submit', event.data)
</script>

<template>
  <UForm
    :schema="courseClassSchema"
    :validate="validateSlug"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormField label="Título" name="title" required>
      <UInput v-model="state.title" placeholder="Clase 1: tu primer corte" class="w-full" autofocus />
    </UFormField>

    <UFormField label="Slug" name="slug" required help="Identificador único en la URL: minúsculas, números y guiones.">
      <UInput
        v-model="state.slug"
        placeholder="clase-1-tu-primer-corte"
        class="w-full font-mono"
        @update:model-value="slugTouched = true"
      />
    </UFormField>

    <UFormField label="Portada (URL)" name="cover_url">
      <UInput v-model="state.cover_url" type="url" placeholder="https://…" icon="i-lucide-image" class="w-full" />
    </UFormField>

    <div v-if="state.cover_url && coverOk" class="overflow-hidden rounded-lg border border-default">
      <img
        :src="state.cover_url"
        alt="Vista previa de la portada"
        class="aspect-video w-full object-cover"
        @error="coverOk = false"
      >
    </div>

    <UFormField label="Descripción" name="description" help="Resumen corto que se ve en el listado.">
      <UTextarea v-model="state.description" :rows="3" autoresize placeholder="De qué trata la clase." class="w-full" />
    </UFormField>

    <UFormField
      label="Video (URL)"
      name="video_url"
      :help="video?.kind === 'iframe' ? `Se reproducirá con el reproductor de ${video.provider === 'youtube' ? 'YouTube' : video.provider === 'vimeo' ? 'Vimeo' : 'Google Drive'}.` : 'YouTube, Vimeo, Google Drive o un archivo .mp4.'"
    >
      <UInput v-model="state.video_url" type="url" placeholder="https://youtube.com/watch?v=…" icon="i-lucide-video" class="w-full" />
    </UFormField>

    <UFormField label="Contenido" name="content" help="El material de la clase: texto, pasos, enlaces…">
      <UTextarea v-model="state.content" :rows="8" autoresize :maxrows="20" class="w-full" />
    </UFormField>

    <UFormField name="is_active" help="Una clase inactiva no la ven los alumnos.">
      <USwitch v-model="state.is_active" :label="state.is_active ? 'Activa' : 'Inactiva'" />
    </UFormField>

    <div class="flex justify-end gap-2 pt-2">
      <UButton label="Cancelar" color="neutral" variant="ghost" @click="emit('cancel')" />
      <UButton
        type="submit"
        :label="editing ? 'Guardar cambios' : 'Agregar clase'"
        :icon="editing ? 'i-lucide-save' : 'i-lucide-plus'"
        :loading="loading"
      />
    </div>
  </UForm>
</template>
