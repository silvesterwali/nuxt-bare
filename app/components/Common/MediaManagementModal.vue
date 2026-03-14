<script setup lang="ts">
const open = defineModel<boolean>("open", {
  default: false,
});

const emit = defineEmits<{
  (e: "select", id: number): void;
}>();

const { mediaItems, pagination, page, isLoading, refetch, type } =
  useMediaManagement({
    limit: 20,
    initialType: "image",
  });

function close() {
  open.value = false;
}

function select(id: number) {
  console.log("Selected media ID:", id); // Debug log to verify the selected ID
  emit("select", id);
  close(); // Close modal after selection
}

function goToPage(newPage: number) {
  page.value = newPage;
  refetch();
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Choose media"
    description="Choose media from your library or upload new files."
    class="max-w-5xl!"
  >
    <template #body>
      <div
        class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex gap-2 flex-wrap">
          <USelect
            v-model="type"
            :items="[
              { label: 'Images', value: 'image' },
              { label: 'Documents', value: 'document' },
            ]"
            size="sm"
            class="w-full sm:w-auto"
          />
        </div>
        <UButton
          size="sm"
          icon="i-lucide-refresh-ccw"
          label="Reload"
          variant="outline"
          :loading="isLoading"
          @click="refetch()"
        />
      </div>

      <AdminMediaGrid
        :media="mediaItems"
        :loading="isLoading"
        :select-mode="true"
        @select="select"
      />

      <div class="mt-4 flex justify-end">
        <UPagination
          :page="page"
          :total="pagination?.total || 0"
          :items-per-page="pagination?.perPage || 12"
          @update:page="goToPage"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" label="Close" @click="close" />
      </div>
    </template>
  </UModal>
</template>
