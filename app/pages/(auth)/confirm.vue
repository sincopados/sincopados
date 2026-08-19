<script setup lang="ts">
definePageMeta({
  layout: 'login-layout',
});

const user = useSupabaseUser();
const redirectInfo = useSupabaseCookieRedirect();
const localePath = useLocalePath();

// Página de retorno de OAuth y de los enlaces de confirmación por correo.
// El módulo ya ha intercambiado el código por una sesión cuando llegamos aquí.
watch(user, (value) => {
  if (value) {
    const saved = redirectInfo.pluck();
    navigateTo(saved || localePath('/dashboard'));
  }
}, { immediate: true });
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
    <p class="text-muted">{{ $t('confirmingSession') }}</p>
  </div>
</template>
