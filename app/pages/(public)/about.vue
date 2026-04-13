<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({
    title: t('seoMetaAboutTitle'),
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
  <div class="bg-[#0a0a0a] text-white min-h-screen">
    <UContainer class="py-20 space-y-32">
      <AboutHistory />
      <AboutTimeline />
      <AboutTeam />
      <AboutCTA />
    </UContainer>
  </div>
</template>