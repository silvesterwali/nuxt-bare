---
title: Type Management
description: Centralized type/interface management in shared/types for server and client usage
---

# Type Management Guide

## Principle

**All types shared between server and client MUST live in `shared/types/**`\*\*

This ensures:

- Single source of truth
- Server and client stay in sync
- Easy refactoring
- Better IDE autocomplete
- No duplicate type definitions

---

## Directory Structure

```
shared/types/
├── index.ts              # Barrel exports
├── common.ts             # Common/generic types
├── blog.ts               # Blog related types
├── category.ts           # Category types
├── media.ts              # Media types
├── user.ts               # User types
├── auth.ts               # Auth types
└── api.ts                # API response/request types
```

---

## Type Definitions

### 1. Entity Types (Blog.ts)

```typescript
// shared/types/blog.ts

/**
 * Main Blog entity
 */
export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  categoryId: string;
  authorId: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

/**
 * Blog form data (for create/update)
 * - Usually subset of Blog entity
 * - Excludes: id, createdAt, updatedAt, publishedAt
 */
export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags?: string[];
  status?: "draft" | "published";
}

/**
 * Blog list item (for display in lists)
 * - Subset for performance
 */
export interface BlogListItem {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  authorId: string;
  status: Blog["status"];
  createdAt: Date;
  publishedAt: Date | null;
}

/**
 * Blog detail (with relations)
 */
export interface BlogDetail extends Blog {
  category: Category;
  author: User;
  comments?: Comment[];
}

/**
 * Query parameters for blog list
 */
export interface BlogListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: Blog["status"];
  categoryId?: string;
  tags?: string[];
  sort?: string;
}

/**
 * Create blog request payload
 */
export type CreateBlogPayload = Omit<BlogFormData, "id">;

/**
 * Update blog request payload
 */
export type UpdateBlogPayload = Partial<BlogFormData>;
```

### 2. Common Response Types (Common.ts)

```typescript
// shared/types/common.ts

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Single item response
 */
export interface SingleResponse<T> {
  data: T;
  message?: string;
}

/**
 * List response (non-paginated)
 */
export interface ListResponse<T> {
  data: T[];
  message?: string;
}

/**
 * Error response
 */
export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Success response (generic)
 */
export interface SuccessResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
}

/**
 * API Query params (common across all lists)
 */
export interface BaseQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}
```

### 3. Related Types

```typescript
// shared/types/category.ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  icon?: string;
}

// shared/types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
}

// shared/types/media.ts
export interface Media {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedBy: string;
  createdAt: Date;
}

// shared/types/auth.ts
export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}
```

### 4. Barrel Export (index.ts)

```typescript
// shared/types/index.ts

// Entity types
export type {
  Blog,
  BlogDetail,
  BlogListItem,
  BlogFormData,
  BlogListQuery,
  CreateBlogPayload,
  UpdateBlogPayload,
} from "./blog";

export type { Category, CategoryFormData } from "./category";

export type { User, UserProfile } from "./user";

export type { Media } from "./media";

export type { AuthToken, LoginPayload, RegisterPayload } from "./auth";

// Response types
export type {
  PaginatedResponse,
  SingleResponse,
  ListResponse,
  ErrorResponse,
  SuccessResponse,
  BaseQuery,
} from "./common";
```

---

## Usage in Server

### Route Handler

```typescript
// server/api/blogs/index.get.ts
import type {
  BlogListQuery,
  PaginatedResponse,
  BlogListItem,
} from "@/shared/types";

export default defineEventHandler(
  async (event): Promise<PaginatedResponse<BlogListItem>> => {
    const query = getQuery(event) as BlogListQuery;

    // Fetch dari database
    const [items, total] = await Promise.all([
      queryBlogs(query),
      countBlogs(query),
    ]);

    return {
      data: items,
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  },
);
```

### Server Utils (validation)

