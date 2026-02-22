<script setup lang="ts">
defineProps<{
  title?: string;
  collapsible?: boolean;
}>();
</script>

<template>
  <div class="mb-4">
    <div
      v-if="title"
      class="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
    >
      {{ title }}
    </div>
    <div class="space-y-1">
      <slot />
    </div>
  </div>
</template>
