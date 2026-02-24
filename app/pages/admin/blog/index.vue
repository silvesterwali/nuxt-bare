<script setup lang="ts">
import { formatTimeAgo } from "@vueuse/core";

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

const { locale } = useI18n();

// Fetch language-aware posts
const { data, status, refresh } = await useFetch("/api/admin/blog");

async function deletePost(id: number) {
  if (!confirm("Are you sure you want to delete this post?")) return;
  try {
    await $fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    useToast().add({ title: "Post deleted", color: "success" });
    refresh();
  } catch (e: any) {
    useToast().add({ title: "Failed to delete post", color: "error" });
  }
}

const columns = [
  { header: "ID", accessorKey: "id" },
  { header: "Slug", accessorKey: "slug" },
  { header: "Title", accessorKey: "title" },
  { header: "Language", accessorKey: "language" },
  { header: "Status", accessorKey: "status" },
  { header: "Author", accessorKey: "author.name" },
  { header: "Created", accessorKey: "createdAt" },
  { header: "Actions", accessorKey: "actions" },
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
      <UTable
        :data="data?.data || []"
        :columns="columns"
        :loading="status === 'pending'"
      >
        <template #status-cell="{ row }">
          <UBadge
            :color="
              (row.original as any)?.status === 'published'
                ? 'success'
                : 'neutral'
            "
            variant="subtle"
          >
            {{
              (row.original as any)?.status === "published"
                ? "Published"
                : "Draft"
            }}
          </UBadge>
        </template>
        <template #language-cell="{ row }">
          <UBadge color="primary" variant="subtle">
            {{ (row.original as any)?.language }}
          </UBadge>
        </template>
        <template #createdAt-cell="{ row }">
          {{ formatTimeAgo(new Date((row.original as any)?.createdAt)) }}
        </template>
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <NuxtLink :to="`/admin/blog/${(row.original as any)?.id}/edit`">
              <UButton
                icon="i-lucide-pencil"
                color="neutral"
                variant="ghost"
                size="sm"
              />
            </NuxtLink>
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              @click="deletePost((row.original as any)?.id)"
            />
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
