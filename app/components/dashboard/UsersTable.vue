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

/**
 * Filtro por tipo de usuario. Sustituye a las seis entradas que había en la
 * barra lateral. Cuando la página fija un rol (`/usuarios/rol/...`) el selector
 * no se muestra y esta tabla se comporta como antes.
 */
const roleFilter = ref<UserRole | 'todos'>(props.role ?? 'todos');

watch(() => props.role, (next) => {
  roleFilter.value = next ?? 'todos';
});

/** Sólo se ofrecen los roles que el actor puede administrar. */
const roleItems = computed(() => [
  { label: 'Todos los roles', value: 'todos' as const, icon: 'i-lucide-users' },
  ...manageableRoles(actorRole.value).map(role => ({
    label: `${ROLE_LABELS[role]}s`,
    value: role,
    icon: ROLE_ICONS[role],
  })),
]);

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
  const wanted = roleFilter.value;

  return (users.value ?? []).filter((user) => {
    if (wanted !== 'todos' && user.role !== wanted) return false;
    if (!term) return true;

    return [user.full_name, user.email, user.referral_code]
      .some(field => field?.toLowerCase().includes(term));
  });
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
        class="min-w-48 max-w-sm flex-1"
      />

      <USelectMenu
        v-if="!props.role"
        v-model="roleFilter"
        :items="roleItems"
        value-key="value"
        :icon="roleFilter === 'todos' ? 'i-lucide-users' : ROLE_ICONS[roleFilter]"
        class="w-full sm:w-52"
      />

      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="outline"
        :loading="status === 'pending'"
        aria-label="Actualizar la lista"
        @click="refresh()"
      />
      <UButton
        icon="i-lucide-user-plus"
        label="Crear usuario"
        class="max-sm:grow"
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
