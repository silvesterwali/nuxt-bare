// Barrel re-export so Nuxt auto-imports all schemas from this direct
// shared/utils/ child. Nuxt only scans top-level files in shared/utils/,
// not subdirectories — this bridge makes every schema available without
// explicit imports in server routes and Vue components.
export * from "./schema/auth";
export * from "./schema/category";
export * from "./schema/common";
export * from "./schema/media";
export * from "./schema/permissions";
export * from "./schema/post";
export * from "./schema/tag";
export * from "./schema/user";
