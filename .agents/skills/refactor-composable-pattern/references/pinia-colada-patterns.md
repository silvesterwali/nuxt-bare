---
title: Pinia-Colada with Error Handling & Form Validation
description: Complete patterns for pinia-colada mutations, error transformation, and form.setErrors() mapping in Nuxt full-stack
---

# Pinia-Colada with Error Handling & Form Validation

Comprehensive guide for integrating pinia-colada mutations with form error handling, based on **working patterns** from this project.

## ⚡ Quick Summary

| Pattern | When to Use | Returns |
|---------|-----------|---------|
| **Query** (`useQuery`) | Fetch data from API | `{ data, isLoading, error }` |
| **Mutation** (`useMutation`) | Create/Update/Delete | Returns from mutation fn |
| **mutateAsync** | Form submission (await needed) | Promise - catch errors |
| **mutate** | Fire-and-forget (delete confirm dialog) | Void - errors in onError hook |
| **transformToIssue** | Backend error → form errors | `FormError[]` for `form.setErrors()` |

---

## Error Transformation Pattern (The Bridge)

---

## Component Pattern Hierarchy

### Full Component Structure (Admin Modules)

```
AdminCategoryForm/  (Modal form component)
├── Props: open (v-model), categoryId, category
├── Emits: (none - uses v-model for close)
└── Workflow: Reactive state → Submit → mutateAsync → Close on success or show errors

AdminCategoryList/  (List with inline create/edit)
├── Controls: Search, pagination, modal management
├── Mutations: useCategory(Create|Update|Delete)Mutation()
└── Data: useCategoriesQuery()
```

### Component Relationships

```
List Component (AdminCategoryList)
    ↓ (opens modal with v-model)
Form Component (AdminCategoryForm)
    ↓ (calls mutations from composables)
Pinia-Colada Mutation (useCategoryCreateMutation)
    ↓ (catches errors)
Component Error State Ref (issues: ZodIssue[])
    ↓ (renders field errors)
Form Fields with Error Display
```

---

## Component Pattern Details

### 1. List Component Pattern

**File:** `AdminCategoryList.vue`

```vue
<script setup lang="ts">
// QUERIES
const { data: categories, isLoading: pending } = useCategoriesQuery()
const { mutate: deleteCategory } = useCategoryDeleteMutation()

// STATE
const isOpen = ref(false)
const editingId = ref<number | null>(null)
const selectedCategory = ref<BlogCategory | null>(null)
const deleteConfirmOpen = ref(false)
const categoryToDelete = ref<number | null>(null)

// LOCAL COMPUTED (pagination from client-side data)
const paginated = computed(() => {
  const arr = categories.value || []
  const start = (page.value - 1) * perPage.value
  return arr.slice(start, start + perPage.value)
})

// MODAL MANAGEMENT
function openCreateModal() {
  editingId.value = null
  selectedCategory.value = null
  isOpen.value = true
}

function openEditModal(category: BlogCategory) {
  editingId.value = category.id
  selectedCategory.value = category
  isOpen.value = true
}

// DELETE HANDLING
function handleDeleteCategory(id: number) {
  categoryToDelete.value = id
  deleteConfirmOpen.value = true
}

function confirmDelete() {
  if (categoryToDelete.value) {
    deleteCategory(categoryToDelete.value) // mutate() not await
    deleteConfirmOpen.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header with Create button -->
    <div class="flex justify-between items-center">
      <h2>Categories</h2>
      <UButton @click="openCreateModal" label="New Category" />
    </div>

    <!-- Table -->
    <UTable :data="paginated" :columns="columns" :loading="pending" />

    <!-- Pagination -->
    <UPagination v-model:page="page" :total="(categories || []).length" />

    <!-- Form Modal (controlled by parent with v-model) -->
    <AdminCategoryForm
      v-model:open="isOpen"
      :category-id="editingId"
      :category="selectedCategory"
    />

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="deleteConfirmOpen" title="Delete Category">
      <template #body>
        <p>Are you sure?</p>
        <div class="flex gap-2">
          <UButton variant="ghost" label="Cancel" @click="deleteConfirmOpen = false" />
          <UButton color="error" label="Delete" @click="confirmDelete" />
        </div>
      </template>
    </UModal>
  </div>
</template>
```

