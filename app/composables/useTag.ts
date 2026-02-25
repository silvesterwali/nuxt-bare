import { useQuery, useMutation, useQueryCache } from "@pinia/colada";
import type { BlogTag } from "@/types/blog";

export interface CreateTagInput {
  name: Record<string, string> | string;
  slug?: Record<string, string> | string;
  color?: string;
}

export function useTagsQuery() {
  return useQuery({
    key: ["admin", "tags"],
    query: async () => {
      const response = await $fetch<{
        data: BlogTag[];
        statusMessage: string;
      }>("/api/admin/tags");
      return response.data;
    },
  });
}

export function useTagCreateMutation() {
  const cache = useQueryCache();

  return useMutation({
    mutation: async (data: CreateTagInput) => {
      return $fetch<BlogTag>("/api/admin/tags", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: async () => {
      await cache.invalidateQueries({
        key: ["admin", "tags"],
      });
      useToast().add({
        title: "Success",
        description: "Tag created successfully",
      });
    },
    onError: () => {
      useToast().add({
        title: "Error",
        description: "Failed to create tag",
        color: "error",
      });
    },
  });
}

export function useTagUpdateMutation() {
  const cache = useQueryCache();

  return useMutation({
    mutation: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateTagInput>;
    }) => {
      return $fetch<BlogTag>(`/api/admin/tags/${id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: async () => {
      await cache.invalidateQueries({
        key: ["admin", "tags"],
      });
      useToast().add({
        title: "Success",
        description: "Tag updated successfully",
      });
    },
    onError: () => {
      useToast().add({
        title: "Error",
        description: "Failed to update tag",
        color: "error",
      });
    },
  });
}

export function useTagDeleteMutation() {
  const cache = useQueryCache();

  return useMutation({
    mutation: async (id: number) => {
      return $fetch<{ success: boolean; id: number }>(`/api/admin/tags/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: async () => {
      await cache.invalidateQueries({
        key: ["admin", "tags"],
      });
      useToast().add({
        title: "Success",
        description: "Tag deleted successfully",
      });
    },
    onError: () => {
      useToast().add({
        title: "Error",
        description: "Failed to delete tag",
        color: "error",
      });
    },
  });
}
