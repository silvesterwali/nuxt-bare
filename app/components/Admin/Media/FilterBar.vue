<script setup lang="ts">
const page = defineModel<number>("page", {
  default: 1,
});

const type = defineModel<string>("type", {
  default: "",
});

const folderName = defineModel<string>("folderName", {
  default: "",
});

const { data: folderResponse, isLoading: foldersLoading } =
  useMediaFoldersQuery();

const folderItems = computed(() =>
  (folderResponse.value?.data ?? []).map((folder) => ({
    label: folder.name,
    value: folder.name,
  })),
);
</script>

<template>
  <div
    class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 border-t border-gray-200 dark:border-gray-700"
  >
    <div class="flex flex-wrap items-center gap-2">
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
      <USelectMenu
        v-model="folderName"
        :items="folderItems"
        :loading="foldersLoading"
        class="w-full sm:w-64"
        icon="i-lucide-folder-search"
        value-key="value"
        label-key="label"
        placeholder="Folder"
        searchable
        clear
      >
        <template #empty>
          <span class="text-sm text-muted">No folders available yet</span>
        </template>
      </USelectMenu>
      <UButton
        v-if="type || folderName"
        color="neutral"
        variant="ghost"
        icon="i-lucide-x"
        label="Reset"
        @click="
          () => {
            type = '';
            folderName = '';
            page = 1;
          }
        "
      />
    </div>
  </div>
</template>
