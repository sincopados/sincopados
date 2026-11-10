<script setup lang="ts">
definePageMeta({
  middleware: 'role',
  roles: ['superusuario'],
})

const { leads, filtered, status, error, refresh, interest, search, countByInterest } = useMediaNetworkLeads()

const filterItems = [
  { label: 'Todos los intereses', value: 'todos' },
  ...MEDIA_NETWORK_INTERESTS.map(value => ({ label: MEDIA_NETWORK_INTEREST_LABELS[value], value })),
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Media Network</h1>
        <p class="mt-1 text-muted">
          Postulaciones de la convocatoria abierta en
          <ULink to="/sincopados-media-network" target="_blank" class="text-primary">/sincopados-media-network</ULink>.
        </p>
      </div>

      <UButton
        icon="i-lucide-refresh-cw"
        label="Actualizar"
        color="neutral"
        variant="subtle"
        :loading="status === 'pending'"
        @click="() => refresh()"
      />
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <DashboardStatCard label="Postulaciones" :value="leads.length" icon="i-lucide-inbox" />
      <DashboardStatCard
        v-for="key in MEDIA_NETWORK_INTERESTS"
        :key="key"
        :label="MEDIA_NETWORK_INTEREST_LABELS[key]"
        :value="countByInterest[key]"
        :icon="MEDIA_NETWORK_INTEREST_ICONS[key]"
      />
    </div>

    <UAlert
      v-if="error"
      icon="i-lucide-triangle-alert"
      color="error"
      variant="subtle"
      title="No se pudieron cargar las postulaciones"
      :description="error.statusMessage ?? error.message"
    />

    <div class="flex flex-wrap gap-3">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar por nombre o WhatsApp"
        class="w-full sm:w-72"
      />
      <USelect v-model="interest" :items="filterItems" class="w-full sm:w-64" />
    </div>

    <DashboardMediaNetworkLeadsTable :leads="filtered" :loading="status === 'pending'" />
  </div>
</template>
