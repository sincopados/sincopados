  <script setup lang="ts">
  import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui';

  const route = useRoute();

  const { locale, setLocale } = useI18n()


  const languageItems = ref<DropdownMenuItem[]>([
    {
      label: 'Español',
      icon: 'circle-flags:co',
      code: 'ES',
      onSelect: () =>{
        setLocale('es')
      }
    },
    {
      label: 'English',
      icon: 'circle-flags:us',
      code: 'EN',
      onSelect: () =>{
        setLocale('en')
      }
    },
    {
      label: 'Nederlands',
      icon: 'circle-flags:nl',
      code: 'NL',
      onSelect: () =>{
        setLocale('nl')
      }
    },
    {
      label: 'Français',
      icon: 'circle-flags:fr',
      code: 'FR',
      onSelect: () =>{
        setLocale('fr')
      }
    },
  ]);

  const languagesBase = [
    { label: 'Español', value: 'es', code: 'ES', icon: 'circle-flags:co' },
    { label: 'English', value: 'en', code: 'EN', icon: 'circle-flags:us' },
    { label: 'Nederlands', value: 'nl', code: 'NL', icon: 'circle-flags:nl' },
    { label: 'Français', value: 'fr', code: 'FR', icon: 'circle-flags:fr' }
]

  const items = computed<NavigationMenuItem[]>(() => [{
    label: 'Redes Sociales',
    to: '/redes-sociales',
    //icon: 'i-lucide-book-open',
    active: route.path.startsWith('/redes-sociales')
  }, {
    label: 'Youtube',
    //icon: 'i-lucide-rocket',
    to: '/videos-youtube',
    active: route.path.startsWith('/videos-youtube')
  }, {
    label: 'Precios',
    to: '/pricing',
    //icon: 'i-lucide-box',
    active: route.path.startsWith('/pricing')
  }, {
    label: 'Nosotros',
    //icon: 'i-simple-icons-figma',
    to: '/about',
    active: route.path.startsWith('/about')
  }]);

  const responsiveMenu = ref([
    ...items.value,
    {
      label: 'login',
      to: '/login',
      active: route.path.startsWith('/login')

    }
  ]);
  // Bandera y código del idioma activo, derivados de `locale`.
  const currentLanguage = computed(
    () => languagesBase.find(language => language.value === locale.value) ?? languagesBase[0]!
  )

  </script>

  <template>
    <UHeader
      :toggle="{
        color: 'primary',
        variant: 'subtle',
        class: 'rounded-full'
      }"
    >
      <template #title>
        <IconsLogo class="h-8 sm:h-6 w-auto" />
      </template>

      <UNavigationMenu :items="items" />

      <template #right>
        
        <UColorModeSwitch />
        <UDropdownMenu
          :items="languageItems"
          :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: 8
          }"
          :ui="{
            content: 'w-48'
          }"
        >
          <UButton :label="currentLanguage.code" :icon="currentLanguage.icon" color="neutral" variant="outline" />
        </UDropdownMenu>
      </template>
      <template #body>
        <UNavigationMenu :items="responsiveMenu" orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>
  </template>

 