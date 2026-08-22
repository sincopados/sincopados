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

  app: {
    // Título y descripción de reserva: las páginas públicas definen los suyos
    // con `useSeoMeta` y las claves `seoMeta*` de i18n.
    head: {
      title: 'Sincopados',
      meta: [
        {
          name: 'description',
          content: 'Sincopados Producciones Audiovisuales: producción de video y estrategia de redes sociales en Medellín.',
        },
        { property: 'og:site_name', content: 'Sincopados' },
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

  runtimeConfig: {
    supabase: {
      // Vacío a propósito. @nuxtjs/supabase lee `process.env.NUXT_SUPABASE_SECRET_KEY`
      // en tiempo de build, y Nitro hornea `runtimeConfig` en el bundle del
      // servidor: la secret key acabaría escrita en claro en `nitro.mjs`.
      // Declararla aquí como cadena vacía gana sobre ese valor por defecto, y
      // Nitro la rellena en cada arranque desde la variable de entorno.
      secretKey: '',
      serviceKey: '',
    },
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