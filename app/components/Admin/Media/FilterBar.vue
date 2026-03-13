<script setup lang="ts">
const type = defineModel<string>("type", {
  default: "",
});
</script>

<template>
  <div
    class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 border-t border-gray-200 dark:border-gray-700"
  >
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
      <USelectMenu
        v-model="type"
        :items="[
          { label: 'Image', value: 'image' },
          { label: 'Document', value: 'document' },
        ]"
        class="w-40"
        value-key="value"
        label-key="label"
        placeholder="Type"
        clear
      />
    </div>
  </div>
</template>
