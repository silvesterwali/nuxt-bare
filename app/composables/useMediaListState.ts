import { computed, ref, watch } from "vue";
import type { MediaListParams } from "~/composables/useMediaManagementQuery";

export const useMediaListState = () => {
  const route = useRoute();
  const router = useRouter();

  const page = ref(Number(route.query.page) || 1);
  const type = ref(route.query.type?.toString() || "");

  // Sync URL with state
  watch(
    [page, type],
    async () => {
      const query = { ...route.query };

      if (page.value > 1) {
        query.page = page.value.toString();
      } else {
        delete query.page;
      }

      if (type.value) {
        query.type = type.value;
      } else {
        delete query.type;
      }

      await router.replace({ query });
    },
    { deep: true },
  );

  // Sync state with URL
  watch(
    () => route.query,
    (newQuery) => {
      if (Number(newQuery.page || 1) !== page.value) {
        page.value = Number(newQuery.page) || 1;
      }
      if ((newQuery.type?.toString() || "") !== type.value) {
        type.value = newQuery.type?.toString() || "";
      }
    },
  );

  const params = computed<MediaListParams>(() => ({
    page: page.value,
    limit: 10,
    type: type.value || undefined,
    privacy: "public",
  }));

  return {
    page,
    type,
    params,
  };
};
