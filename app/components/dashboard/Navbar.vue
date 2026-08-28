<script setup lang="ts">
import type { BreadcrumbItem, DropdownMenuItem } from '@nuxt/ui';

const route = useRoute();
const localePath = useLocalePath();
const { t } = useI18n();
const { profile, role } = useProfile();
const { user, signOut } = useAuth();

const roleLabel = computed(() => (role.value ? ROLE_LABELS[role.value] : ''));

// Título que la página de detalle publica para el último tramo, porque una
// ruta dinámica mostraría el identificador en crudo.
const breadcrumbTitle = useBreadcrumbTitle();

// Miga de pan derivada de la ruta, para no mantener una lista aparte.
const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const segments = route.path.split('/').filter(Boolean).filter(s => s !== 'dashboard');

  return [
    { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: localePath('/dashboard') },
    ...segments.map((segment, index) => ({
      label: index === segments.length - 1 && breadcrumbTitle.value
        ? breadcrumbTitle.value
        : decodeURIComponent(segment).replace(/-/g, ' '),
      to: localePath(`/dashboard/${segments.slice(0, index + 1).join('/')}`),
    })),
  ];
});

/** Último tramo de la miga: es lo único que cabe en la cabecera de móvil. */
const currentCrumb = computed(() => {
  const items = breadcrumbItems.value;
  return items[items.length - 1]?.label ?? '';
});

const userMenuItems = computed<DropdownMenuItem[][]>(() => {
  if (!user.value) {
    return [[
      { label: t('loginTitle'), icon: 'i-lucide-log-in', to: localePath('/login') },
      { label: t('registerTitle'), icon: 'i-lucide-user-plus', to: localePath('/register') },
    ]];
  }

  return [
    [{
      label: profile.value?.full_name || profile.value?.email || '',
      type: 'label' as const,
      avatar: { src: profile.value?.avatar_url || undefined, alt: profile.value?.full_name || '' },
    }],
    [
      { label: t('navProfile'), icon: 'i-lucide-user', to: localePath('/dashboard/perfil') },
      { label: t('navReferrals'), icon: 'i-lucide-share-2', to: localePath('/dashboard/referidos') },
    ],
    [{ label: t('logout'), icon: 'i-lucide-log-out', onSelect: () => signOut() }],
  ];
});
</script>

<template>
  <div class="sticky top-0 z-10 border-b border-default bg-primary/10">
    <div class="flex items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
      <!-- Sin este botón la barra lateral es inalcanzable en móvil: el
           componente ya trae `lg:hidden`, así que sólo aparece donde hace falta. -->
      <UDashboardSidebarToggle class="-ms-1" />

      <UBreadcrumb
        :items="breadcrumbItems"
        :ui="{
          root: 'min-w-0',
          list: 'text-sm font-medium capitalize flex-nowrap',
          item: 'truncate',
        }"
        class="hidden min-w-0 sm:flex"
      />

      <!-- En móvil la miga completa no cabe: se deja sólo el tramo actual. -->
      <p class="min-w-0 flex-1 truncate text-sm font-medium capitalize sm:hidden">
        {{ currentCrumb }}
      </p>

      <div class="ms-auto flex shrink-0 items-center gap-2 sm:gap-4">
        <UBadge
          v-if="roleLabel"
          :color="role ? ROLE_COLORS[role] : 'neutral'"
          variant="subtle"
          class="hidden sm:inline-flex"
        >
          {{ roleLabel }}
        </UBadge>

        <USeparator orientation="vertical" class="hidden h-6 sm:block" />

        <UDropdownMenu :items="userMenuItems" :content="{ align: 'end' }">
          <UButton
            :avatar="user ? { src: profile?.avatar_url || undefined, alt: profile?.full_name || '' } : undefined"
            :icon="user ? undefined : 'i-lucide-user'"
            color="neutral"
            variant="ghost"
            trailing-icon="i-lucide-chevron-down"
            :label="user ? (profile?.full_name || $t('account')) : $t('loginTitle')"
            :ui="{ label: 'hidden sm:inline' }"
          />
        </UDropdownMenu>
      </div>
    </div>
  </div>
</template>
