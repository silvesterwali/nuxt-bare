import { eq, and, or, like, desc, sql, count, type SQL } from "drizzle-orm";
import { db, schema } from "../../db";
import type { UserRole, User, UserProfile, PaginationParams } from "~/types/db";
import {
  validatePaginationParams,
  createPaginationResponse,
  buildCountQuery,
} from "../common/pagination";
import { sendAccountDeactivationEmail } from "../common/email";

export interface UserFilters {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface UserWithProfile extends User {
  profile?: UserProfile;
}

export async function getUsers(
  filters: UserFilters = {},
  paginationParams?: Partial<PaginationParams>,
) {
  const { page, limit } = validatePaginationParams(paginationParams || {});

  // Build where conditions
  const conditions: SQL[] = [];

  if (filters.search) {
    const searchPattern = `%${filters.search}%`;
    conditions.push(
      or(
        like(schema.users.email, searchPattern),
        like(schema.userProfiles.firstName, searchPattern),
        like(schema.userProfiles.lastName, searchPattern),
      )!,
    );
  }

  if (filters.role) {
    conditions.push(eq(schema.users.role, filters.role));
  }

  if (typeof filters.isActive === "boolean") {
    conditions.push(eq(schema.users.isActive, filters.isActive));
  }

  if (typeof filters.emailVerified === "boolean") {
    conditions.push(eq(schema.users.emailVerified, filters.emailVerified));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const query = db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      isActive: schema.users.isActive,
      emailVerified: schema.users.emailVerified,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt,
      profile: {
        id: schema.userProfiles.id,
        firstName: schema.userProfiles.firstName,
        lastName: schema.userProfiles.lastName,
        avatar: schema.userProfiles.avatar,
        bio: schema.userProfiles.bio,
        dateOfBirth: schema.userProfiles.dateOfBirth,
        phoneNumber: schema.userProfiles.phoneNumber,
        address: schema.userProfiles.address,
      },
    })
    .from(schema.users)
    .leftJoin(
      schema.userProfiles,
      eq(schema.users.id, schema.userProfiles.userId),
    )
    .where(whereClause)
    .orderBy(desc(schema.users.createdAt));

  // Build count query with join to support search on profile fields
  const countQuery = db
    .select({ count: count() })
    .from(schema.users)
    .leftJoin(
      schema.userProfiles,
      eq(schema.users.id, schema.userProfiles.userId),
    )
    .where(whereClause);

  // Execute queries
  const offset = (page - 1) * limit;
  const [users, countResult] = await Promise.all([
    query.limit(limit).offset(offset),
    countQuery,
  ]);

  const totalCount = countResult[0]?.count || 0;

  return createPaginationResponse(users, totalCount, page, limit);
}

export async function getUserById(id: number): Promise<UserWithProfile | null> {
  const users = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      isActive: schema.users.isActive,
      emailVerified: schema.users.emailVerified,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt,
      profile: {
        id: schema.userProfiles.id,
        firstName: schema.userProfiles.firstName,
        lastName: schema.userProfiles.lastName,
        avatar: schema.userProfiles.avatar,
        bio: schema.userProfiles.bio,
        dateOfBirth: schema.userProfiles.dateOfBirth,
        phoneNumber: schema.userProfiles.phoneNumber,
        address: schema.userProfiles.address,
        createdAt: schema.userProfiles.createdAt,
        updatedAt: schema.userProfiles.updatedAt,
      },
    })
    .from(schema.users)
    .leftJoin(
      schema.userProfiles,
      eq(schema.users.id, schema.userProfiles.userId),
    )
    .where(eq(schema.users.id, id))
    .limit(1);

  const user = users[0];
  if (!user) return null;

  // Handle case where profile doesn't exist (left join)
  if (!user.profile?.id) {
    // @ts-expect-error - profile structure mismatch due to left join potential nulls
    user.profile = undefined;
  }

  return user as unknown as UserWithProfile;
}

export async function updateUserRole(id: number, role: UserRole) {
  const result = await db
    .update(schema.users)
    .set({
      role,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, id))
    .returning();

  if (result.length === 0) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  return result[0];
}

export async function toggleUserActive(id: number) {
  // First get the current user to check their status and profile
  const user = await getUserById(id);

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const newActiveStatus = !user.isActive;

  const result = await db
    .update(schema.users)
    .set({
      isActive: newActiveStatus,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, id))
    .returning();

  if (!result.length) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  // Send deactivation email if user is being deactivated
  if (!newActiveStatus && user.profile?.firstName) {
    try {
      await sendAccountDeactivationEmail(user.email, user.profile.firstName);
    } catch (error) {
      console.error("Failed to send deactivation email:", error);
      // Don't throw error - user deactivation should still succeed
    }
  }

  return result[0]!;
}

export async function deleteUser(id: number) {
  // Check if user exists
  const user = await getUserById(id);

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  // Prevent deletion of admin users (optional safety check)
  if (user.role === "admin") {
    throw createError({
      statusCode: 400,
      statusMessage: "Cannot delete admin users",
    });
  }

  // Delete user (cascade will handle profile and other related records)
  await db.delete(schema.users).where(eq(schema.users.id, id));

  return user;
}

export async function getUserStats() {
  // Get total counts
  const [totalUsers, activeUsers, verifiedUsers, adminUsers] =
    await Promise.all([
      db.select({ count: count() }).from(schema.users),
      db
        .select({ count: count() })
        .from(schema.users)
        .where(eq(schema.users.isActive, true)),
      db
        .select({ count: count() })
        .from(schema.users)
        .where(eq(schema.users.emailVerified, true)),
      db
        .select({ count: count() })
        .from(schema.users)
        .where(eq(schema.users.role, "admin")),
    ]);

  // Get recent registrations (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRegistrations = await db
    .select({ count: count() })
    .from(schema.users)
    .where(
      and(
        eq(schema.users.isActive, true),
        // Note: You might need to adjust this based on your SQL dialect
        sql`${schema.users.createdAt} >= ${thirtyDaysAgo.toISOString()}`,
      ),
    );

  return {
    totalUsers: totalUsers[0]?.count || 0,
    activeUsers: activeUsers[0]?.count || 0,
    verifiedUsers: verifiedUsers[0]?.count || 0,
    adminUsers: adminUsers[0]?.count || 0,
    recentRegistrations: recentRegistrations[0]?.count || 0,
  };
}
