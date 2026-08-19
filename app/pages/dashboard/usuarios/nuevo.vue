<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import type { UserRole } from '~/types/db';

definePageMeta({
  middleware: 'role',
  roles: ['superusuario', 'tutor'],
});

const toast = useToast();
const localePath = useLocalePath();
const { role: actorRole } = useProfile();

const roleOptions = computed(() =>
  manageableRoles(actorRole.value).map(value => ({ label: ROLE_LABELS[value], value })),
);

const schema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  email: z.email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role: z.enum(USER_ROLES),
  phone: z.string().max(40).optional().or(z.literal('')),
  referral_code: z.string().max(12).optional().or(z.literal('')),
});

type Schema = z.output<typeof schema>

const state = reactive({
  full_name: '',
  email: '',
  password: '',
  role: 'cliente' as UserRole,
  phone: '',
  referral_code: '',
});

const saving = ref(false);

// La creación pasa por el servidor: alta en `auth.users` con la Admin API y el
// rol en app_metadata, que el navegador nunca puede escribir.
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  saving.value = true;

  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: {
        full_name: event.data.full_name,
        email: event.data.email,
        password: event.data.password,
        role: event.data.role,
        phone: event.data.phone || undefined,
        referral_code: event.data.referral_code || undefined,
      },
    });

    toast.add({ title: 'Usuario creado', color: 'success' });
    await navigateTo(localePath('/dashboard/usuarios'));
  }
  catch (error) {
    toast.add({
      title: 'No se pudo crear el usuario',
      description: (error as { statusMessage?: string }).statusMessage ?? 'Error inesperado',
      color: 'error',
    });
  }
  finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">Crear usuario</h1>
      <p class="mt-1 text-muted">El usuario recibirá acceso inmediato con estas credenciales.</p>
    </div>

    <UCard>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Nombre completo" name="full_name" required>
          <UInput v-model="state.full_name" class="w-full" />
        </UFormField>

        <UFormField label="Correo electrónico" name="email" required>
          <UInput v-model="state.email" type="email" class="w-full" />
        </UFormField>

        <UFormField label="Contraseña" name="password" required>
          <UInput v-model="state.password" type="password" class="w-full" />
        </UFormField>

        <UFormField label="Rol" name="role" required>
          <USelect v-model="state.role" :items="roleOptions" class="w-full" />
        </UFormField>

        <UFormField label="Teléfono" name="phone">
          <UInput v-model="state.phone" class="w-full" />
        </UFormField>

        <UFormField
          label="Código de quien lo refirió"
          name="referral_code"
          help="Opcional. Vincula al nuevo usuario con el afiliado que lo trajo."
        >
          <UInput v-model="state.referral_code" class="w-full font-mono uppercase" />
        </UFormField>

        <div class="flex gap-3">
          <UButton type="submit" label="Crear usuario" :loading="saving" />
          <UButton
            label="Cancelar"
            color="neutral"
            variant="ghost"
            :to="localePath('/dashboard/usuarios')"
          />
        </div>
      </UForm>
    </UCard>
  </div>
</template>
