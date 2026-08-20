<script setup lang="ts">
definePageMeta({
  layout: 'login-layout',
});

const user = useSupabaseUser();
const redirectInfo = useSupabaseCookieRedirect();
const referralCookie = useReferralCookie();
const localePath = useLocalePath();

// Página de retorno de OAuth y de los enlaces de confirmación por correo.
// El módulo ya ha intercambiado el código por una sesión cuando llegamos aquí.
const settle = async () => {
  // Con OAuth el código de referido no puede viajar en `user_metadata`, así que
  // se guardó en cookie antes de salir hacia el proveedor. El servidor decide si
  // procede aplicarlo; aquí no se comprueba nada, sólo se entrega.
  if (referralCookie.value) {
    try {
      await $fetch('/api/referrals/claim', {
        method: 'POST',
        body: { code: referralCookie.value },
      });
    }
    catch {
      // Un referido no aplicado no debe impedir la entrada al panel.
    }
    finally {
      referralCookie.value = null;
    }
  }

  const saved = redirectInfo.pluck();
  await navigateTo(saved || localePath('/dashboard'));
};

watch(user, (value) => {
  if (value) settle();
}, { immediate: true });
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
    <p class="text-muted">{{ $t('confirmingSession') }}</p>
  </div>
</template>