**Key Points:**
- List component doesn't handle mutations directly beyond delete confirmation
- Create/Edit form is in a separate modal component
- Delete uses `.mutate()` (fire-and-forget) with toast in mutation onSuccess
- Create/Edit form opens with props for edit detection

---

### 2. Form Component Pattern (Modal-based)

**File:** `AdminCategoryForm.vue`

```vue
<script setup lang="ts">
import { z } from "zod"
import type { BlogCategory } from "@/types/blog"
import type { ZodIssue } from "zod"

// ========== PROPS & MODEL ==========
interface OtherProps {
  categoryId: number | null
  category: BlogCategory | null
}

const open = defineModel<boolean>("open", { default: false })
const props = defineProps<OtherProps>()

// ========== MUTATIONS ==========
const { mutateAsync: createCategory, isLoading: creating } = useCategoryCreateMutation()
const { mutateAsync: updateCategory, isLoading: updating } = useCategoryUpdateMutation()

// ========== SCHEMA & VALIDATION ==========
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
})

type FormData = z.infer<typeof schema>

// ========== ERROR TRACKING ==========
const issues = ref<ZodIssue[]>([])
const fieldErrors = computed(() => {
  const map: Record<string, string> = {}
  for (const issue of issues.value) {
    const key = issue.path[0] as string
    if (!map[key]) map[key] = issue.message
  }
  return map
})

// ========== FORM STATE ==========
const state = reactive({
  name: "",
  description: "",
  color: "",
})

// ========== COMPUTED ==========
const isLoading = computed(() => creating.value || updating.value)
const modalTitle = computed(() => (props.categoryId ? "Edit Category" : "New Category"))

// ========== SYNC FORM STATE WITH PROPS ==========
watchEffect(() => {
  if (open.value && props.category) {
    state.name = props.category.name || ""
    state.description = props.category.description || ""
    state.color = props.category.color || ""
  } else if (open.value && !props.category) {
    // Clear form for create mode
    state.name = ""
    state.description = ""
    state.color = ""
  }
})

// ========== SUBMIT HANDLER ==========
async function onSubmit() {
  try {
    // Always clear previous issues before submit
    issues.value = []

    const data = {
      name: state.name,
      description: state.description || undefined,
      color: state.color || undefined,
    }

    if (props.categoryId) {
      // UPDATE path
      await updateCategory({
        id: props.categoryId,
        data,
      })
    } else {
      // CREATE path
      await createCategory(data)
    }

    // Close only on success
    open.value = false
  } catch (error: any) {
    console.error("Form submission error:", error)
    
    // Map error response to ZodIssue[] format
    let array: any[] = []
    if (Array.isArray(error)) {
      array = error
    } else if (Array.isArray(error?.data)) {
      array = error.data
    }
    issues.value = array as ZodIssue[]
  }
}

function close() {
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="modalTitle" @close="close">
    <template #body>
      <div class="flex flex-col gap-4">
        <CommonLanguageContentViewer />

        <!-- Name Field -->
        <UFormField label="Name" required>
          <UInput
            v-model="state.name"
            placeholder="Enter category name"
            class="w-full"
          />
          <template #hint v-if="fieldErrors.name">
            <span class="text-red-500">{{ fieldErrors.name }}</span>
          </template>
        </UFormField>

        <!-- Description Field -->
        <UFormField label="Description">
          <UTextarea
            v-model="state.description"
            placeholder="Enter category description"
            :rows="3"
            class="w-full"
          />
          <template #hint v-if="fieldErrors.description">
            <span class="text-red-500">{{ fieldErrors.description }}</span>
          </template>
        </UFormField>

        <!-- Color Field -->
        <UFormField label="Color">
          <div class="flex gap-2">
            <UInput
              v-model="state.color"
              type="color"
              placeholder="#000000"
              class="w-16"
            />
            <UInput
              v-model="state.color"
              placeholder="e.g., #FF5733"
              class="flex-1"
            />
          </div>
        </UFormField>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 pt-4">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cancel"
            @click="close"
          />
          <UButton
            label="Save Category"
            :loading="isLoading"
            @click="onSubmit"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
```

