# Admin Components Audit Report

## Refactor-Composable-Pattern Compliance Assessment

**Date:** March 13, 2026  
**Scope:** `/app/components/Admin/` (5 modules)  
**Pattern Reference:** [refactor-composable-pattern SKILL.md]

---

## Executive Summary

| Status                     | Count | Modules         |
| -------------------------- | ----- | --------------- |
| ✅ **COMPLIANT**           | 2     | Category, Tag   |
| ⚠️ **PARTIALLY COMPLIANT** | 2     | Blog, User      |
| ❌ **NON-COMPLIANT**       | 1     | Media           |
| **Overall Maturity**       |       | ~50% compliance |

---

## Detailed Module Analysis

### 1. 📑 BLOG Module

**Files:** `Form.vue`, `List.vue`

#### File Structure

```
Blog/
├── Form.vue         (Multi-purpose: create/edit form)
└── List.vue         (List view with table)
```

#### Component Analysis

**Blog/Form.vue**

- **Responsibility:** Form input for creating/editing blog posts
- **Props:** `post` (optional BlogFormData), `isLoading`
- **Emits:** `submit` event with BlogFormData
- **Current State:** ❌ ANTI-PATTERN DETECTED

**Issues Found:**

1. ❌ **Missing Form Logic Extraction** - Form logic is in component, should be in composable
   - Form state management: `form`, `selectedCategoryIds`, `selectedTagIds`
   - Watch logic for prop changes
   - Options computation
   - Should be in `useBlogForm(initialPost?)` composable

2. ❌ **Unnecessary Imports** - Importing `ref`, `watch`, `computed` explicitly
   - Should use Nuxt auto-imports
   - Only necessary import: `@nuxt/ui` type
   - Component import (MediaPicker) is correct

3. ❌ **Missing Smart Create/Edit Detection**
   - No `isEdit`/`isCreate` computed properties
   - Component doesn't auto-detect mode based on props
   - Creates bloated prop interface

4. ✅ **Type Safety** - Types from `@/types/blog` (correct)

5. ⚠️ **Error Handling** - No error handling visible in Form.vue
   - Parent component must handle errors
   - Should be in composable with try/catch

**Blog/List.vue**

- **Responsibility:** Display blog posts in table format
- **Composables Used:** `useBlogListState()`, `usePostsQuery()`, `usePostDeleteMutation()`
- **Current State:** ✅ MOSTLY COMPLIANT

**Strengths:**

- Clean separation: List state + Query hook + Delete mutation
- No explicit imports for composables (auto-imported)
- Proper delete confirmation
- Uses table rendering pattern correctly

**Minor Issues:**

1. ⚠️ **Confirm Dialog** - Using native `confirm()` instead of custom modal
   - Works but not consistent with Category/Tag pattern
   - Category/Tag use DeleteConfirmModal component

#### Compliance Score: ⚠️ **60% COMPLIANT**

- List.vue: 85% ✅
- Form.vue: 35% ❌

---

### 2. ✅ CATEGORY Module

**Files:** `Form.vue`, `List.vue`

#### File Structure

```
Category/
├── Form.vue        (Modal form: create/edit)
└── List.vue        (List with inline form modal)
```

#### Component Analysis

**Category/Form.vue**

- **Responsibility:** Modal form for category create/edit
- **Props:** `categoryId`, `category` (data for edit mode)
- **Model:** `v-model:open` for modal state
- **Composables Used:** `useCategoryCreateMutation()`, `useCategoryUpdateMutation()`
- **Current State:** ✅ **FULLY COMPLIANT**

**Strengths:**

1. ✅ **Smart Create/Edit Detection**

   ```typescript
   const modalTitle = computed(() =>
     props.categoryId ? "Edit Category" : "New Category",
   );
   ```

2. ✅ **Proper Error Handling**
   - Server validation errors parsed to `ZodIssue[]`
   - Field-level error mapping
   - Errors only cleared on new submission

3. ✅ **Async Mutation Handling**
   - Uses `mutateAsync` to await completion
   - Modal closes only on success

4. ✅ **Conditional Logic**
   - `if (props.categoryId) updateCategory() else createCategory()`
   - Follows unified form pattern

5. ✅ **Type Safety**
   - Zod schema for validation
   - TypeScript types throughout

6. ✅ **State Management**
   - Clean reactive state with `reactive()`
   - Loading state computed from mutation status

**Category/List.vue**

- **Responsibility:** Display categories with modal-based CRUD
- **Composables Used:** `useCategoriesQuery()`, `useCategoryDeleteMutation()`
- **Modal Management:** Local ref states for modal open/close
- **Current State:** ✅ **FULLY COMPLIANT**

