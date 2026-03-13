<script setup lang="ts">
/**
 * Reusable confirmation modal for delete actions
 * Usage:
 * <CommonConfirmDelete
 *   v-model:open="deleteOpen"
 *   title="Delete Item"
 *   message="Are you sure?"
 *   :loading="isDeleting"
 *   @confirm="handleDelete"
 * />
 */

interface Props {
  /** Modal title */
  title?: string;
  /** Confirmation message */
  message?: string;
  /** Item identifier/name to display */
  itemName?: string;
  /** Show loading state on delete button */
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Delete Item",
  message:
    "Are you sure you want to delete this item? This action cannot be undone.",
  itemName: "",
  loading: false,
});

const emit = defineEmits<{
  /** Emitted when user confirms deletion */
  (e: "confirm"): void;
}>();

const open = defineModel<boolean>("open", {
  default: false,
});

function onConfirm() {
  emit("confirm");
}

function onCancel() {
  open.value = false;
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    icon="i-lucide-alert-triangle"
    @keydown.escape="onCancel"
  >
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ message }}
        </p>
        <p
          v-if="itemName"
          class="text-sm font-semibold text-gray-900 dark:text-white"
        >
          {{ itemName }}
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          variant="ghost"
          label="Cancel"
          :disabled="loading"
          @click="onCancel"
        />
        <UButton
          color="error"
          label="Delete"
          :loading="loading"
          @click="onConfirm"
        />
      </div>
    </template>
  </UModal>
</template>
