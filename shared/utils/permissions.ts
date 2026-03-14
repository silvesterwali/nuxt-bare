export type PermissionAction = "create" | "read" | "update" | "delete";
export type FeatureName = "users" | "blog" | "media" | "category" | "tags";

/**
 * Single source of truth for all available features and their CRUD actions.
 * Auto-imported on both server and client via shared/utils/.
 */
export function AllPermissions(): Record<FeatureName, PermissionAction[]> {
  return {
    users: ["create", "read", "update", "delete"],
    blog: ["create", "read", "update", "delete"],
    media: ["create", "read", "update", "delete"],
    category: ["create", "read", "update", "delete"],
    tags: ["create", "read", "update", "delete"],
  };
}