**Strengths:**

1. ✅ **Separation of Concerns**
   - List management in component
   - CRUD mutations in composables
   - Form logic in Form.vue

2. ✅ **Pagination**
   - Client-side pagination implemented correctly
   - Uses computed for filtered data

3. ✅ **Delete Confirmation Pattern**
   - Dedicated modal for delete confirmation
   - Clear user experience

#### Compliance Score: ✅ **100% COMPLIANT**

---

### 3. ✅ TAG Module

**Files:** `Form.vue`, `List.vue`

#### File Structure

```
Tag/
├── Form.vue        (Modal form: create/edit)
└── List.vue        (List with inline form modal)
```

#### Component Analysis

**Tag/Form.vue**

- **Responsibility:** Modal form for tag create/edit
- **Pattern:** Identical to Category/Form.vue
- **Current State:** ✅ **FULLY COMPLIANT**

**Key Characteristics:**

- ✅ Smart create/edit detection
- ✅ Async mutation with proper awaiting
- ✅ Server error parsing and display
- ✅ Modal close-on-success pattern
- ✅ Zod validation schema
- ✅ No explicit Vue API imports (auto-imported)

**Tag/List.vue**

- **Responsibility:** Display tags with modal-based CRUD
- **Current State:** ✅ **FULLY COMPLIANT**

**Identical to Category/List.vue patterns:**

- ✅ Query and mutation composables
- ✅ Client-side pagination
- ✅ Delete confirmation modal
- ✅ Modal state management

#### Compliance Score: ✅ **100% COMPLIANT**

---

### 4. ⚠️ USER Module

**Files:** `Create.vue`, `Edit.vue`, `List.vue`

#### File Structure

```
User/
├── Create.vue       (Create page: form only)
├── Edit.vue         (Edit page: form only)
└── List.vue         (List view with table)
```

#### Component Analysis

**User/Create.vue**

- **Responsibility:** User creation form
- **Composables Used:** `useUserCreateMutation()`, `useValidateHelper()`
- **Current State:** ⚠️ **PARTIALLY COMPLIANT**

**Issues Found:**

1. ⚠️ **Separated Create Component**
   - Pattern: Separate Create.vue instead of unified form
   - Violates "unified form" principle
   - Creates duplicate code with Edit.vue
   - Could be `UserForm.vue` with `mode="create"` prop

2. ⚠️ **Manual Error Transformation**

   ```typescript
   const errors = transformToIssue(err);
   if (errors.length) form.value?.setErrors(errors);
   ```

   - Works but not centralized in composable
   - Repeated in Edit.vue

3. ✅ **Composable-based Mutation** - Good use of `useUserCreateMutation()`

4. ✅ **Type Safety** - Zod schema used correctly

**User/Edit.vue**

- **Responsibility:** User editing form
- **Composables Used:** `useUserQuery()`, `useUserUpdateMutation()`, `useValidateHelper()`
- **Current State:** ⚠️ **PARTIALLY COMPLIANT**

**Issues Found:**

1. ⚠️ **Code Duplication with Create.vue**
   - Same Zod schema (with password optional)
   - Same error handling pattern
   - Same form structure
   - Could share single component

2. ✅ **Query Hook Usage** - Proper async data loading

3. ⚠️ **Form Population Logic**

   ```typescript
   watchEffect(() => {
     const u = userResp.value?.data;
     if (u) {
       state.email = u.email; /* ... */
     }
   });
   ```

   - Works but should be in composable

4. ✅ **State Shape** - Properly matches schema

**User/List.vue**

- **Responsibility:** Display users in table
- **Composables Used:** `useUserListState()`, `useUsersQuery()`, `useUserDeleteMutation()`
- **Current State:** ✅ **COMPLIANT**

**Strengths:**

- Clean list state management
- Proper delete handling
- Table rendering correct

#### Compliance Score: ⚠️ **65% COMPLIANT**

- List.vue: 90% ✅
- Create.vue: 60% ⚠️
- Edit.vue: 45% ⚠️

---

### 5. ❌ MEDIA Module

**Files:** `DeleteConfirmModal.vue`, `FilterBar.vue`, `List.vue`, `Table.vue`, `UploadModal.vue`

#### File Structure

```
Media/
├── DeleteConfirmModal.vue  (Reusable delete confirmation)
├── FilterBar.vue           (Filter controls)
├── List.vue                (Main list orchestrator)
├── Table.vue               (Table display component)
└── UploadModal.vue         (File upload modal)
```

#### Component Analysis