**Key Points:**
- Uses `defineModel` for v-model binding (Vue 3.4+)
- Uses `mutateAsync` (not `mutate`) to await completion
- Form doesn't use `UForm` component - uses reactive state directly
- Error handling: Collects `ZodIssue[]` from error response
- Field errors mapped to reactive `fieldErrors` computed property
- Modal only closes on successful mutation
- Edit/Create detection via `props.categoryId` existence

---

## Composable Pattern Details

### Pinia-Colada Query Composable

```typescript
// composables/useCategoriesQuery.ts
import { useQuery } from "@pinia/colada"
import type { BlogCategory } from "@/types/blog"

export function useCategoriesQuery() {
  return useQuery({
    key: ["admin", "categories"],
    query: async () => {
      const response = await $fetch<{
        data: BlogCategory[]
        statusMessage: string
      }>("/api/admin/categories")
      return response.data
    },
  })
}
```

**Features:**
- `key` array: Cache key for pinia-colada store
- `query` fn: Async function returning data only (not full response)
- Returns: `{ data, isLoading, error, isPending, ... }`

---

### Pinia-Colada Mutation Composable (Create Pattern)

```typescript
// composables/useCategory.ts
import { useMutation, useQueryCache } from "@pinia/colada"
import type { BlogCategory } from "@/types/blog"

export interface CreateCategoryInput {
  name: Record<string, string> | string
  slug?: Record<string, string> | string
  description?: Record<string, string> | string
  color?: string
}

export function useCategoryCreateMutation() {
  const cache = useQueryCache()

  return useMutation({
    // mutation fn: receives payload, returns data
    mutation: async (data: CreateCategoryInput) => {
      return $fetch<BlogCategory>("/api/admin/categories", {
        method: "POST",
        body: data,
      })
    },

    // onSuccess: called on successful mutation
    onSuccess: async () => {
      // Invalidate cache to refetch list
      await cache.invalidateQueries({
        key: ["admin", "categories"],
      })
      // Show toast
      useToast().add({
        title: "Success",
        description: "Category created successfully",
      })
    },

    // onError: called on mutation error
    onError: () => {
      useToast().add({
        title: "Error",
        description: "Failed to create category",
        color: "error",
      })
    },
  })
}
```

**Returns:**
```typescript
{
  mutate(payload): void         // Fire-and-forget
  mutateAsync(payload): Promise  // Await completion (recommended for forms)
  isLoading: Ref<boolean>
  error: Ref<any>
  data: Ref<any>
  state: Ref<"idle" | "pending" | "error" | "success">
}
```

---

### Pinia-Colada Mutation Composable (Update Pattern)

```typescript
export function useCategoryUpdateMutation() {
  const cache = useQueryCache()

  return useMutation({
    mutation: async ({
      id,
      data,
    }: {
      id: number
      data: Partial<CreateCategoryInput>
    }) => {
      return $fetch<BlogCategory>(`/api/admin/categories/${id}`, {
        method: "PUT",
        body: data,
      })
    },

    onSuccess: async () => {
      await cache.invalidateQueries({
        key: ["admin", "categories"],
      })
      useToast().add({
        title: "Success",
        description: "Category updated successfully",
      })
    },

    onError: () => {
      useToast().add({
        title: "Error",
        description: "Failed to update category",
        color: "error",
      })
    },
  })
}
```

---

## Error Transformation & Form.setErrors() Mapping

### Backend Error Response Format

When validation fails on the backend, the error is thrown as:

```typescript
// server/api/admin/categories/index.post.ts
throw createError({
  statusCode: 422,
  statusMessage: "Validation Error",
  data: [
    {
      code: "too_small",
      minimum: 1,
      type: "string",
      path: ["name"],
      message: "Name is required",
    },
    {
      code: "invalid_string",
      validation: "email",
      path: ["email"],
      message: "Invalid email format",
    },
  ]
})
```

### Error Catching in Components

