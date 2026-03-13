---
title: Component Structure Best Practices
description: Guidelines for organizing and structuring Vue components in the refactored architecture
---

# Component Structure Guide

## Principles

1. **Single Responsibility** - Komponen hanya render dan handle UI state
2. **Presentation Focused** - Minimal business logic, delegate ke composable
3. **Reusable Chunks** - Small, focused components yang dapat di-reuse
4. **Type Safety** - Semua props dan emits di-type dengan jelas
5. **Auto-imports** - Gunakan Nuxt auto-imports untuk Vue APIs (ref, reactive, computed, dll)

---

## Auto-Imports (Nuxt 4.x)

Di Nuxt 4.x, kamu tidak perlu manual import untuk Vue composition APIs:

```typescript
// ❌ TIDAK PERLU - Sudah auto-imported
import { ref, computed, watch } from 'vue'
import { PropType } from 'vue'

// ✅ LANGSUNG GUNAKAN
const count = ref(0)
const doubled = computed(() => count.value * 2)
```

**Auto-imported di Nuxt:**
- Vue APIs: `ref`, `reactive`, `computed`, `watch`, `onMounted`, dll
- Nuxt APIs: `useRouter`, `useFetch`, `useState`, `navigateTo`, dll
- Custom Composables: Semua file di folder `composables/` (auto-imported)
- Components: Semua file di folder `components/` (lihat section berikut)
- Utilities: `definePageMeta`, `defineLayout`, dll

