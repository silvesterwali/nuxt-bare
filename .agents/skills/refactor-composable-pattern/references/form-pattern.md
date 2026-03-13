---
title: Form Pattern - Edit and Create
description: Unified form component and composable pattern for handling both edit and create operations
---

# Form Pattern: Edit & Create Unified

## Core Concept

**One Form Component + One Composable = Both Edit and Create**

Detection logic:
- **No props** → Create mode
- **With data prop** → Edit mode
- **Composable decides** which API endpoint to call

---

## Architecture

```
Page/Route
    ↓
BlogForm Component
    ├─ Props: blog (optional)
    └─ emit: success, cancel
        ↓
useBlogForm(blog?)
    ├─ State: formData, errors, isSubmitting
    ├─ Computed: isEdit, isCreate
    └─ Methods: submitForm(), reset(), validate()
        ↓
API Routes
    ├─ POST /api/blogs (create)
    └─ PATCH /api/blogs/:id (update)
```

---

## Implementation

### Step 1: Create Composable

```typescript
// app/composables/useBlogForm.ts
import { computed, reactive, ref } from 'vue'
import type { BlogData, BlogFormData } from '@/shared/types'

export interface UseBlogFormReturn {
  // State
  formData: BlogFormData
  errors: Record<string, string>
  isSubmitting: boolean
  touched: Record<string, boolean>
  
  // Computed
  isEdit: boolean
  isCreate: boolean
  isDirty: boolean
  
  // Methods
  submitForm(): Promise<BlogData>
  reset(): void
  validate(): boolean
  markTouched(field: string): void
  getFieldError(field: string): string | null
}

/**
 * Smart form composable: handles both create and update
 * 
 * @param initialData - Blog data for edit mode (optional)
 * @returns Form state and methods
 * 
 * @example
 * // Create mode
 * const { formData, submitForm } = useBlogForm()
 * 
 * // Edit mode
 * const { formData, submitForm } = useBlogForm(blog)
 */
export function useBlogForm(
  initialData?: BlogData | null
): UseBlogFormReturn {
  // Determine mode
  const isEdit = computed(() => !!initialData?.id)
  const isCreate = computed(() => !isEdit.value)

  // Initial form data
  const defaultFormData: BlogFormData = {
    title: '',
    excerpt: '',
    content: '',
    categoryId: '',
    tags: []
  }

  // Form state
  const formData = reactive<BlogFormData>({
    ...defaultFormData,
    ...(initialData ? { 
      title: initialData.title,
      excerpt: initialData.excerpt,
      content: initialData.content,
      categoryId: initialData.categoryId,
      tags: initialData.tags || []
    } : {})
  })

  // Save original for dirty detection
  const originalData = JSON.stringify(formData)

  // Meta state
  const errors = ref<Record<string, string>>({})
  const isSubmitting = ref(false)
  const touched = ref<Record<string, boolean>>({})

  // Computed
  const isDirty = computed(() => {
    return JSON.stringify(formData) !== originalData
  })

  // Validation
  const validate = (): boolean => {
    errors.value = {}

    if (!formData.title?.trim()) {
      errors.value.title = 'Title is required'
    } else if (formData.title.length < 3) {
      errors.value.title = 'Title must be at least 3 characters'
    } else if (formData.title.length > 200) {
      errors.value.title = 'Title must not exceed 200 characters'
    }

    if (!formData.excerpt?.trim()) {
      errors.value.excerpt = 'Excerpt is required'
    } else if (formData.excerpt.length > 500) {
      errors.value.excerpt = 'Excerpt must not exceed 500 characters'
    }

    if (!formData.content?.trim()) {
      errors.value.content = 'Content is required'
    }

    if (!formData.categoryId) {
      errors.value.categoryId = 'Category is required'
    }

    return Object.keys(errors.value).length === 0
  }

  // Submit - Auto-decides: create vs update
  const submitForm = async (): Promise<BlogData> => {
    if (!validate()) {
      throw new Error('Validation failed')
    }

    isSubmitting.value = true
    try {
      let response

      if (isEdit.value && initialData?.id) {
        // UPDATE mode
        response = await $fetch<{ data: BlogData }>(
          `/api/blogs/${initialData.id}`,
          {
            method: 'PATCH',
            body: formData
          }
        )
      } else {
        // CREATE mode
        response = await $fetch<{ data: BlogData }>(
          '/api/blogs',
          {
            method: 'POST',
            body: formData
          }
        )
      }

      return response.data
    } finally {
      isSubmitting.value = false
    }
  }

  // Reset to initial
  const reset = (): void => {
    if (initialData) {
      Object.assign(formData, {
        title: initialData.title,
        excerpt: initialData.excerpt,
        content: initialData.content,
        categoryId: initialData.categoryId,
        tags: initialData.tags || []
      })
    } else {
      Object.assign(formData, defaultFormData)
    }
    errors.value = {}
    touched.value = {}
  }

  // Mark field touched
  const markTouched = (field: string): void => {
    touched.value[field] = true
  }

  // Get field error (only show if touched)
  const getFieldError = (field: string): string | null => {
    return touched.value[field] ? (errors.value[field] || null) : null
  }

  return {
    formData,
    errors,
    isSubmitting: isSubmitting.value,
    touched: touched.value,
    isEdit: isEdit.value,
    isCreate: isCreate.value,
    isDirty: isDirty.value,
    submitForm,
    reset,
    validate,
    markTouched,
    getFieldError
  }
}
```

