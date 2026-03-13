# Component Lifecycle Hooks

## Overview

Vue 3 lifecycle hooks let you run code at specific stages of a component's lifecycle: creation, mounting, updates, and unmounting.

## Available Hooks

### Setup Phase

```vue
<script setup lang="ts">
// Setup runs before component is created
// Use for: Initial state, composables, setup logic
</script>
```

### Creation & Mounting

```vue
<script setup lang="ts">
import { onBeforeMount, onMounted } from "vue";

onBeforeMount(() => {
  // Runs right before component mounts to DOM
  // Use for: Last-minute setup (rarely needed)
});

onMounted(() => {
  // Runs after component is mounted to DOM
  // Use for: DOM queries, event listeners, timers, API calls
  console.log("Component mounted!");
});
</script>
```

### Updates

```vue
<script setup lang="ts">
import { onBeforeUpdate, onUpdated } from "vue";

onBeforeUpdate(() => {
  // Runs before component re-renders
  // Use for: Rare - usually not needed
});

onUpdated(() => {
  // Runs after component re-renders
  // Use for: Syncing with DOM after changes
  console.log("Component updated!");
});
</script>
```

### Unmounting

```vue
<script setup lang="ts">
import { onBeforeUnmount, onUnmounted } from "vue";

onBeforeUnmount(() => {
  // Runs before component is removed
  // Use for: Cleanup prep (rarely needed)
});

onUnmounted(() => {
  // Runs after component is completely removed
  // Use for: Cleanup (remove timers, event listeners, unsubscribe)
  clearTimeout(timerId);
  removeEventListener("scroll", handleScroll);
});
</script>
```

## Common Patterns

### Fetch Data on Mount

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";

const data = ref([]);
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;
  try {
    data.value = await $fetch("/api/data");
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <ul v-else>
    <li v-for="item in data" :key="item.id">{{ item.name }}</li>
  </ul>
</template>
```

### Set Up & Clean Up Event Listener

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

function handleScroll() {
  // Handle scroll
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
```

### Timer/Interval Cleanup

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const secondsElapsed = ref(0);

onMounted(() => {
  const interval = setInterval(() => {
    secondsElapsed.value++;
  }, 1000);

  onUnmounted(() => {
    clearInterval(interval);
  });
});
</script>

<template>
  <p>Elapsed: {{ secondsElapsed }}s</p>
</template>
```

### Sync External State on Mount

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useAuthStore } from "~/stores/auth";

const auth = useAuthStore();

onMounted(() => {
  // Restore session from localStorage
  auth.loadSession();

  // Subscribe to auth changes
  const unsubscribe = auth.$subscribe((mutation, state) => {
    // Sync to backend
    console.log("Auth state changed:", state);
  });

  onUnmounted(() => {
    unsubscribe();
  });
});
</script>
```

## Lifecycle Diagram

```
Setup Phase
    ↓
onBeforeMount
    ↓
Component inserts into DOM
    ↓
onMounted ← Common: Fetch data, add listeners
    ↓
    ↓ (when props/state changes)
onBeforeUpdate
    ↓
Component re-renders
    ↓
onUpdated ← Rare: Post-render DOM access
    ↓
    ↓ (when component is removed)
onBeforeUnmount
    ↓
Component removed from DOM
    ↓
onUnmounted ← Common: Cleanup listeners, timers
```

## In Composition API vs Options API

### Composition API (✅ Use This)

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

onMounted(() => {
  console.log("Mounted");
});

onUnmounted(() => {
  console.log("Unmounted");
});
</script>
```

### Options API (Legacy)

```vue
<script>
export default {
  mounted() {
    console.log("Mounted");
  },

  unmounted() {
    console.log("Unmounted");
  },
};
</script>
```

## Best Practices

### ✅ DO: Group Cleanup with Setup

```vue
<script setup lang="ts">
onMounted(() => {
  const interval = setInterval(() => {
    /* ... */
  }, 1000);

  // Keep cleanup nearby - easy to see the pair
  onUnmounted(() => {
    clearInterval(interval);
  });
});
</script>
```

### ✅ DO: Use Composables for Complex Lifecycle Logic

```vue
<script setup lang="ts">
// ✅ Complex logic moved to composable
import { useScrollListener } from "~/composables/useScrollListener";

const { isScrolling } = useScrollListener();
</script>
```

### ❌ DON'T: Put Async Operations Without Error Handling

```vue
<!-- ❌ Unhandled errors -->
onMounted(async () => { await fetch('/api/data').then(r => r.json()); });

<!-- ✅ With error handling -->
<script setup lang="ts">
onMounted(async () => {
  try {
    const response = await fetch("/api/data");
    data.value = await response.json();
  } catch (error) {
    console.error("Failed to load data:", error);
    error.value = error;
  }
});
</script>
```

---

**Reference:**

- [Vue Lifecycle Hooks](https://vuejs.org/guide/essentials/lifecycle.html)
- [API: onMounted](https://vuejs.org/api/composition-api-lifecycle.html#onmounted)
- [API: onUnmounted](https://vuejs.org/api/composition-api-lifecycle.html#onunmounted)
