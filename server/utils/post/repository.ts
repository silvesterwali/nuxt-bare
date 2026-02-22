import { eq, desc } from "drizzle-orm";
import { db, schema } from "../../db";

export const postRepository = {
  async findAll() {
    // Basic implementation: fetch all posts with author info
    // In a real app, this would support pagination
    const posts = await db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        content: schema.posts.content,
        published: schema.posts.published,
        createdAt: schema.posts.createdAt,
        author: {
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
        },
      })
      .from(schema.posts)
      .leftJoin(schema.users, eq(schema.posts.userId, schema.users.id))
      .orderBy(desc(schema.posts.createdAt));

    return posts;
  },

  async create(data: {
    title: string;
    content: string;
    userId: number;
    published?: boolean;
  }) {
    const result = await db
      .insert(schema.posts)
      .values({
        title: data.title,
        content: data.content,
        userId: data.userId,
        published: data.published ? 1 : 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  },
};
