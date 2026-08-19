<script setup lang="ts">
const { main, referrals, account } = useDashboardNav();
const { profile, role } = useProfile();

const roleLabel = computed(() => (role.value ? ROLE_LABELS[role.value] : ''));
const displayName = computed(() => profile.value?.full_name || profile.value?.email || '');
</script>

<template>
  <UDashboardSidebar
    collapsible
    resizable
    :ui="{ footer: 'border-t border-default' }"
  >
    <template #header="{ collapsed }">
      <UDashboardSidebarCollapse variant="subtle" />
      <IconsLogo v-if="!collapsed" class="h-6 w-auto" />
    </template>

    <template #default="{ collapsed }">
      <UNavigationMenu
        :collapsed="collapsed"
        :items="main"
        orientation="vertical"
      />

      <USeparator v-if="!collapsed" :label="$t('navReferrals')" class="my-2" />

      <UNavigationMenu
        :collapsed="collapsed"
        :items="referrals"
        orientation="vertical"
      />

      <UNavigationMenu
        :collapsed="collapsed"
        :items="account"
        orientation="vertical"
        class="mt-auto"
      />
    </template>

    <template #footer="{ collapsed }">
      <div class="flex w-full items-center gap-2 overflow-hidden">
        <UAvatar
          :src="profile?.avatar_url || undefined"
          :alt="displayName"
          icon="i-lucide-user"
          size="sm"
        />
        <div v-if="!collapsed" class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{{ displayName }}</p>
          <p class="truncate text-xs text-muted">{{ roleLabel }}</p>
        </div>
      </div>
    </template>
  </UDashboardSidebar>
</template>
