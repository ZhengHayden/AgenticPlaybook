import path from "node:path";
import { defineConfig } from "drizzle-kit";

const dbPath = process.env.PLAYBOOK_DB_PATH ?? path.resolve(process.cwd(), "data/playbook.db");

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: dbPath },
});