**Media/List.vue**

- **Responsibility:** Orchestrate media library view
- **Composables Used:** `useMediaListState()`, `useMediaManagementQuery()`, `useMediaDeleteMutation()`
- **Current State:** ❌ **NON-COMPLIANT**

**Critical Issues:**

1. ❌ **Scattered Modal Management**
   - `uploadOpen`, `deleteConfirmOpen`, `deleteId` managed in List.vue
   - Should be extracted to composable
   - Modal state explosion as module grows

2. ❌ **Mixed Responsibilities**
   - List orchestration
   - Modal state management
   - Event handlers for child modals
   - Should separate concerns better

3. ⚠️ **Child Component Imports**
   - Explicit import: `FilterBar`, `UploadModal`, `DeleteConfirmModal`
   - Should use auto-imports (components already in Admin/Media/)

   ```typescript
   // ❌ Currently:
   import FilterBar from "~/components/Admin/Media/FilterBar.vue"

   // ✅ Should be (auto-imported):
   <AdminMediaFilterBar />
   ```

**Media/Table.vue**

- **Responsibility:** Render media table
- **Props:** `media`, `loading`, `selectMode`
- **Emits:** `view`, `delete`, `select`
- **Current State:** ⚠️ **PARTIALLY COMPLIANT**

**Issues:**

1. ⚠️ **Presentation vs Logic**
   - Contains utility function `formatBytes()` - acceptable
   - Clean emit pattern - good
   - Props properly typed

2. ⚠️ **No Explicit Imports of Vue APIs**
   - Relying on auto-imports (correct)
   - But uses `h()` for rendering without explicit import

**Media/UploadModal.vue**

- **Responsibility:** File upload UI
- **Composables Used:** `useMediaUploadMutation()`, `useValidateHelper()`
- **Current State:** ⚠️ **PARTIALLY COMPLIANT**

**Issues:**

1. ⚠️ **Validation Logic in Component**

   ```typescript
   const maxSize = mediaType === "image" ? 2 * 1024 * 1024 : 50 * 1024 * 1024;
   if (file.value.size > maxSize) {
     /* error */
   }
   ```

   - Client-side validation rules hardcoded
   - Should be in composable or config

2. ✅ **Error Handling** - Uses `transformToIssue()` correctly

3. ⚠️ **File Type Detection Logic**

   ```typescript
   const mediaType = fileType.startsWith("image/") ? "image" : "document";
   ```

   - Should be utility function or composable

**Media/FilterBar.vue**

- **Responsibility:** Filter controls
- **Current State:** ✅ **COMPLIANT**
- Uses `v-model` properly with `defineModel`

**Media/DeleteConfirmModal.vue**

- **Responsibility:** Confirmation dialog
- **Current State:** ✅ **COMPLIANT**
- Clean, reusable modal pattern

#### Compliance Score: ❌ **35% COMPLIANT**

**Critical Refactoring Needed:**

- Extract modal state to composable
- Remove component imports (use auto-imports)
- Move validation rules to config/composable
- Centralize file type detection logic

---

## 📊 Assessment Summary Table

| Module       | Files | Structure Match | Composables  | Type Mgmt | Error Handling | Status  |
| ------------ | ----- | --------------- | ------------ | --------- | -------------- | ------- |
| **Blog**     | 2     | 60%             | Partial      | ✅ Good   | ❌ Missing     | ⚠️ 60%  |
| **Category** | 2     | ✅ 100%         | ✅ Excellent | ✅ Good   | ✅ Excellent   | ✅ 100% |
| **Tag**      | 2     | ✅ 100%         | ✅ Excellent | ✅ Good   | ✅ Excellent   | ✅ 100% |
| **User**     | 3     | ⚠️ 65%          | ✅ Good      | ✅ Good   | ⚠️ Duplicated  | ⚠️ 65%  |
| **Media**    | 5     | 35%             | ⚠️ Partial   | ✅ Good   | ⚠️ Scattered   | ❌ 35%  |

---

## 🔍 Compliance Findings

### ✅ Modules Already Compliant (100%)

#### **Category Module**

- ✅ Smart create/edit detection in single Form.vue
- ✅ Proper async mutation handling with `mutateAsync`
- ✅ Server error parsing with Zod issue mapping
- ✅ Modal closeable only on success
- ✅ No unnecessary imports
- ✅ Clean composable usage

#### **Tag Module**

- ✅ Identical compliance pattern to Category
- ✅ All best practices followed
- ✅ Following the refactor-composable-pattern guidelines perfectly

---

### ⚠️ Modules Needing Refactoring (60-65%)