---

### Step 2: Create Form Component

```vue
<!-- app/components/Blog/BlogForm.vue -->
<script setup lang="ts">
import { PropType } from 'vue'
import type { BlogData } from '@/shared/types'
import { useBlogForm } from '@/composables/useBlogForm'

defineProps<{
  blog?: BlogData
}>()

defineEmits<{
  success: [blog: BlogData]
  cancel: []
}>()

// Smart detection: if blog prop exists = edit mode, else = create mode
const {
  formData,
  errors,
  isSubmitting,
  isEdit,
  isDirty,
  submitForm,
  reset,
  markTouched,
  getFieldError
} = useBlogForm(props.blog)
</script>

<template>
  <form class="blog-form" @submit.prevent="onSubmit">
    <!-- Header -->
    <div class="form-header">
      <h2 v-if="isEdit" class="form-title">Edit Blog</h2>
      <h2 v-else class="form-title">Create New Blog</h2>
    </div>

    <!-- Title Field -->
    <div class="form-group">
      <label for="title" class="form-label">Title</label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        class="form-input"
        :class="{ 'is-error': getFieldError('title') }"
        placeholder="Enter blog title"
        required
        @blur="markTouched('title')"
      />
      <span v-if="getFieldError('title')" class="form-error">
        {{ getFieldError('title') }}
      </span>
    </div>

    <!-- Excerpt Field -->
    <div class="form-group">
      <label for="excerpt" class="form-label">Excerpt</label>
      <textarea
        id="excerpt"
        v-model="formData.excerpt"
        class="form-textarea"
        :class="{ 'is-error': getFieldError('excerpt') }"
        placeholder="Enter blog excerpt (summary)"
        rows="3"
        required
        @blur="markTouched('excerpt')"
      ></textarea>
      <span v-if="getFieldError('excerpt')" class="form-error">
        {{ getFieldError('excerpt') }}
      </span>
    </div>

    <!-- Content Field -->
    <div class="form-group">
      <label for="content" class="form-label">Content</label>
      <textarea
        id="content"
        v-model="formData.content"
        class="form-textarea"
        :class="{ 'is-error': getFieldError('content') }"
        placeholder="Enter blog content"
        rows="10"
        required
        @blur="markTouched('content')"
      ></textarea>
      <span v-if="getFieldError('content')" class="form-error">
        {{ getFieldError('content') }}
      </span>
    </div>

    <!-- Category Field -->
    <div class="form-group">
      <label for="category" class="form-label">Category</label>
      <CategorySelect
        id="category"
        v-model="formData.categoryId"
        :error="getFieldError('categoryId')"
        @blur="markTouched('categoryId')"
      />
    </div>

    <!-- Tags Field -->
    <div class="form-group">
      <label for="tags" class="form-label">Tags</label>
      <TagInput
        v-model="formData.tags"
      />
    </div>

    <!-- Form Actions -->
    <div class="form-actions">
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="isSubmitting || (!isDirty && isEdit)"
      >
        <span v-if="isSubmitting" class="spinner"></span>
        <span v-if="isEdit">Update Blog</span>
        <span v-else>Create Blog</span>
      </button>

      <button
        type="button"
        class="btn btn-secondary"
        :disabled="isSubmitting"
        @click="onCancel"
      >
        Cancel
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  success: [blog: BlogData]
  cancel: []
}>()

const onSubmit = async () => {
  try {
    const blog = await submitForm()
    emit('success', blog)
  } catch (err) {
    console.error('Form submission failed:', err)
  }
}

const onCancel = () => {
  if (isDirty && !confirm('Discard changes?')) {
    return
  }
  reset()
  emit('cancel')
}
</script>

<style scoped>
.blog-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &.is-error {
    border-color: #ef4444;
  }
}

.form-error {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-primary {
  background-color: #3b82f6;
  color: white;

  &:hover:not(:disabled) {
    background-color: #2563eb;
  }
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;

  &:hover:not(:disabled) {
    background-color: #d1d5db;
  }
}

.spinner {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid #ffffff;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
```

