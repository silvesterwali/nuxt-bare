<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: "auth",
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/admin/blog"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <UIcon name="i-lucide-arrow-left" />
          </NuxtLink>
          <h1 class="text-3xl font-bold">Create New Post</h1>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Add a new blog post with multi-language support
        </p>
      </div>
    </div>

    <!-- Form Card -->
    <UCard class="max-w-4xl">
      <!-- No post prop = Create mode -->
      <AdminBlogForm />
    </UCard>
  </div>
</template>
