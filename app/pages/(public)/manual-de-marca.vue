<script setup lang="ts">
const title = 'Manual de Marca · Sincopados Producciones'
const description = 'Identidad visual de Sincopados Producciones: logotipo, logosímbolo, versiones cromáticas, tipografía Roboto Condensed, paleta y aplicaciones, con descarga de todos los archivos.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogUrl: 'https://sincopados.com/manual-de-marca',
  ogImage: '/marca/sincopados-logo-vertical-dorado.png',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: '/marca/sincopados-logo-vertical-dorado.png',
})

const root = useTemplateRef<HTMLElement>('root')
useScrollReveal(root)
</script>

<template>
  <div ref="root" class="marca min-h-screen bg-[#0a0a0a] text-white">
    <UContainer class="space-y-24 py-10 sm:py-16">
      <MarcaHero />

      <MarcaNav />

      <MarcaLogoShowcase
        id="logotipo"
        eyebrow="Logotipo & logosímbolo"
        title="La versión principal"
        description="El logosímbolo «SP» y el logotipo vertical son la expresión primaria de la marca. Se usan sin alterar proporciones, sin efectos y respetando siempre una de las tres versiones cromáticas."
        group="vertical"
      />

      <MarcaLogoShowcase
        id="logosimbolo"
        eyebrow="Logosímbolo aislado"
        title="El monograma SP"
        description="Reservado para avatares, favicon, sellos y aplicaciones donde el espacio no permite el logotipo completo."
        group="isotipo"
      />

      <MarcaLogoShowcase
        id="horizontal"
        eyebrow="Aplicación horizontal"
        title="Formato apaisado"
        description="Pensada para cabeceras, firmas de correo, cintillos de vídeo y cualquier espacio más ancho que alto."
        group="horizontal"
      />

      <MarcaTypography />

      <MarcaColors />

      <MarcaApplications />

      <MarcaDownloads />
    </UContainer>
  </div>
</template>

<style scoped>
.marca {
  /* Roboto Condensed es la tipografía oficial del manual. */
  font-family: 'Roboto Condensed', 'Arial Narrow', ui-sans-serif, sans-serif;
}

.marca.is-animated :deep([data-reveal]),
.marca.is-animated :deep([data-reveal-group] > *) {
  opacity: 0;
}
</style>
