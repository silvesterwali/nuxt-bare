---
title: Zod 4.x Validation Patterns  
description: Client-side validation with Zod 4, backend validation separation, and form error handling strategy
---

# Zod 4.x Validation Patterns

## Prinsip Utama (Core Principles)

> **Saya tidak ingin ada validasi yang harus kirim api backend... semua seperti itu harus selesai dibackend aja**  
> "I don't want component validation for things that require backend API calls. All of that must be handled on the backend only."

### The Split

1. **Client-Side: Format & Structure** — Validate format, types, length, patterns only
2. **Backend-Side: Business Logic** — Validate uniqueness, availability, permissions, business rules
3. **Error Handling: Return to Form** — Map backend validation errors to form fields

### Validation Responsibility Chart

| Check Type | Client-Side | Backend |
|-----------|------------|---------|
| Email format | ✅ `z.email()` | ✅ + Security |
| Email uniqueness | ❌ Never | ✅ Always |
| Username format | ✅ ASCII/length | ✅ + Rules |
| Username taken | ❌ Never | ✅ Always |
| Password strength | ✅ Min length | ✅ + Complexity |
| Field required | ✅ Yes | ✅ Yes |
| Business rules | ❌ Never | ✅ Always |
| Data uniqueness | ❌ Never | ✅ Always |
| Cross-entity checks | ❌ Never | ✅ Always |
| User permissions | ❌ Never | ✅ Always |

---

## Zod 4.x API Changes

### Error Customization - Modern Style

**Zod 4** unified error handling under a single `error` parameter:

```typescript
import { z } from 'zod'

// ✅ ZOD 4 MODERN - Unified error parameter
const schema1 = z.string({
  error: 'Custom error message'
})

// ✅ ZOD 4 MODERN - Dynamic based on issue code
const schema2 = z.string({
  error: (issue) => {
    if (issue.code === 'too_small') {
      return `Minimum ${issue.minimum} characters required`
    }
    if (issue.code === 'too_big') {
      return `Maximum ${issue.maximum} characters allowed`
    }
    return 'Invalid value'
  }
})

// ❌ DEPRECATED (Zod 3 - DO NOT USE)
z.string({
  invalid_type_error: 'Must be string',     // ❌ Removed
  required_error: 'Required'                // ❌ Removed
})
```

### Top-Level Format Validators

**Zod 4** moved string validators to top-level (better tree-shaking):

```typescript
// ✅ ZOD 4 (recommended)
z.email()                    // Email format
z.url()                      // URL validation
z.uuid()                     // UUID/GUID 
z.emoji()                    // Single emoji
z.base64()                   // Base64 encoding
z.ipv4()                     // IPv4 address
z.ipv6()                     // IPv6 address

// ❌ DEPRECATED (still works but old style)
z.string().email()           // ❌ Use z.email() instead
z.string().url()             // ❌ Use z.url() instead
z.string().uuid()            // ❌ Use z.uuid() instead
```

### Error Formatting

**Zod 4** replaced `.format()` and `.flatten()` with `z.treeifyError()`:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.email('Invalid email'),
  age: z.number().min(18, 'Must be 18+'),
})

try {
  schema.parse(data)
} catch (error) {
  if (error instanceof z.ZodError) {
    // ✅ ZOD 4 - Use z.treeifyError()
    const formatted = z.treeifyError(error)
    console.log(formatted)
    // {
    //   email: { _errors: ['Invalid email'] },
    //   age: { _errors: ['Must be 18+'] }
    // }

    // ❌ DEPRECATED (DO NOT USE)
    error.format()           // ❌ Removed
    error.flatten()          // ❌ Removed
  }
}
```

---

## Client-Side Validation Schema

### Principles

✅ **DO:**
- Validate format (email, URL, UUID)
- Check length (min, max, string length)
- Check type (string, number, boolean)
- Validate pattern with regex
- Check required fields
- Test file type and size upfront

❌ **DON'T:**
- Check email uniqueness
- Check username availability
- Check slug duplicates
- Call API for validation
- Validate business logic
- Check user permissions

### Blog Example - Client Schema Only

```typescript
// shared/types/validation/blog.ts
import { z } from 'zod'

