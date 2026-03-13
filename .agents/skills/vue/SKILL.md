---
name: vue
description: Vue 3 component patterns, composition API, reactive data binding, two-way binding with defineModel, and best practices.
metadata:
  author: Vue.js Core Team + Project Guidelines
  version: "3.4+"
  source: https://vuejs.org, project-specific conventions
---

# Vue 3 Component Patterns

Comprehensive guide for building Vue 3 components with the Composition API, focusing on reactive patterns, two-way binding, and modern best practices.

## Core Patterns

| Topic                  | Description                                   | Reference                                                        |
| ---------------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| Two-Way Binding        | Modern defineModel API, v-model binding       | [bindings-definemodel](references/bindings-definemodel.md)       |
| Props & Emits (Legacy) | defineProps, defineEmits, old v-model pattern | [bindings-legacy-pattern](references/bindings-legacy-pattern.md) |
| Reactive State         | ref, reactive, computed, watchers             | [state-management](references/state-management.md)               |
| Lifecycle Hooks        | onMounted, onUpdated, onUnmounted             | [lifecycle-hooks](references/lifecycle-hooks.md)                 |

## Best Practices

| Topic                 | Description                        | Reference                                                              |
| --------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| Component Composition | Splitting logic, code organization | [best-practices-composition](references/best-practices-composition.md) |

---

## Quick Reference

### ✅ Use `defineModel` (Vue 3.4+)

For cleaner two-way data binding:

```vue
<script setup lang="ts">
// Single value binding
const modelValue = defineModel<number | null>();

// Multiple v-model bindings
const isOpen = defineModel<boolean>("isOpen");
const title = defineModel<string>("title");
</script>

<template>
  <div>
    <button @click="modelValue = modelValue ? null : 1">
      Toggle: {{ modelValue }}
    </button>
  </div>
</template>
```

### ❌ Avoid: Old Pattern (Pre-Vue 3.4)

```vue
<script setup lang="ts">
const props = defineProps<{ modelValue: number | null }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: number | null): void;
}>();

// Then emit updates:
emit("update:modelValue", newValue);
</script>
```

---

## When to Update Components

Refactor components using the old pattern when:

- Adding new two-way binding features
- Refactoring for code clarity
- Training new team members on current patterns
- Working in components shared across the codebase

Start with refactoring:

1. High-reuse components (MediaPicker, FormFields, etc.)
2. Components with multiple v-model bindings
3. Components that will be documented as examples

---
