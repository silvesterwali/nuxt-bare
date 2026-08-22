<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";

const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");

const { search, page, params } = useUrlListState({
  filters: ["search"],
  debounce: ["search"],
  params: ({ page, search }) => ({
    page: page.value,
    search: search.value,
    limit: 10,
  }),
});
const { data: users, isLoading: pending } = useUsersQuery(params);
const { mutate: deleteUser, isLoading: deleting } = useUserDeleteMutation();
const { mutate: resendVerification, isLoading: resending } =
  useResendVerificationMutation();

const limit = computed(() => users.value?.meta?.per_page ?? 10);
const total = computed(() => users.value?.meta?.total ?? 0);
const paginationFrom = computed(() =>
  total.value === 0
    ? 0
    : Math.min((page.value - 1) * limit.value + 1, total.value),
);
const paginationTo = computed(() =>
  Math.min(page.value * limit.value, total.value),
);

// ── Delete confirmation ─────────────────────────────────────────────────
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
  }
}

// ── Resend verification confirmation ────────────────────────────────────
const confirmResendOpen = ref(false);
const userToResend = ref<{ id: number; email: string } | null>(null);

function handleResendVerification(id: number, email: string) {
  userToResend.value = { id, email };
  confirmResendOpen.value = true;
}

function confirmResendVerification() {
  if (userToResend.value) {
    resendVerification(userToResend.value.id);
  }
}

// Close modal after resend completes (success or error)
watch(resending, (loading, prev) => {
  if (prev && !loading) {
    confirmResendOpen.value = false;
    userToResend.value = null;
  }
});

// ── Row actions ─────────────────────────────────────────────────────────
function getRowActions(rowId: number) {
  const user = users.value?.data?.find((u) => u.id === rowId);
  const actions: any[] = [
    {
      label: "Edit User",
      icon: "i-lucide-pencil",
      to: `/admin/users/${rowId}`,
    },
  ];

  // Show "Resend Verification" only for unverified users
  if (user && !user.emailVerified) {
    actions.push({
      label: "Resend Verification",
      icon: "i-lucide-mail-check",
      onSelect: () => handleResendVerification(rowId, user.email),
    });
  }

  actions.push({
    label: "Delete User",
    icon: "i-lucide-trash-2",
    color: "error",
    onSelect: () => handleDeleteUser(rowId, user?.email || ""),
  });

  return actions;
}

// ── Table columns ───────────────────────────────────────────────────────
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
    accessorKey: "emailVerified",
    header: "Verified",
    meta: {
      class: {
        th: "text-center",
        td: "text-center",
      },
    },
    cell: ({ row }) => {
      const verified = row.getValue("emailVerified") as boolean;
      return h(
        UBadge,
        {
          color: verified ? "success" : "warning",
          variant: "subtle",
          size: "sm",
        },
        () => (verified ? "Verified" : "Pending"),
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
  <div class="flex flex-col gap-4">
    <CommonPageHeader title="Manage Users">
      <UButton to="/admin/users/new" icon="i-lucide-plus">Add User</UButton>
    </CommonPageHeader>

    <UCard :ui="{ body: 'p-0' }">
      <template #header>
        <div class="flex items-center gap-3">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search users..."
            class="w-full max-w-xs"
          />
          <span class="text-sm text-muted ml-auto">{{ total }} results</span>
        </div>
      </template>

      <UTable
        :columns="columnsData"
        :data="users?.data || []"
        :loading="pending"
      />

      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm text-muted">
            Showing {{ paginationFrom }}–{{ paginationTo }} of {{ total }}
          </p>
          <UPagination
            v-model:page="page"
            :total="users?.meta?.total || 0"
            :items-per-page="users?.meta?.per_page || 10"
          />
        </div>
      </template>
    </UCard>

    <!-- Confirm Delete Modal -->
    <UModal
      v-model:open="confirmDeleteOpen"
      title="Delete User"
      icon="i-lucide-trash-2"
    >
      <template #body>
        <div class="flex flex-col gap-3">
          <p>
            Are you sure you want to delete
            <strong>{{ userToDeleteEmail }}</strong
            >?
          </p>

          <UAlert
            color="error"
            variant="subtle"
            icon="i-lucide-alert-triangle"
            title="This action cannot be undone"
            description="All data associated with this user will be permanently removed."
          />
        </div>
      </template>

      <template #footer>
        <div class="flex justify-between w-full">
          <UButton
            color="neutral"
            variant="outline"
            @click="confirmDeleteOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            color="error"
            :loading="deleting"
            @click="confirmDelete"
          >
            Delete User
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Confirm Resend Verification Modal -->
    <UModal
      v-model:open="confirmResendOpen"
      title="Resend Verification Email"
      icon="i-lucide-mail-check"
    >
      <template #body>
        <div class="flex flex-col gap-3">
          <p>
            Send a new email verification link to
            <strong>{{ userToResend?.email }}</strong
            >?
          </p>

          <UAlert
            color="warning"
            variant="subtle"
            icon="i-lucide-alert-triangle"
            title="Please verify before sending"
            description="Only resend if the user reports not receiving the original email. Sending repeated verification emails may be flagged as spam by email providers."
          />
        </div>
      </template>

      <template #footer>
        <div class="flex justify-between w-full">
          <UButton
            color="neutral"
            variant="outline"
            @click="confirmResendOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            color="primary"
            :loading="resending"
            @click="confirmResendVerification"
          >
            Send Verification Email
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
