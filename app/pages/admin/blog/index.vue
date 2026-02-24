<script setup lang="ts">
import { formatTimeAgo } from "@vueuse/core";

// Fetch language-aware posts
const { data, status, refresh } = await useFetch("/api/admin/blog");

const isOpen = ref(false);
const isEditing = ref(false);
const selectedPostId = ref<number | null>(null);

const form = reactive({
  title: "",
  content: "",
  published: false,
});

function openCreateModal() {
  isEditing.value = false;
  selectedPostId.value = null;
  form.title = "";
  form.content = "";
  form.published = false;
  isOpen.value = true;
}

function openEditModal(post: any) {
  isEditing.value = true;
  selectedPostId.value = post.id;
  form.title = post.title;
  form.content = post.content;
  form.published = post.published ? true : false;
  isOpen.value = true;
}

async function savePost() {
  try {
    if (isEditing.value && selectedPostId.value) {
      await $fetch(`/api/admin/blog/${selectedPostId.value}`, {
        method: "PUT",
        body: form,
      });
      useToast().add({ title: "Post updated successfully", color: "success" });
    } else {
      await $fetch("/api/admin/blog", {
        method: "POST",
        body: form,
      });
      useToast().add({ title: "Post created successfully", color: "success" });
    }
    isOpen.value = false;
    refresh();
  } catch (error: any) {
    useToast().add({
      title: "Error saving post",
      description: error.data?.message || "An error occurred",
      color: "error",
    });
  }
}

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
  { header: "Title", accessorKey: "title" },
  { header: "Language", accessorKey: "language" },
  { header: "Status", accessorKey: "published" },
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
          Manage your localized content. Displaying posts for the current language.
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        label="New Post"
        @click="openCreateModal"
      />
    </div>

    <UCard>
      <UTable
        :data="data?.data || []"
        :columns="columns"
        :loading="status === 'pending'"
      >
        <template #published-cell="{ row }">
          <UBadge
            :color="(row.original as any)?.published ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ (row.original as any)?.published ? 'Published' : 'Draft' }}
          </UBadge>
        </template>
        <template #createdAt-cell="{ row }">
          {{ formatTimeAgo(new Date((row.original as any)?.createdAt)) }}
        </template>
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="openEditModal((row.original as any))"
            />
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

    <UModal v-model:open="isOpen" :title="isEditing ? 'Edit Post' : 'New Post'">
      <template #content>
        <form @submit.prevent="savePost" class="space-y-4">
          <UFormField label="Title" name="title">
            <UInput v-model="form.title" placeholder="Post title" required class="w-full" />
          </UFormField>

          <UFormField label="Content" name="content">
            <UTextarea v-model="form.content" placeholder="Write something..." required :rows="8" class="w-full" />
          </UFormField>

          <UFormField label="Status" name="published">
            <USwitch v-model="form.published" />
            <span class="ml-2 text-sm">{{ form.published ? 'Published' : 'Draft' }}</span>
          </UFormField>

          <div class="flex justify-end gap-2 pt-4">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="isOpen = false" />
            <UButton type="submit" label="Save Post" />
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
