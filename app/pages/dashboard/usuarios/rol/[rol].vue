<script setup lang="ts">
import type { UserRole } from '~/types/db';

definePageMeta({
  middleware: 'role',
  roles: ['superusuario', 'tutor'],
});

const route = useRoute();
const { role: actorRole } = useProfile();

const targetRole = route.params.rol as UserRole;

if (!USER_ROLES.includes(targetRole)) {
  throw createError({ statusCode: 404, statusMessage: 'Rol desconocido' });
}

// Un tutor no tiene por qué llegar a /usuarios/rol/superusuario: la RLS ya
// devolvería una lista vacía, pero el mensaje explícito es más útil.
const isAllowed = computed(() => canManageRole(actorRole.value, targetRole));
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">
        {{ ROLE_LABELS[targetRole] }}s
      </h1>
      <p class="mt-1 text-muted">Usuarios con el rol {{ ROLE_LABELS[targetRole] }}.</p>
    </div>

    <UAlert
      v-if="!isAllowed"
      color="warning"
      variant="subtle"
      icon="i-lucide-shield-alert"
      title="Sin permisos"
      description="Tu rol no permite administrar este tipo de usuario."
    />

    <DashboardUsersTable v-else :role="targetRole" />
  </div>
</template>