---

### Step 3: Usage in Pages

#### Create Page (or Route)
```vue
<!-- pages/admin/blog/new.vue -->
<script setup lang="ts">
import BlogForm from '@/components/Blog/BlogForm.vue'

const router = useRouter()

const handleSuccess = async (blog) => {
  // Show success toast/notification
  // await navigateTo(`/admin/blog/${blog.id}`)
  await router.push({
    name: 'blog-detail',
    params: { id: blog.id }
  })
}

const handleCancel = () => {
  router.back()
}
</script>

<template>
  <div class="container">
    <BlogForm 
      @success="handleSuccess" 
      @cancel="handleCancel"
    />
  </div>
</template>
```

#### Edit Page (or Route)
```vue
<!-- pages/admin/blog/[id].vue -->
<script setup lang="ts">
import BlogForm from '@/components/Blog/BlogForm.vue'
import { useBlogDetail } from '@/composables/useBlogDetail'

const route = useRoute()
const router = useRouter()

// Fetch blog data for edit
const { blog, isLoading, error } = useBlogDetail(route.params.id as string)

const handleSuccess = async (updatedBlog) => {
  blog.value = updatedBlog
  // Show success notification
  router.back()
}

const handleCancel = () => {
  router.back()
}
</script>

<template>
  <div class="container">
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <!-- blog prop triggers EDIT mode -->
    <BlogForm 
      v-else
      :blog="blog"
      @success="handleSuccess" 
      @cancel="handleCancel"
    />
  </div>
</template>
```

#### Alternative: Single Route with Edit and Create
```vue
<!-- pages/admin/blog/[id].vue - handles both create and edit -->
<script setup lang="ts">
import BlogForm from '@/components/Blog/BlogForm.vue'
import { useBlogDetail } from '@/composables/useBlogDetail'

const route = useRoute()
const router = useRouter()

// id can be "new" for create mode, or ID for edit mode
const isCreateMode = route.params.id === 'new'

const { blog, isLoading } = isCreateMode 
  ? { blog: ref(null), isLoading: ref(false) }
  : useBlogDetail(route.params.id as string)

const handleSuccess = async (blog) => {
  await router.push(`/admin/blog/${blog.id}`)
}
</script>

<template>
  <div class="container">
    <!-- No blog prop = Create mode, with blog prop = Edit mode -->
    <BlogForm 
      :blog="blog" 
      @success="handleSuccess" 
      @cancel="$router.back()"
    />
  </div>
</template>
```

---

## API Endpoints

### Create Endpoint
```typescript
// server/api/blogs/index.post.ts
import type { CreateBlogPayload, Blog } from '@/shared/types'

export default defineEventHandler(async (event): Promise<{ data: Blog }> => {
  const body = await readBody<CreateBlogPayload>(event)
  
  // Validate
  const { valid, errors } = validateBlogData(body)
  if (!valid) {
    throw createError({
      statusCode: 422,
      message: 'Validation failed',
      data: errors
    })
  }

  // Create
  const blog = await createBlogInDb({
    ...body,
    authorId: event.context.user.id
  })

  return { data: blog }
})
```

### Update Endpoint
```typescript
// server/api/blogs/[id].patch.ts
import type { UpdateBlogPayload, Blog } from '@/shared/types'

export default defineEventHandler(async (event): Promise<{ data: Blog }> => {
  const { id } = event.context.params
  const body = await readBody<UpdateBlogPayload>(event)

  // Check ownership
  const blog = await getBlogFromDb(id)
  if (blog?.authorId !== event.context.user.id) {
    throw createError({
      statusCode: 403,
      message: 'Unauthorized'
    })
  }

  // Update
  const updated = await updateBlogInDb(id, body)

  return { data: updated }
})
```

---

## Key Benefits

✅ **Single Source of Truth** - Form logic only in composable
✅ **Automatic Mode Detection** - Props presence determines create vs edit
✅ **No Duplication** - One component handles both cases
✅ **Easy Maintenance** - Changes in one place
✅ **Testable** - Composable can be unit tested
✅ **Reusable** - Other components can use same composable
✅ **DRY** - Don't repeat yourself

---

## Checklist

- [ ] Composable exported and named `useBlogForm`
- [ ] Component accepts optional `blog` prop
- [ ] Component emits `success` and `cancel` events
- [ ] Composable handles validation
- [ ] Composable has `isEdit` and `isCreate` computed
- [ ] submitForm() decides between POST/PATCH
- [ ] Form resets on cancel
- [ ] Error display with field-level validation
- [ ] Dirty state tracking
- [ ] Loading state while submitting
- [ ] API returns typed response
