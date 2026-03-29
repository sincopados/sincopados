  <script setup lang="ts">
  import type { NavigationMenuItem, DropdownMenuItem, SelectMenuItem } from '@nuxt/ui';

  const route = useRoute();

  const { locales, setLocale } = useI18n()


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

  const languages = ref<SelectMenuItem[]>([
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
    }
  ]);
  const value = ref({
    label: 'Español'
  });

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
          :ui="{
            content: 'w-48'
          }"
        >
          <UButton label="Open" icon="i-lucide-menu" color="neutral" variant="outline" />
        </UDropdownMenu>
        <USelectMenu v-model="value" :items="languages" class="w-24" />
      </template>

      <template #body>
        <UNavigationMenu :items="responsiveMenu" orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>
  </template>

