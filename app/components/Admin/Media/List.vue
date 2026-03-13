<script setup lang="ts">
import FilterBar from "~/components/Admin/Media/FilterBar.vue";
import UploadModal from "~/components/Admin/Media/UploadModal.vue";
import DeleteConfirmModal from "~/components/Admin/Media/DeleteConfirmModal.vue";

const { page, type, params } = useMediaListState();
const { data: mediaResponse, isLoading: pending } =
  useMediaManagementQuery(params);

const media = computed(() => mediaResponse.value?.data || []);
const pagination = computed(() => mediaResponse.value?.pagination);

const deleteMutation = useMediaDeleteMutation();

const uploadOpen = ref(false);

const deleteConfirmOpen = ref(false);
const deleteId = ref<number | null>(null);

function openMedia(url: string) {
  if (!url) return;

  // Ensure we open an absolute URL (the backend stores paths like `/assets/…`).
  const fullUrl = new URL(url, window.location.origin).toString();
  window.open(fullUrl, "_blank");
}

function handleUploadReload(response: { message: string; data: any }) {
  // The upload modal emits this after a successful upload.
  // The query cache is invalidated by the upload mutation itself, so no
  // additional action is required here, but the parent can respond if needed.
  console.debug("Media uploaded:", response);
}

function openDeleteModal(id: number) {
  deleteId.value = id;
  deleteConfirmOpen.value = true;
}

function confirmDelete() {
  if (!deleteId.value) return;
  deleteMutation.mutate(deleteId.value);
  deleteConfirmOpen.value = false;
  deleteId.value = null;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Media Library</h2>
        <p class="text-gray-500 dark:text-gray-400">
          Upload and manage your media assets.
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        label="Upload Media"
        @click="uploadOpen = true"
      />
    </div>

    <FilterBar v-model:page="page" v-model:type="type" />

    <AdminMediaTable
      :media="media"
      :loading="pending"
      @view="openMedia"
      @delete="openDeleteModal"
    />

    <UPagination
      v-model:page="page"
      :total="pagination?.total || 0"
      :items-per-page="pagination?.perPage || 10"
      class="self-end"
    />

    <UploadModal v-model:open="uploadOpen" @reload="handleUploadReload" />

    <DeleteConfirmModal
      v-model:open="deleteConfirmOpen"
      @confirm="confirmDelete"
    />
  </div>
</template>
