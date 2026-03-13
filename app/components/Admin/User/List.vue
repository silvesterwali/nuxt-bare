<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";

const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");

const { search, page, params } = useUserListState();
const { data: users, isLoading: pending } = useUsersQuery(params);
const { mutate: deleteUser, isLoading: deleting } = useUserDeleteMutation();

const confirmDeleteOpen = ref(false);
const userToDelete = ref<number | null>(null);
const userToDeleteEmail = ref<string>("");

function handleDeleteUser(id: number, email: string) {
  userToDelete.value = id;
  userToDeleteEmail.value = email;
  confirmDeleteOpen.value = true;
}

function confirmDelete() {
  if (userToDelete.value) {
    deleteUser(userToDelete.value);
    userToDelete.value = null;
    userToDeleteEmail.value = "";
  }
}

function getRowActions(rowId: number) {
  const user = users.value?.data?.find((u) => u.id === rowId);
  return [
    {
      label: "Edit User",
      icon: "i-lucide-pencil",
      to: `/admin/users/${rowId}`,
    },
    {
      label: "Delete User",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect: () => handleDeleteUser(rowId, user?.email || ""),
    },
  ];
}

const roleColors: Record<string, string> = {
  admin: "error",
  user: "primary",
  moderator: "warning",
};

const columnsData: TableColumn<UserWithProfile>[] = [
  {
    accessorKey: "email",
    header: "Email",
    meta: {
      class: {
        th: "text-left",
        td: "text-left",
      },
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    meta: {
      class: {
        th: "text-left",
        td: "text-left",
      },
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    meta: {
      class: {
        th: "text-center",
        td: "text-center",
      },
    },
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const color = roleColors[role] || "neutral";
      return h(
        UBadge,
        { color, variant: "subtle", class: "capitalize", size: "sm" },
        () => role,
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    meta: {
      class: {
        th: "text-right",
        td: "text-right text-sm",
      },
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") as string);
      return date.toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
  {
    id: "actions",
    header: "Actions",
    meta: {
      class: {
        th: "text-right",
        td: "text-right",
      },
    },
    cell: ({ row }) =>
      h(
        UDropdownMenu,
        {
          items: getRowActions(row.original.id),
          content: { align: "end" },
        },
        () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
            size: "sm",
            "aria-label": "Actions",
          }),
      ),
  },
];
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Manage Users</h1>
      <UButton to="/admin/users/new" icon="i-lucide-plus">Add User</UButton>
    </div>

    <UCard>
      <div
        class="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700"
      >
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search users..."
          class="w-full max-w-xs"
        />
      </div>

      <UTable
        :columns="columnsData as any"
        :data="users?.data || []"
        :loading="pending"
      />

      <div
        class="flex justify-end p-3 border-t border-gray-200 dark:border-gray-700"
      >
        <UPagination
          v-model:page="page"
          :total="users?.meta?.total || 0"
          :items-per-page="users?.meta?.limit || 10"
        />
      </div>
    </UCard>

    <!-- Confirm Delete Modal -->
    <CommonConfirmDelete
      v-model:open="confirmDeleteOpen"
      title="Delete User"
      message="Are you sure you want to delete this user? This action cannot be undone."
      :item-name="userToDeleteEmail"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>