#### **Blog Module**

- ❌ Form.vue violates "logic in composable" principle
- ❌ Form state and watchers should be in `useBlogForm()` composable
- ❌ Missing isEdit/isCreate computed detection
- ⚠️ No centralized error handling
- ⚠️ Uses native `confirm()` instead of modal

**Refactoring Priority:** HIGH

**Estimated Effort:** 2-3 hours

- Extract form logic to composable: 1-2 hours
- Add error handling: 30min
- Replace confirm() with modal: 30min

#### **User Module**

- ❌ Create.vue and Edit.vue are duplicates
- ⚠️ Should be one UserForm.vue with mode detection
- ⚠️ Error handling duplicated across components
- ⚠️ Form population logic should be in composable

**Refactoring Priority:** HIGH

**Estimated Effort:** 3-4 hours

- Merge Create/Edit to UserForm.vue: 1.5-2 hours
- Extract form logic to useUserForm() composable: 1-1.5 hours
- Centralize error handling: 30min
- Add compose/mode detection: 30min

---

### ❌ Module Needing Major Refactoring (35%)

#### **Media Module**

- ❌ Modal state scattered across List.vue (3 separate refs)
- ❌ Explicit component imports instead of auto-imports
- ❌ Validation rules hardcoded in UploadModal
- ❌ File type detection logic not centralized
- ⚠️ Missing composable for modal orchestration

**Refactoring Priority:** CRITICAL

**Estimated Effort:** 4-5 hours

- Create useMediaModal() composable for modal state: 1-1.5 hours
- Remove component imports, use auto-imports: 30min
- Extract validation config to composable/config: 1 hour
- Extract file type utilities: 30min
- Cleanup and testing: 1-1.5 hours

---

## 🎯 Common Patterns & Issues

### Positive Patterns Found ✅

1. **Modal-Based CRUD (Category, Tag)**
   - Clean modal orchestration
   - Proper v-model binding
   - Form logic in component, mutations in composables
   - ✅ **This is the correct pattern**

2. **List State Management**
   - All modules use `useXxxListState()` composables
   - URL sync with query parameters
   - Debounced search implemented
   - ✅ **Consistent and good pattern**

3. **Query/Mutation Separation**
   - Data fetching via `useXxxQuery()`
   - Mutations separated: `useXxxCreateMutation()`, `useXxxUpdateMutation()`, `useXxxDeleteMutation()`
   - Cache invalidation on success
   - ✅ **Follows pinia-colada pattern well**

4. **Error Handling (Category, Tag)**
   - Server errors parsed to Zod issues
   - Field-level error display
   - Clear user feedback
   - ✅ **Good error UX**

---

### Issues & Anti-Patterns Found ❌

#### 1. **Blog Form Logic Not Extracted** ❌

```typescript
// ❌ CURRENT: Logic in Form.vue
const form = ref<BlogFormData>({...})
const selectedCategoryIds = ref<number[]>([])
watch(() => props.post, (newPost) => { /* populate */ })

// ✅ SHOULD BE: Logic in composable
const { form, selectedCategoryIds, selectedTagIds, onSubmit } = useBlogForm(props.post)
```

#### 2. **User Create/Edit Duplication** ❌

```typescript
// ❌ CURRENT: Two separate components
User/Create.vue - handles user creation
User/Edit.vue - handles user editing (90% duplicate code)

// ✅ SHOULD BE: One component with mode detection
User/Form.vue - handles both (mode determined by props)
useUserForm(initialUser?) - composable for both modes
```

#### 3. **Media Modal State Explosion** ❌

```typescript
// ❌ CURRENT: Multiple modal refs in List.vue
const uploadOpen = ref(false);
const deleteConfirmOpen = ref(false);
const deleteId = ref<number | null>(null);
// ... functions to manage each modal

// ✅ SHOULD BE: Orchestrated in composable
const {
  uploadOpen,
  deleteConfirmOpen,
  deleteId,
  openUploadModal,
  openDeleteModal,
} = useMediaModal();
```

#### 4. **Explicit Component Imports** ❌

```typescript
// ❌ CURRENT in Media/List.vue:
import FilterBar from "~/components/Admin/Media/FilterBar.vue"
import UploadModal from "~/components/Admin/Media/UploadModal.vue"

// ✅ SHOULD BE: Auto-imported
<AdminMediaFilterBar />  <!-- Auto-imported -->
<AdminMediaUploadModal /> <!-- Auto-imported -->
```

#### 5. **Hardcoded Validation Rules** ❌

