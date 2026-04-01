<script setup lang="ts">

const { t } = useI18n();

const cards = ref([
  {
    title: t('featuresCardsTitle1'),
    description: t('featuresCardsDescription1'),
    icon: 'simple-icons:instagram',
    to: '/',
    class: 'lg:col-span-2',
    image: {
      path: '/video-marketing-instagram',
      width: 363,
      height: 152
    },
    orientation: 'horizontal' as const
  },
  {
    title: t('featuresCardsTitle2'),
    description: t('featuresCardsDescription2'),
    icon: 'simple-icons:tiktok',
    to: '/',
    variant: 'soft' as const
  },
  {
    title: t('featuresCardsTitle3'),
    description: t('featuresCardsDescription3'),
    icon: 'simple-icons:facebook',
    to: '/',
    variant: 'soft' as const
  },
  {
    title: t('featuresCardsTitle4'),
    description: t('featuresCardsDescription4'),
    icon: 'simple-icons:youtube',
    to: '/',
    image: {
      path: '/video-marketing-youtube',
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
    :ui="{ 

      }"
  />    
  <UPageGrid class="my-4">
    <UPageCard
      v-for="(card, index) in cards"
      :key="index"
      v-bind="card"
      :ui="{ 
        leadingIcon: 'w-16 h-16'
      }"
    >
    <UColorModeImage
    v-if="card.image"
    :light="`${card.image.path}-light.jpg`"
    :dark="`${card.image.path}-dark.jpg`"
    :width="card.image.width"
    :height="card.image.height"
    :alt="card.title"
    loading="lazy"
    class="w-full"
    />
    </UPageCard>
  </UPageGrid>
</template>

