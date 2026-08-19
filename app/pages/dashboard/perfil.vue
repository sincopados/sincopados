<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import type { Database } from '~/types/db';

const client = useSupabaseClient<Database>();
const userId = useAuthUserId();
const toast = useToast();
const { profile, role, refresh } = useProfile();

const saving = ref(false);

const schema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  phone: z.string().max(40).optional().or(z.literal('')),
  avatar_url: z.url('URL inválida').optional().or(z.literal('')),
});

type Schema = z.output<typeof schema>

const state = reactive<Schema>({ full_name: '', phone: '', avatar_url: '' });

watchEffect(() => {
  state.full_name = profile.value?.full_name ?? '';
  state.phone = profile.value?.phone ?? '';
  state.avatar_url = profile.value?.avatar_url ?? '';
});

// El rol, el código de referido y el referente son de sólo lectura aquí: un
// trigger en la base de datos rechaza cualquier intento de cambiarlos.
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  if (!userId.value) return;

  saving.value = true;

  const { error } = await client
    .from('profiles')
    .update({
      full_name: event.data.full_name,
      phone: event.data.phone || null,
      avatar_url: event.data.avatar_url || null,
    })
    .eq('id', userId.value);

  saving.value = false;

  if (error) {
    toast.add({ title: 'No se pudo guardar', description: error.message, color: 'error' });
    return;
  }

  toast.add({ title: 'Perfil actualizado', color: 'success' });
  await refresh();
};

const passwordSchema = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirm: z.string().min(8),
}).refine(data => data.password === data.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
});

type PasswordSchema = z.output<typeof passwordSchema>

const passwordState = reactive({ password: '', confirm: '' });
const changingPassword = ref(false);

const onChangePassword = async (event: FormSubmitEvent<PasswordSchema>) => {
  changingPassword.value = true;

  const { error } = await client.auth.updateUser({ password: event.data.password });

  changingPassword.value = false;

  if (error) {
    toast.add({ title: 'No se pudo cambiar la contraseña', description: error.message, color: 'error' });
    return;
  }

  passwordState.password = '';
  passwordState.confirm = '';
  toast.add({ title: 'Contraseña actualizada', color: 'success' });
};
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">Mi perfil</h1>
      <p class="mt-1 text-muted">Actualiza tus datos personales.</p>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center gap-4">
          <UAvatar :src="profile?.avatar_url || undefined" :alt="profile?.full_name || ''" size="lg" icon="i-lucide-user" />
          <div>
            <p class="font-medium">{{ profile?.email }}</p>
            <UBadge v-if="role" :color="ROLE_COLORS[role]" variant="subtle" class="mt-1">
              {{ ROLE_LABELS[role] }}
            </UBadge>
          </div>
        </div>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Nombre completo" name="full_name" required>
          <UInput v-model="state.full_name" class="w-full" />
        </UFormField>

        <UFormField label="Teléfono" name="phone">
          <UInput v-model="state.phone" class="w-full" />
        </UFormField>

        <UFormField label="URL del avatar" name="avatar_url">
          <UInput v-model="state.avatar_url" class="w-full" placeholder="https://…" />
        </UFormField>

        <UFormField label="Código de referido">
          <UInput :model-value="profile?.referral_code ?? ''" disabled class="w-full font-mono" />
        </UFormField>

        <UButton type="submit" label="Guardar cambios" :loading="saving" />
      </UForm>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Cambiar contraseña</h2>
      </template>

      <UForm :schema="passwordSchema" :state="passwordState" class="space-y-4" @submit="onChangePassword">
        <UFormField label="Nueva contraseña" name="password" required>
          <UInput v-model="passwordState.password" type="password" class="w-full" />
        </UFormField>

        <UFormField label="Confirmar contraseña" name="confirm" required>
          <UInput v-model="passwordState.confirm" type="password" class="w-full" />
        </UFormField>

        <UButton type="submit" label="Actualizar contraseña" color="neutral" :loading="changingPassword" />
      </UForm>
    </UCard>
  </div>
</template>