```typescript
// ❌ CURRENT in UploadModal.vue:
const maxSize = mediaType === "image" ? 2 * 1024 * 1024 : 50 * 1024 * 1024;

// ✅ SHOULD BE: In composable or config
import { MEDIA_UPLOAD_CONFIG } from "@/composables/useMediaUpload";
const maxSize = MEDIA_UPLOAD_CONFIG[mediaType].maxSize;
```

#### 6. **Native confirm() Instead of Modal** ❌

```typescript
// ❌ CURRENT in Blog/List.vue:
function handleDeletePost(id: number) {
  if (!confirm("Are you sure?")) return
  deletePost(id)
}

// ✅ SHOULD BE: Use modal like Category/Tag
<AdminBlogDeleteConfirmModal />
```

---

## 📋 Refactoring Checklist

### Immediate Actions (Quick Wins)

- [ ] **Blog Module** - Create `useBlogForm()` composable
  - Extract form state: `form`, `selectedCategoryIds`, `selectedTagIds`
  - Extract watch logic for prop population
  - Extract options computation
  - Add `isEdit` and `isCreate` computed

- [ ] **User Module** - Merge Create/Edit components
  - Create `UserForm.vue` (replacing Create/Edit)
  - Add `mode` prop for "create" | "edit"
  - Create `useUserForm(initialUser?, mode?)` composable
  - Centralize error handling in composable

- [ ] **Media Module** - Extract modal orchestration
  - Create `useMediaModal()` composable
  - Move state management: `uploadOpen`, `deleteConfirmOpen`, `deleteId`
  - Remove component imports, use auto-imports

### Medium Priority (Design Improvements)

- [ ] **Blog Module** - Replace native confirm() with modal
  - Create `BlogDeleteConfirmModal.vue`
  - Add proper modal orchestration

- [ ] **Media Module** - Centralize validation rules
  - Create `composables/useMediaUploadConfig.ts`
  - Export `MEDIA_TYPE_CONFIG` with size limits
  - Extract file type detection utility

- [ ] **All Modules** - Ensure consistent error handling
  - Use Zod issue parsing everywhere
  - Centralize field error mapping logic

### Best Practices (Nice to Have)

- [ ] Add loading skeleton components for data fetching
- [ ] Implement optimistic UI updates in mutations
- [ ] Add form dirty state tracking (Blog, User forms)
- [ ] Implement undo/reset functionality for forms
- [ ] Add analytics tracking for form submissions

---

## 🚀 Implementation Priority

### Phase 1: Critical (Week 1)

1. **Category + Tag** ✅ Already compliant - just document as reference
2. **User Module** - Merge Create/Edit (HIGH impact, affects 3 files)
3. **Blog Module** - Extract form composable (affects Form.vue)

### Phase 2: Important (Week 2)

4. **Media Module** - Refactor modal orchestration
5. **All Modules** - Standardize error handling patterns

### Phase 3: Nice to Have (Future)

6. Enhanced UX with loading states, optimistic updates
7. Form dirty state tracking
8. Advanced validation patterns

---

## 📚 Reference Patterns

### ✅ Category/Tag Form Pattern (Reference Model)

```typescript
// Form.vue - Clean and correct
const open = defineModel<boolean>("open", { default: false });
const props = defineProps<{
  categoryId: null | number;
  category: BlogCategory | null;
}>();
const { mutateAsync: updateCategory } = useCategoryUpdateMutation();
const { mutateAsync: createCategory } = useCategoryCreateMutation();

const modalTitle = computed(() =>
  props.categoryId ? "Edit Category" : "New Category",
);

// Intelligently selects create vs update
if (props.categoryId) {
  await updateCategory({ id: props.categoryId, data });
} else {
  await createCategory(data);
}
```

### ✅ List State Pattern (Reference Model)

```typescript
// List.vue - Clean separation
const { page, search, params } = useXxxListState(); // State + URL sync
const { data: items } = useXxxQuery(params); // Query hook
const { mutate: deleteItem } = useXxxDeleteMutation(); // Mutation
```

### ✅ Mutation Error Handling (Reference Model)

```typescript
try {
  await mutateAsync(payload);
  // Success handled in mutation's onSuccess callback
} catch (err: any) {
  const issues = transformToIssue(err); // Parse to ZodIssue[]
  form.value?.setErrors(issues); // Set form-level errors
}
```

---

## 📞 Support & Questions

For detailed implementation guidance:

- Review [refactor-composable-pattern SKILL.md] for full guidelines
- Check Category/Tag Form.vue as reference implementation
- Reference [form-pattern.md] for unified form pattern details
- Reference [component-structure.md] for auto-import guidelines
