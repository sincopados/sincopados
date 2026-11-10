<script setup lang="ts">
const title = 'Sincopados Media Network · Convocatoria abierta en Medellín'
const description
  = 'No buscamos clientes tradicionales, seleccionamos aliados. Postúlate a Sincopados Media Network: trabajo, clases de edición, afiliados y contenidos pregrabados.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogUrl: 'https://sincopados.com/sincopados-media-network',
  ogImage: '/Logo-Sincopados-Golden.png',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: '/Logo-Sincopados-Golden.png',
})

const FORM_ANCHOR = 'postulacion'
</script>

<template>
  <div>
    <MediaNetworkHero :form-anchor="FORM_ANCHOR" />
    <MediaNetworkApplicationForm :id="FORM_ANCHOR" />
  </div>
</template>
