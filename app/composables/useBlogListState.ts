import type { BlogListParams } from "@/types/blog";

export const useBlogListState = () => {
  const route = useRoute();
  const router = useRouter();

  const search = ref(route.query.search?.toString() || "");
  const debouncedSearch = refDebounced(search, 300);
  const page = ref(Number(route.query.page) || 1);

  // Sync URL with state
  watch(
    [debouncedSearch, page],
    async () => {
      // Check if search term changed compared to URL
      const searchChanged =
        debouncedSearch.value !== (route.query.search || "");

      // If search changed, reset page to 1
      if (searchChanged) {
        page.value = 1;
      }

      const query = { ...route.query };

      // Handle search query
      if (debouncedSearch.value) {
        query.search = debouncedSearch.value;
      } else {
        delete query.search;
      }

      // Handle page query - use 1 if search changed, otherwise current page
      const newPage = searchChanged ? 1 : page.value;
      if (newPage > 1) {
        query.page = newPage.toString();
      } else {
        delete query.page;
      }

      await router.replace({ query });
    },
    { deep: true },
  );

  // Sync state with URL (e.g. back/forward button)
  watch(
    () => route.query,
    (newQuery) => {
      if (newQuery.search !== search.value) {
        search.value = newQuery.search?.toString() || "";
      }
      if (Number(newQuery.page || 1) !== page.value) {
        page.value = Number(newQuery.page) || 1;
      }
    },
  );

  const params = computed<BlogListParams>(() => ({
    page: page.value,
    search: debouncedSearch.value,
    limit: 10,
  }));

  return {
    search,
    page,
    params,
  };
};
