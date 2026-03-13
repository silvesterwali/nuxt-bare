import { computed, ref, watch } from "vue";

import { useMediaManagementQuery } from "~/composables/useMediaManagementQuery";

export function useMediaManagement(options?: {
  initialType?: string;
  initialPage?: number;
  limit?: number;
}) {
  const page = ref(options?.initialPage ?? 1);
  const limit = ref(options?.limit ?? 12);
  const type = ref(options?.initialType ?? "image");

  const params = computed(() => ({
    page: page.value,
    limit: limit.value,
    type: type.value || undefined,
    privacy: "public",
  }));

  const {
    data: mediaResponse,
    isLoading,
    refetch,
  } = useMediaManagementQuery(params);

  const mediaItems = computed(() => mediaResponse.value?.data || []);
  const pagination = computed(() => mediaResponse.value?.pagination || null);

  watch(type, () => {
    page.value = 1;
  });

  return {
    page,
    limit,
    type,
    mediaItems,
    pagination,
    isLoading,
    refetch,
  };
}
