<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({
    title: t('seoMetaPricingTitle'),
    description: t('seoMetaPricingDescription'),
    ogTitle: t('seoMetaPricingTitle'),
    ogDescription: t('seoMetaPricingDescription'),
    ogType: 'website',
    ogUrl:'https://sincopados.com',
    ogImage: '/Logo-Sincopados-Golden.png',
    twitterCard: 'summary_large_image',
    twitterTitle: t('seoMetaPricingTitle'),
    twitterDescription: t('seoMetaPricingDescription'),
    twitterImage: '/Logo-Sincopados-Golden.png'
});
</script>
<template>
  <!-- 
    <UPageCTA
    orientation="horizontal"
    :title="$t('pricingPageCTATitle')"
    :description="$t('pricingPageCTADescription')"
  >
    <template #default>
      <div class="flex items-center justify-center">
        <IconsLogoHorizontal :size="409" />
      </div>
    </template>
  </UPageCTA>
  -->

  <div class="mt-10" >
    <PricingTable />
  </div>
</template>