```typescript
async function onSubmit() {
  try {
    issues.value = [] // Always clear before submit

    const data = {
      name: state.name,
      description: state.description || undefined,
    }

    if (props.categoryId) {
      await updateCategory({ id: props.categoryId, data })
    } else {
      await createCategory(data)
    }

    // Only close on success
    open.value = false
  } catch (error: any) {
    // ERROR CAUGHT HERE - from pinia-colada mutation
    
    console.error("Form submission error:", error)
    
    // Map error response to issues array
    let array: any[] = []
    
    if (Array.isArray(error)) {
      // Direct array (unlikely)
      array = error
    } else if (Array.isArray(error?.data)) {
      // Error object with data property (expected)
      array = error.data
    }
    
    issues.value = array as ZodIssue[]
    // Don't close modal - show errors
  }
}
```

### Field Error Display

```typescript
// Computed property: map ZodIssue[] to field names
const fieldErrors = computed(() => {
  const map: Record<string, string> = {}
  for (const issue of issues.value) {
    const key = issue.path[0] as string
    if (!map[key]) map[key] = issue.message // First error only
  }
  return map
})

// In template
<template v-if="fieldErrors.name">
  <span class="text-red-500">{{ fieldErrors.name }}</span>
</template>
```

---

## How Pinia-Colada Mutations Differ from Regular $fetch

### Regular $fetch Approach
```typescript
async function handleSubmit() {
  try {
    const result = await $fetch("/api/categories", {
      method: "POST",
      body: data,
    })
    // Manual toast
    // Manual cache invalidation
    // Manual UI state management
  } catch (error) {
    // Manual error handling
  }
}
```

### Pinia-Colada useMutation Approach

| Aspect | $fetch | useMutation |
|--------|--------|------------|
| **Error Handling** | Manual try-catch | `onError` hook |
| **Success Handling** | Manual | `onSuccess` hook |
| **Cache Invalidation** | Manual | `onSuccess` → `useQueryCache().invalidateQueries()` |
| **Toast Notifications** | Manual | Can be in `onSuccess`/`onError` |
| **Loading State** | Manual ref | Built-in `isLoading` |
| **Reusability** | Call function directly | Composable can be used in multiple components |
| **Request Deduplication** | None | Automatic if called multiple times |
| **Error State** | Exception only | `error` ref + `state` ref ("pending" \| "error" \| "success") |
| **Component Separation** | Logic in component | Logic in composable |
| **Optimistic Updates** | Manual | Supported via `onMutate` (advanced) |

### Key Differences for Form Error Handling

**$fetch (Manual):**
```typescript
try {
  await $fetch(...)
} catch (error) {
  if (error.status === 422) {
    // Must manually extract error.data
    // Must manually map to form fields
  }
}
```

**useMutation (Declarative):**
```typescript
const { mutateAsync, isLoading } = useMutation({
  mutation: async (data) => $fetch(..., { body: data }),
  onError: (error) => {
    // Error already available
    // Can use in component's catch block
  }
})

// Component:
try {
  await mutateAsync(data)
} catch (error) {
  // Error from mutation passed to catch
  issues.value = error.data // Directly map
}
```

---

## Pinia-Colada Integration with Zod Validation

### Backend Schema (for validation)

```typescript
// server/utils/category/schema.ts
import { z } from "zod"

export const CreateCategoryBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
})

export type CreateCategoryBody = z.infer<typeof CreateCategoryBodySchema>
```

### Backend Validation with Error Throwing

```typescript
// server/api/admin/categories/index.post.ts
import { readValidatedBody } from "h3"

export default defineAuthHandler(async (event) => {
  try {
    // readValidatedBody throws if validation fails
    const { name, description, color } = await readValidatedBody(
      event,
      CreateCategoryBodySchema.parse,
    )

    // Validation passed, now do business logic
    const result = await createCategory({
      name: normalize(name, language),
      description: description ? normalize(description) : undefined,
      color,
    })

    return jsonResponse(result[0], "Category created successfully")
  } catch (error) {
    if (error instanceof H3Error) {
      // Re-throw with formatted data
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.statusMessage,
        data: JSON.parse(error.data.message), // Zod issues
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    })
  }
})
```

### Frontend Form Composable with Zod

