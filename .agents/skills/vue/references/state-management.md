# Reactive State Management (ref, reactive, computed, watch)

## Overview

Vue 3 provides multiple APIs for managing reactive state in components. Understanding when to use each is crucial for writing clear, maintainable code.

## Core APIs

### `ref` - Reactive Single Value

Use for single scalar values (numbers, strings, booleans):

```vue
<script setup lang="ts">
import { ref } from "vue";

// Single values
const count = ref<number>(0);
const name = ref<string>("");
const isOpen = ref<boolean>(false);

// Can hold objects too
const user = ref<{ id: number; name: string } | null>(null);

// Update values
count.value++;
isOpen.value = !isOpen.value;
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="count++">Increment</button>
  </div>
</template>
```

**Key Points:**

- Must use `.value` in script
- Auto-unwrapped in templates and computed
- Best for simple, trackable single values

### `reactive` - Reactive Objects

Use for complex objects with multiple properties:

```vue
<script setup lang="ts">
import { reactive } from "vue";

interface FormData {
  email: string;
  password: string;
  terms: boolean;
}

const form = reactive<FormData>({
  email: "",
  password: "",
  terms: false,
});

// Update nested properties
form.email = "user@example.com";
form.terms = true;
</script>

<template>
  <form>
    <input v-model="form.email" />
    <input v-model="form.password" />
    <button :disabled="!form.terms">Submit</button>
  </form>
</template>
```

**Key Points:**

- No `.value` needed - direct property access
- Good for grouped related data
- Less ergonomic than `ref` for v-model bindings

### `computed` - Derived Reactive Values

Use for values that depend on other reactive data:

```vue
<script setup lang="ts">
import { computed, ref } from "vue";

const firstName = ref("John");
const lastName = ref("Doe");

// Read-only computed
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`;
});

// Writable computed
const email = computed({
  get: () => userStore.email,
  set: (newEmail) => {
    userStore.email = newEmail;
  },
});
</script>

<template>
  <p>Full Name: {{ fullName }}</p>
</template>
```

**Key Points:**

- Lazy-evaluated - only runs when accessed
- Memoized - cached until dependencies change
- Great for filtering, formatting, combining data
- Can be writable with getter/setter

### `watch` - React to Changes

Use to run side effects when reactive values change:

```vue
<script setup lang="ts">
import { watch, ref } from "vue";

const searchQuery = ref("");
const results = ref([]);

// Watch single ref
watch(searchQuery, async (newQuery) => {
  if (!newQuery) {
    results.value = [];
    return;
  }

  const data = await fetch(`/api/search?q=${newQuery}`);
  results.value = await data.json();
});

// Watch multiple values
const firstName = ref("");
const lastName = ref("");

watch([firstName, lastName], ([newFirst, newLast]) => {
  console.log("Names changed:", newFirst, newLast);
});

// Watch with options
watch(
  searchQuery,
  (newQuery) => {
    // This runs after debounce
  },
  {
    debounce: 300,
  },
);

// watchEffect - auto-tracks dependencies
import { watchEffect } from "vue";

watchEffect(() => {
  console.log("Full name:", firstName.value, lastName.value);
  // Automatically re-runs whenever firstName or lastName changes
});
</script>
```

**Key Points:**

- Side effects only - don't return values
- Can watch refs, computed, or nested properties
- Use for API calls, analytics, syncing to external state
- `watchEffect` auto-tracks dependencies (simpler for some uses)

## When to Use Each

| API        | Use Case                         | Example                              |
| ---------- | -------------------------------- | ------------------------------------ |
| `ref`      | Single values, simple state      | `count`, `isLoading`, `selectedId`   |
| `reactive` | Objects with multiple properties | `formData`, `userProfile`, `filters` |
| `computed` | Derived/transformed values       | `fullName`, `isValid`, `hasErrors`   |
| `watch`    | Side effects on changes          | Fetch data, log changes, sync state  |
| `useModel` | Two-way bindings (v-model)       | Component props with two-way sync    |

## Best Practices

### ✅ DO: Use `ref` for Most Component State

```vue
const isOpen = ref(false);
const selectedId = ref<number | null>(null);
const formData = ref({ name: '', email: '' });
```

### ❌ DON'T: Mix `ref` and `reactive` Unnecessarily

```vue
// ❌ Confusing const counter = reactive({ value: 0 }); counter.value++; // ✅
Clear const counter = ref(0); counter.value++;
```

### ✅ DO: Use `computed` for Derived Values

```vue
const fullName = computed(() => `${first.value} ${last.value}`); const isValid =
computed(() => form.value.email && form.value.password);
```

### ❌ DON'T: Use Computed for Side Effects

```vue
// ❌ Wrong - computed runs frequently, side effects are unexpected const
fetchUser = computed(async () => { return await fetch('/api/user'); }); // ✅
Right - watch is for side effects watch(userId, async (id) => { const user =
await fetch(`/api/user/${id}`); });
```

### ✅ DO: Destructure with Care

```vue
<script setup lang="ts">
import { ref, computed } from "vue";

const count = ref(0);

// ❌ Loses reactivity
const { value } = count;
console.log(value); // No longer reactive

// ✅ Keep as ref
const increment = () => {
  count.value++;
};
</script>
```

---

**Reference:**

- [Vue Reactivity API](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [ref() API](https://vuejs.org/api/reactivity-core.html#ref)
- [computed() API](https://vuejs.org/api/reactivity-core.html#computed)
- [watch() API](https://vuejs.org/api/reactivity-core.html#watch)
