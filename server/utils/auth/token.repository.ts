import { eq, sql } from "drizzle-orm";
import { db, schema } from "../../db";
import type { UserTokenType } from "~/types/db";

export const tokenRepository = {
  async create(userId: number, type: UserTokenType, expiresInHours = 24) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);
    const token = crypto.randomUUID();

    const createdToken = await db
      .insert(schema.userTokens)
      .values({
        userId,
        token,
        type,
        expiresAt,
        createdAt: new Date(),
      })
      .returning();

    if (!createdToken.length) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to create token",
      });
    }

    return createdToken[0];
  },

  async findByToken(token: string, type: UserTokenType) {
    return db.query.userTokens.findFirst({
      where: (userTokens, { eq, and, gt }) =>
        and(
          eq(userTokens.token, token),
          eq(userTokens.type, type),
          gt(userTokens.expiresAt, new Date()),
        ),
      with: {
        user: true,
      },
    });
  },

  async delete(id: number) {
    return db.delete(schema.userTokens).where(eq(schema.userTokens.id, id));
  },
};
