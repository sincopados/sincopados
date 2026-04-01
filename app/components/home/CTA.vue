<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui';
const { t } = useI18n();

const links = ref<ButtonProps[]>([
  {
    label: t('welcome'),
    color: 'neutral'
  },
  {
    label: 'Conoce Más',
    color: 'neutral',
    variant: 'subtle',
    trailingIcon: 'i-lucide-arrow-right'
  }
]);

</script>

<template>
  <UPageCTA
    :title="$t('homeCTATitle')"
    :description="$t('homeCTADescription')"
    orientation="horizontal"
    :links="links"
    class="my-4"
  >
    <img
      src="/home-social-media-medellin.png"
      alt="Illustration"
      class="w-96 rounded-lg"
      loading="lazy"
    />
    <template #top>
        <h1 class="flex flex-col items-center justify-center text-6xl font-bold mt-12">Video Marketing en Medellín</h1>
      </template>
    
  </UPageCTA>
</template>
