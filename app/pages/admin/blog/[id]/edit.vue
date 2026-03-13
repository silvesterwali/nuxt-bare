<script setup lang="ts">
import { ref, computed } from "vue";
import type { BlogCategory, BlogTag, BlogFormData } from "@/types/blog";

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const postId = computed(() => parseInt(route.params.id as string));

const loading = ref(false);
const postLoading = ref(true);
const {
  data: post,
  error: fetchError,
  isPending: pending,
} = usePostQuery(postId);

// form ref for validation errors
import type { Ref, ComponentPublicInstance } from "vue";
const formRef: Ref<ComponentPublicInstance<{
  setErrors(errs: any[]): void;
}> | null> = ref(null);
const { transformToIssue } = useValidateHelper();

watch(
  pending,
  (isPending) => {
    postLoading.value = isPending;
  },
  { immediate: true },
);

watch(
  post,
  (newPost) => {
    postLoading.value = false;
  },
  { immediate: true },
);

// Transform API response to form data for current locale
const { locale } = useI18n();
const formPost = computed<
  | (BlogFormData & {
      id?: number;
      categories?: BlogCategory[];
      tags?: BlogTag[];
    })
  | undefined
>(() => {
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
    featuredImageId: p.featuredImageId ?? null,
  };
});

async function handleSubmit(formData: any) {
  loading.value = true;
  try {
    // simple values; API will localize via normalize
    const updateData = {
      slug: formData.slug,
      title: formData.title,
      shortDescription: formData.shortDescription,
      content: formData.content,
      status: formData.status,
      categoryIds: formData.categoryIds || [],
      tagIds: formData.tagIds || [],
      featuredImageId: formData.featuredImageId || null,
    };

    const result = await $fetch(`/api/admin/blog/${postId.value}`, {
      method: "PUT",
      body: updateData,
    });
    useToast().add({
      title: "Post updated",
      description: "Your blog post has been updated successfully.",
      color: "success",
    });
    await router.push("/admin/blog");
  } catch (error: any) {
    console.error("Blog update error details:", {
      message: error.message,
      data: error.data,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      error: error,
    });

    const errorMessage =
      error.data?.message ||
      error.data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "An error occurred";

    useToast().add({
      title: "Error updating post",
      description: errorMessage,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
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
    <div v-if="postLoading" class="flex justify-center py-12">
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
        <AdminBlogForm
          ref="formRef"
          :post="formPost"
          :is-loading="loading"
          @submit="handleSubmit"
        />
      </UCard>
    </div>
  </div>
</template>
