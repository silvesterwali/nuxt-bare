---
title: Import Best Practices
description: Avoiding circular dependencies, unnecessary imports, and maintaining clean architecture
---

# Import Best Practices Guide

## Core Rules

1. **Components import Composables** ✅
2. **Composables import Components** ❌
3. **Everything imports Shared Types** ✅
4. **Avoid Circular Dependencies** ✅

---

## Import Hierarchy

```
┌─────────────────────────────────┐
│        Shared Types (lowest)    │
│  (shared/types, shared/utils)   │
└────────────────┬────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼─────────┐       ┌──────▼──────┐
│ Composables │       │  Components │
│             │◄──────┤             │
│ (app/       │       │ (app/       │
│ composables)│       │ components) │
└─────────────┘       └──────┬──────┘
                            │
                      ┌─────▼─────┐
                      │   Pages    │
                      │ (app/pages)│
                      └────────────┘
```

---

## Import Patterns

### ✅ GOOD: Component uses Composable

```typescript
// app/components/Blog/BlogList.vue
<script setup lang="ts">
import { useBlogList } from '@/composables/useBlogList'
import type { BlogData } from '@/shared/types'

// ✅ Good: Import composable
const { blogs, isLoading, search } = useBlogList()
</script>
```

---

### ✅ GOOD: Page imports Component and Composable

```vue
<!-- pages/admin/blog/index.vue -->
<script setup lang="ts">
// ✅ Good: Page composes multiple things
import BlogList from '@/components/Blog/BlogList.vue'
import BlogFilter from '@/components/Blog/BlogFilter.vue'
import { useBlogManager } from '@/composables/useBlogManager'

const { search, sort } = useBlogManager()
</script>

<template>
  <div>
    <BlogFilter @search="search" @sort="sort" />
    <BlogList />
  </div>
</template>
```

---

### ❌ BAD: Composable imports Component

```typescript
// ❌ NEVER DO THIS
// app/composables/useBlogManager.ts
import BlogCard from '@/components/Blog/BlogCard.vue'  // ❌ CIRCULAR!

export function useBlogManager() {
  // ...
}
```

**Why?** Creates circular dependency:
- BlogCard imports useBlog
- useBlog imports BlogCard
- Both need each other = circular dependency
- Build fails or very slow

---

### ❌ BAD: Component imports Component

```vue
<!-- app/components/Blog/BlogList.vue -->
<script setup lang="ts">
// ❌ AVOID: Direct component import
import BlogCard from './BlogCard.vue'       // ❌ If BlogCard also needs BlogList
import BlogActionMenu from './BlogActions.vue'  // ❌ Multiple cross-imports

// This creates hard-to-manage dependencies
</script>
```

**Why?** Reduces reusability, creates coupling

---

### ✅ GOOD: Lift to Parent/Page Level

```vue
<!-- pages/admin/blog/index.vue -->
<script setup lang="ts">
// ✅ GOOD: Compose at page level
import BlogList from '@/components/Blog/BlogList.vue'
import BlogCard from '@/components/Blog/BlogCard.vue'

// BlogList and BlogCard don't know about each other
</script>

<template>
  <div>
    <BlogList>
      <template #item="{ blog }">
        <!-- BlogCard receives blog via slot -->
        <BlogCard :blog="blog" />
      </template>
    </BlogList>
  </div>
</template>
```

---

## Common Scenarios

### Scenario 1: Shared UI Component

Multiple features need same input/button

```
✅ SOLUTION: Place in Common/Generic folder

app/components/
├── Common/
│   ├── FormInput.vue       ← Used by Blog, Category, User
│   ├── Button.vue          ← Used everywhere
│   └── Modal.vue           ← Generic modal
│
├── Blog/
│   └── BlogForm.vue        ← Uses Common/FormInput
│
└── Category/
    └── CategoryForm.vue    ← Uses Common/FormInput
```

**Import:**
```vue
<!-- app/components/Blog/BlogForm.vue -->
<script setup lang="ts">
import FormInput from '@/components/Common/FormInput.vue'
</script>
```

---

### Scenario 2: Shared Business Logic

Multiple composables need same utils

```
✅ SOLUTION: Extract to shared/utils or shared/services

shared/utils/
├── validation.ts           ← Used by useBlogForm, useCategoryForm
├── api-client.ts           ← Used by all data-fetching composables
└── date-formatter.ts       ← Used by components & composables

app/composables/
├── useBlogForm.ts          ← Uses shared/utils/validation
└── useCategoryForm.ts      ← Uses shared/utils/validation
```

**Import:**
```typescript
// app/composables/useBlogForm.ts
import { validateBlogData } from '@/shared/utils/validation'
```

---

### Scenario 3: Data Fetching in Composable Only

Business logic stays in composable, component just renders

```
✅ SOLUTION: Fetch in composable, pass to component

// app/composables/useBlogList.ts
export function useBlogList() {
  const blogs = ref<BlogData[]>([])
  
  const fetchBlogs = async () => {
    const res = await $fetch('/api/blogs')
    blogs.value = res.data
  }
  
  onMounted(fetchBlogs)
  
  return { blogs }
}

// app/components/Blog/BlogList.vue
<script setup lang="ts">
// ✅ No API calls here
const { blogs } = useBlogList()
</script>

<template>
  <div v-for="blog in blogs">
    {{ blog.title }}
  </div>
</template>
```

