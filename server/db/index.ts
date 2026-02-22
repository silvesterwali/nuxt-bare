import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Database connection
const dbPath = process.env.NODE_ENV === "test" ? "./database.test.db" : "./database.db";
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export schema for use in API routes
export { schema };
