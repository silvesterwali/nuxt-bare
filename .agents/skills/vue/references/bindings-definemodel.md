# Two-Way Binding with `defineModel` (Vue 3.4+)

## Overview

The `defineModel` macro simplifies two-way data binding in Vue 3.4+, replacing the need to manually manage props and emits for v-model synchronization.

## Basic Usage

### Single v-model Binding

```vue
<script setup lang="ts">
const modelValue = defineModel<number | null>();
</script>

<template>
  <input v-model="modelValue" />
</template>
```

**Usage:**

```vue
<MediaPicker v-model="selectedImageId" />
```

### Multiple v-model Bindings

```vue
<script setup lang="ts">
const isOpen = defineModel<boolean>("isOpen");
const title = defineModel<string>("title");
</script>

<template>
  <div v-if="isOpen">
    <h1>{{ title }}</h1>
    <button @click="isOpen = false">Close</button>
  </div>
</template>
```

**Usage:**

```vue
<Dialog v-model:is-open="dialogOpen" v-model:title="dialogTitle" />
```

## Comparison: Old vs New

### ❌ Old Pattern (Pre-Vue 3.4)

```vue
<script setup lang="ts">
interface Props {
  modelValue?: number | null;
  disabled?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: number | null): void;
}>();

function updateValue(newValue: number | null) {
  emit("update:modelValue", newValue);
}
</script>

<template>
  <button @click="updateValue(123)">Select</button>
</template>
```

### ✅ New Pattern (Vue 3.4+)

```vue
<script setup lang="ts">
const modelValue = defineModel<number | null>();

const props = defineProps<{
  disabled?: boolean;
}>();

function updateValue(newValue: number | null) {
  modelValue.value = newValue;
}
</script>

<template>
  <button @click="updateValue(123)">Select</button>
</template>
```

**Benefits:**

- Shorter, cleaner code
- No need to manually manage props/emits for bindings
- Type-safe out of the box
- More intuitive for team members familiar with v-model

## Advanced: Optional vs Required

### Optional Binding (Default)

```vue
<script setup lang="ts">
const modelValue = defineModel<string | null>(); // Optional, can be undefined
</script>
```

### Required Binding

```vue
<script setup lang="ts">
const modelValue = defineModel<string>({
  required: true,
});
</script>
```

## Watched Changes

Watching `defineModel` values works the same as any reactive ref:

```vue
<script setup lang="ts">
import { watch } from "vue";

const modelValue = defineModel<number | null>();

watch(modelValue, (newVal) => {
  console.log("Value changed to:", newVal);
});
</script>
```

## Real-World Example: MediaPicker

```vue
<script setup lang="ts">
import { computed, ref, watch } from "vue";

const modelValue = defineModel<number | null>();

const props = defineProps<{
  disabled?: boolean;
  label?: string;
}>();

const selectedId = ref<number | null>(modelValue.value ?? null);
const selectedMedia = ref<any>(null);

// Watch for external changes to modelValue
watch(modelValue, (val) => {
  selectedId.value = val ?? null;
});

function selectMedia(item: any) {
  modelValue.value = item.id; // Direct assignment instead of emit
  selectedMedia.value = item;
}

function clearSelection() {
  modelValue.value = null;
}
</script>

<template>
  <div class="space-y-3">
    <img v-if="selectedMedia" :src="selectedMedia.thumbnail" alt="" />
    <button @click="selectMedia(item)">Select</button>
    <button @click="clearSelection">Clear</button>
  </div>
</template>
```

## When to Migrate

Prioritize refactoring components in this order:

1. **Shared/Reusable Components** (MediaPicker, FormFields, etc.)
   - Used across multiple pages/features
   - Good examples for the team
   - High impact on code clarity

2. **High-Traffic Components** (Blog Forms, Admin Panels)
   - Frequently modified
   - Good to standardize early

3. **New Components**
   - Always use `defineModel` from the start
   - No need to carry forward old patterns

## Checklist for Refactoring

- [ ] Replace `defineProps<{ modelValue }>` with `const modelValue = defineModel<T>()`
- [ ] Remove corresponding `defineEmits`
- [ ] Replace `emit("update:modelValue", val)` with `modelValue.value = val`
- [ ] Update any watchers to watch `modelValue` directly instead of `() => props.modelValue`
- [ ] Test two-way binding still works (v-model)
- [ ] Run typecheck to verify types are correct
- [ ] Update tests if applicable

---

**References:**

- [Vue 3.4 Release Notes](https://blog.vuejs.org/posts/vue-3-4)
- [Vue defineModel Documentation](https://vuejs.org/guide/components/v-model.html#basic-usage)
