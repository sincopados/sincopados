<script setup lang="ts">
import type { Database } from '~/types/db';

const client = useSupabaseClient<Database>();
const userId = useAuthUserId();
const localePath = useLocalePath();
const { profile, role, isStaff, isSuperuser } = useProfile();

const money = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

// Un único bloque de métricas, filtrado por la RLS: cada rol recibe sólo
// aquello que puede ver, sin ramificar consultas por tipo de usuario.
const { data: stats } = await useAsyncData('dashboard-stats', async () => {
  if (!userId.value) return null;

  const [users, services, courses, summary] = await Promise.all([
    client.from('profiles').select('id', { count: 'exact', head: true }),
    client.from('client_services').select('id', { count: 'exact', head: true }).eq('status', 'activo'),
    client.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'activo'),
    client.from('referral_summary').select('*').eq('profile_id', userId.value).maybeSingle(),
  ]);

  return {
    users: users.count ?? 0,
    services: services.count ?? 0,
    courses: courses.count ?? 0,
    referredCount: summary.data?.referred_count ?? 0,
    totalEarned: summary.data?.total_earned ?? 0,
  };
}, { watch: [userId] });

const greeting = computed(() => profile.value?.full_name?.split(' ')[0] || profile.value?.email || '');
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-highlighted">
        Hola, {{ greeting }}
      </h1>
      <p class="mt-2 text-muted">
        Panel de {{ role ? ROLE_LABELS[role] : '' }}
      </p>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        v-if="isStaff"
        label="Usuarios visibles"
        :value="stats?.users ?? 0"
        icon="i-lucide-users"
        :hint="isSuperuser ? 'Todos los roles' : 'Clientes, alumnos y afiliados'"
      />
      <DashboardStatCard
        v-if="isStaff || role === 'cliente'"
        :label="role === 'cliente' ? 'Mis servicios activos' : 'Servicios activos'"
        :value="stats?.services ?? 0"
        icon="i-lucide-package-check"
        color="text-success"
      />
      <DashboardStatCard
        v-if="isStaff || role === 'alumno'"
        :label="role === 'alumno' ? 'Mis cursos activos' : 'Inscripciones activas'"
        :value="stats?.courses ?? 0"
        icon="i-lucide-book-open-check"
        color="text-secondary"
      />
      <DashboardStatCard
        label="Referidos"
        :value="stats?.referredCount ?? 0"
        icon="i-lucide-share-2"
      />
      <DashboardStatCard
        label="Ganado por referidos"
        :value="money(stats?.totalEarned ?? 0)"
        icon="i-lucide-wallet"
        color="text-success"
      />
    </div>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Accesos rápidos</h2>
      </template>

      <div class="flex flex-wrap gap-3">
        <UButton icon="i-lucide-user" label="Mi perfil" :to="localePath('/dashboard/perfil')" variant="outline" color="neutral" />
        <UButton icon="i-lucide-share-2" label="Mis referidos" :to="localePath('/dashboard/referidos')" variant="outline" color="neutral" />
        <UButton v-if="isStaff" icon="i-lucide-users" label="Gestionar usuarios" :to="localePath('/dashboard/usuarios')" variant="outline" color="neutral" />
        <UButton v-if="isSuperuser" icon="i-lucide-globe" label="Referidos globales" :to="localePath('/dashboard/referidos/global')" variant="outline" color="neutral" />
        <UButton v-if="role === 'cliente'" icon="i-lucide-package" label="Mis servicios" :to="localePath('/dashboard/mis-servicios')" variant="outline" color="neutral" />
        <UButton v-if="role === 'alumno'" icon="i-lucide-book-open" label="Mis cursos" :to="localePath('/dashboard/mis-cursos')" variant="outline" color="neutral" />
      </div>
    </UCard>
  </div>
</template>
