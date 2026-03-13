<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: "auth",
});

const route = useRoute();
const postId = computed(() => parseInt(route.params.id as string));

const { locale } = useI18n();
const {
  data: post,
  error: fetchError,
  isPending: pending,
} = usePostQuery(postId);

// Transform API response to form data for current locale
const formPost = computed<any>(() => {
  if (!post.value) {
    return undefined;
  }
  const p = post.value as any;
  return {
    id: p.id,
    slug: (p.slug as any)?.[locale.value] || (p.slug as any)?.en || "",
    title: (p.title as any)?.[locale.value] || (p.title as any)?.en || "",
    shortDescription:
      (p.shortDescription as any)?.[locale.value] ||
      (p.shortDescription as any)?.en ||
      "",
    content: (p.content as any)?.[locale.value] || (p.content as any)?.en || "",
    status: p.status || "draft",
    categories: p.categories || [],
    tags: p.tags || [],
    featuredImageId: p.featuredImage?.id ?? p.featuredImageId ?? null,
  };
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
          <h1 class="text-3xl font-bold">Edit Post</h1>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Update your blog post content
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center py-12">
      <UCard class="w-full max-w-4xl">
        <div class="flex items-center justify-center py-12">
          <UIcon name="i-lucide-loader" class="animate-spin text-2xl" />
        </div>
      </UCard>
    </div>

    <!-- Error State -->
    <div v-else-if="fetchError">
      <UCard class="max-w-4xl border-red-200 dark:border-red-900">
        <div class="text-red-600 dark:text-red-400">
          <p class="font-medium">Failed to load post</p>
          <p class="text-sm mt-1">{{ fetchError.message }}</p>
        </div>
      </UCard>
    </div>

    <!-- Form Card -->
    <div v-else>
      <UCard class="max-w-4xl">
        <!-- Pass formPost to component - composable handles update internally -->
        <AdminBlogForm :post="formPost" />
      </UCard>
    </div>
  </div>
</template>
