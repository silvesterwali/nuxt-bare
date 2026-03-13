<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { BlogCategory, BlogTag, BlogFormData } from "@/types/blog";
import MediaPicker from "~/components/Common/MediaPicker.vue";

interface Props {
  post?:
    | (BlogFormData & {
        id?: number;
        categories?: BlogCategory[];
        tags?: BlogTag[];
      })
    | null;
  isLoading?: boolean;
}

interface Emits {
  (e: "submit", data: BlogFormData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { data: categories } = useCategoriesQuery();
const { data: tags } = useTagsQuery();

const form = ref<BlogFormData>({
  slug: "",
  title: "",
  shortDescription: "",
  content: "",
  status: "draft",
  categoryIds: [],
  tagIds: [],
  featuredImageId: null,
});

const selectedCategoryIds = ref<number[]>([]);
const selectedTagIds = ref<number[]>([]);

// Watch for prop changes to populate form
watch(
  () => props.post,
  (newPost) => {
    if (newPost) {
      form.value = {
        slug: newPost.slug || "",
        title: newPost.title || "",
        shortDescription: newPost.shortDescription || "",
        content: newPost.content || "",
        status: newPost.status || "draft",
        categoryIds: [],
        tagIds: [],
        featuredImageId: newPost.featuredImageId ?? null,
      };
      selectedCategoryIds.value = (newPost.categories || []).map((c) => c.id);
      selectedTagIds.value = (newPost.tags || []).map((t) => t.id);
    }
  },
  { immediate: true },
);

// Category and tag options for selectors
const categoryOptions = computed(() =>
  (categories.value || []).map((c) => ({
    id: c.id,
    label: c.name,
  })),
);

const tagOptions = computed(() =>
  (tags.value || []).map((t) => ({
    id: t.id,
    label: t.name,
  })),
);

async function onSubmit(event: FormSubmitEvent<BlogFormData>) {
  emit("submit", {
    ...event.data,
    categoryIds: selectedCategoryIds.value,
    tagIds: selectedTagIds.value,
    featuredImageId: form.value.featuredImageId ?? null,
  });
}

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];
</script>

<template>
  <div class="space-y-6">
    <!-- Language Alert -->
    <CommonLanguageContentViewer />

    <!-- Form -->
    <UForm :state="form" @submit="onSubmit" class="space-y-4">
      <!-- Slug -->
      <UFormField label="Slug (URL-friendly)" name="slug" required>
        <UInput
          v-model="form.slug"
          placeholder="my-awesome-post"
          icon="i-lucide-link"
          :disabled="isLoading"
          class="w-full"
        />
        <template #hint>
          This will be used in the URL. Use lowercase letters, numbers, and
          hyphens.
        </template>
      </UFormField>

      <!-- Title -->
      <UFormField label="Title" name="title" required>
        <UInput
          v-model="form.title"
          placeholder="Blog title"
          :disabled="isLoading"
          class="w-full"
        />
      </UFormField>

      <!-- Short Description -->
      <UFormField label="Short Description," name="shortDescription">
        <UTextarea
          v-model="form.shortDescription"
          placeholder="Brief summary or excerpt for previews"
          :rows="3"
          :disabled="isLoading"
          class="w-full"
        />
        <template #description>
          This is a brief summary that will appear in blog listings and previews
          also for SEO meta description. Keep it concise and engaging.
        </template>
      </UFormField>

      <!-- Content Editor -->
      <UFormField label="Content" name="content" required>
        <CommonContentEditor
          v-model="form.content"
          placeholder="Write your post content here..."
        />
      </UFormField>

      <!-- Featured Image -->
      <UFormField label="Featured Image" name="featuredImageId">
        {{ form.featuredImageId }} <!-- Display selected media ID for debugging -->
        <MediaPicker v-model:media-id="form.featuredImageId" />
      </UFormField>

      <!-- Categories -->
      <UFormField label="Categories" name="categories">
        <USelectMenu
          v-model="selectedCategoryIds"
          :items="categoryOptions"
          multiple
          placeholder="Select categories..."
          :disabled="isLoading"
          searchable
          label-key="label"
          value-key="id"
          class="w-full"
          clear
        />
        <template #description>
          Assign zero or more categories to organize this post.
        </template>
      </UFormField>

      <!-- Tags -->
      <UFormField label="Tags" name="tags">
        <USelectMenu
          v-model="selectedTagIds"
          :items="tagOptions"
          multiple
          placeholder="Select tags..."
          :disabled="isLoading"
          searchable
          label-key="label"
          value-key="id"
          class="w-full"
          clear
        />
        <template #description>
          Assign zero or more tags to help readers find related content.
        </template>
      </UFormField>

      <!-- Status -->
      <UFormField label="Status" name="status">
        <USelectMenu
          v-model="form.status"
          :items="statusOptions"
          value-key="value"
          label-key="label"
          :disabled="isLoading"
          class="w-full"
        />
      </UFormField>

      <!-- Submit Button -->
      <div
        class="flex justify-end gap-2 pt-6 border-t border-gray-200 dark:border-gray-700"
      >
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          label="Cancel"
          :to="`/admin/blog`"
        />
        <UButton
          type="submit"
          :label="`${post?.id ? 'Update' : 'Create'} Post`"
          :loading="isLoading"
        />
      </div>
    </UForm>
  </div>
</template>
