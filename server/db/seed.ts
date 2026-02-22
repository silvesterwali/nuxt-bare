import { db, schema } from "./index";
import { faker } from "@faker-js/faker";
import { Hash } from "@adonisjs/hash";
import { Scrypt } from "@adonisjs/hash/drivers/scrypt";

const scrypt = new Scrypt({
  cost: 16384,
  blockSize: 8,
  parallelization: 1,
  saltSize: 16,
  keyLength: 64,
  maxMemory: 33554432,
});
const hash = new Hash(scrypt);

async function hashPassword(password: string) {
  return await hash.make(password);
}

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Clear existing data
    await db.delete(schema.posts);
    await db.delete(schema.userProfiles);
    await db.delete(schema.users);

    // Generate 10 fake users
    const usersData = await Promise.all(
      Array.from({ length: 10 }).map(async () => ({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: await hashPassword("password"),
        role: faker.helpers.arrayElement(["user", "admin", "moderator"]),
        emailVerified: faker.datatype.boolean(),
        isActive: faker.datatype.boolean(),
        createdAt: faker.date.past(),
        updatedAt: new Date(),
      })),
    );

    // Add a consistent super admin user
    usersData.push({
      name: "Super Admin",
      email: "superadmin@gmail.com",
      password: await hashPassword("password"),
      role: "admin",
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Insert users
    const sampleUsers = await db.insert(schema.users).values(usersData).returning();

    console.log(`✅ Inserted ${sampleUsers.length} users`);

    // Insert user profiles
    const profilesData = sampleUsers.map((user) => {
      const nameParts = user.name.split(" ");
      const firstName = nameParts[0] || "Unknown";
      const lastName = nameParts.slice(1).join(" ") || "User";

      return {
        userId: user.id,
        firstName,
        lastName,
        bio: faker.person.bio(),
        avatar: faker.image.avatar(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });

    await db.insert(schema.userProfiles).values(profilesData);
    console.log(`✅ Inserted ${profilesData.length} profiles`);

    // Insert sample posts
    const postsData = Array.from({ length: 20 }).map(() => ({
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(),
      userId: faker.helpers.arrayElement(sampleUsers).id,
      published: faker.datatype.boolean() ? 1 : 0,
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    }));

    await db.insert(schema.posts).values(postsData);
    console.log(`✅ Inserted ${postsData.length} posts`);

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch(console.error);
}

export default seed;
