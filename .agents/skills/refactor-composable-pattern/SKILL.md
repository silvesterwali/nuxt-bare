---
name: refactor-composable-pattern
description: Refactoring pattern untuk menghindari import tidak perlu, menggunakan composable untuk logic, centralized type management di shared/types, dan form component pattern yang mendukung edit dan create dengan sama composable.
metadata:
  author: Project Team
  version: "1.0"
  created: "2026-03-13"
  category: refactoring
  tags:
    - composable
    - component-structure
    - type-management
    - form-pattern
---

# Refactoring dengan Composable Pattern

Panduan lengkap untuk refactoring komponen dan logic dengan pola berbasis composable, centralized type management, dan form component pattern yang efisien.

## 🎯 Tujuan Refactoring

1. **Menghindari Import Tidak Perlu** - Komponenten hanya import apa yang dibutuhkan
2. **Separation of Concerns** - Setiap komponen bertanggung jawab untuk fungsinya, logic ada di composable
3. **Reusable Logic** - Composable dapat digunakan di multiple komponen
4. **Centralized Types** - Semua interface/type di `shared/types/**` agar bisa diakses server dan app
5. **Form Pattern Unified** - Form untuk edit dan create menggunakan 1 composable, props determines action

## 📋 Core Patterns

| Topic                            | Description                                            | Reference                                                                 |
| -------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| **Component Structure**          | Layout dan responsibility komponen                     | [component-structure.md](references/component-structure.md)               |
| **Composable Patterns**          | Cara membuat dan menggunakan composable                | [composable-patterns.md](references/composable-patterns.md)               |
| **Type Management**              | Centralized type di shared/types                       | [type-management.md](references/type-management.md)                       |
| **Form Pattern**                 | Form edit/create dengan unified composable             | [form-pattern.md](references/form-pattern.md)                             |
| **Import Best Practices**        | Menghindari circular dependency dan import tidak perlu | [import-best-practices.md](references/import-best-practices.md)           |
| **Modal & Drawer Accessibility** | Accessibility requirements untuk modal dan drawer      | [modal-drawer-accessibility.md](references/modal-drawer-accessibility.md) |

---

## ✅ Quick Start: Refactoring Steps

### Step 1: Map Types ke Shared/Types

```bash
# Semua interface/type yang digunakan di app dan server
shared/types/
  ├── blog.ts          # Blog related types
  ├── category.ts      # Category types
  ├── user.ts          # User types
  ├── media.ts         # Media types
  ├── common.ts        # Common response types
  └── index.ts         # Barrel export
```

### Step 2: Create Composables untuk Business Logic

```bash
# Composables handle semua logic (fetch, validate, transform)
app/composables/
  ├── useBlogForm.ts       # Form logic: create + edit (smart: detects via props)
  ├── useBlogList.ts       # List logic: fetch, filter, sort, paginate
  ├── useBlogDetail.ts     # Detail logic: fetch single item
  └── useValidation.ts     # Shared validation logic
```

### Step 3: Refactor Components sebagai Presentational

```bash
# Components: hanya render + pass data ke composable
app/components/
  ├── Blog/
  │   ├── BlogForm.vue        # Form (edit/create, smart via props)
  │   ├── BlogList.vue        # List view
  │   └── BlogCard.vue        # Item card
  └── Common/
      └── FormInput.vue       # Reusable input
```

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Component (*.vue)                   │
│  - Minimal logic, focused on rendering                  │
│  - Pass props/events to composable                      │
│  - Handle UI state (modal open/close, focus)            │
└─────────────────┬───────────────────────────────────────┘
                  │ useComposable()
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Composable (useXxx.ts)                      │
│  - Business logic (fetch, validate, transform)          │
│  - State management (ref, reactive)                     │
│  - Methods (create, update, delete, search)             │
│  - Smart action detection (create vs update)            │
└─────────────────┬───────────────────────────────────────┘
                  │ useAPI / useFetch
                  ▼
┌─────────────────────────────────────────────────────────┐
│              API Routes (server/api)                     │
│  - Request validation                                   │
│  - Business logic                                       │
│  - Database operations                                  │
└─────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Shared Types (shared/types)                │
│  - Interfaces shared between server & client            │
│  - Barrel exports for easy import                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Form Component Pattern (Smart Edit/Create)

### Core Concept

Form detect apakah edit atau create berdasarkan props:

