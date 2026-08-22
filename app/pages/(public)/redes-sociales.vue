<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({
    title: t('seoMetaRedesSocialesTitle'),
    description: t('seoMetaRedesSocialesDescription'),
    ogTitle: t('seoMetaRedesSocialesTitle'),
    ogDescription: t('seoMetaRedesSocialesDescription'),
    ogType: 'website',
    ogUrl:'https://sincopados.com',
    ogImage: '/Logo-Sincopados-Golden.png',
    twitterCard: 'summary_large_image',
    twitterTitle: t('seoMetaRedesSocialesTitle'),
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

