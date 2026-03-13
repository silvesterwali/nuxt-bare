// Media Modal state and configuration composable
// Centralizes modal state management and media upload configuration

export const MEDIA_CONFIG = {
  UPLOAD: {
    IMAGE: {
      maxSize: 2 * 1024 * 1024, // 2MB
      mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      label: "Images (max 2MB)",
    },
    DOCUMENT: {
      maxSize: 50 * 1024 * 1024, // 50MB
      mimeTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
      label: "Documents (max 50MB) - PDF, Word, Excel",
    },
  },
};

/**
 * Composable for managing media modal states
 * Centralizes upload modal, delete confirmation modal, and related state
 */
export const useMediaModal = () => {
  // Upload modal state
  const uploadOpen = ref(false);

  // Delete confirmation modal state
  const deleteConfirmOpen = ref(false);
  const deleteId = ref<number | null>(null);

  // Set media ID for deletion and open confirmation
  const openDeleteModal = (id: number) => {
    deleteId.value = id;
    deleteConfirmOpen.value = true;
  };

  // Close delete modal and reset state
  const closeDeleteModal = () => {
    deleteConfirmOpen.value = false;
    deleteId.value = null;
  };

  // Open upload modal
  const openUploadModal = () => {
    uploadOpen.value = true;
  };

  // Close upload modal
  const closeUploadModal = () => {
    uploadOpen.value = false;
  };

  return {
    // Upload modal
    uploadOpen,
    openUploadModal,
    closeUploadModal,

    // Delete confirmation modal
    deleteConfirmOpen,
    deleteId,
    openDeleteModal,
    closeDeleteModal,

    // Configuration
    MEDIA_CONFIG,
  };
};
