/**
 * Seed the "ODM Agentic Transformation" golden example project.
 *
 * Reads `data/ODM_agentic_adoption_benchmark.json` (51 process records, each
 * with 1–2 reference use cases) and populates the existing
 * `odm-agentic-transformation` project with:
 *   - one workflow (Candidate) per record — businessFunction = function,
 *     pain derived from adoption_potential, all 6 readiness gates passed so the
 *     project is fully navigable end-to-end;
 *   - one ProjectUseCase per benchmark use case — a synthesized short name and a
 *     one-sentence description, with impactRationale = kpi_evidence + reference.
 *
 * Everything else on the project (name, client, variants, …) is preserved.
 * Writes directly to SQLite so it runs outside the Next.js runtime.
 *
 * Run with: `npx tsx scripts/seed-odm-golden.ts`
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { makeBlankCandidate } from "../src/content/candidate-factory";
import { screenCriteria } from "../src/content/binary-screen";
import type { Candidate, ProjectUseCase, ScreenAnswers } from "../src/content/sample-data";

const PROJECT_ID = "odm-agentic-transformation";
const DATA_FILE = path.resolve(process.cwd(), "data/ODM_agentic_adoption_benchmark.json");
const DB_PATH = process.env.PLAYBOOK_DB_PATH ?? path.resolve(process.cwd(), "data/playbook.db");

interface BenchmarkUseCase {
  use_case: string;
  reference: string;
  kpi_evidence: string;
}
interface BenchmarkRecord {
  id: number;
  function: string;
  process: string;
  adoption_potential: "High" | "Medium" | "Low";
  use_cases: BenchmarkUseCase[];
}

/** Synthesized `{ name, description }` per use case, keyed `${recordId}#${useCaseIndex}`. */
const SUMMARIES: Record<string, { name: string; description: string }> = {
  "1#0": { name: "NPI Gate Coordination Agent", description: "Autonomously tracks NPI milestones and coordinates cross-functional readiness across the CPE→DVT→PVT→MP gates." },
  "1#1": { name: "Trial-Production Scheduler", description: "Schedules trial production and allocates resources across concurrent NPI programs." },
  "2#0": { name: "Generative DFM/DFA Optimizer", description: "Generative-design agent that checks mechanical and electrical designs against manufacturing constraints to optimize manufacturability." },
  "2#1": { name: "Spec Interpretation Copilot", description: "Interprets OEM customer specifications and maintains requirement traceability." },
  "3#0": { name: "Test-Matrix Planning Agent", description: "Generates DVT/PVT test matrices from design specs and historical failure modes." },
  "3#1": { name: "Test Anomaly Analyzer", description: "Analyzes reliability-test results and detects anomalies to speed root-cause identification." },
  "4#0": { name: "Agentic DFM Reviewer", description: "Scans CAD/EDA outputs against process capabilities and suggests manufacturability redesigns." },
  "4#1": { name: "Production-Transfer Readiness Agent", description: "Validates tooling, jig, and fixture completeness before pilot production runs." },
  "5#0": { name: "ECN/ECO Impact Analyzer", description: "Maps engineering change requests across BOM, tooling, test cases, and supplier artifacts for impact analysis." },
  "5#1": { name: "Change Routing Orchestrator", description: "Automates change routing, stakeholder identification, and approval orchestration in PLM." },
  "6#0": { name: "Component Alternate-Sourcing Agent", description: "Proposes parametric-fit substitutes for EOL or short components and checks BOM/AVL impact." },
  "6#1": { name: "BOM Consistency Validator", description: "Validates BOM consistency across PLM, ERP, and manufacturing systems." },
  "7#0": { name: "VAVE Opportunity Finder", description: "Analyzes BOM cost, yield, and market pricing to surface value-engineering cost-reduction candidates." },
  "7#1": { name: "Yield Improvement Agent", description: "Correlates process parameters with defect data to recommend recipe adjustments that lift yield." },
  "8#0": { name: "Multi-Program Scheduling Agent", description: "Dynamically reallocates production capacity across customer orders based on demand signals." },
  "8#1": { name: "Real-Time WIP Balancer", description: "Monitors line flow and triggers rebalancing when bottlenecks form." },
  "9#0": { name: "SMT Line Optimization Agent", description: "Controls feeder setup, program selection, and changeover sequencing on SMT lines." },
  "9#1": { name: "Closed-Loop SMT Quality Agent", description: "Adjusts reflow profiles and placement parameters from real-time SPI/AOI feedback." },
  "10#0": { name: "Vision Line-Balancing Agent", description: "Uses computer vision to measure cycle times and redistribute tasks for better line balance." },
  "10#1": { name: "Digital-Twin Layout Optimizer", description: "Reconfigures factory-floor layout via digital-twin simulation to cut material travel." },
  "11#0": { name: "Yield Prediction Agent", description: "Correlates process parameters with output quality to predict and prevent yield excursions." },
  "11#1": { name: "Rework Routing Optimizer", description: "Routes defective units through optimal rework paths based on defect classification." },
  "12#0": { name: "Robotic Cell Programming Agent", description: "Generates robot paths and gripper configurations directly from CAD models." },
  "12#1": { name: "IIoT Sensor Orchestrator", description: "Monitors edge devices, detects anomalies, and triggers preventive actions across IIoT sensors." },
  "13#0": { name: "Material Staging Agent", description: "Coordinates AGV/AMR dispatch, line-side delivery timing, and kitting sequences to the production schedule." },
  "13#1": { name: "Kit BOM Verification Agent", description: "Cross-checks physical kits against the production BOM before line release." },
  "14#0": { name: "Strategic Sourcing Agent", description: "Scans spend, market intelligence, and supplier data to recommend category strategies and negotiation positions." },
  "14#1": { name: "Supplier Discovery & Qualification Agent", description: "Identifies new suppliers, checks compliance, and benchmarks pricing automatically." },
  "15#0": { name: "Demand-Aware MRP Agent", description: "Dynamically adjusts MRP parameters to forecast, lead-time, and allocation changes." },
  "15#1": { name: "Real-Time ATP Optimizer", description: "Recalculates available-to-promise in real time across customer programs and component pools." },
  "16#0": { name: "Autonomous PO Agent", description: "Generates, validates, and dispatches purchase orders from MRP output and approval rules." },
  "16#1": { name: "Proactive Expediting Agent", description: "Monitors supplier delivery status and escalates delays before they impact production." },
  "17#0": { name: "Supplier Scorecard Agent", description: "Auto-collects performance data, generates scorecards, and flags deteriorating suppliers." },
  "17#1": { name: "QBR Preparation Agent", description: "Synthesizes delivery, quality, and cost data into executive-ready supplier review packs." },
  "18#0": { name: "Demand Sensing Agent", description: "Integrates sales forecasts, POS, and market signals to sharpen component demand accuracy." },
  "18#1": { name: "Buffer-Stock Optimizer", description: "Dynamically adjusts safety-stock levels to lead-time variability and demand uncertainty." },
  "19#0": { name: "Shipment Orchestration Agent", description: "Optimizes carrier selection, routing, and consolidation for outbound logistics." },
  "19#1": { name: "Customs Compliance Agent", description: "Auto-classifies HS codes, generates export documents, and flags trade-compliance issues." },
  "20#0": { name: "Should-Cost Modeling Agent", description: "Builds should-cost estimates from material, labor, and overhead to strengthen negotiations." },
  "20#1": { name: "Alternate-Component Qualifier", description: "Screens parametric databases for drop-in substitutes during shortages or cost-downs." },
  "21#0": { name: "AOI/SPI Vision Inspection Agent", description: "Detects SMT defects in real time and closes the loop on process adjustment." },
  "21#1": { name: "Multi-Agent QC Coordinator", description: "Coordinates inspection, root-cause analysis, and corrective action across production stations." },
  "22#0": { name: "Adaptive Final-Inspection Agent", description: "Tunes outgoing-inspection intensity based on upstream quality signals." },
  "22#1": { name: "Lot Disposition Agent", description: "Makes traceable lot accept/reject decisions with explainable disposition reasoning." },
  "23#0": { name: "Inspection-Criteria Generator", description: "Generates inspection criteria from customer quality specs and historical defect patterns." },
  "23#1": { name: "Quality Continuous-Improvement Agent", description: "Mines quality data for systemic patterns and recommends SPC and sampling methodology updates." },
  "24#0": { name: "Supplier Audit Agent", description: "Pre-analyzes supplier data to generate risk-based audit focus areas." },
  "24#1": { name: "Supplier CAPA Agent", description: "Generates corrective-action plans from non-conformances and tracks supplier response effectiveness." },
  "25#0": { name: "First-Article Inspection Agent", description: "Compares measurement data to design specs and auto-generates FAI reports." },
  "25#1": { name: "Design Quality-Gate Reviewer", description: "Checks design outputs against quality-plan requirements before gate signoff." },
  "26#0": { name: "Incoming-Inspection Vision Agent", description: "Inspects incoming material with dynamic sampling driven by supplier risk profiles." },
  "26#1": { name: "Incoming Lot Dispositioning Agent", description: "Grades incoming lots and routes them to accept, reject, or conditional-use from measurement data." },
  "27#0": { name: "RFQ Quoting Agent", description: "Parses RFQs, extracts requirements, and drafts quotes from historical pricing and configuration rules." },
  "27#1": { name: "Design-Win Scoring Agent", description: "Scores design-win probability from customer signals, competition, and historical win data." },
  "28#0": { name: "Autonomous Sales-Order Agent", description: "Reads customer emails, extracts order details, and creates ERP sales orders with confirmations." },
  "28#1": { name: "Promise-Date Agent", description: "Provides real-time delivery commitments by integrating with production scheduling." },
  "29#0": { name: "Customer Roadmap Monitor", description: "Scrapes public filings, patents, and news to track customer product roadmaps." },
  "29#1": { name: "Demand-Input Synthesis Agent", description: "Synthesizes market signals, sell-through, and pipeline data into demand estimates." },
  "30#0": { name: "MES/ERP AIOps Agent", description: "Predicts outages, auto-remediates common issues, and manages integration pipelines for manufacturing systems." },
  "30#1": { name: "PLM-ERP Sync Agent", description: "Detects and resolves BOM and routing discrepancies across PLM and ERP automatically." },
  "31#0": { name: "Autonomous SOC Agent", description: "Triages security alerts, investigates threats, and executes containment playbooks." },
  "31#1": { name: "Network Segmentation Compliance Agent", description: "Monitors IP isolation between client data environments in the multi-tenant ODM factory." },
  "32#0": { name: "AI Coding Agent", description: "Generates, tests, and deploys internal enterprise applications from natural-language specs." },
  "32#1": { name: "API Integration Agent", description: "Auto-generates and maintains integrations between MES, ERP, PLM, and custom tools." },
  "33#0": { name: "AI Service-Desk Agent", description: "Auto-resolves L1 tickets such as password resets and access requests without human intervention." },
  "33#1": { name: "Proactive IT-Support Agent", description: "Detects device and application issues before users report them and initiates remediation." },
  "34#0": { name: "Factory Recruiting Agent", description: "Screens applications, schedules interviews, and manages onboarding for mass factory hiring." },
  "34#1": { name: "Shift Scheduling Agent", description: "Generates compliant shift schedules from labor laws, skill matrices, and production demand." },
  "35#0": { name: "Learning-Path Recommender", description: "Personalizes training plans from role, skill gaps, and career progression." },
  "35#1": { name: "EHS Incident-Prediction Agent", description: "Analyzes near-misses, environmental data, and shift patterns to flag high-risk periods." },
  "36#0": { name: "HR Query-Resolution Agent", description: "Answers employee benefits, leave, and payroll questions via a conversational interface." },
  "36#1": { name: "Payroll Anomaly Agent", description: "Flags attendance, overtime, and deduction errors before payroll is processed." },
  "37#0": { name: "FP&A Forecasting Agent", description: "Auto-generates rolling forecasts, variance analysis, and scenario models from ERP/MES data." },
  "37#1": { name: "BOM Cost-Tracking Agent", description: "Monitors material-cost fluctuations and flags program profitability risk in real time." },
  "38#0": { name: "Cash-Flow Forecasting Agent", description: "Predicts daily and weekly multi-currency cash positions from payment-pattern analysis." },
  "38#1": { name: "FX Hedging Agent", description: "Monitors FX exposure and recommends hedge timing and instruments based on market conditions." },
  "39#0": { name: "Executive Reporting Agent", description: "Generates dashboards, variance commentary, and ad-hoc analysis from natural-language queries." },
  "39#1": { name: "Financial Narrative Agent", description: "Drafts month-end commentary and board-ready summaries from data patterns." },
  "40#0": { name: "Touchless AP Agent", description: "Performs PO-GR-invoice three-way matching, handles exceptions, and executes payment approvals." },
  "40#1": { name: "Duplicate-Payment Detector", description: "Scans invoices in real time to catch potential duplicate payments before execution." },
  "41#0": { name: "Financial Close Agent", description: "Orchestrates close tasks, surfaces bottlenecks, and auto-posts routine journal entries." },
  "41#1": { name: "Reconciliation Agent", description: "Auto-matches transactions and proposes resolutions for standard account reconciliations." },
  "42#0": { name: "AI Collections Agent", description: "Prioritizes collections, drafts personalized dunning, and predicts payment behavior." },
  "42#1": { name: "Revenue-Recognition Agent", description: "Classifies multi-milestone ODM contracts and calculates ASC 606 recognition schedules." },
  "43#0": { name: "8D Investigation Agent", description: "Analyzes field-failure data against production records and drafts root-cause 8D reports." },
  "43#1": { name: "Field-Failure Trending Agent", description: "Monitors return data in real time and alerts when failure patterns emerge." },
  "44#0": { name: "RMA Processing Agent", description: "Validates warranty claims against policy and auto-generates approvals and return labels." },
  "44#1": { name: "Warranty-Cost Prediction Agent", description: "Forecasts warranty exposure by product line from field and production-quality data." },
  "45#0": { name: "Order-Entry Automation Agent", description: "Extracts order data from email/EDI, validates against the customer master, and creates ERP sales orders." },
  "45#1": { name: "Export-Documentation Agent", description: "Auto-generates commercial invoices, packing lists, and certificates of origin from order data." },
  "46#0": { name: "Expense Management Agent", description: "Auto-categorizes receipts, checks policy compliance, and routes expense approvals." },
  "46#1": { name: "Admin Workflow Agent", description: "Handles travel booking, scheduling, and routine administrative requests via conversational AI." },
  "47#0": { name: "Building Management Agent", description: "Optimizes HVAC, lighting, and energy across the campus by occupancy and production schedule." },
  "47#1": { name: "Facilities Service-Request Agent", description: "Handles maintenance, cleaning, and transport requests with auto-dispatch to service teams." },
  "48#0": { name: "Strategic Intelligence Agent", description: "Synthesizes market, competitive, and internal performance data into executive briefings." },
  "48#1": { name: "AI Governance Monitor", description: "Tracks agentic-AI deployments across the organization and monitors risk and compliance indicators." },
  "49#0": { name: "Predictive Maintenance Agent", description: "Monitors SMT and test-equipment sensor data, predicts failures, and auto-generates work orders." },
  "49#1": { name: "Spare-Parts Optimization Agent", description: "Predicts part consumption, automates reorders, and manages MRO inventory levels." },
  "50#0": { name: "Contract Review Agent", description: "Analyzes NDAs, CMAs, and IP agreements for risk clauses, gaps, and inconsistencies." },
  "50#1": { name: "Export-Control Screening Agent", description: "Screens transactions against EAR and EU dual-use lists and flags restricted items and destinations." },
  "51#0": { name: "Continuous Compliance Agent", description: "Detects ESG/RBA gaps against standards and generates pre-audit readiness reports." },
  "51#1": { name: "Internal-Controls Testing Agent", description: "Executes control tests, samples transactions, and flags exceptions for auditor review." },
};

