<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui';
const { t } = useI18n();

const links = ref<ButtonProps[]>([
  {
    label: t('welcome'),
    color: 'neutral',
    to:'/pricing'
  },
  {
    label: 'Conoce Más',
    color: 'neutral',
    variant: 'subtle',
    trailingIcon: 'i-lucide-arrow-right',
    to:'/pricing'
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
    <NuxtPicture
      src="/home-social-media-medellin.png"
      alt="Illustration"
      class="block w-96"
      :img-attrs="{ class: 'h-auto w-full rounded-lg' }"
      :width="373"
      :height="669"
      densities="1x"
      loading="lazy"
      decoding="async"
    />
    <template #top>
        <h1 class="flex flex-col items-center justify-center text-6xl font-bold mt-12">Video Marketing en Medellín</h1>
      </template>
    
  </UPageCTA>
</template>
