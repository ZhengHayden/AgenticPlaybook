import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const DB_PATH = process.env.PLAYBOOK_DB_PATH ?? path.resolve(process.cwd(), "data/playbook.db");

function createConnection() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  // Bootstrap the schema so the app works from a fresh `npm run dev` with no
  // migration step. drizzle-kit (`npm run db:push`) remains available for
  // managed migrations as the app grows.
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      client TEXT NOT NULL,
      domain TEXT NOT NULL,
      status TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS knowledge_taxonomy (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      parent_id TEXT,
      sort INTEGER NOT NULL,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS knowledge_use_cases (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      sector_id TEXT NOT NULL,
      industry_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      function_id TEXT NOT NULL,
      maturity TEXT NOT NULL,
      tech_tag TEXT NOT NULL,
      name TEXT NOT NULL,
      validation_status TEXT NOT NULL,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS knowledge_artifacts (
      id TEXT PRIMARY KEY,
      use_case_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      data TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_artifacts_use_case ON knowledge_artifacts(use_case_id);
  `);
  return drizzle(sqlite, { schema });
}

// Next.js dev HMR re-imports modules on every change; caching the connection on
// globalThis prevents reopening the SQLite file (and leaking handles) each reload.
type DbConnection = ReturnType<typeof createConnection>;
const globalForDb = globalThis as unknown as { __playbookDb?: DbConnection };

export const db: DbConnection = globalForDb.__playbookDb ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__playbookDb = db;
}
