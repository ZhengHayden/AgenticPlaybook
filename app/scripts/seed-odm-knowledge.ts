/**
 * Inject the ODM branch of the Knowledge library into an existing database, and
 * attach each source deep-dive markdown as a sanitized, downloadable artifact.
 *
 * `ensureKnowledgeSeeded()` only seeds a fresh DB, so an existing DB never picks
 * up a newly-added branch. This back-fills idempotently (INSERT OR IGNORE) and
 * is safe to re-run. ODM shares the existing `tmt` sector, so taxonomy/use-cases
 * are scoped by the `tmt-odm` industry — never by sector.
 *
 * Run with: `npx tsx scripts/seed-odm-knowledge.ts`
 */
import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { knowledgeSeed } from "../src/content/knowledge-seed";
import { writeArtifactFile } from "../src/lib/artifact-storage";
import type {
  Company,
  Industry,
  KnowledgeUseCase,
  LibraryFunction,
  LibraryWorkflow,
} from "../src/content/knowledge";
import type { ArtifactType, ArtifactStatus, ArtifactKind } from "../src/content/knowledge-artifacts";

const INDUSTRY_ID = "tmt-odm";
const DB_PATH = process.env.PLAYBOOK_DB_PATH ?? path.resolve(process.cwd(), "data/playbook.db");
const SRC_DIR = path.resolve(process.cwd(), "data/odm/use-cases");

const sanitize = (s: string): string =>
  s.replace(/Compal Electronics/g, "Apex Electronics (ODM)").replace(/Compal/g, "Apex Electronics");

const SOURCE_FILES: Record<string, string> = {
  "odm-uc-01": "01-agentic-material-planning-demand-supply.md",
  "odm-uc-02": "02-agentic-production-scheduling-control.md",
  "odm-uc-03": "03-genai-engineering-change-impact-analysis.md",
  "odm-uc-04": "04-agentic-npi-phase-gate-orchestration.md",
  "odm-uc-05": "05-agentic-supplier-risk-performance.md",
  "odm-uc-06": "06-genai-rfq-response-should-cost.md",
  "odm-uc-07": "07-agentic-yield-optimization-process-engineering.md",
  "odm-uc-08": "08-genai-quality-defect-analysis-8d.md",
  "odm-uc-09": "09-agentic-purchase-order-shortage-prediction.md",
  "odm-uc-10": "10-genai-engineering-knowledge-copilot.md",
};

type TaxonomyType = "sector" | "industry" | "company" | "function" | "workflow";

interface TaxonomyInsert {
  id: string;
  type: TaxonomyType;
  parentId: string | null;
  sort: number;
  data: unknown;
}

interface OdmArtifact {
  id: string;
  useCaseId: string;
  title: string;
  kind: ArtifactKind;
  type: ArtifactType;
  status: ArtifactStatus;
  owner: string;
  createdAt: number;
  updatedAt: number;
  file: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    storagePath: string;
  };
  changelog: Array<{ at: number; author: string; note: string }>;
}

function buildTaxonomyRows(): TaxonomyInsert[] {
  const { industries, companies, functions, workflows } = knowledgeSeed;

  const industry = industries.filter((i: Industry) => i.id === INDUSTRY_ID);
  const company = companies.filter((c: Company) => c.industryId === INDUSTRY_ID);
  const companyIds = new Set(company.map((c) => c.id));
  const fns = functions.filter((f: LibraryFunction) => companyIds.has(f.companyId));
  const fnIds = new Set(fns.map((f) => f.id));
  const flows = workflows.filter((w: LibraryWorkflow) => fnIds.has(w.functionId));

  return [
    ...industry.map((i): TaxonomyInsert => ({ id: i.id, type: "industry", parentId: i.sectorId, sort: i.sort, data: i })),
    ...company.map((c): TaxonomyInsert => ({ id: c.id, type: "company", parentId: c.industryId, sort: c.sort, data: c })),
    ...fns.map((f): TaxonomyInsert => ({ id: f.id, type: "function", parentId: f.companyId, sort: f.sort, data: f })),
    ...flows.map((w): TaxonomyInsert => ({ id: w.id, type: "workflow", parentId: w.functionId, sort: w.sort, data: w })),
  ];
}

async function buildArtifact(uc: KnowledgeUseCase, ts: number): Promise<OdmArtifact | null> {
  const fileName = SOURCE_FILES[uc.id];
  if (!fileName) return null;

  const srcPath = path.join(SRC_DIR, fileName);
  if (!fs.existsSync(srcPath)) return null;

  const bytes = Buffer.from(sanitize(fs.readFileSync(srcPath, "utf8")), "utf8");
  const artifactId = `odm-art-${uc.id.slice(-2)}`;
  const storagePath = await writeArtifactFile(uc.id, artifactId, fileName, bytes);

  return {
    id: artifactId,
    useCaseId: uc.id,
    title: `${uc.name} — Deep Dive`,
    kind: "file",
    type: "playbook",
    status: "published",
    owner: "ODM Reference Library",
    createdAt: ts,
    updatedAt: ts,
    file: {
      fileName,
      mimeType: "text/markdown",
      sizeBytes: bytes.length,
      storagePath,
    },
    changelog: [
      {
        at: ts,
        author: "ODM Reference Library",
        note: "Imported from ODM deep-dive library",
      },
    ],
  };
}

async function main(): Promise<void> {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const taxonomyRows = buildTaxonomyRows();
  const useCases = knowledgeSeed.useCases.filter((uc: KnowledgeUseCase) => uc.industryId === INDUSTRY_ID);

  if (taxonomyRows.length === 0 || useCases.length === 0) {
    throw new Error(`No '${INDUSTRY_ID}' branch found in knowledgeSeed — nothing to seed.`);
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

  const insertArtifact = db.prepare(
    `INSERT OR IGNORE INTO knowledge_artifacts (id, use_case_id, kind, type, status, updated_at, data)
     VALUES (@id, @useCaseId, @kind, @type, @status, @updatedAt, @data)`,
  );

  const ts = Date.now();
  const built = await Promise.all(useCases.map((uc) => buildArtifact(uc, ts)));
  const artifacts = built.filter((a): a is OdmArtifact => a !== null);

  const run = db.transaction(() => {
    let tax = 0;
    for (const row of taxonomyRows) {
      tax += insertTaxonomy.run({ ...row, data: JSON.stringify(row.data) }).changes;
    }

    let uc = 0;
    for (const u of useCases) {
      uc += insertUseCase.run({
        id: u.id,
        workflowId: u.workflowId,
        sectorId: u.sectorId,
        industryId: u.industryId,
        companyId: u.companyId,
        functionId: u.functionId,
        maturity: u.maturity,
        techTag: u.techTag,
        name: u.name,
        validationStatus: u.validation.status,
        data: JSON.stringify(u),
      }).changes;
    }

    let art = 0;
    for (const a of artifacts) {
      art += insertArtifact.run({
        id: a.id,
        useCaseId: a.useCaseId,
        kind: a.kind,
        type: a.type,
        status: a.status,
        updatedAt: a.updatedAt,
        data: JSON.stringify(a),
      }).changes;
    }

    return { tax, uc, art };
  });

  const { tax, uc, art } = run();
  db.close();

  console.log(
    `ODM knowledge branch seeded into ${DB_PATH}\n` +
      `  taxonomy rows inserted: ${tax}/${taxonomyRows.length}\n` +
      `  use cases inserted:     ${uc}/${useCases.length}\n` +
      `  artifacts inserted:     ${art}/${artifacts.length}\n` +
      `  (already-present rows are skipped via INSERT OR IGNORE)`,
  );
}

main();
