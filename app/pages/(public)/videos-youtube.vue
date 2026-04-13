<script setup lang="ts">

const { t } = useI18n()
useSeoMeta({
    title: t('seoMetaRedesSocialesTitle'),
    description: t('seoMetaVideosYoutubeDescription'),
    ogTitle: t('seoMetaRedesSocialesTitle'),
    ogDescription: t('seoMetaVideosYoutubeDescription'),
    ogType: 'website',
    ogUrl:'https://sincopados.com',
    ogImage: '/Logo-Sincopados-Golden.png',
    twitterCard: 'summary_large_image',
    twitterTitle: t('seoMetaRedesSocialesTitle'),
    twitterDescription: t('seoMetaVideosYoutubeDescription'),
    twitterImage: '/Logo-Sincopados-Golden.png'
});
</script>

<template>
    <div>
        <YoutubeCTA />     

        <YoutubeFeatures />

        <YoutubeForm />
    </div>
</template>

<style lang="scss" scoped>

</style>