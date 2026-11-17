<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  /** Valores iniciales; sin ellos el formulario es de alta. */
  initial?: CourseModuleFormState
  /** Id del módulo que se edita, para no contarlo como slug repetido. */
  moduleId?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CourseModuleFormData]
  cancel: []
}>()

const state = reactive<CourseModuleFormState>({ ...(props.initial ?? emptyCourseModule()) })
const editing = computed(() => !!props.initial)

// En el alta el slug sigue al título hasta que alguien lo edita a mano; al
// editar un módulo existente no se toca solo, para no romper enlaces.
const slugTouched = ref(editing.value)
watch(() => state.title, (title) => {
  if (!slugTouched.value) state.slug = slugify(title)
})

// El slug es único en todo el sistema: se comprueba antes de guardar.
const { validateSlug } = useSlugAvailability('course_modules', () => props.moduleId)

const coverOk = ref(true)
watch(() => state.cover_url, () => { coverOk.value = true })

const onSubmit = (event: FormSubmitEvent<CourseModuleFormData>) => emit('submit', event.data)
</script>

<template>
  <UForm
    :schema="courseModuleSchema"
    :validate="validateSlug"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormField label="Título" name="title" required>
      <UInput v-model="state.title" placeholder="Edición con IA: fundamentos" class="w-full" autofocus />
    </UFormField>

    <UFormField label="Slug" name="slug" required help="Identificador único en la URL: minúsculas, números y guiones.">
      <UInput
        v-model="state.slug"
        placeholder="edicion-con-ia-fundamentos"
        class="w-full font-mono"
        @update:model-value="slugTouched = true"
      />
    </UFormField>

    <UFormField label="Descripción" name="description">
      <UTextarea v-model="state.description" :rows="4" autoresize placeholder="Qué aprende el alumno en este módulo." class="w-full" />
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

    <UFormField name="is_active" help="Un módulo inactivo no lo ven los alumnos.">
      <USwitch v-model="state.is_active" :label="state.is_active ? 'Activo' : 'Inactivo'" />
    </UFormField>

    <div class="flex justify-end gap-2 pt-2">
      <UButton label="Cancelar" color="neutral" variant="ghost" @click="emit('cancel')" />
      <UButton
        type="submit"
        :label="editing ? 'Guardar cambios' : 'Agregar módulo'"
        :icon="editing ? 'i-lucide-save' : 'i-lucide-plus'"
        :loading="loading"
      />
    </div>
  </UForm>
</template>
