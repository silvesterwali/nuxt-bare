import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Users table with authentication fields
export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"), // null for OAuth users
  role: text("role").notNull().default("user"), // user, admin, moderator
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// User profiles
export const userProfiles = sqliteTable("user_profiles", {
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  dateOfBirth: integer("date_of_birth", { mode: "timestamp" }),
  phoneNumber: text("phone_number"),
  address: text("address"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// User tokens for email verification and password reset
export const userTokens = sqliteTable("user_tokens", {
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  type: text("type").notNull(), // 'email_verification', 'password_reset'
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Email verifications
export const emailVerifications = sqliteTable("email_verifications", {
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  token: text("token").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Password resets
export const passwordResets = sqliteTable("password_resets", {
  id: integer("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Media management
export const media = sqliteTable("media", {
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(), // 'image', 'document'
  privacy: text("privacy").notNull().default("private"), // 'private', 'public'
  width: integer("width"),
  height: integer("height"),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Media usage tracking
export const mediaUsage = sqliteTable("media_usage", {
  id: integer("id").primaryKey(),
  mediaId: integer("media_id")
    .notNull()
    .references(() => media.id, { onDelete: "cascade" }),
  entityType: text("entity_type").notNull(), // 'user_profile', 'post', etc.
  entityId: integer("entity_id").notNull(),
  fieldName: text("field_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Posts table (updated to use JSON for multi-language)
export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  slug: text("slug", { mode: "json" }).$type<Record<string, string>>().notNull(),
  title: text("title", { mode: "json" }).$type<Record<string, string>>().notNull(),
  shortDescription: text("short_description", { mode: "json" }).$type<Record<string, string>>(),
  content: text("content", { mode: "json" }).$type<Record<string, string>>().notNull(),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  featuredImageId: integer("featured_image_id").references(() => media.id, {
    onDelete: "set null",
  }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  tokens: many(userTokens),
  posts: many(posts),
  media: many(media),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const userTokensRelations = relations(userTokens, ({ one }) => ({
  user: one(users, {
    fields: [userTokens.userId],
    references: [users.id],
  }),
}));

export const emailVerificationsRelations = relations(
  emailVerifications,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerifications.userId],
      references: [users.id],
    }),
  }),
);

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  featuredImage: one(media, {
    fields: [posts.featuredImageId],
    references: [media.id],
  }),
}));

export const mediaRelations = relations(media, ({ one, many }) => ({
  // Changed to one, many just in case
  owner: one(users, {
    fields: [media.userId],
    references: [users.id],
  }),
  usage: many(mediaUsage),
}));

export const mediaUsageRelations = relations(mediaUsage, ({ one }) => ({
  media: one(media, {
    fields: [mediaUsage.mediaId],
    references: [media.id],
  }),
}));
