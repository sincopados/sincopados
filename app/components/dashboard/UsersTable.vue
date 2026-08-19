<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { UBadge, UButton, UDropdownMenu } from '#components';
import type { Database, Profile, UserRole } from '~/types/db';

const props = defineProps<{
  /** Si se indica, la tabla sólo muestra ese rol. */
  role?: UserRole
}>();

const client = useSupabaseClient<Database>();
const toast = useToast();
const localePath = useLocalePath();
const { role: actorRole, profile: actorProfile } = useProfile();

const search = ref('');
const deletingId = ref<string | null>(null);

const { data: users, status, refresh } = await useAsyncData<Profile[]>(
  () => `users-${props.role ?? 'all'}`,
  async () => {
    let query = client.from('profiles').select('*').order('created_at', { ascending: false });

    if (props.role) query = query.eq('role', props.role);

    const { data, error } = await query;
    if (error) throw error;

    return data ?? [];
  },
  { watch: [() => props.role] },
);

const rows = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return users.value ?? [];

  return (users.value ?? []).filter(user =>
    [user.full_name, user.email, user.referral_code]
      .some(field => field?.toLowerCase().includes(term)),
  );
});

const removeUser = async (user: Profile) => {
  if (!confirm(`¿Eliminar a ${user.full_name || user.email}? Esta acción no se puede deshacer.`)) return;

  deletingId.value = user.id;

  try {
    await $fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    toast.add({ title: 'Usuario eliminado', color: 'success' });
    await refresh();
  }
  catch (error) {
    toast.add({
      title: 'No se pudo eliminar',
      description: (error as { statusMessage?: string }).statusMessage ?? 'Error inesperado',
      color: 'error',
    });
  }
  finally {
    deletingId.value = null;
  }
};

const columns: TableColumn<Profile>[] = [
  {
    accessorKey: 'full_name',
    header: 'Nombre',
    cell: ({ row }) => row.original.full_name || '—',
  },
  { accessorKey: 'email', header: 'Correo' },
  {
    accessorKey: 'role',
    header: 'Rol',
    cell: ({ row }) => h(
      UBadge,
      { color: ROLE_COLORS[row.original.role], variant: 'subtle' },
      () => ROLE_LABELS[row.original.role],
    ),
  },
  {
    accessorKey: 'referral_code',
    header: 'Código',
    cell: ({ row }) => h('code', { class: 'text-xs' }, row.original.referral_code),
  },
  {
    accessorKey: 'is_active',
    header: 'Estado',
    cell: ({ row }) => h(
      UBadge,
      { color: row.original.is_active ? 'success' : 'neutral', variant: 'subtle' },
      () => (row.original.is_active ? 'Activo' : 'Inactivo'),
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const user = row.original;
      const editable = canManageRole(actorRole.value, user.role);
      const deletable = editable && user.id !== actorProfile.value?.id;

      return h('div', { class: 'flex justify-end' }, [
        h(UDropdownMenu, {
          items: [[
            {
              label: 'Editar',
              icon: 'i-lucide-pencil',
              disabled: !editable,
              to: localePath(`/dashboard/usuarios/${user.id}`),
            },
            {
              label: 'Eliminar',
              icon: 'i-lucide-trash-2',
              color: 'error' as const,
              disabled: !deletable,
              onSelect: () => removeUser(user),
            },
          ]],
          content: { align: 'end' },
        }, {
          default: () => h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            variant: 'ghost',
            square: true,
            loading: deletingId.value === user.id,
          }),
        }),
      ]);
    },
  },
];
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar por nombre, correo o código"
        class="max-w-sm flex-1"
      />
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="outline"
        :loading="status === 'pending'"
        @click="refresh()"
      />
      <UButton
        icon="i-lucide-user-plus"
        label="Crear usuario"
        :to="localePath('/dashboard/usuarios/nuevo')"
      />
    </div>

    <UTable
      :data="rows"
      :columns="columns"
      :loading="status === 'pending'"
      empty="No hay usuarios que coincidan"
      class="rounded-lg border border-default"
    />
  </div>
</template>
