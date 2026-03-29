<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';

const { t } = useI18n();

definePageMeta({
    layout: 'login-layout',
});

const toast = useToast();

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
  type: 'Password',
  placeholder: t('placeholderPassword'),
  required: true
}, {
  name: 'remember',
  label: t('remember'),
  type: 'checkbox'
}];

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => {
    toast.add({ title: 'Google', description: t('providerGoogleDes') })
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => {
    toast.add({ title: 'GitHub', description: t('providerGitHubDes') })
  }
}];

const schema = z.object({
  email: z.email(t('zodInvalidEmail')),
  password: z.string(t('zodRequierePassword')).min(8, t('zod8Digits'))
});

type Schema = z.output<typeof schema>

function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Submitted', payload)
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
    to="/login"
    />
  </div>
</template>

