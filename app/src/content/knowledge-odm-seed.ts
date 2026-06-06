import { DEFAULT_VALIDATION } from "./knowledge";
import type {
  Company,
  Industry,
  KnowledgeBranch,
  LibraryFunction,
  LibraryWorkflow,
  Sector,
  UseCaseSeed,
} from "./knowledge";

/**
 * ODM (electronics contract manufacturing) branch of the Agentic Use Case
 * Library. Ported from `app/data/odm/use-cases/*.md` — 10 prioritized agentic /
 * GenAI use cases for a Tier-1 ODM. Source is Compal-specific; this branch is
 * sanitized to a reference company, "Apex Electronics (ODM)".
 *
 * Reuses the existing TMT sector (no sector row declared here).
 * Browse tree (5 functions → 5 workflows → 10 use cases):
 *   Procurement & Supply Chain → Procurement & Supply Chain Orchestration
 *   Manufacturing Operations   → Production & Process Operations
 *   R&D / Engineering          → Engineering & NPI
 *   Sales & Commercial         → Customer Program & RFQ Management
 *   Quality Assurance & Service→ Quality & Service Resolution
 */

// ─── Sector / Industry / Company ──────────────────────────────
// TMT sector already exists in the base seed; do not re-declare it.
const sectors: Sector[] = [];

const industries: Industry[] = [
  { id: "tmt-odm", sectorId: "tmt", name: { en: "ODM / Electronics Manufacturing", zh: "ODM / 电子制造" }, sort: 1 },
];

const companies: Company[] = [
  { id: "apex-odm", industryId: "tmt-odm", name: "Apex Electronics (ODM)", sort: 0 },
];

// ─── Functions ────────────────────────────────────────────────
const functions: LibraryFunction[] = [
  { id: "odm-fn-proc", companyId: "apex-odm", name: { en: "Procurement & Supply Chain", zh: "采购与供应链" }, color: "#1565c0", sort: 0 },
  { id: "odm-fn-mfg", companyId: "apex-odm", name: { en: "Manufacturing Operations", zh: "制造运营" }, color: "#b45309", sort: 1 },
  { id: "odm-fn-rnd", companyId: "apex-odm", name: { en: "R&D / Engineering", zh: "研发 / 工程" }, color: "#7c3aed", sort: 2 },
  { id: "odm-fn-sales", companyId: "apex-odm", name: { en: "Sales & Commercial", zh: "销售与商务" }, color: "#0d9488", sort: 3 },
  { id: "odm-fn-qa", companyId: "apex-odm", name: { en: "Quality Assurance & Service", zh: "质量保证与服务" }, color: "#be123c", sort: 4 },
];

// ─── Workflows (one per function) ─────────────────────────────
const workflows: LibraryWorkflow[] = [
  { id: "odm-wf-proc", functionId: "odm-fn-proc", name: "Procurement & Supply Chain Orchestration", description: "Agentic material planning, supplier risk, and PO execution across multi-customer ODM programs.", color: "#1565c0", squadHint: "Supply chain + data science", sort: 0 },
  { id: "odm-wf-mfg", functionId: "odm-fn-mfg", name: "Production & Process Operations", description: "Agentic production scheduling and yield optimization across shared lines and OEM programs.", color: "#b45309", squadHint: "Manufacturing engineering + MES", sort: 1 },
  { id: "odm-wf-rnd", functionId: "odm-fn-rnd", name: "Engineering & NPI", description: "GenAI engineering-change analysis, NPI phase-gate orchestration, and an engineering knowledge copilot.", color: "#7c3aed", squadHint: "R&D + PLM", sort: 2 },
  { id: "odm-wf-sales", functionId: "odm-fn-sales", name: "Customer Program & RFQ Management", description: "GenAI RFQ response and should-cost analysis for customer design wins.", color: "#0d9488", squadHint: "Sales engineering + cost", sort: 3 },
  { id: "odm-wf-qa", functionId: "odm-fn-qa", name: "Quality & Service Resolution", description: "GenAI defect analysis and 8D automation across inline inspection and customer quality.", color: "#be123c", squadHint: "Quality + service", sort: 4 },
];

// ─── Use cases ────────────────────────────────────────────────
const useCaseSeeds: UseCaseSeed[] = [];

export const odmBranch: KnowledgeBranch = {
  sectors,
  industries,
  companies,
  functions,
  workflows,
  useCaseSeeds,
};
