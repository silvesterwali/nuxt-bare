<script setup lang="ts">
const open = defineModel<boolean>("open", {
  default: false,
});

const emit = defineEmits<{
  (e: "confirm"): void;
}>();
</script>

<template>
  <UModal v-model:open="open" title="Delete media" icon="i-lucide-trash-2">
    <template #body>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Are you sure you want to delete this media item? This action cannot be
        undone.
      </p>
      <div class="flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          label="Cancel"
          @click="open = false"
        />
        <UButton color="error" label="Delete" @click="emit('confirm')" />
      </div>
    </template>
  </UModal>
</template>
