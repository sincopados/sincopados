<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({
    title: t('seoMetaVideosYoutubeTitle'),
    description: t('seoMetaRedesSocialesDescription'),
    ogTitle: t('seoMetaVideosYoutubeTitle'),
    ogDescription: t('seoMetaRedesSocialesDescription'),
    ogType: 'website',
    ogUrl:'https://sincopados.com',
    ogImage: '/Logo-Sincopados-Golden.png',
    twitterCard: 'summary_large_image',
    twitterTitle: t('seoMetaVideosYoutubeTitle'),
    twitterDescription: t('seoMetaRedesSocialesDescription'),
    twitterImage: '/Logo-Sincopados-Golden.png'
});
</script>

<template>
    <div>
        
        <SocialNetworkCTA />
        <SocialNetworkCards />
        <SocialNetworkSuccsses />
        <SocialNetworkForm />
        
    </div>
</template>

