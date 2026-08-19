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
    '@nuxtjs/i18n',
    '@nuxtjs/supabase',
    'nuxt-gtag'
  ],

  css: ['~/assets/css/main.css'],
  ssr: true,

  app:{
    head: {
      title: 'NEUROFIT - brain',
      meta: [
        {
          name: 'description',
          content: 'Programa identificación y tratamiento de el ansaimer',
        }
      ],
    },

  },
    
  i18n: {
    locales: [
      { code: 'es', language: 'es-ES', name:'Español',file: 'es.json' },
      { code: 'en', language: 'en-US', name:'English',file: 'en.json' },
      { code: 'nl', language: 'nl-NL', name:'Nederlands',file: 'nl.json' },
      { code: 'fr', language: 'fr-FR', name:'français',file: 'fr.json' }
    ],
    defaultLocale: 'es',
  },

  supabase: {
    // Sólo el dashboard exige sesión; el sitio público sigue siendo anónimo.
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: ['/dashboard(/*)?', '/*/dashboard(/*)?'],
      exclude: ['/', '/login', '/register', '/confirm', '/*/login', '/*/register', '/*/confirm'],
      saveRedirectToCookie: true,
    },
    types: '~/types/database.types.ts',
  },

  gtag: {
    id: 'G-V1HZ72Q0JF'
  },
})