```typescript
// composables/useCategoryForm.ts
import { z } from "zod"

export function useCategoryForm() {
  // Client-side schema (format validation only)
  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    color: z.string().optional(),
  })

  const { mutateAsync: createCategory } = useCategoryCreateMutation()

  const state = reactive({
    name: "",
    description: "",
    color: "",
  })

  const issues = ref<ZodIssue[]>([])

  async function submit() {
    try {
      issues.value = []
      
      // Client-side validation (format only)
      // Don't validate business logic here!
      const result = schema.parse(state)

      // Send to server (which validates again)
      await createCategory(result)
    } catch (error) {
      // Catch validation error or mutation error
      if (error instanceof ZodError) {
        issues.value = error.issues
      } else if (Array.isArray(error?.data)) {
        // From mutation error
        issues.value = error.data
      }
    }
  }

  return {
    state,
    issues,
    submit,
  }
}
```

---

## Adapting Advertise Patterns for Pinia-Colada Usage

### Pattern Translation: Before → After

#### Before: $fetch + Manual State
```typescript
// Old pattern
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

async function handleSubmit() {
  isLoading.value = true
  try {
    const result = await $fetch("/api/advertise", {
      method: "POST",
      body: formData.value,
    })
    // Manual success handling
    useRouter().push("/advertise")
  } catch (error: any) {
    if (error.data?.issues) {
      // Manual error mapping
      errors.value = mapZodIssuesToFields(error.data.issues)
    }
  } finally {
    isLoading.value = false
  }
}
```

#### After: Pinia-Colada Mutation
```typescript
// New pattern
const { mutateAsync: createAdvertise, isLoading } = useAdvertiseCreateMutation()
const issues = ref<ZodIssue[]>([])

async function onSubmit() {
  try {
    issues.value = []
    await createAdvertise(formData.value)
    // onSuccess in composable handles navigation
  } catch (error: any) {
    issues.value = error.data // Or extract field by field
  }
}
```

### Step-by-Step Adaptation

**1. Create Query Composable**
```typescript
// composables/useAdvertiseQuery.ts
export function useAdvertisesQuery(params: Ref<AdvertiseListParams>) {
  return useQuery({
    key: () => ["advertise", params.value],
    query: () =>
      $fetch<ResponsePagination<Advertise>>("/api/admin/advertise", {
        query: params.value,
      }).then(res => res.data),
  })
}
```

**2. Create Mutation Composables**
```typescript
// composables/useAdvertiseMutation.ts
export function useAdvertiseCreateMutation() {
  const cache = useQueryCache()
  const router = useRouter()

  return useMutation({
    mutation: (data: CreateAdvertiseInput) =>
      $fetch<Advertise>("/api/admin/advertise", {
        method: "POST",
        body: data,
      }),
    onSuccess: async (data) => {
      await cache.invalidateQueries({ key: ["advertise"] })
      useToast().add({
        title: "Success",
        description: "Advertise created successfully",
      })
      await router.push(`/admin/advertise/${data.id}`)
    },
    onError: () => {
      useToast().add({
        title: "Error",
        description: "Failed to create advertise",
        color: "error",
      })
    },
  })
}
```

**3. Update Form Component**
```vue
<script setup lang="ts">
const { mutateAsync, isLoading } = useAdvertiseCreateMutation()
const { mutateAsync: updateAdvertise } = useAdvertiseUpdateMutation()

const issues = ref<ZodIssue[]>([])
const state = reactive<CreateAdvertiseInput>({...})

async function onSubmit() {
  try {
    issues.value = []
    if (props.advertiseId) {
      await updateAdvertise({ id: props.advertiseId, data: state })
    } else {
      await createAdvertise(state)
    }
  } catch (error: any) {
    issues.value = error.data || []
  }
}
</script>
```

**4. Update List Component (Replace Form Wrapper)**
```vue
<script setup lang="ts">
const { data: advertises } = useAdvertisesQuery(params)
const { mutate: deleteAdvertise } = useAdvertiseDeleteMutation()

const isOpen = ref(false)
const selectedAdvertise = ref<Advertise | null>(null)

function openEdit(advertise: Advertise) {
  selectedAdvertise.value = advertise
  isOpen.value = true
}
</script>

<template>
  <AdminAdvertiseForm
    v-model:open="isOpen"
    :advertise-id="selectedAdvertise?.id ?? null"
    :advertise="selectedAdvertise"
  />
</template>
```

---

## Best Practices for Pinia-Colada + Form Handling

### ✅ DO

