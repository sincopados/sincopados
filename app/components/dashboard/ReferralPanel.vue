<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { UBadge } from '#components';
import type { Database, Profile, ReferralEarning, ReferralSummary } from '~/types/db';

const client = useSupabaseClient<Database>();
const userId = useAuthUserId();
const toast = useToast();
const { profile } = useProfile();

const referralLink = computed(() => {
  if (!profile.value?.referral_code) return '';
  const origin = import.meta.client ? window.location.origin : '';
  return `${origin}/register?ref=${profile.value.referral_code}`;
});

const copy = async (value: string, title: string) => {
  await navigator.clipboard.writeText(value);
  toast.add({ title, icon: 'i-lucide-check', color: 'success' });
};

const { data: summary } = await useAsyncData<ReferralSummary | null>(
  'referral-summary',
  async () => {
    if (!userId.value) return null;

    const { data, error } = await client
      .from('referral_summary')
      .select('*')
      .eq('profile_id', userId.value)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
  { watch: [userId] },
);

const { data: referred, status: referredStatus } = await useAsyncData<Profile[]>(
  'referral-referred',
  async () => {
    if (!userId.value) return [];

    // La RLS de `profiles` permite ver a quienes uno mismo refirió.
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('referred_by', userId.value)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },
  { watch: [userId] },
);

const { data: earnings, status: earningsStatus } = await useAsyncData<ReferralEarning[]>(
  'referral-earnings',
  async () => {
    if (!userId.value) return [];

    const { data, error } = await client
      .from('referral_earnings')
      .select('*')
      .eq('referrer_id', userId.value)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },
  { watch: [userId] },
);

const money = (value: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

const referredColumns: TableColumn<Profile>[] = [
  { accessorKey: 'full_name', header: 'Nombre', cell: ({ row }) => row.original.full_name || '—' },
  { accessorKey: 'email', header: 'Correo' },
  {
    accessorKey: 'role',
    header: 'Rol',
    cell: ({ row }) => h(UBadge, { color: ROLE_COLORS[row.original.role], variant: 'subtle' }, () => ROLE_LABELS[row.original.role]),
  },
  {
    accessorKey: 'created_at',
    header: 'Registrado',
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('es-CO'),
  },
];

const earningColumns: TableColumn<ReferralEarning>[] = [
  {
    accessorKey: 'source_type',
    header: 'Origen',
    cell: ({ row }) => (row.original.source_type === 'curso' ? 'Curso' : 'Servicio'),
  },
  {
    accessorKey: 'base_amount',
    header: 'Base',
    cell: ({ row }) => money(row.original.base_amount, row.original.currency),
  },
  {
    accessorKey: 'rate',
    header: 'Comisión',
    cell: ({ row }) => `${(row.original.rate * 100).toFixed(1)} %`,
  },
  {
    accessorKey: 'amount',
    header: 'Ganado',
    cell: ({ row }) => money(row.original.amount, row.original.currency),
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => h(
      UBadge,
      {
        variant: 'subtle',
        color: row.original.status === 'pagado'
          ? 'success'
          : row.original.status === 'anulado' ? 'error' : 'warning',
      },
      () => row.original.status,
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Fecha',
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('es-CO'),
  },
];
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        label="Referidos"
        :value="summary?.referred_count ?? 0"
        icon="i-lucide-users"
      />
      <DashboardStatCard
        label="Total ganado"
        :value="money(summary?.total_earned ?? 0)"
        icon="i-lucide-wallet"
        color="text-success"
      />
      <DashboardStatCard
        label="Pendiente de pago"
        :value="money(summary?.pending_earned ?? 0)"
        icon="i-lucide-hourglass"
        color="text-warning"
      />
      <DashboardStatCard
        label="Pagado"
        :value="money(summary?.paid_earned ?? 0)"
        icon="i-lucide-badge-check"
        color="text-primary"
      />
    </div>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Tu código de referido</h2>
      </template>

      <div class="flex flex-wrap items-center gap-4">
        <div class="rounded-lg border border-dashed border-default px-6 py-4">
          <p class="font-mono text-2xl font-bold tracking-widest text-primary">
            {{ profile?.referral_code ?? '········' }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton
            icon="i-lucide-copy"
            label="Copiar código"
            color="neutral"
            variant="outline"
            :disabled="!profile?.referral_code"
            @click="copy(profile!.referral_code, 'Código copiado')"
          />
          <UButton
            icon="i-lucide-link"
            label="Copiar enlace"
            :disabled="!referralLink"
            @click="copy(referralLink, 'Enlace copiado')"
          />
        </div>
      </div>

      <template #footer>
        <p class="text-sm text-muted">
          Cada persona que se registre con tu código queda vinculada a ti, y cada
          servicio o curso que contrate genera una comisión a tu favor.
        </p>
      </template>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Usuarios que has referido</h2>
      </template>

      <UTable
        :data="referred ?? []"
        :columns="referredColumns"
        :loading="referredStatus === 'pending'"
        empty="Todavía no has referido a nadie"
      />
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Comisiones generadas</h2>
      </template>

      <UTable
        :data="earnings ?? []"
        :columns="earningColumns"
        :loading="earningsStatus === 'pending'"
        empty="Aún no hay comisiones registradas"
      />
    </UCard>
  </div>
</template>
