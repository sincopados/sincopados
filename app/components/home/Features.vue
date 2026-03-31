<script setup lang="ts">

const { t } = useI18n();

const cards = ref([
  {
    title: t('featuresCardsTitle1'),
    description: t('featuresCardsDescription1'),
    icon: 'i-lucide-swatch-book',
    to: '/',
    class: 'lg:col-span-2',
    image: {
      path: 'https://ui2.nuxt.com/illustrations/color-palette',
      width: 363,
      height: 152
    },
    orientation: 'horizontal' as const
  },
  {
    title: t('featuresCardsTitle2'),
    description: t('featuresCardsDescription2'),
    icon: 'i-lucide-a-large-small',
    to: '/',
    variant: 'soft' as const
  },
  {
    title: t('featuresCardsTitle3'),
    description: t('featuresCardsDescription3'),
    icon: 'i-lucide-sun-moon',
    to: '/',
    variant: 'soft' as const
  },
  {
    title: t('featuresCardsTitle4'),
    description: t('featuresCardsDescription4'),
    icon: 'i-lucide-smile',
    to: '/',
    image: {
      path: 'https://ui2.nuxt.com/illustrations/icon-library',
      width: 362,
      height: 184
    },
    class: 'lg:col-span-2',
    orientation: 'horizontal' as const,
    reverse: true
  }
])
</script>

<template>
    <UPageSection
    :title="$t('featuresTitle')"
    :description="$t('featuresDescription')"
    :headline="$t('featuresHeadline')"
  />    
  <UPageGrid class="my-4">
    <UPageCard
      v-for="(card, index) in cards"
      :key="index"
      v-bind="card"
    >
      <UColorModeImage
        v-if="card.image"
        :light="`${card.image.path}-light.svg`"
        :dark="`${card.image.path}-dark.svg`"
        :width="card.image.width"
        :height="card.image.height"
        :alt="card.title"
        loading="lazy"
        class="w-full"
      />
    </UPageCard>
  </UPageGrid>
</template>

