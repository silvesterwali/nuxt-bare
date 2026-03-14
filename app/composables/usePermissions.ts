import { useQuery } from "@pinia/colada";
import type { APIResponseSuccess } from "@/types/response";
import type { PermissionEntry } from "~~/shared/types/permission";

export const usePermissionsQuery = () => {
  return useQuery({
    key: () => ["permissions", "me"],
    query: () =>
      $fetch<APIResponseSuccess<PermissionEntry[]>>("/api/user/permissions"),
    
  });
};

export const useHasFeature = (feature: string) => {
  const { data } = usePermissionsQuery();
  return computed(
    () =>
      !feature ||
      (data.value?.data ?? []).some((p) => p.feature === feature),
  );
};
