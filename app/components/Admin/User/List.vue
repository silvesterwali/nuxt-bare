<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { UserWithProfile } from "~/types/db";

const UBadge = resolveComponent("UBadge");

const { search, page, params } = useUserListState();
const { data: users, isLoading: pending } = useUsersQuery(params);
const { mutate: deleteUser } = useUserDeleteMutation();

function handleDeleteUser(id: number) {
  if (!confirm("Are you sure?")) return;
  deleteUser(id);
}

function getRowActions(rowId: number) {
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
      onSelect: () => handleDeleteUser(rowId),
    },
  ];
}

const roleColors: Record<string, string> = {
  admin: "error",
  user: "primary",
  moderator: "warning",
};

const columns: TableColumn<UserWithProfile>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const color = roleColors[role] || "neutral";
      return h(
        UBadge,
        { color, variant: "subtle", class: "capitalize" },
        () => role,
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
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
    cell: ({ row }) => {
      const UDropdownMenu = resolveComponent("UDropdownMenu");
      const UButton = resolveComponent("UButton");
      return h(
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
      );
    },
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

      <UTable :columns="columns" :data="users?.data || []" :loading="pending" />

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
  </div>
</template>
