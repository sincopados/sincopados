  <script setup lang="ts">
  import type { NavigationMenuItem, DropdownMenuItem, SelectMenuItem } from '@nuxt/ui';

  const route = useRoute();

  const { locale, locales, setLocale } = useI18n()


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
  ]);

  const languagesBase = [
    { label: 'Español', value: 'es', icon: 'circle-flags:co' },
    { label: 'English', value: 'en', icon: 'circle-flags:us' },
    { label: 'Nederlands', value: 'nl', icon: 'circle-flags:nl' }
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
  const  iconText = ref(languagesBase[0])

  const iconLanguage = computed(()=> {
    if (locale.value === 'en') {
      iconText.value = languagesBase[1]
    } else if(locale.value === 'nl') {
      iconText.value = languagesBase[2]
    } else {
      iconText.value = languagesBase[0]
    }
    return iconText.value?.icon
  })

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
           onSelect() {
            iconLanguage()
           }
          :ui="{
            content: 'w-48'
          }"
        >
          <UButton :label="iconText?.value" :icon="iconLanguage" color="neutral" variant="outline" />
        </UDropdownMenu>
      </template>
      <template #body>
        <UNavigationMenu :items="responsiveMenu" orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>
  </template>

