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
      src="https://picsum.photos/640/728"
      width="320"
      height="364"
      alt="Illustration"
      class="w-full rounded-lg"
      loading="lazy"
    />
    
  </UPageCTA>
</template>
