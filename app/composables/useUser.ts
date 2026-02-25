import { useQuery, useMutation, useQueryCache } from "@pinia/colada";
import type { User, UserWithProfile } from "@/types/db";
import type { ResponsePagination } from "@/types/response";
import type { UserListParams } from "@/types/user";

export const useUsersQuery = (params: Ref<UserListParams>) => {
  return useQuery({
    key: () => ["users", params.value],
    query: () => {
      const p = params.value;
      return $fetch<ResponsePagination<UserWithProfile>>("/api/admin/users", {
        query: {
          page: p.page,
          limit: p.limit,
          search: p.search,
          role: p.role,
        },
      });
    },
  });
};

export const useUserQuery = (id: Ref<number | string>) => {
  return useQuery({
    key: () => ["users", id.value],
    query: () => $fetch<UserWithProfile>(`/api/admin/users/${id.value}`),
  });
};

export const useUserCreateMutation = () => {
  const queryCache = useQueryCache();
  const toast = useToast();

  return useMutation({
    mutation: (payload: Record<string, any>) =>
      $fetch("/api/admin/users", {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      queryCache.invalidateQueries({ key: ["users"] });
      toast.add({
        title: "Success",
        description: "User created successfully",
        color: "success",
      });
    },
    onError: (err: any) => {
      const msg = err.data?.message || "Failed to create user";
      toast.add({ title: "Error", description: msg, color: "error" });
      throw err;
    },
  });
};

export const useUserUpdateMutation = () => {
  const queryCache = useQueryCache();
  const toast = useToast();

  return useMutation({
    mutation: ({ id, payload }: { id: number | string; payload: any }) =>
      $fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    onSuccess: (data, { id }) => {
      queryCache.invalidateQueries({ key: ["users"] });
      // also invalidate the specific user
      queryCache.invalidateQueries({ key: ["users", id] });
      toast.add({
        title: "Success",
        description: "User updated successfully",
        color: "success",
      });
    },
    onError: (err: any) => {
      const msg = err.data?.message || "Failed to update user";
      toast.add({ title: "Error", description: msg, color: "error" });
      throw err;
    },
  });
};

export const useUserDeleteMutation = () => {
  const queryCache = useQueryCache();
  const toast = useToast();

  return useMutation({
    mutation: (id: number | string) =>
      $fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryCache.invalidateQueries({ key: ["users"] });
      toast.add({
        title: "Success",
        description: "User deleted successfully",
        color: "success",
      });
    },
    onError: (err: any) => {
      const msg = err.data?.message || "Failed to delete user";
      toast.add({ title: "Error", description: msg, color: "error" });
    },
  });
};
