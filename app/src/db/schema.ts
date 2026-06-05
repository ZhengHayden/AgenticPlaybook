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

/**
 * One row per grouping level of the Knowledge library (Sector / Industry /
 * Company / Function / Workflow). The full object is stored as JSON in `data`;
 * `type`, `parentId` and `sort` are denormalized for cheap tree assembly.
 */
export const knowledgeTaxonomy = sqliteTable("knowledge_taxonomy", {
  id: text("id").primaryKey(),
  type: text("type", {
    enum: ["sector", "industry", "company", "function", "workflow"],
  }).notNull(),
  parentId: text("parent_id"), // null for sectors
  sort: integer("sort").notNull(),
  data: text("data").notNull(), // JSON-serialized level object
});

export type KnowledgeTaxonomyRow = typeof knowledgeTaxonomy.$inferSelect;
export type NewKnowledgeTaxonomyRow = typeof knowledgeTaxonomy.$inferInsert;

/**
 * One row per library use case (the leaf). The full {@link KnowledgeUseCase} is
 * stored as JSON in `data`; parent ids and a few filter columns are derived from
 * it on every write — never edited independently. See {@link file://./knowledge-repo.ts}.
 */
export const knowledgeUseCases = sqliteTable("knowledge_use_cases", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id").notNull(),
  sectorId: text("sector_id").notNull(),
  industryId: text("industry_id").notNull(),
  companyId: text("company_id").notNull(),
  functionId: text("function_id").notNull(),
  maturity: text("maturity").notNull(),
  techTag: text("tech_tag").notNull(),
  name: text("name").notNull(),
  validationStatus: text("validation_status").notNull(),
  data: text("data").notNull(), // JSON-serialized KnowledgeUseCase
});

export type KnowledgeUseCaseRow = typeof knowledgeUseCases.$inferSelect;
export type NewKnowledgeUseCaseRow = typeof knowledgeUseCases.$inferInsert;

/**
 * One row per knowledge artifact. The full {@link KnowledgeArtifact} is stored
 * as JSON in `data`; `use_case_id`, `kind`, `type`, `status` and `updated_at`
 * are denormalized for cheap listing/filtering — never edited independently.
 */
export const knowledgeArtifacts = sqliteTable("knowledge_artifacts", {
  id: text("id").primaryKey(),
  useCaseId: text("use_case_id").notNull(),
  kind: text("kind", { enum: ["file", "link"] }).notNull(),
  type: text("type").notNull(),
  status: text("status", { enum: ["draft", "published", "deprecated"] }).notNull(),
  updatedAt: integer("updated_at").notNull(),
  data: text("data").notNull(), // JSON-serialized KnowledgeArtifact
});

export type KnowledgeArtifactRow = typeof knowledgeArtifacts.$inferSelect;
export type NewKnowledgeArtifactRow = typeof knowledgeArtifacts.$inferInsert;
