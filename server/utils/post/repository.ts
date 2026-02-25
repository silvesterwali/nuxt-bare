import { eq, desc } from "drizzle-orm";
import { db, schema } from "../../db";

export const postRepository = {
  async findAll() {
    const posts = await db
      .select({
        id: schema.posts.id,
        slug: schema.posts.slug,
        title: schema.posts.title,
        shortDescription: schema.posts.shortDescription,
        content: schema.posts.content,
        status: schema.posts.status,
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

  async findById(id: number) {
    const post = await db.query.posts.findFirst({
      where: eq(schema.posts.id, id),
    });
    return post;
  },

  async create(data: {
    slug: Record<string, string>;
    title: Record<string, string>;
    shortDescription?: Record<string, string>;
    content: Record<string, string>;
    userId: number;
    status?: "draft" | "published" | "archived";
  }) {
    const result = await db
      .insert(schema.posts)
      .values({
        slug: data.slug,
        title: data.title,
        shortDescription: data.shortDescription,
        content: data.content,
        userId: data.userId,
        status: data.status || "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  },

  async update(
    id: number,
    data: {
      slug?: Record<string, string>;
      title?: Record<string, string>;
      shortDescription?: Record<string, string>;
      content?: Record<string, string>;
      status?: "draft" | "published" | "archived";
    },
  ) {
    const result = await db
      .update(schema.posts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.posts.id, id))
      .returning();

    return result[0];
  },

  async destroy(id: number) {
    const result = await db
      .delete(schema.posts)
      .where(eq(schema.posts.id, id))
      .returning();
    return result[0];
  },
};
