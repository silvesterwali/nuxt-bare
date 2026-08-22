/**
 * Type definitions inferred directly from the Drizzle schema.
 *
 * This is the single source of truth for all entity types used across the
 * application — no manual duplication.  When the schema changes, these
 * types update automatically on the next type-check.
 *
 * Located in shared/ because both app/ and server/ depend on these types.
 * Pattern taken from atidone: keep schema.ts clean, infer everything else.
 */
import * as schema from "../../server/db/schema";

// ── Users ───────────────────────────────────────────────────────────────
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type UserRole = "admin" | "user" | "moderator";

// ── User profiles ───────────────────────────────────────────────────────
export type UserProfile = typeof schema.userProfiles.$inferSelect;
export type NewUserProfile = typeof schema.userProfiles.$inferInsert;

export type UserWithProfile = User & {
  profile?: UserProfile | null;
};

// ── Posts ───────────────────────────────────────────────────────────────
export type Post = typeof schema.posts.$inferSelect;
export type NewPost = typeof schema.posts.$inferInsert;

// ── Media ───────────────────────────────────────────────────────────────
export type MediaFolder = typeof schema.mediaFolders.$inferSelect;
export type NewMediaFolder = typeof schema.mediaFolders.$inferInsert;

export type Media = typeof schema.media.$inferSelect & {
  thumbnail?: typeof schema.media.$inferSelect | null;
  folder?: MediaFolder | null;
  folderName?: string | null;
};
export type NewMedia = typeof schema.media.$inferInsert;

export type MediaUsage = typeof schema.mediaUsage.$inferSelect;
export type NewMediaUsage = typeof schema.mediaUsage.$inferInsert;

// ── Auth tokens ─────────────────────────────────────────────────────────
export type EmailVerification = typeof schema.emailVerifications.$inferSelect;
export type NewEmailVerification =
  typeof schema.emailVerifications.$inferInsert;

export type PasswordReset = typeof schema.passwordResets.$inferSelect;
export type NewPasswordReset = typeof schema.passwordResets.$inferInsert;

// ── String literal unions ───────────────────────────────────────────────
export type UserTokenType = "email_verification" | "password_reset";
export type MediaType = "image" | "document";
export type MediaPrivacy = "public" | "private";

// ── Pagination ──────────────────────────────────────────────────────────
export interface PaginationParams {
  page?: number;
  limit?: number;
}
