<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="flex items-start justify-between mb-8">
    <div class="min-w-0">
      <h1
        class="text-xl font-display font-semibold tracking-tight text-highlighted truncate"
      >
        {{ title }}
      </h1>
      <p v-if="description" class="text-sm text-muted mt-1">
        {{ description }}
      </p>
      <p v-else-if="$slots.description" class="text-sm text-muted mt-1">
        <slot name="description" />
      </p>
    </div>
    <div
      v-if="$slots.default"
      class="flex items-center gap-2 ml-4 flex-shrink-0"
    >
      <slot />
    </div>
  </div>
</template>