```vue
<!-- Penggunaan: Props "blog" menentukan apakah edit/create -->
<BlogForm />
<!-- No props = Create mode -->
<BlogForm :blog="item" />
<!-- With props = Edit mode -->
```

Composable `useBlogForm` secara otomatis menentukan action:

```typescript
// useBlogForm.ts
export function useBlogForm(initialBlog?: BlogData) {
  const isEdit = computed(() => !!initialBlog?.id);
  const isCreate = computed(() => !isEdit.value);

  const submitForm = async (data) => {
    if (isEdit.value) {
      return updateBlog(initialBlog.id, data);
    } else {
      return createBlog(data);
    }
  };
}
```

---

## ⚠️ Common Mistakes

### ❌ DON'T: Import component dari component

```vue
<!-- ❌ JANGAN -->
<script setup lang="ts">
import BlogList from "./BlogList.vue";
import BlogForm from "./BlogForm.vue";
</script>
```

**Alasan:** Terjadi circular dependency, hard to test, tidak reusable

### ✅ DO: Use parent layout atau page untuk compose

```vue
<!-- ✅ LAKUKAN -->
<!-- pages/admin/blog/index.vue -->
<script setup lang="ts">
import BlogList from "@/components/Blog/BlogList.vue";
import BlogForm from "@/components/Blog/BlogForm.vue";
</script>
```

---

### ❌ DON'T: Put form logic di component

```vue
<!-- ❌ JANGAN -->
<script setup lang="ts">
const blog = ref<BlogData | null>(null);

const submitForm = async (data) => {
  // 200 lines of form logic di sini
  // tidak bisa di-reuse
};
</script>
```

### ✅ DO: Move ke composable

```typescript
// ✅ LAKUKAN: composables/useBlogForm.ts
export function useBlogForm(initialBlog?: BlogData) {
  const blog = ref<BlogData | null>(initialBlog || null);
  const submitForm = async (data) => {
    /* ... */
  };
  return { blog, submitForm };
}
```

```vue
<!-- Components/Blog/BlogForm.vue -->
<script setup lang="ts">
const { blog, submitForm } = useBlogForm(props.blog);
</script>
```

---

## 🚀 Next Steps

1. **Read:** [component-structure.md](references/component-structure.md) - Understand component layout
2. **Read:** [type-management.md](references/type-management.md) - Centralize your types
3. **Read:** [composable-patterns.md](references/composable-patterns.md) - Build composables
4. **Read:** [form-pattern.md](references/form-pattern.md) - Implement smart form
5. **Read:** [import-best-practices.md](references/import-best-practices.md) - Avoid import issues

---

## 📚 File Structure After Refactoring

```
app/
├── components/
│   ├── Blog/
│   │   ├── BlogForm.vue          # Smart form (edit/create)
│   │   ├── BlogList.vue          # List presentation
│   │   ├── BlogCard.vue          # Item card
│   │   └── BlogDetail.vue        # Single item view
│   └── Common/
│       ├── FormInput.vue         # Reusable input
│       ├── FormSelect.vue
│       └── FormTextarea.vue
│
├── composables/
│   ├── useBlogForm.ts            # Form logic (create + update)
│   ├── useBlogList.ts            # List logic (fetch + filter)
│   ├── useBlogDetail.ts          # Detail logic
│   ├── useValidation.ts          # Validation helpers
│   └── useCategoryList.ts
│
├── pages/
│   └── admin/
│       └── blog/
│           ├── index.vue         # List page
│           ├── [id].vue          # Detail page
│           └── new.vue           # Create page (OR can use [id] with conditional)
│
└── types/
    └── (moved to shared/types)

shared/
├── types/
│   ├── blog.ts
│   ├── category.ts
│   ├── media.ts
│   ├── user.ts
│   ├── common.ts
│   └── index.ts
│
└── utils/
    ├── file.ts
    └── (other utilities)

server/
├── api/
│   ├── admin/
│   │   └── blog/
│   │       ├── index.get.ts      # List
│   │       ├── index.post.ts     # Create
│   │       └── [id].patch.ts     # Update
│   └── (other routes)
│
├── utils/
│   ├── validation.ts
│   ├── auth.ts
│   └── (other utilities)
│
└── db/
    └── schema.ts
```

---

## 🎓 Learning Resources

- [Vue 3 Composition API Docs](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Nuxt Auto-imports](https://nuxt.com/docs/guide/concepts/auto-imports)
- [Nuxt Composables](https://nuxt.com/docs/guide/directory-structure/composables)
