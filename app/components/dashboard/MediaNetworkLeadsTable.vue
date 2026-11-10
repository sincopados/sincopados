<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { MediaNetworkLead } from '~/types/db'

defineProps<{ leads: MediaNetworkLead[], loading?: boolean }>()

const columns: TableColumn<MediaNetworkLead>[] = [
  { accessorKey: 'full_name', header: 'Nombre' },
  { accessorKey: 'whatsapp', header: 'WhatsApp' },
  { accessorKey: 'interests', header: 'Intereses' },
  { accessorKey: 'source', header: 'Origen' },
  { accessorKey: 'created_at', header: 'Fecha' },
]

const dateTime = (value: string) =>
  new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
</script>

<template>
  <UTable
    :data="leads"
    :columns="columns"
    :loading="loading"
    empty="No hay postulaciones con estos filtros."
    class="rounded-lg border border-default"
  >
    <template #full_name-cell="{ row }">
      <span class="font-medium text-highlighted">{{ row.original.full_name }}</span>
    </template>

    <template #whatsapp-cell="{ row }">
      <UButton
        :to="whatsappLink(row.original.whatsapp)"
        target="_blank"
        rel="noopener"
        :label="row.original.whatsapp"
        icon="i-simple-icons-whatsapp"
        color="success"
        variant="ghost"
        size="sm"
        class="font-mono"
      />
    </template>

    <template #interests-cell="{ row }">
      <div class="flex flex-wrap gap-1">
        <UBadge
          v-for="key in row.original.interests"
          :key="key"
          :icon="MEDIA_NETWORK_INTEREST_ICONS[key]"
          :label="MEDIA_NETWORK_INTEREST_LABELS[key]"
          color="neutral"
          variant="subtle"
          size="sm"
        />
      </div>
    </template>

    <template #source-cell="{ row }">
      <span class="text-muted">{{ row.original.source ?? '—' }}</span>
    </template>

    <template #created_at-cell="{ row }">
      <span class="whitespace-nowrap text-muted">{{ dateTime(row.original.created_at) }}</span>
    </template>
  </UTable>
</template>
