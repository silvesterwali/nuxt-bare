import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";

// ── Database path (mirrors drizzle.config.ts) ──────────────────────────
const dbPath =
  process.env.NODE_ENV === "test" ? "./database.test.db" : "./database.db";

// ── Connection ──────────────────────────────────────────────────────────
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

// ── Drizzle instance ────────────────────────────────────────────────────
export const useDb = drizzle(sqlite, { schema });

// ── Re-export schema for convenience ────────────────────────────────────
export { schema };

// ── Inferred types ──────────────────────────────────────────────────────
export type Database = typeof useDb;
