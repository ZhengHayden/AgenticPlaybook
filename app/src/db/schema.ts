import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * One row per project. The full `Project` object is stored as JSON in `data`
 * (the source of truth). A handful of columns are denormalized out of the blob
 * so the projects list/filter query never has to parse every row.
 *
 * The denormalized columns are derived from `data` on every write — never edited
 * independently. See {@link file://./projects-repo.ts}.
 */
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  client: text("client").notNull(),
  domain: text("domain").notNull(),
  status: text("status", { enum: ["active", "archived"] }).notNull(),
  updatedAt: integer("updated_at").notNull(), // epoch millis
  data: text("data").notNull(), // JSON-serialized Project
});

export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
