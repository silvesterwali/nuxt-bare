import { useQuery, useMutation, useQueryCache } from "@pinia/colada";
import type { ResponsePagination } from "@/types/response";
import type { BlogListParams, BlogPost } from "@/types/blog";

export const usePostsQuery = (params: Ref<BlogListParams>) => {
  return useQuery({
    key: () => ["posts", params.value],
    query: () => {
      const p = params.value;
      return $fetch<ResponsePagination<BlogPost>>("/api/admin/blog", {
        query: {
          page: p.page,
          limit: p.limit,
          search: p.search,
        },
      });
    },
  });
};

export const usePostQuery = (id: Ref<number | string>) => {
  return useQuery({
    key: () => ["posts", id.value],
    query: async () => {
      const response = await $fetch<{
        data: BlogPost;
        statusMessage: string;
      }>(`/api/admin/blog/${id.value}`);
      return response.data;
    },
  });
};

export const usePostDeleteMutation = () => {
  const queryCache = useQueryCache();
  const toast = useToast();

  return useMutation({
    mutation: (id: number | string) =>
      $fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryCache.invalidateQueries({ key: ["posts"] });
      toast.add({
        title: "Success",
        description: "Post deleted successfully",
        color: "success",
      });
    },
    onError: (err: any) => {
      const msg = err.data?.message || "Failed to delete post";
      toast.add({ title: "Error", description: msg, color: "error" });
      throw err;
    },
  });
};
