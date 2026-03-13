# Legacy v-model Pattern (Pre-Vue 3.4)

## Overview

Before Vue 3.4, two-way binding required manually managing `defineProps` and `defineEmits` separately. This is now **obsolete** but documented here for reference when maintaining older code.

## Pattern Structure

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
  <button @click="updateValue(123)">Update</button>
</template>
```

## Why This Pattern Is No Longer Recommended

1. **Verbose** - Requires 3 separate declarations (interface, props, emits)
2. **Error-prone** - Easy to mismatch prop name, event name, and usage
3. **Harder to track** - Watchers need to access `() => props.modelValue`
4. **Harder to read** - Unclear that this is a two-way binding without looking at parent usage

## Gradual Migration Strategy

Since this pattern exists throughout the codebase:

### Phase 1: New Components (Immediate)

- All new components use `defineModel`
- Document this as the project standard

### Phase 2: Shared Components (High Priority)

```
app/components/Common/
├── MediaPicker.vue          ✅ Done
├── ContentEditor.vue        ✅ Done
└── FormField.vue            🔄 Priority
```

### Phase 3: Feature Components (Medium Priority)

```
app/components/Admin/
├── Blog/FeaturedImageSelector.vue   ✅ Done
└── */Form*.vue                      🔄 Soon
```

### Phase 4: Maintenance (As-Needed)

- Other components updated when being actively worked on
- No need to refactor dormant code

## Example Refactoring

### Before

```vue
<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

function handleInput(text: string) {
  emit("update:modelValue", text);
}

watch(
  () => props.modelValue,
  (newVal) => {
    console.log("Changed:", newVal);
  },
);
</script>

<template>
  <input :value="modelValue" @input="handleInput($event.target.value)" />
</template>
```

### After

```vue
<script setup lang="ts">
import { watch } from "vue";

const modelValue = defineModel<string>();

const props = defineProps<{
  placeholder?: string;
}>();

function handleInput(text: string) {
  modelValue.value = text;
}

watch(modelValue, (newVal) => {
  console.log("Changed:", newVal);
});
</script>

<template>
  <input v-model="modelValue" />
</template>
```

## Checklist for Deprecating Usage

When you encounter the old pattern:

- [ ] Check if component has existing tests
- [ ] Identify all parent components using this v-model
- [ ] Refactor to `defineModel`
- [ ] Update any watchers (`() => props.modelValue` → `modelValue`)
- [ ] Remove `defineEmits` declaration
- [ ] Run `pnpm typecheck` to verify
- [ ] Test in browser (especially if component renders in forms)
- [ ] Update tests if they reference emit events

---

**Note:** This pattern should not be used in new components. Always use `defineModel` (Vue 3.4+).
