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
    <div class="flex items-center justify-between gap-4 px-6 py-4">
      <UBreadcrumb
        :items="breadcrumbItems"
        :ui="{ list: 'text-sm font-medium capitalize' }"
      />

      <div class="ms-auto flex items-center gap-4">
        <UBadge v-if="roleLabel" :color="role ? ROLE_COLORS[role] : 'neutral'" variant="subtle">
          {{ roleLabel }}
        </UBadge>

        <USeparator orientation="vertical" class="h-6" />

        <UDropdownMenu :items="userMenuItems" :content="{ align: 'end' }">
          <UButton
            :avatar="user ? { src: profile?.avatar_url || undefined, alt: profile?.full_name || '' } : undefined"
            :icon="user ? undefined : 'i-lucide-user'"
            color="neutral"
            variant="ghost"
            trailing-icon="i-lucide-chevron-down"
            :label="user ? (profile?.full_name || $t('account')) : $t('loginTitle')"
          />
        </UDropdownMenu>
      </div>
    </div>
  </div>
</template>
