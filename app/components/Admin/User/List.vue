<script setup lang="ts">
const columns = [
  { accessorKey: "email", header: "Email", id: "email" },
  { accessorKey: "name", header: "Name", id: "name" },
  { accessorKey: "role", header: "Role", id: "role" },
  { accessorKey: "createdAt", header: "Created At", id: "createdAt" },
  { id: "actions", header: "Actions" },
];

const route = useRoute();
const router = useRouter();

const search = ref(route.query.search?.toString() || "");
const debouncedSearch = refDebounced(search, 300);
const page = ref(Number(route.query.page) || 1);

// Sync URL with state
watch(
  [debouncedSearch, page],
  async () => {
    // Check if search term changed compared to URL
    const searchChanged = debouncedSearch.value !== (route.query.search || "");

    // If search changed, reset page to 1
    if (searchChanged) {
      page.value = 1;
    }

    const query = { ...route.query };

    // Handle search query
    if (debouncedSearch.value) {
      query.search = debouncedSearch.value;
    } else {
      delete query.search;
    }

    // Handle page query - use 1 if search changed, otherwise current page
    const newPage = searchChanged ? 1 : page.value;
    if (newPage > 1) {
      query.page = newPage.toString();
    } else {
      delete query.page;
    }

    await router.replace({ query });
  },
  { deep: true },
);

// Sync state with URL (e.g. back/forward button)
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.search !== search.value) {
      search.value = newQuery.search?.toString() || "";
    }
    if (Number(newQuery.page || 1) !== page.value) {
      page.value = Number(newQuery.page) || 1;
    }
  },
);

const params = computed(() => ({
  page: page.value,
  search: debouncedSearch.value,
  limit: 10,
}));

const { data: users, isLoading: pending } = useUsersQuery(params);
const { mutate: deleteUser } = useUserDeleteMutation();

function handleDeleteUser(id: number) {
  if (!confirm("Are you sure?")) return;
  deleteUser(id);
}
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

      <UTable :columns="columns" :data="users?.data || []" :loading="pending">
        <template #actions-cell="{ row }">
          <UDropdownMenu
            :items="[
              {
                label: 'Edit User',
                icon: 'i-lucide-pencil',
                to: `/admin/users/${row.original.id}`,
              },
              {
                label: 'Delete User',
                icon: 'i-lucide-trash-2',
                color: 'error',
                onSelect: () => handleDeleteUser(Number(row.original.id)),
              },
            ]"
          >
            <UButton icon="i-lucide-ellipsis" color="neutral" variant="ghost" />
          </UDropdownMenu>
        </template>
      </UTable>

      <div
        class="flex justify-end p-3 border-t border-gray-200 dark:border-gray-700"
      >
        <UPagination
          v-model:page="page"
          :total="users?.meta?.total || 0"
          :items-per-page="users?.meta?.limit || 25"
        />
      </div>
    </UCard>
  </div>
</template>
