/**
 * Inject the Energy & Utilities branch of the Knowledge library into an existing
 * database.
 *
 * `ensureKnowledgeSeeded()` only seeds a *fresh* (empty) database, so a DB that
 * already holds the TMT/Vodafone seed will never pick up a newly-added branch.
 * This script back-fills the utility branch idempotently (INSERT OR IGNORE), so
 * it is safe to re-run and will not resurrect use cases the user has deleted
 * beyond the branch's own seed ids.
 *
 * Source of truth is `knowledgeSeed` (see `src/content/knowledge-utility-seed.ts`),
 * filtered to the `energy-utilities` sector so the script and the bundled seed
 * can never drift.
 *
 * Run with: `npx tsx scripts/seed-utility-knowledge.ts`
 */
import path from "node:path";
import Database from "better-sqlite3";
import { knowledgeSeed } from "../src/content/knowledge-seed";
import type {
  Company,
  Industry,
  KnowledgeUseCase,
  LibraryFunction,
  LibraryWorkflow,
  Sector,
} from "../src/content/knowledge";

const SECTOR_ID = "energy-utilities";
const DB_PATH = process.env.PLAYBOOK_DB_PATH ?? path.resolve(process.cwd(), "data/playbook.db");

type TaxonomyType = "sector" | "industry" | "company" | "function" | "workflow";

interface TaxonomyInsert {
  id: string;
  type: TaxonomyType;
  parentId: string | null;
  sort: number;
  data: unknown;
}

function buildTaxonomyRows(): TaxonomyInsert[] {
  const { sectors, industries, companies, functions, workflows } = knowledgeSeed;

  const sector = sectors.filter((s: Sector) => s.id === SECTOR_ID);
  const industry = industries.filter((i: Industry) => i.sectorId === SECTOR_ID);
  const industryIds = new Set(industry.map((i) => i.id));
  const company = companies.filter((c: Company) => industryIds.has(c.industryId));
  const companyIds = new Set(company.map((c) => c.id));
  const fns = functions.filter((f: LibraryFunction) => companyIds.has(f.companyId));
  const fnIds = new Set(fns.map((f) => f.id));
  const flows = workflows.filter((w: LibraryWorkflow) => fnIds.has(w.functionId));

  return [
    ...sector.map((s): TaxonomyInsert => ({ id: s.id, type: "sector", parentId: null, sort: s.sort, data: s })),
    ...industry.map((i): TaxonomyInsert => ({ id: i.id, type: "industry", parentId: i.sectorId, sort: i.sort, data: i })),
    ...company.map((c): TaxonomyInsert => ({ id: c.id, type: "company", parentId: c.industryId, sort: c.sort, data: c })),
    ...fns.map((f): TaxonomyInsert => ({ id: f.id, type: "function", parentId: f.companyId, sort: f.sort, data: f })),
    ...flows.map((w): TaxonomyInsert => ({ id: w.id, type: "workflow", parentId: w.functionId, sort: w.sort, data: w })),
  ];
}

function main(): void {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const taxonomyRows = buildTaxonomyRows();
  const useCases = knowledgeSeed.useCases.filter((uc: KnowledgeUseCase) => uc.sectorId === SECTOR_ID);

  if (taxonomyRows.length === 0 || useCases.length === 0) {
    throw new Error(`No '${SECTOR_ID}' branch found in knowledgeSeed — nothing to seed.`);
  }

  const insertTaxonomy = db.prepare(
    `INSERT OR IGNORE INTO knowledge_taxonomy (id, type, parent_id, sort, data)
     VALUES (@id, @type, @parentId, @sort, @data)`,
  );
  const insertUseCase = db.prepare(
    `INSERT OR IGNORE INTO knowledge_use_cases
       (id, workflow_id, sector_id, industry_id, company_id, function_id,
        maturity, tech_tag, name, validation_status, data)
     VALUES (@id, @workflowId, @sectorId, @industryId, @companyId, @functionId,
        @maturity, @techTag, @name, @validationStatus, @data)`,
  );

  const run = db.transaction(() => {
    let taxonomyInserted = 0;
    for (const row of taxonomyRows) {
      const res = insertTaxonomy.run({ ...row, data: JSON.stringify(row.data) });
      taxonomyInserted += res.changes;
    }
    let useCasesInserted = 0;
    for (const uc of useCases) {
      const res = insertUseCase.run({
        id: uc.id,
        workflowId: uc.workflowId,
        sectorId: uc.sectorId,
        industryId: uc.industryId,
        companyId: uc.companyId,
        functionId: uc.functionId,
        maturity: uc.maturity,
        techTag: uc.techTag,
        name: uc.name,
        validationStatus: uc.validation.status,
        data: JSON.stringify(uc),
      });
      useCasesInserted += res.changes;
    }
    return { taxonomyInserted, useCasesInserted };
  });

  const { taxonomyInserted, useCasesInserted } = run();
  db.close();

  console.log(
    `Utility knowledge branch seeded into ${DB_PATH}\n` +
      `  taxonomy rows inserted: ${taxonomyInserted}/${taxonomyRows.length}\n` +
      `  use cases inserted:     ${useCasesInserted}/${useCases.length}\n` +
      `  (already-present rows are skipped via INSERT OR IGNORE)`,
  );
}

main();