const painFor = (potential: BenchmarkRecord["adoption_potential"]): Candidate["pain"] =>
  potential === "High" ? "high" : potential === "Low" ? "low" : "med";

/** All six readiness gates marked Yes so the golden project flows through the funnel. */
function passAllScreen(): ScreenAnswers {
  return Object.fromEntries(screenCriteria.map((cr) => [cr.id, { yes: true }])) as ScreenAnswers;
}

function buildCandidate(record: BenchmarkRecord): Candidate {
  const candidateId = `odm-wf-${record.id}`;
  const useCases: ProjectUseCase[] = record.use_cases.map((u, j) => {
    const summary = SUMMARIES[`${record.id}#${j}`];
    if (!summary) throw new Error(`Missing synthesized summary for ${record.id}#${j}`);
    return {
      id: `odm-uc-${record.id}-${j}`,
      candidateId,
      name: summary.name,
      description: summary.description,
      impactRationale: `${u.kpi_evidence}\n\nReference: ${u.reference}`,
    };
  });

  const base = makeBlankCandidate({
    name: record.process,
    description: `${record.function} · adoption potential ${record.adoption_potential}`,
    sourceSystem: "",
    volumePerMonth: 0,
    pain: painFor(record.adoption_potential),
  });

  return {
    ...base,
    id: candidateId,
    businessFunction: record.function,
    screen: passAllScreen(),
    useCases,
  };
}

function main(): void {
  const records = JSON.parse(readFileSync(DATA_FILE, "utf8")) as BenchmarkRecord[];
  const candidates = records.map(buildCandidate);
  const useCaseCount = candidates.reduce((sum, c) => sum + (c.useCases?.length ?? 0), 0);

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const row = db.prepare("SELECT data FROM projects WHERE id = ?").get(PROJECT_ID) as
    | { data: string }
    | undefined;
  if (!row) {
    throw new Error(`Project "${PROJECT_ID}" not found — create it in the app first, then re-run.`);
  }

  const project = JSON.parse(row.data) as Record<string, unknown>;
  project.candidates = candidates;
  project.updatedAt = new Date().toISOString();

  db.prepare(
    "UPDATE projects SET name = ?, client = ?, domain = ?, status = ?, updated_at = ?, data = ? WHERE id = ?",
  ).run(
    project.name,
    project.client,
    project.domain,
    project.status,
    Date.now(),
    JSON.stringify(project),
    PROJECT_ID,
  );
  db.close();

  console.log(
    `Seeded "${PROJECT_ID}": ${candidates.length} workflows, ${useCaseCount} use cases across ` +
      `${new Set(records.map((r) => r.function)).size} business functions.`,
  );
}

main();
