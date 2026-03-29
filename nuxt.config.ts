// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/ui',
    '@nuxtjs/i18n'
  ],

  css: ['~/assets/css/main.css'],
  ssr: true,
  
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', name:'English',file: 'en.json' },
      { code: 'es', language: 'es-ES', name:'Español',file: 'es.json' }
    ],
    defaultLocale: 'en',
  }
})