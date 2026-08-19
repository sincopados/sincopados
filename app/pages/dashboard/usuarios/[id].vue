<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import type { Database, Profile, UserRole } from '~/types/db';

definePageMeta({
  middleware: 'role',
  roles: ['superusuario', 'tutor'],
});

const route = useRoute();
const client = useSupabaseClient<Database>();
const toast = useToast();
const localePath = useLocalePath();
const { role: actorRole, profile: actorProfile } = useProfile();

const id = computed(() => route.params.id as string);

const { data: target, refresh } = await useAsyncData<Profile | null>(
  () => `user-${id.value}`,
  async () => {
    const { data, error } = await client.from('profiles').select('*').eq('id', id.value).maybeSingle();
    if (error) throw error;
    return data;
  },
);

if (!target.value) {
  throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' });
}

const isSelf = computed(() => target.value?.id === actorProfile.value?.id);
const canEdit = computed(() => !!target.value && canManageRole(actorRole.value, target.value.role));

const roleOptions = computed(() =>
  manageableRoles(actorRole.value).map(value => ({ label: ROLE_LABELS[value], value })),
);

const schema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  email: z.email('Correo inválido'),
  phone: z.string().max(40).optional().or(z.literal('')),
  role: z.enum(USER_ROLES),
  is_active: z.boolean(),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
});

type Schema = z.output<typeof schema>

const state = reactive({
  full_name: '',
  email: '',
  phone: '',
  role: 'cliente' as UserRole,
  is_active: true,
  password: '',
});

watchEffect(() => {
  if (!target.value) return;
  state.full_name = target.value.full_name ?? '';
  state.email = target.value.email;
  state.phone = target.value.phone ?? '';
  state.role = target.value.role;
  state.is_active = target.value.is_active;
});

const saving = ref(false);
const deleting = ref(false);

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  saving.value = true;

  try {
    await $fetch(`/api/admin/users/${id.value}`, {
      method: 'PATCH',
      body: {
        full_name: event.data.full_name,
        email: event.data.email,
        phone: event.data.phone || null,
        role: event.data.role,
        is_active: event.data.is_active,
        ...(event.data.password ? { password: event.data.password } : {}),
      },
    });

    state.password = '';
    toast.add({ title: 'Usuario actualizado', color: 'success' });
    await refresh();
  }
  catch (error) {
    toast.add({
      title: 'No se pudo actualizar',
      description: (error as { statusMessage?: string }).statusMessage ?? 'Error inesperado',
      color: 'error',
    });
  }
  finally {
    saving.value = false;
  }
};

const removeUser = async () => {
  if (!confirm('¿Eliminar definitivamente este usuario?')) return;

  deleting.value = true;

  try {
    await $fetch(`/api/admin/users/${id.value}`, { method: 'DELETE' });
    toast.add({ title: 'Usuario eliminado', color: 'success' });
    await navigateTo(localePath('/dashboard/usuarios'));
  }
  catch (error) {
    toast.add({
      title: 'No se pudo eliminar',
      description: (error as { statusMessage?: string }).statusMessage ?? 'Error inesperado',
      color: 'error',
    });
  }
  finally {
    deleting.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Editar usuario</h1>
        <p class="mt-1 text-muted">{{ target?.email }}</p>
      </div>
      <UBadge v-if="target" :color="ROLE_COLORS[target.role]" variant="subtle">
        {{ ROLE_LABELS[target.role] }}
      </UBadge>
    </div>

    <UAlert
      v-if="!canEdit"
      color="warning"
      variant="subtle"
      icon="i-lucide-shield-alert"
      title="Sin permisos"
      description="Tu rol no permite modificar este usuario."
    />

    <UCard v-else>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Nombre completo" name="full_name" required>
          <UInput v-model="state.full_name" class="w-full" />
        </UFormField>

        <UFormField label="Correo electrónico" name="email" required>
          <UInput v-model="state.email" type="email" class="w-full" />
        </UFormField>

        <UFormField label="Teléfono" name="phone">
          <UInput v-model="state.phone" class="w-full" />
        </UFormField>

        <UFormField
          label="Rol"
          name="role"
          :help="isSelf ? 'No puedes cambiar tu propio rol.' : undefined"
        >
          <USelect v-model="state.role" :items="roleOptions" :disabled="isSelf" class="w-full" />
        </UFormField>

        <UFormField label="Cuenta activa" name="is_active">
          <USwitch v-model="state.is_active" />
        </UFormField>

        <UFormField
          label="Nueva contraseña"
          name="password"
          help="Déjalo vacío para conservar la actual."
        >
          <UInput v-model="state.password" type="password" class="w-full" />
        </UFormField>

        <div class="flex flex-wrap gap-3">
          <UButton type="submit" label="Guardar cambios" :loading="saving" />
          <UButton
            label="Volver"
            color="neutral"
            variant="ghost"
            :to="localePath('/dashboard/usuarios')"
          />
          <UButton
            v-if="!isSelf"
            label="Eliminar usuario"
            color="error"
            variant="outline"
            icon="i-lucide-trash-2"
            class="ms-auto"
            :loading="deleting"
            @click="removeUser"
          />
        </div>
      </UForm>
    </UCard>

    <UCard v-if="target">
      <template #header>
        <h2 class="text-lg font-semibold">Referidos</h2>
      </template>

      <dl class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt class="text-muted">Código de referido</dt>
          <dd class="font-mono font-medium">{{ target.referral_code }}</dd>
        </div>
        <div>
          <dt class="text-muted">Referido por</dt>
          <dd class="font-medium">{{ target.referred_by ?? '—' }}</dd>
        </div>
        <div>
          <dt class="text-muted">Registrado</dt>
          <dd class="font-medium">{{ new Date(target.created_at).toLocaleDateString('es-CO') }}</dd>
        </div>
      </dl>
    </UCard>
  </div>
</template>
