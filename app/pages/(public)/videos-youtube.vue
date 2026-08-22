<script setup lang="ts">

const { t } = useI18n()
useSeoMeta({
    title: t('seoMetaVideosYoutubeTitle'),
    description: t('seoMetaVideosYoutubeDescription'),
    ogTitle: t('seoMetaVideosYoutubeTitle'),
    ogDescription: t('seoMetaVideosYoutubeDescription'),
    ogType: 'website',
    ogUrl:'https://sincopados.com',
    ogImage: '/Logo-Sincopados-Golden.png',
    twitterCard: 'summary_large_image',
    twitterTitle: t('seoMetaVideosYoutubeTitle'),
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