1. **Use `mutateAsync` for forms** - Allows awaiting completion and closing modal on success
   ```typescript
   const { mutateAsync } = useMutation(...)
   await mutateAsync(data) // Can await and catch
   ```

2. **Clear errors before submit**
   ```typescript
   issues.value = []
   try { await mutateAsync(...) }
   ```

3. **Keep validation split**
   - Client: Format, length, type
   - Backend: Uniqueness, business logic
   ```typescript
   // Backend throws ZodIssue[] on validation
   // Frontend catches and displays to form user
   ```

4. **Use cache invalidation** for list updates
   ```typescript
   onSuccess: async () => {
     await cache.invalidateQueries({ key: ["advertise"] })
   }
   ```

5. **Use error field mapping** for multi-field errors
   ```typescript
   const fieldErrors = computed(() => {
     const map: Record<string, string> = {}
     for (const issue of issues.value) {
       map[issue.path[0]] = issue.message
     }
     return map
   })
   ```

### ❌ DON'T

1. **Don't use `mutate()` for forms** - Can't await or catch errors
   ```typescript
   // ❌ Wrong
   mutate(data) // Errors silently go to onError
   ```

2. **Don't close modal before mutation completes**
   ```typescript
   // ❌ Wrong - modal closes before mutation finishes
   mutateAsync(data)
   open.value = false
   ```

3. **Don't send business validation to frontend**
   ```typescript
   // ❌ Wrong - don't validate uniqueness on client
   const schema = z.object({
     email: z.string().email().superRefine(async (val, ctx) => {
       const exists = await checkEmailExists(val)
       if (exists) ctx.addIssue(...)
     })
   })
   ```

4. **Don't manually update query cache** if using invalidateQueries
   ```typescript
   // ❌ Wrong - rely on invalidateQueries to refetch
   const { data: items } = useQuery(...)
   items.value.push(newItem)
   ```

5. **Don't catch errors in both `onError` and component** without clear separation
   ```typescript
   // Ambiguous - which runs first?
   onError: () => toast.add("Error")
   // AND in component:
   } catch (error) { ... }
   ```

---

## Real-World Example: Blog Post Create/Edit

### Full Implementation

```typescript
// composables/useBlogMutation.ts
import { useMutation, useQueryCache } from "@pinia/colada"
import type { BlogFormData, BlogPost } from "@/types/blog"

export function useBlogCreateMutation() {
  const cache = useQueryCache()
  const router = useRouter()

  return useMutation({
    mutation: async (data: BlogFormData & { categoryIds: number[]; tagIds: number[] }) => {
      return $fetch<BlogPost>("/api/admin/blog", {
        method: "POST",
        body: data,
      })
    },

    onSuccess: async (post) => {
      // Invalidate blog list cache
      await cache.invalidateQueries({ key: ["posts"] })
      
      useToast().add({
        title: "Success",
        description: "Blog post created successfully",
      })

      // Navigate to detail or list
      await router.push(`/admin/blog/${post.id}/edit`)
    },

    onError: () => {
      useToast().add({
        title: "Error",
        description: "Failed to create blog post",
        color: "error",
      })
    },
  })
}

export function useBlogUpdateMutation() {
  const cache = useQueryCache()

  return useMutation({
    mutation: async ({
      id,
      data,
    }: {
      id: number
      data: Partial<BlogFormData> & { categoryIds?: number[]; tagIds?: number[] }
    }) => {
      return $fetch<BlogPost>(`/api/admin/blog/${id}`, {
        method: "PUT",
        body: data,
      })
    },

    onSuccess: async () => {
      await cache.invalidateQueries({ key: ["posts"] })
      useToast().add({
        title: "Success",
        description: "Blog post updated successfully",
      })
    },

    onError: () => {
      useToast().add({
        title: "Error",
        description: "Failed to update blog post",
        color: "error",
      })
    },
  })
}
```

