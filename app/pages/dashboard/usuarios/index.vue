<script setup lang="ts">
definePageMeta({
  middleware: 'role',
  roles: ['superusuario', 'tutor'],
});

const { isSuperuser } = useProfile();
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">Usuarios</h1>
      <p class="mt-1 text-muted">
        {{ isSuperuser
          ? 'Administra todos los usuarios del sistema.'
          : 'Administra clientes, alumnos y afiliados.' }}
      </p>
    </div>

    <DashboardUsersTable />
  </div>
</template>