**Reference:** [Nuxt Auto-imports Docs](https://nuxt.com/docs/guide/concepts/auto-imports) | [Nuxt Components Auto-import](https://nuxt.com/docs/guide/directory-structure/components)

---

## Commonly Auto-Imported APIs

### Vue Composition API
```typescript
// ✅ No import needed
ref, reactive, computed, watch, watchEffect
onMounted, onUpdated, onUnmounted, onBeforeMount
toRef, toRefs, unref, isRef, isReactive

// Usage:
const count = ref(0)
const doubled = computed(() => count.value * 2)
watch(() => count.value, (newVal) => { /* ... */ })
```

### Vue Utilities
```typescript
// ✅ No import needed
defineProps, defineEmits, defineModel, withDefaults
computed, ref, reactive, watch

// defineExpose, getCurrentInstance, etc
```

### Nuxt Composables
```typescript
// ✅ No import needed
useRouter, useRoute
useFetch, useAsyncData, useLazyFetch
useState, useCookie, useHead
useNuxtData, useSeoMeta, useError
usePreventScroll, useScrollToTop
```

### Nuxt Utilities
```typescript
// ✅ No import needed
definePageMeta, defineRouteRules, navigateTo
defineLayout, clearNuxtData, refreshNuxtData
setResponseStatus, showError, clearError
```

### Check Auto-imports
```bash
# Lihat semua auto-imports yang tersedia
cat .nuxt/imports.d.ts

# Lihat component auto-imports
cat .nuxt/components.d.ts
```

### Nuxt Component Auto-Imports

```typescript
// ✅ No import needed - Components auto-imported from components/ directory
// File: components/Blog/Card.vue
// Usage: <BlogCard /> (folder "Blog" + file "Card" = BlogCard)

// File: components/admin/card.vue → <AdminCard />
// File: components/Common/FormInput.vue → <CommonFormInput />
// File: components/admin/users/list.vue → <AdminUsersList />
```

**Naming Convention:**
- Folder name + File name (both PascalCase) = Component name
- **Example:** `components/Blog/Card.vue` → `<BlogCard />`
- **Example:** `components/admin/users/List.vue` → `<AdminUsersList />`
- **Example:** `components/Common/FormInput.vue` → `<CommonFormInput />`
- ❌ Wrong: `components/Blog/BlogCard.vue` (folder + file both say "Blog")
- ✅ Right: `components/Blog/Card.vue` (no duplication)

---

### Nuxt Composable Auto-Imports

```typescript
// ✅ No import needed - Composables auto-imported from composables/ directory
// File: composables/useBlogForm.ts
// Usage: const { formData, submitForm } = useBlogForm()

// File: composables/useBlogList.ts
// Usage: const { blogs, loading, search } = useBlogList()

// File: composables/admin/useAdminUsers.ts
// Usage: const { users, remove } = useAdminUsers()
```

**Naming Convention:**
- File: `composables/useBlogForm.ts` → Composable: `useBlogForm()`
- File: `composables/admin/useAdminUsers.ts` → Composable: `useAdminUsers()`
- Nested path → PascalCase (folder name included)
- Always use `use` prefix for composables

**Example:**
```vue
<script setup lang="ts">
// ✅ No import - auto-imported
const { formData, isEdit, submitForm } = useBlogForm()
const { blogs, loading } = useBlogList()
const { users, deleteUser } = useAdminUsers()
</script>
```

---

## Component Hierarchy

### Level 1: Page Components
```vue
<!-- pages/admin/blog/index.vue -->
<script setup lang="ts">
// ✅ useBlogList auto-imported dari composables/useBlogList.ts
// Tidak perlu manual import!

// Komposisi di level page
const { blogs, isLoading, search, sort, paginate } = useBlogList()

// ✅ BlogList auto-imported dari components/Blog/BlogList.vue
</script>

<template>
  <div>
    <h1>Blog Management</h1>
    <!-- ✅ No import needed - auto-imported -->
    <BlogList :blogs="blogs" :loading="isLoading" />
  </div>
</template>
```

### Level 2: Feature Components (Containers)
```vue
<!-- components/Blog/List.vue -->
<script setup lang="ts">
import type { BlogData } from '@/shared/types'

interface Props {
  blogs: BlogData[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false
})

const selectedId = ref<string | null>(null)

// ✅ Card auto-imported dari components/Blog/Card.vue
</script>

<template>
  <div class="blog-list">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="grid gap-4">
      <!-- ✅ No import needed - auto-imported -->
      <BlogCard 
        v-for="blog in blogs" 
        :key="blog.id"
        :blog="blog"
        :selected="selectedId === blog.id"
        @select="selectedId = blog.id"
      />
    </div>
  </div>
</template>
```

### Level 3: UI Components (Dumb Components)
```vue
<!-- components/Blog/Card.vue -->
<script setup lang="ts">
import type { BlogData } from '@/shared/types'

// ✅ No other imports needed - types auto-imported
// ✅ If using FormInput: auto-imported dari components/Common/FormInput.vue

interface Props {
  blog: BlogData
  selected?: boolean
}

withDefaults(defineProps<Props>(), {
  selected: false
})

defineEmits<{
  (e: 'select'): void
}>()
</script>

<template>
  <article 
    class="blog-card"
    :class="{ 'is-selected': selected }"
    @click="$emit('select')"
  >
    <h3>{{ blog.title }}</h3>
    <p>{{ blog.excerpt }}</p>
    <time>{{ blog.createdAt }}</time>
  </article>
</template>
```

---

## Form Components (Smart Pattern)

### Component: Edit/Create dengan Props Detection
```vue
<!-- components/Blog/Form.vue -->
<script setup lang="ts">
import type { BlogData } from '@/shared/types'

// ✅ useBlogForm auto-imported dari composables/useBlogForm.ts
// Tidak perlu manual import!

interface Props {
  blog?: BlogData
}

withDefaults(defineProps<Props>(), {})

defineEmits<{
  (e: 'success', blog: BlogData): void
  (e: 'cancel'): void
}>()

// Composable detects edit vs create otomatis
const { 
  formData, 
  isEdit, 
  isSubmitting, 
  submitForm,
  reset 
} = useBlogForm(props.blog)
</script>

<template>
  <form @submit.prevent="submitForm">
    <h2>{{ isEdit ? 'Edit Blog' : 'Create New Blog' }}</h2>
    
    <!-- ✅ FormInput auto-imported dari components/Common/FormInput.vue -->
    <FormInput 
      v-model="formData.title" 
      label="Title"
      required
    />
    
    <!-- ✅ FormTextarea auto-imported -->
    <FormTextarea 
      v-model="formData.content" 
      label="Content"
      required
    />
    
    <!-- ✅ FormSelect auto-imported -->
    <FormSelect 
      v-model="formData.categoryId" 
      label="Category"
      :options="categories"
    />
    
    <div class="actions">
      <button type="submit" :disabled="isSubmitting">
        {{ isEdit ? 'Update' : 'Create' }}
      </button>
      <button type="button" @click="reset">Cancel</button>
    </div>
  </form>
</template>
```

---

## Reusable Form Fields

### Input Component (Modern: defineModel)
```vue
<!-- components/Common/Input.vue -->
<script setup lang="ts">
// ✅ Modern Pattern: defineModel (Vue 3.4+)
// Cleaner than modelValue + defineEmits

interface Props {
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  error?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text'
})

// ✅ MODERN: Two-way binding dengan defineModel
// Parent: <CommonInput v-model="title" label="Title" />
const modelValue = defineModel<string | number>({
  default: ''
})
</script>

<template>
  <div class="form-field">
    <label v-if="label">{{ label }}</label>
    <input 
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      @input="modelValue = $event.target.value"
    />
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>
```

### Input Component: Old vs Modern Pattern

#### ❌ OLD: modelValue + defineEmits (Pre-Vue 3.4)
```vue
<script setup lang="ts">
interface Props {
  modelValue: string | number
  label?: string
}

withDefaults(defineProps<Props>(), {})

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <input 
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
```

#### ✅ MODERN: defineModel (Vue 3.4+)
```typescript
// Lebih ringkas, lebi jelas, dan type-safe
const modelValue = defineModel<string>({
  default: ''
})
```

**Parent usage tetap sama:**
```vue
<CommonInput v-model="title" label="Title" />
```

### Textarea Component (Modern: defineModel)
```vue
<!-- components/Common/Textarea.vue -->
<script setup lang="ts">
// ✅ Use defineModel for clean two-way binding

interface Props {
  label?: string
  placeholder?: string
  required?: boolean
  rows?: number
  error?: string
}

withDefaults(defineProps<Props>(), {
  rows: 4
})

// ✅ defineModel instead of modelValue + defineEmits
const modelValue = defineModel<string>({
  default: ''
})
</script>

<template>
  <div class="form-field">
    <label v-if="label">{{ label }}</label>
    <textarea 
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :rows="rows ?? 4"
      @input="modelValue = $event.target.value"
    ></textarea>
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>
```

### Select Component (Modern: defineModel)
```vue
<!-- components/Common/Select.vue -->
<script setup lang="ts">
export interface SelectOption {
  value: string | number
  label: string
}

interface Props {
  label?: string
  options: SelectOption[]
  placeholder?: string
  required?: boolean
  error?: string
}

withDefaults(defineProps<Props>(), {})

// ✅ defineModel for clean two-way binding
const modelValue = defineModel<string | number>({
  default: ''
})
</script>

<template>
  <div class="form-field">
    <label v-if="label">{{ label }}</label>
    <select 
      :value="modelValue"
      :required="required"
      @change="modelValue = $event.target.value"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>
```

---

## Two-Way Data Binding: defineModel vs modelValue

### Modern Pattern: defineModel (Vue 3.4+)

```typescript
// ✅ Cleaner dan lebih ringkas
const fullName = defineModel<string>('fullName', {
  default: ''
})

// Parent automatically dapat v-model:full-name="data.fullName"
// Tidak perlu defineEmits, tidak perlu :value + @input
```

**Parent Component:**
```vue
<template>
  <!-- ✅ Simple two-way binding -->
  <MyInput v-model:full-name="data.fullName" />
  
  <!-- Atau dengan v-model singkat (model name = 'modelValue') -->
  <FormInput v-model="data.title" />
</template>
```

**Multiple Models dalam satu component:**
```vue
<script setup lang="ts">
// Component mendukung multiple v-model bindings
const title = defineModel<string>()
const description = defineModel<string>('description')
const published = defineModel<boolean>('published')
</script>

<template>
  <!-- Parent -->
  <MyForm 
    v-model="post.title"
    v-model:description="post.description"
    v-model:published="post.published"
  />
</template>
```

### Old Pattern: modelValue + defineEmits (Pre-Vue 3.4)

```typescript
// ❌ Lebih verbose
interface Props {
  modelValue: string
}

withDefaults(defineProps<Props>(), {})

defineEmits<{
  'update:modelValue': [value: string]
}>()

// Parent:
// <MyInput v-model="data.fullName" />
// <MyInput :model-value="data.fullName" @update:model-value="data.fullName = $event" />
```

---

## defineEmits Syntax: Old vs Modern

### ✅ MODERN: Function Overload Syntax (Vue 3.4+)
```typescript
// Cleaner dan lebih explicit tentang apa yang di-emit
defineEmits<{
  (e: 'success', blog: BlogData): void
  (e: 'cancel'): void
  (e: 'delete', id: string): void
}>()

// Type-safe parent usage
const handleSuccess = (blog: BlogData) => { }
const handleCancel = () => { }
```

**Parent Component:**
```vue
<template>
  <BlogForm 
    @success="handleSuccess"
    @cancel="handleCancel"
    @delete="handleDelete"
  />
</template>
```

### ❌ OLD: Tuple Array Syntax (Pre-Vue 3.4)
```typescript
defineEmits<{
  success: [blog: BlogData]
  cancel: [void]
  delete: [id: string]
}>()
```

**Advantages of Function Overload:**
- More explicit about parameter names and types
- Better IDE autocomplete in parent components
- Clearer intent: `(e: 'success', blog: BlogData)` vs `success: [BlogData]`
- Follows Vue 3.4+ official pattern
- Single responsibility per line

### Key Differences

| Aspek | Old (Tuple) | Modern (Overload) |
|-------|-------------|-------------------|
| **Syntax** | `success: [blog: BlogData]` | `(e: 'success', blog: BlogData): void` |
| **Clarity** | Less explicit | Very explicit |
| **Maintainability** | Harder to read | Easier to understand |
| **IDE Support** | Basic | Excellent |
| **Parent Usage** | Same (`@success="..."`) | Same (`@success="..."`) |

---

## defineProps Syntax: Old vs Modern

### ❌ OLD: Object Syntax (Pre-Vue 3.4)
```typescript
// Perlu import PropType
import { PropType } from 'vue'

// Manual type wrapping dengan as PropType
defineProps({
  blogs: {
    type: Array as PropType<BlogData[]>,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})
```

### ✅ MODERN: TypeScript Interface Syntax (Vue 3.4+)
```typescript
// Tidak perlu import PropType
// Types langsung dalam interface

interface Props {
  blogs: BlogData[]      // required (tanpa ? = required)
  loading?: boolean      // optional (dengan ?)
}

// Gunakan withDefaults untuk optional props
withDefaults(defineProps<Props>(), {
  loading: false
})
```

### Key Differences

| Aspek | Old | Modern |
|-------|-----|--------|
| **Import** | Perlu `import { PropType }` | Tidak perlu |
| **Syntax** | Object literal | TypeScript interface |
| **Required** | `required: true` | Tanpa `?` di interface |
| **Optional** | `required: false` (tidak wajib) | Dengan `?` di interface |
| **Default** | `default: value` | `withDefaults()` |
| **Type Safety** | Compile-time saja | Full type inference |
| **IDE Support** | Standar | Lebih baik |

### Contoh: Required vs Optional Props

```typescript
// ✅ MODERN STYLE

interface Props {
  // REQUIRED - harus di-pass
  id: string
  title: string
  
  // OPTIONAL - dengan default
  isPinned?: boolean
  Tags?: string[]
  status?: 'draft' | 'published'
}

withDefaults(defineProps<Props>(), {
  isPinned: false,
  Tags: () => [],           // Array default pakai function
  status: 'draft'
})

// USAGE:
// <MyComponent id="1" title="Hello" />                    ✅ OK
// <MyComponent id="1" title="Hello" is-pinned />           ✅ OK
// <MyComponent id="1" title="Hello" is-pinned status="published" /> ✅ OK
// <MyComponent title="Hello" />                           ❌ Error: missing id
```

---

## Template Snippet: Usage

### Create Mode
```vue
<!-- pages/admin/blog/new.vue -->
<script setup lang="ts">
// ✅ BlogForm auto-imported from components/Blog/Form.vue

const router = useRouter()

function handleSuccess(blog) {
  // Show success message
  router.push(`/admin/blog/${blog.id}`)
}
</script>

<template>
  <div class="container">
    <BlogForm @success="handleSuccess" @cancel="$router.back()" />
  </div>
</template>
```

### Edit Mode
```vue
<!-- pages/admin/blog/[id].vue -->
<script setup lang="ts">
// ✅ useBlogDetail auto-imported from composables/useBlogDetail.ts

const route = useRoute()
const { blog } = await useBlogDetail(route.params.id)
</script>

<template>
  <div class="container">
    <!-- Props "blog" triggers edit mode -->
    <BlogForm :blog="blog" @success="$router.back()" />
  </div>
</template>
```

---

## ✅ Checklist

- [ ] Props typed with TypeScript interface + `withDefaults`
- [ ] All emits are defined with proper types
- [ ] No circular imports between components
- [ ] Business logic moved to composables
- [ ] UI state (modal open, selected item) kept in component
- [ ] No data fetching in component (use composable)
- [ ] Form components use v-model (defineModel or as prop)
- [ ] Form logic centralized in composable
- [ ] Using Nuxt auto-imports (no manual import for Vue APIs)
- [ ] No manual `PropType` imports (use TypeScript interfaces)
- [ ] Optional props with defaults use `withDefaults`
- [ ] Type imports use `type` keyword

---

## Complete Real-World Example

### Complete Blog List Component
```vue
<!-- components/Blog/List.vue -->
<script setup lang="ts">
import type { BlogData } from '@/shared/types'

// ✅ Card auto-imported: components/Blog/Card.vue
// ✅ Pagination auto-imported: components/Blog/Pagination.vue

interface Props {
  blogs: BlogData[]
  loading?: boolean
  page?: number
  totalPages?: number
  perPage?: number
}

withDefaults(defineProps<Props>(), {
  loading: false,
  page: 1,
  totalPages: 1,
  perPage: 10
})

defineEmits<{
  (e: 'select', blog: BlogData): void
  (e: 'delete', id: string): void
  (e: 'edit', blog: BlogData): void
  (e: 'page-change', page: number): void
}>()

const selectedId = ref<string | null>(null)

// ✅ No import needed - ref is auto-imported
// ✅ No import needed - computed is auto-imported
const hasItems = computed(() => blogs.length > 0)
</script>

<template>
  <div class="blog-list">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner">Loading...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasItems" class="empty-state">
      <p>No blogs found</p>
    </div>

    <!-- List -->
    <div v-else class="grid gap-4">
      <BlogCard 
        v-for="blog in blogs" 
        :key="blog.id"
        :blog="blog"
        :selected="selectedId === blog.id"
        @select="selectedId = blog.id; $emit('select', blog)"
        @edit="$emit('edit', blog)"
        @delete="$emit('delete', blog.id)"
      />
    </div>

    <!-- Pagination -->
    <BlogPagination 
      v-if="hasItems && totalPages > 1"
      :current-page="page"
      :total-pages="totalPages"
      @change="$emit('page-change', $event)"
    />
  </div>
</template>

<style scoped>
.blog-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
}
</style>
```

### Complete Blog Form Component
```vue
<!-- components/Blog/Form.vue -->
<script setup lang="ts">
import type { BlogData } from '@/shared/types'

// ✅ Input auto-imported: components/Common/Input.vue
// ✅ Textarea auto-imported: components/Common/Textarea.vue  
// ✅ CategorySelect auto-imported: components/Common/Select.vue

interface Props {
  blog?: BlogData
}

withDefaults(defineProps<Props>(), {})

defineEmits<{
  (e: 'success', blog: BlogData): void
  (e: 'cancel'): void
}>()

// ✅ useBlogForm auto-imported from composables/useBlogForm.ts
const { 
  formData, 
  errors, 
  isEdit, 
  isSubmitting,
  submitForm,
  reset,
  getFieldError,
  markTouched
} = useBlogForm(props.blog)

const onSubmit = async () => {
  try {
    const result = await submitForm()
    $emit('success', result)
  } catch (error) {
    console.error('Form submission error:', error)
  }
}
</script>

<template>
  <form class="blog-form" @submit.prevent="onSubmit">
    <div class="form-header">
      <h2>{{ isEdit ? 'Edit Blog' : 'Create New Blog' }}</h2>
    </div>

    <FormInput 
      v-model="formData.title"
      label="Title"
      placeholder="Enter blog title"
      required
      :error="getFieldError('title')"
      @blur="markTouched('title')"
    />

    <FormTextarea
      v-model="formData.excerpt"
      label="Excerpt"
      placeholder="Brief summary"
      rows="2"
      :error="getFieldError('excerpt')"
      @blur="markTouched('excerpt')"
    />

    <FormTextarea
      v-model="formData.content"
      label="Content"
      placeholder="Full blog content"
      rows="10"
      required
      :error="getFieldError('content')"
      @blur="markTouched('content')"
    />

    <CategorySelect
      v-model="formData.categoryId"
      label="Category"
      required
      :error="getFieldError('categoryId')"
      @blur="markTouched('categoryId')"
    />

    <div class="form-actions">
      <button 
        type="submit" 
        class="btn btn-primary"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
      </button>
      <button 
        type="button" 
        class="btn btn-secondary"
        :disabled="isSubmitting"
        @click="$emit('cancel'); reset()"
      >
        Cancel
      </button>
    </div>
  </form>
</template>

<style scoped>
.blog-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.form-header {
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

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
</style>
```

---

## Where Business Logic Belongs

| Feature | Location | Why |
|---------|----------|-----|
| Data fetching | Composable | Reusable, testable, controlled |
| Validation | Composable | Can be used by API and client |
| Data transformation | Composable | Reusable, decoupled from rendering |
| UI visibility (modal, dropdown) | Component | Specific to UI state |
| Form field errors | Composable | Tied to validation logic |
| Form submission flow | Composable | Create/update/delete logic |
| Event handlers | Component | Part of rendering |
| Conditional rendering | Component | View logic |

---

## Modern Import Best Practices (Nuxt 4.x)

### ✅ WHAT TO DO: Leverage Auto-Imports

```vue
<script setup lang="ts">
// ✅ DON'T IMPORT - Already auto-imported in Nuxt

// Vue APIs
const count = ref(0)
const total = computed(() => count.value * 2)
watch(() => count.value, (newVal) => {})

// Nuxt composables
const router = useRouter()
const { data } = await useFetch('/api/data')

// Custom composables (from composables/ directory)
const { formData, isEdit, submitForm } = useBlogForm()
const { blogs, loading, search } = useBlogList()

// Types (type-only imports when needed)
import type { BlogData } from '@/shared/types'
</script>

<template>
  <!-- ✅ EVERYTHING AUTO-IMPORTED - No explicit imports needed -->
  <!-- BlogForm from components/Blog/Form.vue -->
  <BlogForm />
  <!-- CommonInput from components/Common/Input.vue -->
  <CommonInput />
  <!-- AdminCard from components/admin/Card.vue -->
  <AdminCard />
</template>
```

### ❌ WHAT NOT TO DO: Avoid These Imports

```vue
<script setup lang="ts">
// ❌ DON'T - These are already auto-imported
import { ref, reactive, computed, watch } from 'vue'
import { defineProps, defineEmits, withDefaults } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PropType } from 'vue'  // ← Not needed anymore

// ❌ DON'T - Components are auto-imported  
// File: components/Blog/Form.vue  →  Component: <BlogForm />
import BlogForm from '@/components/Blog/Form.vue'  // ← Not needed
// File: components/Common/Input.vue  →  Component: <CommonInput />
import CommonInput from '@/components/Common/Input.vue'  // ← Not needed
// File: components/admin/Card.vue  →  Component: <AdminCard />
import AdminCard from '@/components/admin/Card.vue'  // ← Not needed

// ❌ DON'T - Composables are auto-imported too!
import { useBlogForm } from '@/composables/useBlogForm'  // ← Not needed
import { useBlogList } from '@/composables/useBlogList'  // ← Not needed
</script>
```

### ✅ ONLY IMPORT: What's Actually Needed

```vue
<script setup lang="ts">
// ✅ DO IMPORT:

// 1. Types (type-only import)
import type { BlogData, BlogFormData } from '@/shared/types'

// 2. Utilities/Helpers (jika tidak ingin auto-imports)
import { validateBlog } from '@/shared/utils/validation'
import { formatDate } from '@/shared/utils/date'

// ✅ Everything else is auto-imported:
// - Vue APIs: ref, reactive, computed, watch, onMounted, etc
// - defineProps, defineEmits, withDefaults, defineModel
// - Nuxt composables: useRouter, useRoute, navigateTo, useFetch, useState, etc
// - Custom composables: useBlogForm, useBlogList, useCustomLogic (from composables/)
// - Components: BlogForm, FormInput, BlogCard (from components/)
</script>
```

### Import Organization

```typescript
// Best practice order:
// 1. Type imports (Grouped at top)
// 2. Only specific utilities if needed
// (empty line)
// Everything else: Auto-imported

import type { BlogData, BlogFormData } from '@/shared/types'
import { formatDate } from '@/shared/utils/date'

// ✅ Auto-imported (NO imports needed):
// - Vue APIs: ref, reactive, computed, watch, defineProps, defineEmits, defineModel, etc
// - Nuxt APIs: useRouter, useFetch, navigateTo, definePageMeta, etc
// - Custom Composables: useBlogForm, useBlogList, useUserDetail, etc (from composables/)
// - Components: BlogForm, FormInput, BlogCard, AdminCard, etc (from components/)

interface Props { /* ... */ }
const blogs = ref<BlogData[]>([])
const { formData, isEdit, submitForm } = useBlogForm()  // ← auto-imported
// <BlogForm /> ← auto-imported component
</script>
```

---

## Component File Naming & Organization

### Directory Structure
```
components/
├── Blog/
│   ├── List.vue               → <BlogList />
│   ├── Card.vue               → <BlogCard />
│   ├── Form.vue               → <BlogForm />
│   └── Detail.vue             → <BlogDetail />
│
├── admin/
│   ├── Card.vue               → <AdminCard />
│   ├── Dashboard.vue          → <AdminDashboard />
│   └── users/
│       ├── List.vue           → <AdminUsersList />
│       └── Form.vue           → <AdminUsersForm />
│
└── Common/
    ├── FormInput.vue          → <CommonFormInput />
    ├── FormTextarea.vue       → <CommonFormTextarea />
    ├── FormSelect.vue         → <CommonFormSelect />
    └── Modal.vue              → <CommonModal />
```

### Naming Convention
- **File path:** `components/Blog/List.vue` → Component: `<BlogList />` (folder "Blog" + file "List")
- **File path:** `components/admin/users/form.vue` → Component: `<AdminUsersForm />` (nested folders concatenated)
- **File path:** `components/Common/FormInput.vue` → Component: `<CommonFormInput />` 

### Rules
✅ Folder name + File name (both capitalized) = Component name
✅ Nested folders are all concatenated together
✅ File names should NOT repeat the folder name (avoid: `Blog/BlogList.vue`)
✅ Use PascalCase for file names: `List.vue`, not `list.vue`
✅ Root-level files: `components/Button.vue` → `<Button />`

---

## Checklist: Modern Component Best Practices

- [ ] No manual imports for Vue APIs (ref, computed, watch, etc)
- [ ] No manual import for `PropType` (use TypeScript interfaces)
- [ ] No manual imports for components (auto-imported from components/)
- [ ] No manual imports for composables (auto-imported from composables/)
- [ ] Props defined with interface + `withDefaults`
- [ ] Optional props use `?` in interface
- [ ] Emits use function overload syntax: `(e: 'event', payload): void`
- [ ] Type imports use `import type` keyword
- [ ] Only import: types and specific utilities when needed
- [ ] Auto-imports: Vue APIs, Nuxt APIs, Components, Composables
- [ ] Props and emits properly typed
- [ ] Two-way binding uses `defineModel` (not modelValue + defineEmits)
- [ ] Form components use `defineModel` for v-model support
- [ ] No circular dependencies
- [ ] Business logic in composables, not components
- [ ] Component files organized in logical folders
- [ ] Composable files organized in logical folders (use `use` prefix)
- [ ] Following Nuxt naming conventions
