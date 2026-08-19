<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';

const { t } = useI18n();

definePageMeta({
    layout: 'login-layout',
});

const toast = useToast();
const client = useSupabaseClient();
const user = useSupabaseUser();
const redirectInfo = useSupabaseCookieRedirect();
const localePath = useLocalePath();
const loading = ref(false);

const goToDashboard = () => {
  const saved = redirectInfo.pluck();
  return navigateTo(saved || localePath('/dashboard'));
};

watchEffect(() => {
  if (user.value) goToDashboard();
});

const fields: AuthFormField[] = [{
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
  name: 'remember',
  label: t('remember'),
  type: 'checkbox'
}];

const signInWithProvider = async (provider: 'google' | 'github') => {
  const { error } = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}${localePath('/confirm')}` }
  });

  if (error) {
    toast.add({ title: t('loginError'), description: error.message, color: 'error' });
  }
};

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => signInWithProvider('google')
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => signInWithProvider('github')
}];

const schema = z.object({
  email: z.email(t('zodInvalidEmail')),
  password: z.string(t('zodRequierePassword')).min(8, t('zod8Digits'))
});

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true;

  const { error } = await client.auth.signInWithPassword({
    email: payload.data.email,
    password: payload.data.password
  });

  loading.value = false;

  if (error) {
    toast.add({ title: t('loginError'), description: error.message, color: 'error' });
    return;
  }

  await goToDashboard();
};
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        :title="$t('loginTitle')"
        :description="$t('loginDescription')"
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
    :label="$t('goToRegister')"
    :to="localePath('/register')"
    />
  </div>
</template>
