<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { UBadge, UButton, UDropdownMenu } from '#components';
import type { Database, ReferralEarning, ReferralSummary } from '~/types/db';

definePageMeta({
  middleware: 'role',
  roles: ['superusuario'],
});

const client = useSupabaseClient<Database>();
const toast = useToast();

const money = (value: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

const { data: summaries, status } = await useAsyncData<ReferralSummary[]>('referral-global', async () => {
  const { data, error } = await client
    .from('referral_summary')
    .select('*')
    .order('total_earned', { ascending: false });

  if (error) throw error;
  return data ?? [];
});

const { data: earnings, status: earningsStatus, refresh: refreshEarnings } = await useAsyncData<ReferralEarning[]>(
  'referral-global-earnings',
  async () => {
    const { data, error } = await client
      .from('referral_earnings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    return data ?? [];
  },
);

const totals = computed(() => ({
  earned: (summaries.value ?? []).reduce((sum, row) => sum + Number(row.total_earned), 0),
  pending: (summaries.value ?? []).reduce((sum, row) => sum + Number(row.pending_earned), 0),
  paid: (summaries.value ?? []).reduce((sum, row) => sum + Number(row.paid_earned), 0),
  referred: (summaries.value ?? []).reduce((sum, row) => sum + Number(row.referred_count), 0),
}));

// Sólo el superusuario tiene política de UPDATE sobre `referral_earnings`.
const markAs = async (earning: ReferralEarning, status: ReferralEarning['status']) => {
  const { error } = await client.from('referral_earnings').update({ status }).eq('id', earning.id);

  if (error) {
    toast.add({ title: 'No se pudo actualizar', description: error.message, color: 'error' });
    return;
  }

  toast.add({ title: `Comisión marcada como ${status}`, color: 'success' });
  await refreshEarnings();
};

const summaryColumns: TableColumn<ReferralSummary>[] = [
  { accessorKey: 'full_name', header: 'Usuario', cell: ({ row }) => row.original.full_name || row.original.email },
  {
    accessorKey: 'role',
    header: 'Rol',
    // Postgres declara nullable toda columna de una vista, de ahí los fallbacks.
    cell: ({ row }) => {
      const role = row.original.role;
      return role
        ? h(UBadge, { color: ROLE_COLORS[role], variant: 'subtle' }, () => ROLE_LABELS[role])
        : '—';
    },
  },
  { accessorKey: 'referral_code', header: 'Código', cell: ({ row }) => h('code', { class: 'text-xs' }, row.original.referral_code ?? '—') },
  { accessorKey: 'referred_count', header: 'Referidos', cell: ({ row }) => row.original.referred_count ?? 0 },
  { accessorKey: 'total_earned', header: 'Total', cell: ({ row }) => money(row.original.total_earned ?? 0) },
  { accessorKey: 'pending_earned', header: 'Pendiente', cell: ({ row }) => money(row.original.pending_earned ?? 0) },
  { accessorKey: 'paid_earned', header: 'Pagado', cell: ({ row }) => money(row.original.paid_earned ?? 0) },
];

const earningColumns: TableColumn<ReferralEarning>[] = [
  {
    accessorKey: 'created_at',
    header: 'Fecha',
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('es-CO'),
  },
  { accessorKey: 'source_type', header: 'Origen' },
  { accessorKey: 'amount', header: 'Comisión', cell: ({ row }) => money(row.original.amount, row.original.currency) },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => h(
      UBadge,
      {
        variant: 'subtle',
        color: row.original.status === 'pagado' ? 'success' : row.original.status === 'anulado' ? 'error' : 'warning',
      },
      () => row.original.status,
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => h('div', { class: 'flex justify-end' }, [
      h(UDropdownMenu, {
        items: [(['aprobado', 'pagado', 'anulado'] as const).map(status => ({
          label: `Marcar como ${status}`,
          icon: 'i-lucide-check',
          disabled: row.original.status === status,
          onSelect: () => markAs(row.original, status),
        }))],
        content: { align: 'end' },
      }, {
        default: () => h(UButton, {
          icon: 'i-lucide-ellipsis-vertical',
          color: 'neutral',
          variant: 'ghost',
          square: true,
        }),
      }),
    ]),
  },
];
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">Referidos globales</h1>
      <p class="mt-1 text-muted">Vista consolidada de todo el programa de referidos.</p>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard label="Referidos totales" :value="totals.referred" icon="i-lucide-users" />
      <DashboardStatCard label="Comisiones generadas" :value="money(totals.earned)" icon="i-lucide-wallet" color="text-success" />
      <DashboardStatCard label="Pendiente de pago" :value="money(totals.pending)" icon="i-lucide-hourglass" color="text-warning" />
      <DashboardStatCard label="Pagado" :value="money(totals.paid)" icon="i-lucide-badge-check" color="text-primary" />
    </div>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Ranking por usuario</h2>
      </template>

      <UTable
        :data="summaries ?? []"
        :columns="summaryColumns"
        :loading="status === 'pending'"
        empty="Sin datos de referidos"
      />
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Últimas comisiones</h2>
      </template>

      <UTable
        :data="earnings ?? []"
        :columns="earningColumns"
        :loading="earningsStatus === 'pending'"
        empty="Sin comisiones registradas"
      />
    </UCard>
  </div>
</template>