/**
 * Blog form input validation (client-side ONLY)
 * Validates: format, length, required fields
 * Does NOT validate: uniqueness, availability
 */
export const CreateBlogInputSchema = z.object({
  title: z
    .string({
      error: (issue) => {
        if (issue.code === 'too_small') {
          return 'Title must be at least 5 characters'
        }
        if (issue.code === 'too_big') {
          return 'Title must not exceed 200 characters'
        }
        return 'Title is required'
      }
    })
    .min(5)
    .max(200)
    .trim(),

  slug: z
    .string({ error: 'Slug format is invalid' })
    .refine(
      (val) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val),
      'Slug must be lowercase with hyphens only'
    ),

  excerpt: z
    .string({ error: 'Excerpt is required' })
    .min(10, 'At least 10 characters')
    .max(500, 'Maximum 500 characters')
    .trim(),

  content: z
    .string({ error: 'Content is required' })
    .min(50, 'Content must be at least 50 characters'),

  categoryId: z
    .string({ error: 'Category is required' })
    .uuid('Invalid category ID'),

  tags: z
    .array(z.string())
    .nonempty('At least one tag required')
    .max(5, 'Maximum 5 tags allowed'),

  published: z.boolean().default(false),

  publishedAt: z.date().nullable().default(null),
})

export type CreateBlogInput = z.infer<typeof CreateBlogInputSchema>

// For update (all fields optional)
export const UpdateBlogInputSchema = CreateBlogInputSchema.partial()
export type UpdateBlogInput = z.infer<typeof UpdateBlogInputSchema>
```

---

## Backend Validation (Server-Side Only)

### Backend Schema with Business Logic

```typescript
// server/api/admin/blogs.post.ts
import { z } from 'zod'
import { CreateBlogInputSchema } from '@/shared/types'

/**
 * Backend validation schema
 * - Includes all client-side validation
 * - PLUS business logic validation
 */
const BackendCreateBlogSchema = CreateBlogInputSchema.superRefine(
  async (data, ctx) => {
    // 1. Check if slug already exists (BACKEND ONLY)
    const existingBlog = await db.blog.findUnique({
      where: { slug: data.slug },
    })
    if (existingBlog) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['slug'],
        message: 'Slug already exists',
      })
    }

    // 2. Verify category exists (BACKEND ONLY)
    const category = await db.category.findUnique({
      where: { id: data.categoryId },
    })
    if (!category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['categoryId'],
        message: 'Category not found',
      })
    }

    // 3. Verify all tags exist (BACKEND ONLY)
    const tags = await db.tag.findMany({
      where: { id: { in: data.tags } },
    })
    if (tags.length !== data.tags.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tags'],
        message: 'One or more tags not found',
      })
    }

    // 4. Check user permissions (BACKEND ONLY)
    const user = await getUserFromSession(event)
    if (!user?.hasPermission('blog:create')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['_root'],
        message: 'Insufficient permissions',
      })
    }
  }
)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validate with backend schema (all checks)
    const validatedData = await BackendCreateBlogSchema.parseAsync(body)

    // If validation passes, create blog
    const blog = await db.blog.create({
      data: validatedData,
    })

    return { success: true, data: blog }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format errors to send back to form
      return formatZodErrors(error)
    }
    throw error
  }
})

/**
 * Format Zod errors for form display
 * - Extract field errors
 * - Extract root-level errors (general message)
 */
function formatZodErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {}
  const issues: string[] = []

  error.issues.forEach((issue) => {
    if (issue.path.length === 0 || issue.path[0] === '_root') {
      // Root level error (general error)
      issues.push(issue.message)
    } else {
      // Field-specific error
      const fieldName = issue.path[0] as string
      fieldErrors[fieldName] = issue.message
    }
  })

  return {
    success: false,
    errors: fieldErrors,
    message: issues.length > 0 ? issues[0] : 'Validation failed',
  }
}
```

---

## Form Component with Error Handling

### BlogForm Component

```vue
<!-- components/Blog/Form.vue -->
<script setup lang="ts">
import type { BlogData } from '@/shared/types'
import { CreateBlogInputSchema } from '@/shared/types'