```vue
<!-- components/Admin/Blog/Form.vue -->
<script setup lang="ts">
import { z } from "zod"
import type { BlogFormData, BlogCategory, BlogTag } from "@/types/blog"
import type { FormSubmitEvent } from "@nuxt/ui"

interface Props {
  post?: BlogFormData & { id?: number; categories?: BlogCategory[]; tags?: BlogTag[] } | null
  isLoading?: boolean
}

interface Emits {
  (e: "submit", data: BlogFormData & { categoryIds: number[]; tagIds: number[] }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Queries
const { data: categories } = useCategoriesQuery()
const { data: tags } = useTagsQuery()

// Form state
const form = ref<BlogFormData>({
  slug: "",
  title: "",
  shortDescription: "",
  content: "",
  status: "draft",
  categoryIds: [],
  tagIds: [],
  featuredImageId: null,
})

const selectedCategoryIds = ref<number[]>([])
const selectedTagIds = ref<number[]>([])

// Watch for prop changes
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
      }
      selectedCategoryIds.value = (newPost.categories || []).map((c) => c.id)
      selectedTagIds.value = (newPost.tags || []).map((t) => t.id)
    }
  },
  { immediate: true },
)

async function onSubmit(event: FormSubmitEvent<BlogFormData>) {
  emit("submit", {
    ...event.data,
    categoryIds: selectedCategoryIds.value,
    tagIds: selectedTagIds.value,
    featuredImageId: form.value.featuredImageId ?? null,
  })
}
</script>

<template>
  <div class="space-y-6">
    <UForm :state="form" @submit="onSubmit" class="space-y-4">
      <!-- Fields as before -->
      <UFormField label="Title" name="title" required>
        <UInput v-model="form.title" placeholder="Blog title" />
      </UFormField>
      <!-- ... more fields ... -->
      <div class="flex justify-end gap-2 pt-6 border-t">
        <UButton type="button" color="neutral" variant="ghost" label="Cancel" :to="`/admin/blog`" />
        <UButton type="submit" :label="`${post?.id ? 'Update' : 'Create'} Post`" :loading="isLoading" />
      </div>
    </UForm>
  </div>
</template>
```

```vue
<!-- pages/admin/blog/create.vue or [...id]/edit.vue -->
<script setup lang="ts">
import type { BlogFormData, BlogPost } from "@/types/blog"

const isEditMode = computed(() => !!route.params.id)
const postId = computed(() => Number(route.params.id) || null)

// Fetch post if editing
const { data: post } = isEditMode.value ? usePostQuery(ref(postId.value)) : ref(null)

// Mutations
const { mutateAsync: createPost, isLoading: creating } = useBlogCreateMutation()
const { mutateAsync: updatePost, isLoading: updating } = useBlogUpdateMutation()

const isLoading = computed(() => creating.value || updating.value)

async function handleSubmit(data: BlogFormData & { categoryIds: number[]; tagIds: number[] }) {
  try {
    if (isEditMode.value && postId.value) {
      await updatePost({ id: postId.value, data })
    } else {
      await createPost(data)
    }
  } catch (error) {
    console.error("Form error:", error)
    // Error handling in mutation's onError
  }
}
</script>

<template>
  <div>
    <AdminBlogForm :post="post" :is-loading="isLoading" @submit="handleSubmit" />
  </div>
</template>
```

---

## Summary: Key Differences in Implementation

| Aspect | Traditional Composable | Pinia-Colada Pattern |
|--------|------------------------|----------------------|
| **Query** | `async function` | `useQuery()` with hooks |
| **Mutation** | `async function` | `useMutation()` with onSuccess/onError |
| **Error Tracking** | Manual ref | `error` ref + `state` computed |
| **Cache Invalidation** | Manual in component | `useQueryCache().invalidateQueries()` |
| **Toast/Alerts** | In component | In composable onSuccess/onError |
| **Loading State** | Manual ref | Built-in `isLoading` |
| **API Error Mapping** | Component logic | Caught in try-catch of component |
| **Best for** | Simple scripts | Large forms with complex interactions |

---

## Resources & References

- Query Composable: `usePostsQuery`, `useCategoriesQuery`, `useTagsQuery`
- Mutation Composables: `useTagCreateMutation`, `useCategoryUpdateMutation`, `useBlogCreateMutation`
- Components: `AdminCategoryForm`, `AdminCategoryList`, `AdminTagForm`, `AdminBlogForm`
- Error Handling: `ZodIssue[]` mapping in components
- Cache Management: `useQueryCache()` for invalidation