```typescript
// server/utils/validation.ts
import type { BlogFormData } from "@/shared/types";

export function validateBlogData(data: BlogFormData): {
  valid: boolean;
  errors?: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.title?.trim()) {
    errors.title = "Title is required";
  }
  if (!data.content?.trim()) {
    errors.content = "Content is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}
```

---

## Usage in Client/App

### Composable

```typescript
// app/composables/useBlogList.ts
import type { Blog, BlogListQuery, PaginatedResponse } from "@/shared/types";

export function useBlogList() {
  const blogs = ref<Blog[]>([]);
  const query = reactive<BlogListQuery>({
    page: 1,
    limit: 10,
  });

  const fetchBlogs = async () => {
    const response = await $fetch<PaginatedResponse<Blog>>("/api/blogs", {
      query,
    });
    blogs.value = response.data;
  };

  return { blogs, fetchBlogs };
}
```

### Component

```vue
<!-- app/components/Blog/BlogForm.vue -->
<script setup lang="ts">
import type { BlogFormData } from "@/shared/types";

const formData = reactive<BlogFormData>({
  title: "",
  excerpt: "",
  content: "",
  categoryId: "",
  status: "draft",
});
</script>
```

---

## Type Structure Diagram

```
┌─────────────────────────────────────┐
│      shared/types/blog.ts           │
│                                     │
│  Blog (full entity)                 │
│  ├── BlogDetail (with relations)    │
│  ├── BlogListItem (for lists)       │
│  ├── BlogFormData (for forms)       │
│  ├── BlogListQuery (for queries)    │
│  └── CreateBlogPayload              │
└─────────────────────────────────────┘
           ↑
    used by both
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐    ┌───▼───┐
│Server │    │Client │
│       │    │       │
│api/   │    │app/   │
│utils/ │    │comps/ │
└───────┘    └───────┘
```

---

## Best Practices

### ✅ DO: Domain-based organization

```
shared/types/
├── blog.ts
├── category.ts
├── user.ts
└── index.ts
```

### ❌ DON'T: Flat structure or mixed concepts

```
shared/types/
├── entities.ts        # ❌ Too generic
├── responses.ts       # ❌ Hard to find
└── models.ts          # ❌ Unclear purpose
```

---

### ✅ DO: Use specific types in component

```typescript
// ✅ GOOD: Specific type
const blog = ref<Blog | null>(null)
const formData = reactive<BlogFormData>({...})
```

### ❌ DON'T: Use generic types

```typescript
// ❌ BAD: Any type
const blog = ref<any>(null)
const formData = reactive<Record<string, any>>({...})
```

---

### ✅ DO: Export types, not interfaces

```typescript
// ✅ GOOD
export type Blog = {
  id: string;
  title: string;
};

export type BlogFormData = Omit<Blog, "id">;
```

### ❌ DON'T: Deep nesting or circular references

```typescript
// ❌ BAD: Circular
export interface Blog {
  comments: Comment[];
}

export interface Comment {
  blog: Blog; // ❌ Circular!
}
```

**Solution:** Use IDs instead

```typescript
// ✅ GOOD
export interface Blog {
  id: string;
  commentIds: string[];
}

export interface Comment {
  id: string;
  blogId: string; // Just ID, no circular ref
}
```

---

### ✅ DO: Version types if API changes

```typescript
// shared/types/blog.ts

export interface BlogV1 {
  id: string;
  title: string;
}

export interface BlogV2 {
  id: string;
  title: string;
  excerpt: string; // Added in v2
}

// Alias untuk current version
export type Blog = BlogV2;
```

---

## Migration Checklist

When refactoring existing code to use shared types:

- [ ] Extract all types to `shared/types/`
- [ ] Update server routes to import types
- [ ] Update client composables to import types
- [ ] Update components to import types
- [ ] Remove duplicate type definitions in app/types
- [ ] Update all `$fetch` calls with proper return types
- [ ] Verify server/client types match
- [ ] Run type checking: `nuxi typecheck`
- [ ] Test application features end-to-end
