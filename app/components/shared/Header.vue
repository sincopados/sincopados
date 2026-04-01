  <script setup lang="ts">
  import type { NavigationMenuItem, DropdownMenuItem, SelectMenuItem } from '@nuxt/ui';
  import * as loc from '@nuxt/ui/locale'

  const route = useRoute();

  const { locale, locales, setLocale } = useI18n()


  const languageItems = ref<DropdownMenuItem[]>([
    {
      label: 'Español',
      icon: 'circle-flags:co',
      onSelect: () =>{
        setLocale('es')
      }
    },
    {
      label: 'English',
      icon: 'circle-flags:us',
      onSelect: () =>{
        setLocale('en')
      }
    },
  ]);

  const languagesBase = [
  { label: 'Español', value: 'es', icon: 'circle-flags:co' },
  { label: 'English', value: 'en', icon: 'circle-flags:us' }
]

  const items = computed<NavigationMenuItem[]>(() => [{
    label: 'Productos',
    to: '/products',
    //icon: 'i-lucide-book-open',
    active: route.path.startsWith('/products')
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
  }, {
    label: 'Contacto',
    //icon: 'i-lucide-rocket',
    to: '/contact',
    active: route.path.startsWith('/contact')
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
        <IconsLogo class="h-8 w-auto" />
      </template>

      <UNavigationMenu :items="items" />

      <template #right>
        
        <UColorModeSwitch />

        <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
          <UButton
            color="neutral"
            variant="ghost"
            to="https://github.com/nuxt/ui"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
          />
        </UTooltip>
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
          <UButton :label="iconText?.label" :icon="iconLanguage" color="neutral" variant="outline" />
        </UDropdownMenu>
      </template>
      <template #body>
        <UNavigationMenu :items="responsiveMenu" orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>
  </template>

