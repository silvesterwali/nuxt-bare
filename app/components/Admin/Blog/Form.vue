<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

interface BlogFormData {
  slug: string
  title: string
  shortDescription: string
  content: string
  status: 'draft' | 'published' | 'archived'
}

interface Props {
  post?: BlogFormData & { id?: number }
  isLoading?: boolean
}

interface Emits {
  (e: 'submit', data: BlogFormData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref<BlogFormData>({
  slug: '',
  title: '',
  shortDescription: '',
  content: '',
  status: 'draft'
})

// Watch for prop changes to populate form
watch(() => props.post, (newPost) => {
  if (newPost) {
    form.value = {
      slug: newPost.slug || '',
      title: newPost.title || '',
      shortDescription: newPost.shortDescription || '',
      content: newPost.content || '',
      status: newPost.status || 'draft'
    }
  }
}, { immediate: true })

async function onSubmit(event: FormSubmitEvent<BlogFormData>) {
  emit('submit', event.data)
}

const { locale } = useI18n()

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' }
]
</script>

<template>
  <div class="space-y-6">
    <!-- Language Alert -->
    <div class="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
      <div class="flex items-start gap-2">
        <UIcon name="i-lucide-info" class="mt-0.5 flex-shrink-0" />
        <div>
          <p class="font-medium">Language-Specific Content</p>
          <p class="text-xs mt-1">You are currently editing in <strong>{{ locale.toUpperCase() }}</strong> language. Changes will only affect this language's version.</p>
        </div>
      </div>
    </div>

    <!-- Form -->
    <UForm :state="form" @submit="onSubmit" class="space-y-4">
      <!-- Slug -->
      <UFormField label="Slug (URL-friendly)" name="slug" required>
        <UInput
          v-model="form.slug"
          placeholder="my-awesome-post"
          icon="i-lucide-link"
          :disabled="isLoading"
        />
        <template #hint>
          This will be used in the URL. Use lowercase letters, numbers, and hyphens.
        </template>
      </UFormField>

      <!-- Title -->
      <UFormField label="Title" name="title" required>
        <UInput
          v-model="form.title"
          placeholder="Post title"
          icon="i-lucide-heading-2"
          :disabled="isLoading"
        />
      </UFormField>

      <!-- Short Description -->
      <UFormField label="Short Description (Optional)" name="shortDescription">
        <UTextarea
          v-model="form.shortDescription"
          placeholder="Brief summary or excerpt for previews"
          :rows="3"
          :disabled="isLoading"
        />
      </UFormField>

      <!-- Content Editor -->
      <UFormField label="Content" name="content" required>
        <AdminBlogContentEditor
          v-model="form.content"
          placeholder="Write your post content here..."
        />
      </UFormField>

      <!-- Status -->
      <UFormField label="Status" name="status">
        <USelect
          v-model="form.status"
          :options="statusOptions"
          option-attribute="label"
          value-attribute="value"
          :disabled="isLoading"
        />
      </UFormField>

      <!-- Submit Button -->
      <div class="flex justify-end gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
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