interface Props {
  blog?: BlogData
}

withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  (e: 'success', blog: BlogData): void
  (e: 'cancel'): void
}>()

// Composables
const { formData, isEdit, isSubmitting, submitForm } = useBlogForm(props.blog)
const { errors, touched, validateField, markTouched, getFieldError } =
  useFormValidation()

// Real-time validation on blur (client-side only)
function handleFieldBlur(fieldName: string) {
  markTouched(fieldName)

  const fieldSchema = (CreateBlogInputSchema as any).shape[fieldName]
  if (fieldSchema) {
    validateField(fieldSchema, formData[fieldName], fieldName)
  }
}

// Submit form with backend validation
async function handleSubmit() {
  try {
    // 1. Client-side validation first
    const clientValidation = validateForm(
      CreateBlogInputSchema,
      formData
    )
    if (!clientValidation.valid) {
      showError('Please fix the errors below')
      return
    }

    // 2. Submit to backend (backend does business logic validation)
    const result = await submitForm()

    if (result.success) {
      emit('success', result.data)
    } else {
      // 3. Backend returned validation errors - map to form
      Object.assign(errors.value, result.errors)

      // Mark all fields as touched to show errors
      Object.keys(result.errors).forEach((field) => {
        touched.value[field] = true
      })

      // Show general message
      showError(result.message || 'Validation failed')
    }
  } catch (error) {
    showError('An unexpected error occurred')
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="blog-form">
    <h2>{{ isEdit ? 'Edit Blog' : 'Create Blog' }}</h2>

    <!-- Title -->
    <FormField>
      <label>Title</label>
      <FormInput
        v-model="formData.title"
        type="text"
        placeholder="Enter blog title"
        required
        :error="getFieldError('title')"
        @blur="handleFieldBlur('title')"
      />
    </FormField>

    <!-- Slug -->
    <FormField>
      <label>Slug</label>
      <FormInput
        v-model="formData.slug"
        type="text"
        placeholder="auto-generated-slug"
        :error="getFieldError('slug')"
        @blur="handleFieldBlur('slug')"
      />
    </FormField>

    <!-- Excerpt -->
    <FormField>
      <label>Excerpt</label>
      <FormTextarea
        v-model="formData.excerpt"
        placeholder="Brief summary"
        :error="getFieldError('excerpt')"
        @blur="handleFieldBlur('excerpt')"
      />
    </FormField>

    <!-- Content -->
    <FormField>
      <label>Content</label>
      <FormTextarea
        v-model="formData.content"
        placeholder="Full content"
        rows="10"
        required
        :error="getFieldError('content')"
        @blur="handleFieldBlur('content')"
      />
    </FormField>

    <!-- Category -->
    <FormField>
      <label>Category</label>
      <FormSelect
        v-model="formData.categoryId"
        :options="categories"
        required
        :error="getFieldError('categoryId')"
        @blur="handleFieldBlur('categoryId')"
      />
    </FormField>

    <!-- Tags -->
    <FormField>
      <label>Tags</label>
      <FormMultiSelect
        v-model="formData.tags"
        :options="allTags"
        max="5"
        :error="getFieldError('tags')"
        @blur="handleFieldBlur('tags')"
      />
    </FormField>

    <!-- Submit -->
    <div class="form-actions">
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create' }}
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </form>
</template>

<style scoped>
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}
</style>
```

### Form Composable

```typescript
// app/composables/useBlogForm.ts
import type { BlogData, CreateBlogInput } from '@/shared/types'

interface FormResponse {
  success: boolean
  data?: BlogData
  errors?: Record<string, string>
  message?: string
}

export function useBlogForm(initialBlog?: BlogData) {
  const formData = reactive<CreateBlogInput>({
    title: initialBlog?.title || '',
    slug: initialBlog?.slug || '',
    excerpt: initialBlog?.excerpt || '',
    content: initialBlog?.content || '',
    categoryId: initialBlog?.categoryId || '',
    tags: initialBlog?.tags || [],
    published: initialBlog?.published || false,
    publishedAt: initialBlog?.publishedAt || null,
  })

  const isSubmitting = ref(false)
  const isEdit = computed(() => !!initialBlog?.id)

  async function submitForm(): Promise<FormResponse> {
    isSubmitting.value = true

    try {
      const endpoint = isEdit.value
        ? `/api/admin/blogs/${initialBlog!.id}`
        : '/api/admin/blogs'

      const method = isEdit.value ? 'PATCH' : 'POST'

      const response = await $fetch<FormResponse>(endpoint, {
        method,
        body: formData,
      })

      return response
    } catch (error: any) {
      // Backend validation errors
      if (error.data?.errors) {
        return {
          success: false,
          errors: error.data.errors,
          message: error.data.message,
        }
      }

      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    formData: readonly(formData),
    isEdit,
    isSubmitting: readonly(isSubmitting),
    submitForm,
  }
}
```

### Validation Composable

```typescript
// app/composables/useFormValidation.ts
import { z } from 'zod'

export function useFormValidation() {
  const errors = ref<Record<string, string>>({})
  const touched = ref<Record<string, boolean>>({})

  /**
   * Validate single field (client-side only)
   */
  function validateField(
    schema: z.ZodSchema,
    value: unknown,
    fieldName: string
  ): boolean {
    try {
      schema.parse(value)
      errors.value[fieldName] = ''
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.value[fieldName] = error.issues[0]?.message || 'Invalid value'
      }
      return false
    }
  }

  /**
   * Validate entire form (client-side only)
   */
  function validateForm(
    schema: z.ZodSchema,
    formData: unknown
  ): { valid: boolean; errors: Record<string, string> } {
    try {
      schema.parse(formData)
      errors.value = {}
      return { valid: true, errors: {} }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path[0] as string
          newErrors[path] = issue.message
        })
        errors.value = newErrors
        return { valid: false, errors: newErrors }
      }
      return { valid: false, errors: {} }
    }
  }

  function markTouched(fieldName: string): void {
    touched.value[fieldName] = true
  }

  function getFieldError(fieldName: string): string {
    if (!touched.value[fieldName]) return ''
    return errors.value[fieldName] || ''
  }

  function clearErrors(): void {
    errors.value = {}
    touched.value = {}
  }

  return {
    errors: readonly(errors),
    touched: readonly(touched),
    validateField,
    validateForm,
    markTouched,
    getFieldError,
    clearErrors,
  }
}
```

---

## Common Patterns

### Email

```typescript
// Client (format only)
const EmailSchema = z.email('Enter a valid email address')

// Backend (+ uniqueness)
const BackendEmailSchema = z
  .email('Enter a valid email address')
  .superRefine(async (email, ctx) => {
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email already registered',
      })
    }
  })
```

### Slug

```typescript
// Client (format only)
const SlugSchema = z
  .string()
  .refine(
    (val) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val),
    'Lowercase letters and hyphens only'
  )

// Backend (+ uniqueness)
const BackendSlugSchema = SlugSchema.superRefine(async (slug, ctx) => {
  const existing = await db.blog.findUnique({ where: { slug } })
  if (existing) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Slug already used',
    })
  }
})
```

---

## Best Practices

✅ **DO:**
- Keep client schemas simple (format, length, type only)
- Always validate on backend (don't trust client)
- Return field errors from backend
- Map backend errors to form fields
- Show user-friendly error messages
- Use Zod 4 APIs (z.email(), z.treeifyError())

❌ **DON'T:**
- Check uniqueness on client
- Skip backend validation
- Show raw validation error messages
- Put business logic in client schemas
- Use deprecated Zod 3 APIs
- Try to validate permissions on client
