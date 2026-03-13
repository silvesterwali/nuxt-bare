# Modal & Drawer Accessibility Guide

## Overview

Modals and drawers in Nuxt UI (`UModal`, `UDrawer`) require proper accessibility attributes to ensure compliance with WCAG guidelines and provide a good experience for users with assistive technologies.

## Core Requirements

### 1. **Title (Required)**

Every modal and drawer MUST have a title. This provides context and is read by screen readers.

```vue
<!-- ✅ CORRECT -->
<UModal title="Add User" v-model:open="isOpen">
  <!-- content -->
</UModal>

<!-- ✅ CORRECT with slot -->
<UModal v-model:open="isOpen">
  <template #title>Add User</template>
  <!-- content -->
</UModal>

<!-- ❌ WRONG - Missing title -->
<UModal v-model:open="isOpen">
  <!-- content -->
</UModal>
```

### 2. **Description (Required)**

Every modal and drawer MUST have a description. This provides additional context for screen reader users.

```vue
<!-- ✅ CORRECT with description property -->
<UModal
  title="Delete User"
  description="This action cannot be undone. The user will be permanently removed."
  v-model:open="isOpen"
>
  <!-- content -->
</UModal>

<!-- ✅ CORRECT with description slot -->
<UModal title="Delete User" v-model:open="isOpen">
  <template #description>
    This action cannot be undone. The user will be permanently removed.
  </template>
  <!-- content -->
</UModal>

<!-- ✅ CORRECT - Description in body (implicit) -->
<UModal title="Confirm Action" v-model:open="isOpen">
  <template #body>
    <p>Are you sure you want to delete this user? This action cannot be undone.</p>
  </template>
</UModal>

<!-- ❌ WRONG - Missing description -->
<UModal title="Delete User" v-model:open="isOpen">
  <div class="flex gap-2">
    <button @click="delete">Yes</button>
    <button @click="cancel">No</button>
  </div>
</UModal>
```

## Pattern Examples

### Form Modal (Create/Edit)

```vue
<script setup lang="ts">
const isOpen = ref(false);
</script>

<template>
  <!-- ✅ Clear title and description for create modal -->
  <UModal
    title="Create New User"
    description="Enter the user details below. All fields are required."
    v-model:open="isOpen"
  >
    <template #body>
      <AdminUserForm @submit="handleSubmit" />
    </template>
  </UModal>

  <!-- ✅ Different title/description for edit mode -->
  <UModal
    :title="isEdit ? 'Edit User' : 'Create User'"
    :description="
      isEdit
        ? 'Update the user information below.'
        : 'Enter the new user details below. All fields are required.'
    "
    v-model:open="isOpen"
  >
    <template #body>
      <AdminUserForm :user="selectedUser" @submit="handleSubmit" />
    </template>
  </UModal>
</template>
```

### Confirmation Modal

```vue
<template>
  <!-- ✅ Descriptive title and explanation -->
  <UModal
    title="Delete User"
    description="This user will be permanently removed. This action cannot be undone."
    v-model:open="isConfirmOpen"
  >
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          You are about to delete <strong>{{ user.name }}</strong
          >.
        </p>
        <div class="flex gap-2">
          <UButton color="gray" @click="isConfirmOpen = false">
            Cancel
          </UButton>
          <UButton color="red" @click="confirmDelete"> Delete User </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
```

### Drawer Example

```vue
<template>
  <!-- ✅ Drawer with title and description -->
  <UDrawer
    title="User Filters"
    description="Adjust the filters below to find users"
    v-model:open="isFiltersOpen"
  >
    <template #body>
      <div class="space-y-4">
        <UFormField label="Role">
          <USelect v-model="filter.role" :options="roles" />
        </UFormField>
        <UFormField label="Status">
          <USelect v-model="filter.status" :options="statuses" />
        </UFormField>
      </div>
    </template>
  </UDrawer>
</template>
```

## Accessibility Best Practices

### 1. Semantic HTML

Use semantic elements inside modals/drawers for better structure:

```vue
<!-- ✅ GOOD -->
<UModal title="Update Profile" description="Edit your profile information">
  <template #body>
    <form @submit.prevent="submit">
      <fieldset>
        <legend>Personal Information</legend>
        <UFormField label="First Name" name="firstName">
          <UInput v-model="form.firstName" />
        </UFormField>
      </fieldset>
    </form>
  </template>
</UModal>
```

### 2. Keyboard Navigation

Ensure modals/drawers support keyboard navigation:

```vue
<!-- ✅ Tab through form fields, Escape closes modal, Enter submits -->
<UModal
  title="Login"
  description="Enter your credentials to login"
  v-model:open="isOpen"
>
  <template #body>
    <form @submit.prevent="handleLogin">
      <UInput v-model="email" placeholder="Email" autofocus />
      <UInput v-model="password" type="password" placeholder="Password" />
      <UButton type="submit">Login</UButton>
    </form>
  </template>
</UModal>
```

### 3. Focus Management

- Modal opens: focus moves to first interactive element (usually input or button)
- Modal closes: focus returns to trigger element
- Use `autofocus` on primary input when appropriate

```vue
<script setup lang="ts">
const emailInput = ref<any>(null);

watch(
  () => isOpen.value,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        emailInput.value?.input?.focus();
      });
    }
  },
);
</script>

<template>
  <UModal
    title="Subscribe"
    description="Enter your email to subscribe"
    v-model:open="isOpen"
  >
    <template #body>
      <UFormField label="Email">
        <UInput
          ref="emailInput"
          v-model="email"
          type="email"
          placeholder="your@email.com"
          autofocus
        />
      </UFormField>
    </template>
  </UModal>
</template>
```

## Checklist

Before deploying any modal or drawer:

- [ ] Title is clear and descriptive
- [ ] Description provides context (either via `description` prop or body content)
- [ ] All form fields have associated labels
- [ ] Tab order is logical
- [ ] Escape key closes the modal/drawer
- [ ] Focus is returned to trigger element after close
- [ ] No console warnings about missing accessibility attributes
- [ ] Tested with screen reader (e.g., NVDA, JAWS, VoiceOver)

## Common Issues & Solutions

### Issue: "Missing `Description` or `aria-describedby` warning"

**Solution:** Add description property or description slot:

```vue
<!-- Before (with warning) -->
<UModal title="Delete" v-model:open="isOpen">
  <p>Are you sure?</p>
</UModal>

<!-- After (no warning) -->
<UModal
  title="Delete"
  description="Are you sure? This action cannot be undone."
  v-model:open="isOpen"
>
  <!-- content -->
</UModal>
```

### Issue: Screen reader not reading modal title

**Ensure the `title` prop is used**, not just visual text:

```vue
<!-- ❌ WRONG - Title is visual only -->
<UModal v-model:open="isOpen">
  <template #body>
    <h2 class="text-xl font-bold">Delete Item</h2>
    <!-- content -->
  </template>
</UModal>

<!-- ✅ CORRECT - Title is semantic -->
<UModal title="Delete Item" v-model:open="isOpen">
  <template #body>
    <!-- content -->
  </template>
</UModal>
```

## References

- [NuxtUI UModal Documentation](https://ui.nuxt.com/components/modal)
- [NuxtUI UDrawer Documentation](https://ui.nuxt.com/components/drawer)
- [WCAG 2.1 Dialog Guidelines](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA26)
- [Accessible Modals - A11y Project](https://www.a11yproject.com/posts/modal-dialogs/)
