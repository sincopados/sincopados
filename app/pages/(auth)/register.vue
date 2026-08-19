<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';

const { t } = useI18n();

definePageMeta({
    layout: 'login-layout',
});

const toast = useToast();
const client = useSupabaseClient();
const localePath = useLocalePath();
const route = useRoute();
const loading = ref(false);

// Permite llegar desde un enlace de referido: /register?ref=ABC12345
const referralFromLink = String(route.query.ref ?? '').toUpperCase();

const fields: AuthFormField[] = [{
  name: 'name',
  type: 'text',
  label: t('name'),
  placeholder: t('placeholderName'),
  required: true
},{
  name: 'email',
  type: 'email',
  label: t('email'),
  placeholder: t('placeholderEmail'),
  required: true
}, {
  name: 'password',
  label: t('password'),
  type: 'password',
  placeholder: t('placeholderPassword'),
  required: true
}, {
  name: 'referral_code',
  type: 'text',
  label: t('referralCode'),
  placeholder: t('placeholderReferralCode'),
  defaultValue: referralFromLink
}];

const signUpWithProvider = async (provider: 'google' | 'github') => {
  const { error } = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}${localePath('/confirm')}` }
  });

  if (error) {
    toast.add({ title: t('registerError'), description: error.message, color: 'error' });
  }
};

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => signUpWithProvider('google')
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => signUpWithProvider('github')
}];

const schema = z.object({
  name: z.string(t('zodRequiereName')).min(2, t('zodRequiereName')),
  email: z.email(t('zodInvalidEmail')),
  password: z.string(t('zodRequierePassword')).min(8, t('zod8Digits')),
  referral_code: z.string().max(12).optional().or(z.literal(''))
});

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true;

  // El rol nunca se envía desde el navegador: el trigger de la base de datos
  // asigna `cliente` por defecto y sólo un administrador puede cambiarlo.
  const { error } = await client.auth.signUp({
    email: payload.data.email,
    password: payload.data.password,
    options: {
      emailRedirectTo: `${window.location.origin}${localePath('/confirm')}`,
      data: {
        full_name: payload.data.name,
        referral_code: payload.data.referral_code?.toUpperCase() || undefined
      }
    }
  });

  loading.value = false;

  if (error) {
    toast.add({ title: t('registerError'), description: error.message, color: 'error' });
    return;
  }

  toast.add({ title: t('registerSuccess'), description: t('registerSuccessDescription'), color: 'success' });
  await navigateTo(localePath('/login'));
};
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        :title="$t('registerTitle')"
        :description="$t('registerDescription')"
        icon="i-lucide-user"
        :fields="fields"
        :providers="providers"
        :loading="loading"
        @submit="onSubmit"
        :ui="{
            leadingIcon: 'text-2xl',
        }"
      />
    </UPageCard>
    <UButton 
    color="primary"
    variant="ghost"
    :label="$t('goToLogin')"
    :to="localePath('/login')"
    />
  </div>
</template>
