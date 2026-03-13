<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { formatTimeAgo } from "@vueuse/core";

const { locale } = useI18n();
const { search, page, params } = useBlogListState();
const { data: posts, isLoading: pending } = usePostsQuery(params);
const { mutate: deletePost, isLoading: deleting } = usePostDeleteMutation();
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");

const confirmDeleteOpen = ref(false);
const postToDelete = ref<number | null>(null);

function handleDeletePost(id: number) {
  postToDelete.value = id;
  confirmDeleteOpen.value = true;
}

function confirmDelete() {
  if (postToDelete.value) {
    deletePost(postToDelete.value);
    postToDelete.value = null;
  }
}

function getRowActions(rowId: number) {
  return [
    {
      label: "Edit",
      icon: "i-lucide-pencil",
      to: `/admin/blog/${rowId}/edit`,
    },
    {
      label: "Delete",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect: () => handleDeletePost(rowId),
    },
  ];
}

const columnsData: TableColumn<BlogPost>[] = [
  {
    accessorKey: "title",
    header: "Title",
    meta: {
      class: {
        th: "text-left",
        td: "text-left",
      },
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "language",
    header: "Language",
    meta: {
      class: {
        th: "text-center",
        td: "text-center",
      },
    },
    cell: ({ row }) =>
      h(UBadge, { color: "primary", variant: "subtle", size: "sm" }, () =>
        (row.getValue("language") as string).toUpperCase(),
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      class: {
        th: "text-center",
        td: "text-center",
      },
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const color = status === "published" ? "success" : "neutral";
      return h(
        UBadge,
        { color, variant: "subtle", class: "capitalize", size: "sm" },
        () => status,
      );
    },
  },
  {
    accessorKey: "author.name",
    header: "Author",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    meta: {
      class: {
        th: "text-right",
        td: "text-right text-sm",
      },
    },
    cell: ({ row }) =>
      formatTimeAgo(new Date(row.getValue("createdAt") as string)),
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
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Blog Posts</h2>
        <p class="text-gray-500 dark:text-gray-400">
          Manage your localized content. Currently editing in
          <span class="font-semibold uppercase">{{ locale }}</span> language.
        </p>
      </div>

      <NuxtLink to="/admin/blog/create">
        <UButton icon="i-lucide-plus" label="New Post" />
      </NuxtLink>
    </div>

    <UCard>
      <div
        class="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700"
      >
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search posts..."
          class="w-full max-w-xs"
        />
      </div>

      <UTable
        :data="posts?.data || []"
        :columns="columnsData as any"
        :loading="pending"
      />

      <div
        class="flex justify-end p-3 border-t border-gray-200 dark:border-gray-700"
      >
        <UPagination
          v-model:page="page"
          :total="posts?.meta?.total || 0"
          :items-per-page="posts?.meta?.limit || 10"
        />
      </div>
    </UCard>

    <!-- Confirm Delete Modal -->
    <CommonConfirmDelete
      v-model:open="confirmDeleteOpen"
      title="Delete Blog Post"
      message="Are you sure you want to delete this blog post? This action cannot be undone and all content will be permanently removed."
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>
