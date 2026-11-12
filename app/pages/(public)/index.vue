<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const title = 'Sincopados Producciones · Centro de Medios Digitales en Medellín'
const description
  = 'Sincopados Media Network: centro de medios digitales en Medellín que conecta el talento con la monetización global. Formación en edición con IA, bodega de contenidos, red de talento y programa de afiliados.'

useSeoMeta({
  title,
  description,
  ogTitle: 'Sincopados Producciones · Centro de Medios Digitales',
  ogDescription: 'Conectamos el talento con la monetización global desde Medellín.',
  ogType: 'website',
  ogUrl: 'https://sincopados.com',
  ogImage: '/marca/sincopados-logo-vertical-dorado.png',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: '/marca/sincopados-logo-vertical-dorado.png',
})
useHead({
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/marca/sincopados-isotipo-dorado.svg' }],
})

const root = useTemplateRef<HTMLElement>('root')
useLandingFx(root)
</script>

<template>
  <div ref="root">
    <LandingGrain />
    <LandingScrollProgress />

    <main>
      <LandingHero />
      <LandingMarquee :items="['Edición con IA', 'Monetización', 'YouTube', 'TikTok Live', 'Reels & Shorts', 'Afiliados', 'Cultura urbana']" />
      <LandingManifesto />
      <LandingVideoAnchor />
      <LandingPillars />
      <LandingMethod />
      <LandingStats />
      <LandingJourney />
      <LandingChannels />
      <LandingMarquee :items="['Desde Medellín', 'Para LATAM', 'Talento binacional', 'Economía creativa']" :dir="1" outline />
      <LandingDiff />
      <LandingContact />
    </main>

    <LandingDock />
  </div>
</template>
