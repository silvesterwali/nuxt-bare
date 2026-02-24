import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import * as schema from "../server/db/schema";

export default async function setup() {
  process.env.NODE_ENV = "test";
  
  // Delete existing test database to start fresh
  const dbPath = "./database.test.db";
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  // Also clean up WAL files
  if (fs.existsSync(`${dbPath}-wal`)) {
    fs.unlinkSync(`${dbPath}-wal`);
  }
  if (fs.existsSync(`${dbPath}-shm`)) {
    fs.unlinkSync(`${dbPath}-shm`);
  }
  
  try {
    // Connect to test database with WAL mode
    const sqlite = new Database(dbPath);
    
    // Enable WAL mode immediately
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("synchronous = NORMAL");
    
    // Read and execute migration files directly
    const migrationsDir = "./server/db/migrations";
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`[test-setup] Found ${files.length} migration files`);
    
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      // Split by statement breakpoint
      const statements = sql
        .split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      console.log(`[test-setup] Executing ${statements.length} statements from ${file}`);
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
          sqlite.exec(stmt);
        } catch (err) {
          console.error(`[test-setup] Failed to execute statement ${i + 1}:`, err);
          throw err;
        }
      }
    }
    
    // Verify tables were created
    const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log(`[test-setup] Created ${tables.length} tables:`, tables.map((t: any) => t.name).join(', '));
    
    // Checkpoint WAL and close properly
    sqlite.exec("PRAGMA wal_checkpoint(RESTART);");
    sqlite.close();
    console.log('[test-setup] Migrations completed successfully');
  } catch (error) {
    console.error("[test-setup] Migration failed:", error);
    throw error;
  }
}
