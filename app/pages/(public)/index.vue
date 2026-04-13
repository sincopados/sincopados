<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({
    title: t('seoMetaHomeTitle'),
    description: t('seoMetaHomeDescription'),
    ogTitle: t('seoMetaHomeTitle'),
    ogDescription: t('seoMetaHomeDescription'),
    ogType: 'website',
    ogUrl:'https://sincopados.com',
    ogImage: '/Logo-Sincopados-Golden.png',
    twitterCard: 'summary_large_image',
    twitterTitle: t('seoMetaHomeTitle'),
    twitterDescription: t('seoMetaHomeDescription'),
    twitterImage: '/Logo-Sincopados-Golden.png'
});
</script>
<template>
  <HomeCTA />
  <HomeFeatures />
  <HomeTestimonials />
  <HomeStack />
</template>