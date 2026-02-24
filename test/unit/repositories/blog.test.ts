import { describe, it, expect, beforeAll } from "vitest";
import { db, schema } from "../../../server/db";
import { postRepository } from "../../../server/utils/post/repository";

describe("Blog Repository - Multi-language CRUD", () => {
  let testUserId: number;

  beforeAll(async () => {
    // Clean test data - tables already exist from globalSetup
    try {
      await db.delete(schema.posts);
      await db.delete(schema.users);
    } catch (e: any) {
      console.log("[test] Cleanup note:", e.message);
    }

    // Create a test user for blog posts
    const user = await db
      .insert(schema.users)
      .values({
        name: "Test Admin",
        email: "admin@test.com",
        password: "hashed_password",
        role: "admin",
        emailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    testUserId = user[0].id;
  });

  it("should create a post with English content", async () => {
    const newPost = await postRepository.create({
      slug: { en: "hello-world" },
      title: { en: "Hello World" },
      shortDescription: { en: "A test post" },
      content: { en: "This is the English content" },
      userId: testUserId,
      status: "draft",
    });

    expect(newPost).toBeDefined();
    expect(newPost.id).toBeGreaterThan(0);
    expect(newPost.slug.en).toBe("hello-world");
    expect(newPost.title.en).toBe("Hello World");
    expect(newPost.content.en).toBe("This is the English content");
  });

  it("should update post with Indonesian content while keeping English", async () => {
    const newPost = await postRepository.create({
      slug: { en: "update-test" },
      title: { en: "Update Test" },
      content: { en: "English content" },
      userId: testUserId,
    });

    const updated = await postRepository.update(newPost.id, {
      slug: { en: "update-test", id: "uji-perbaruan" },
      title: { en: "Update Test", id: "Uji Perbaruan" },
      content: { en: "English content", id: "Konten Indonesia" },
    });

    expect(updated.slug.en).toBe("update-test");
    expect(updated.slug.id).toBe("uji-perbaruan");
    expect(updated.title.en).toBe("Update Test");
    expect(updated.title.id).toBe("Uji Perbaruan");
    expect(updated.content.en).toBe("English content");
    expect(updated.content.id).toBe("Konten Indonesia");
  });

  it("should fetch post by ID and return all language versions", async () => {
    const newPost = await postRepository.create({
      slug: { en: "fetch-test", id: "tes-ambil" },
      title: { en: "Fetch Test", id: "Tes Ambil" },
      content: { en: "English fetch", id: "Pengambilan Indonesia" },
      userId: testUserId,
    });

    const post = await postRepository.findById(newPost.id);

    expect(post).toBeDefined();
    expect(post?.slug).toHaveProperty("en");
    expect(post?.slug).toHaveProperty("id");
    expect(post?.title.en).toBe("Fetch Test");
    expect(post?.title.id).toBe("Tes Ambil");
  });

  it("should fetch all posts", async () => {
    await postRepository.create({
      slug: { en: "list-test" },
      title: { en: "List Test" },
      content: { en: "Listed content" },
      userId: testUserId,
    });

    const posts = await postRepository.findAll();

    expect(posts).toBeDefined();
    expect(posts.length).toBeGreaterThan(0);

    const listPost = posts.find((p: any) => p.title.en === "List Test");
    expect(listPost).toBeDefined();
  });

  it("should update only Indonesian content without affecting English", async () => {
    const newPost = await postRepository.create({
      slug: { en: "partial-update" },
      title: { en: "Partial Update" },
      content: { en: "Only English" },
      userId: testUserId,
    });

    const updated = await postRepository.update(newPost.id, {
      title: { en: "Partial Update", id: "Perbaruan Sebagian" },
    });

    expect(updated.title.en).toBe("Partial Update");
    expect(updated.title.id).toBe("Perbaruan Sebagian");
    expect(updated.slug.en).toBe("partial-update");
  });

  it("should have separate language fields as objects", async () => {
    const newPost = await postRepository.create({
      slug: { en: "lang-test", id: "tes-bahasa" },
      title: { en: "Lang Test", id: "Tes Bahasa" },
      content: { en: "English lang", id: "Bahasa Indonesia" },
      userId: testUserId,
    });

    const post = await postRepository.findById(newPost.id);

    expect(post?.slug).toEqual(
      expect.objectContaining({
        en: expect.any(String),
        id: expect.any(String),
      }),
    );
    expect(post?.title).toEqual(
      expect.objectContaining({
        en: expect.any(String),
        id: expect.any(String),
      }),
    );
    expect(post?.content).toEqual(
      expect.objectContaining({
        en: expect.any(String),
        id: expect.any(String),
      }),
    );
  });

  it("should delete post", async () => {
    const newPost = await postRepository.create({
      slug: { en: "delete-test" },
      title: { en: "Delete Test" },
      content: { en: "To be deleted" },
      userId: testUserId,
    });

    await postRepository.destroy(newPost.id);

    const deleted = await postRepository.findById(newPost.id);
    expect(deleted).toBeUndefined();
  });

  it("should create multiple posts in different languages and retrieve all", async () => {
    const post1 = await postRepository.create({
      slug: { en: "first-post" },
      title: { en: "First Post" },
      content: { en: "First English" },
      userId: testUserId,
    });

    const post2 = await postRepository.create({
      slug: { id: "posting-kedua" },
      title: { id: "Posting Kedua" },
      content: { id: "Konten Indonesia Kedua" },
      userId: testUserId,
    });

    const allPosts = await postRepository.findAll();
    const retrieved1 = allPosts.find((p: any) => p.id === post1.id);
    const retrieved2 = allPosts.find((p: any) => p.id === post2.id);

    expect(retrieved1?.slug.en).toBe("first-post");
    expect(retrieved2?.slug.id).toBe("posting-kedua");

    // Cleanup
    await postRepository.destroy(post1.id);
    await postRepository.destroy(post2.id);
  });
});
