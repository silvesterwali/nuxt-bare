import { eq, and } from "drizzle-orm";
import { createError } from "h3";
import { userRepository } from "../user/repository";
import {
  AllPermissions,
  type FeatureName,
} from "../../../shared/utils/permissions";

export const permissionRepository = {
  async findByUserId(userId: number) {
    return useDb
      .select()
      .from(schema.userPermissions)
      .where(eq(schema.userPermissions.userId, userId));
  },

  async findByUserIdAndFeature(userId: number, feature: string) {
    const rows = await useDb
      .select()
      .from(schema.userPermissions)
      .where(
        and(
          eq(schema.userPermissions.userId, userId),
          eq(schema.userPermissions.feature, feature),
        ),
      )
      .limit(1);
    return rows[0] || null;
  },

  async upsert(userId: number, feature: string, permissions: string[]) {
    const existing = await permissionRepository.findByUserIdAndFeature(
      userId,
      feature,
    );
    if (existing) {
      await permissionRepository.deleteByUserIdAndFeature(userId, feature);
    }
    const [created] = await useDb
      .insert(schema.userPermissions)
      .values({
        userId,
        feature,
        permissions,
        createdAt: existing?.createdAt ?? new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  },

  async deleteByUserIdAndFeature(userId: number, feature: string) {
    return useDb
      .delete(schema.userPermissions)
      .where(
        and(
          eq(schema.userPermissions.userId, userId),
          eq(schema.userPermissions.feature, feature),
        ),
      );
  },

  async deleteAllByUserId(userId: number) {
    return useDb
      .delete(schema.userPermissions)
      .where(eq(schema.userPermissions.userId, userId));
  },
};

/**
 * Grant all actions for a feature to a user identified by email.
 */
export async function grantPermissionByEmail(
  email: string,
  feature: FeatureName,
) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const all = AllPermissions();
  const actions = all[feature];
  return permissionRepository.upsert(user.id, feature, actions);
}

/**
 * Revoke all actions for a feature from a user identified by email.
 */
export async function revokePermissionByEmail(
  email: string,
  feature: FeatureName,
) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  return permissionRepository.deleteByUserIdAndFeature(user.id, feature);
}