---

## Import Statement Patterns

### ✅ Type-only Imports (correct)

```typescript
// Separate imports: distinguish types from runtime
import type { BlogData, BlogFormData } from '@/shared/types'
import { useBlogForm } from '@/composables/useBlogForm'

// Or
import type { PropType } from 'vue'
import { ref, computed } from 'vue'
```

### ❌ Mixed Type and Runtime (avoid)

```typescript
// ❌ Don't mix - harder to optimize
import { BlogData, useBlogForm } from '@/shared/types'
```

---

### ✅ Barrel Exports from index.ts

```typescript
// shared/types/index.ts
export type { BlogData, BlogFormData } from './blog'
export type { Category, CategoryFormData } from './category'
export type { User, UserProfile } from './user'
```

**Usage:**
```typescript
import type { BlogData, Category, User } from '@/shared/types'
```

### ❌ Don't: Mix import paths

```typescript
// ❌ Avoid: importing from multiple paths
import { BlogData } from '@/shared/types/blog'
import { Category } from '@/shared/types/category'

// ✅ Better: use barrel export
import type { BlogData, Category } from '@/shared/types'
```

---

## Detecting Circular Dependencies

### Issue: Composable needs Component data

**Problem:**
```typescript
// ❌ useBlogManager wants to know about BlogCard
export function useBlogManager() {
  // Need BlogCard instance to customize rendering?
  // Solution: Pass as parameter, not import!
}
```

**Solution: Invert Control**
```typescript
// ✅ Composable doesn't import component
// Instead: accepts render function or config

export function useBlogManager(options = {}) {
  const renderItem = options.renderItem || defaultRender
  
  return { blogs, renderItem }
}

// Component passes render logic
<script setup lang="ts">
const { blogs, renderItem } = useBlogManager({
  renderItem: (blog) => /* ... */
})
</script>
```

---

### Issue: Two Components Need Each Other

**Problem:**
```
BlogList.vue imports BlogCard.vue
BlogCard.vue imports BlogList.vue (for parent communication)
→ Circular!
```

**Solution 1: Use Slots**
```vue
<!-- Parent passes child template -->
<BlogList>
  <template #item="{ blog }">
    <BlogCard :blog="blog" />
  </template>
</BlogList>
```

**Solution 2: Use Events**
```vue
<!-- Child emits, parent handles -->
<BlogCard :blog="blog" @edit="onEdit" />
```

**Solution 3: Lift to Page**
```vue
<!-- Page composes both -->
<BlogList ref="listRef" />
<BlogCard ref="cardRef" />
```

---

## File Organization to Avoid Issues

### ✅ GOOD: Clear dependency flow

```
shared/
├── types/           ← No imports (only types)
├── utils/           ← Can import types only
└── constants/

app/
├── composables/     ← Can import: types, utils, other composables
├── components/      ← Can import: types, utils, composables, other components
└── pages/           ← Can import: anything
```

### ❌ BAD: Unclear structure

```
app/
├── utils/           ← Imports components? ❌
├── helpers/         ← Imports composables and components? ❌
└── lib/             ← Purpose unclear ❌
```

---

## Refactoring Checklist

- [ ] No component imports other components
- [ ] No composable imports components
- [ ] All types in `shared/types`
- [ ] All utilities in `shared/utils`
- [ ] No circular imports (check with `npm run lint`)
- [ ] Type-only imports use `type` keyword
- [ ] Using barrel exports from `shared/types/index.ts`
- [ ] Page/route level imports components and composes them
- [ ] Data flow: Page → Composable → API
- [ ] Render flow: Page → Component hierarchy

---

## TypeScript Checking

Verify no circular dependencies:

```bash
# Check imports
npm run typecheck

# Or use madge for visualization
npx madge --extensions ts,tsx,vue app/
```

---

## Summary

| What | Where | Can Import | Should NOT Import |
|------|-------|------------|-------------------|
| **Type** | `shared/types/` | Nothing | Components, Composables |
| **Utility** | `shared/utils/` | Types, other utils | Components, Composables |
| **Composable** | `app/composables/` | Types, utils, other composables | Components |
| **Component** | `app/components/` | Types, utils, composables, other components | Pages |
| **Page** | `app/pages/` | Everything | (Nothing off-limits) |

---

## Real-World Example: Blog Module

### BEFORE (Tangled Dependencies)
```
BlogList.vue → BlogCard.vue → useBlogActions.ts → BlogList.vue ❌ CIRCULAR
```

### AFTER (Clean Dependencies)
```
BlogList.vue
├── imports: useBlogList (composable)
└── emits: select, delete

BlogCard.vue  
├── imports: useBlogActions (composable)
└── emits: edit, delete

pages/admin/blog/index.vue
├── imports: BlogList, BlogCard
├── uses: useBlogManager
└── handles: all interactions

useBlogList.ts
├── imports: shared/types
└── no component imports

useBlogActions.ts
├── imports: shared/types
└── no component imports ✅
```
