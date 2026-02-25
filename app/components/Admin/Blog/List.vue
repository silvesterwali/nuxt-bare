<script setup lang="ts">
import { h, resolveComponent } from "vue";
import { formatTimeAgo } from "@vueuse/core";
import type { TableColumn } from "@nuxt/ui";
import type { BlogPost } from "@/types/blog";

const UBadge = resolveComponent("UBadge");

const { locale } = useI18n();
const { search, page, params } = useBlogListState();
const { data: posts, isLoading: pending } = usePostsQuery(params);
const { mutate: deletePost } = usePostDeleteMutation();

function handleDeletePost(id: number) {
  if (!confirm("Are you sure you want to delete this post?")) return;
  deletePost(id);
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

const columns: TableColumn<BlogPost>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "language",
    header: "Language",
    cell: ({ row }) =>
      h(UBadge, { color: "primary", variant: "subtle" }, () =>
        row.getValue("language"),
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const color = status === "published" ? "success" : "neutral";
      return h(UBadge, { color, variant: "subtle" }, () => status);
    },
  },
  {
    accessorKey: "author.name",
    header: "Author",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) =>
      formatTimeAgo(new Date(row.getValue("createdAt") as string)),
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

      <UTable :data="posts?.data || []" :columns="columns" :loading="pending" />

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
  </div>
</template>
