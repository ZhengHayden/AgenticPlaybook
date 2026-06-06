/**
 * Seed the "UT-Golden Example" golden project (CLP utility benchmark).
 *
 * Reads `data/utility_agentic_adoption_benchmark.json` — 13 functions and 51
 * workflows linked by `functionId` — and populates the existing
 * `ut-golden-example` project with:
 *   - one workflow (Candidate) per function — businessFunction = segment, pain
 *     from tier, all readiness gates passed so the project is fully navigable;
 *   - one ProjectUseCase per benchmark workflow — a synthesized short name and a
 *     one-sentence description, with impactRationale = impactEstimate (the KPI
 *     evidence) + evidenceSources (the references).
 *
 * Everything else on the project (name, client, variants, …) is preserved.
 * Run with: `npx tsx scripts/seed-ut-golden.ts`
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { makeBlankCandidate } from "../src/content/candidate-factory";
import { screenCriteria } from "../src/content/binary-screen";
import type { Candidate, ProjectUseCase, ScreenAnswers } from "../src/content/sample-data";

const PROJECT_ID = "ut-golden-example";
const DATA_FILE = path.resolve(process.cwd(), "data/utility_agentic_adoption_benchmark.json");
const DB_PATH = process.env.PLAYBOOK_DB_PATH ?? path.resolve(process.cwd(), "data/playbook.db");

interface BenchmarkFunction {
  id: string;
  name: string;
  segment: string;
  estimatedHc: number;
  hcNote: string;
  tier: 1 | 2 | 3;
  workflowCount: number;
}
interface BenchmarkWorkflow {
  id: string;
  functionId: string;
  name: string;
  description: string;
  impactEstimate: string;
  evidenceSources: string[];
}
interface BenchmarkFile {
  functions: BenchmarkFunction[];
  workflows: BenchmarkWorkflow[];
}

/** Synthesized `{ name, description }` per benchmark workflow, keyed by workflow id. */
const SUMMARIES: Record<string, { name: string; description: string }> = {
  "wf-001": { name: "Condition Monitoring & Predictive Diagnostics", description: "Predicts rotating-equipment failures 30–90 days ahead from vibration, temperature, and pressure sensor streams across the gas fleet." },
  "wf-002": { name: "Reliability-Centred Maintenance Planning", description: "Autonomously optimises maintenance intervals from live asset condition, reprioritising routine work across the fleet without manual approval." },
  "wf-003": { name: "Heat-Rate & Performance Optimisation", description: "Real-time ML tuning of firing temperature, HRSG operation, and auxiliary load to lift efficiency across the ~3.9 GW Black Point gas fleet." },
  "wf-004": { name: "Outage Planning & Scheduling Optimisation", description: "Finds optimal maintenance windows by correlating demand, weather, fuel availability, and equipment condition across the fleet." },
  "wf-005": { name: "Asset Lifecycle & Remaining-Life Estimation", description: "Estimates remaining useful life of turbine blades, boiler tubes, and transformers from historical failures and live sensor feeds." },
  "wf-006": { name: "Transformer Health Scoring", description: "Predicts distribution-transformer failure within 6–12 months from dissolved-gas analysis, load history, temperature, and age." },
  "wf-007": { name: "Risk-Based Asset Maintenance Planning", description: "Scores every grid asset by failure probability × consequence to prioritise inspection and maintenance across the 12,958 km network." },
  "wf-008": { name: "Satellite-AI Vegetation Management", description: "Detects vegetation encroachment along transmission corridors from satellite imagery and prioritises clearance by proximity and growth rate." },
  "wf-009": { name: "Failure Investigation & Root-Cause Analysis", description: "Mines fault records, relay data, and maintenance history with NLP to surface root causes and systemic failure patterns." },
  "wf-010": { name: "Asset Replacement & Fleet Renewal", description: "Sequences asset renewals by balancing replacement cost, failure risk, and Scheme-of-Control recovery across the ageing fleet." },
  "wf-011": { name: "Crew Scheduling & Dispatch Optimisation", description: "Optimises crew assignments in real time by skill, location, priority, equipment, and travel time across the HK territory." },
  "wf-012": { name: "Autonomous Fault Isolation & Restoration", description: "Multi-agent system that detects a fault, isolates the affected section, and restores supply via automatic reconfiguration within seconds." },
  "wf-013": { name: "Field AI Copilot & Mobile Execution", description: "AR/mobile assistant giving field crews live equipment data, procedure guidance, safety alerts, and auto-documentation." },
  "wf-014": { name: "Outage Prediction & Crew Pre-Positioning", description: "Predicts outage likelihood by grid section 24–72 hours ahead from weather, load, and historical outage data to pre-position crews." },
  "wf-015": { name: "Field Materials & Equipment Management", description: "Forecasts field material needs from planned work, failure predictions, and seasonality to cut emergency procurement." },
  "wf-016": { name: "Real-Time Plant Control & Autonomous Dispatch", description: "Agentic dispatch optimisation within grid-operator constraints, fuel contracts, and emissions limits, executing inside preset parameters." },
  "wf-017": { name: "Digital Shift Handover & Operator Briefing", description: "GenAI auto-compiles plant state, alarms, pending actions, and safety notes into a structured shift-handover briefing." },
  "wf-018": { name: "Real-Time Combustion Optimisation", description: "Continuously tunes air-fuel ratio, flame pattern, and NOx second-by-second to hold optimal combustion efficiency." },
  "wf-019": { name: "Automated Safety Permit Management", description: "Automates safety-permit issuance, conflict checking, and closure, with AI anomaly detection for non-standard conditions." },
  "wf-020": { name: "Work Order Prioritisation & Execution", description: "Ranks open work orders by risk, efficiency impact, and resource availability and auto-assigns them to qualified crew." },
  "wf-021": { name: "Fuel Price Forecasting & Hedging", description: "Time-series ML forecasts gas, coal, and LNG prices using geopolitical, weather, and supply signals to inform hedging." },
  "wf-022": { name: "Autonomous Fuel Sourcing & Execution", description: "Executes spot fuel purchases 24/7 within pre-approved risk limits, price bands, and volume constraints in global LNG markets." },
  "wf-023": { name: "Fuel Inventory & Logistics Optimisation", description: "Balances storage cost, delivery lead time, and demand uncertainty to optimise fuel stock across the supply chain." },
  "wf-024": { name: "Supplier Risk Monitoring", description: "Flags at-risk fuel suppliers 30–60 days ahead from reliability, financial health, delivery, and quality metrics." },
  "wf-025": { name: "Probabilistic Load Forecasting", description: "Probabilistic capacity forecasts incorporating EV adoption, data-centre growth, DER penetration, Northern Metropolis, and weather." },
  "wf-026": { name: "Network Topology & Reinforcement Design", description: "Evaluates thousands of reinforcement options against cost, reliability, losses, and flexibility for Northern Metropolis expansion." },
  "wf-027": { name: "DER Integration & Hosting Capacity", description: "Digital twin that simulates high-DER scenarios and cuts hosting-capacity studies from weeks to hours." },
  "wf-028": { name: "Northern Metropolis Capacity Planning", description: "Scenario planning for new load centres, integrating land-use projections, phased timelines, and infrastructure staging." },
  "wf-029": { name: "AI-Assisted Investment Case Preparation", description: "GenAI drafts investment cases, fills cost-benefit templates, and surfaces comparable precedents for Development Plan submissions." },
  "wf-030": { name: "Generative Design & Cable Routing", description: "Generates optimal cable and overhead-line routes from terrain, land use, environmental constraints, and cost for new developments." },
  "wf-031": { name: "Construction Delay Prediction & Coordination", description: "Tracks construction progress against baseline and flags delay risk from weather, materials, and contractor performance." },
  "wf-032": { name: "Revenue Assurance & Loss Detection", description: "Detects energy theft, meter tampering, and billing anomalies across 2.88M smart-meter streams and auto-resolves simple exceptions." },
  "wf-033": { name: "Smart Meter Data Validation", description: "Identifies stuck meters, comms failures, and implausible consumption, and triggers correction workflows automatically." },
  "wf-034": { name: "Credit & Debt Risk Management", description: "Predicts payment-default probability from consumption, payment history, and demographics for early intervention before write-off." },
  "wf-035": { name: "Demand-Response Orchestration", description: "Autonomously coordinates demand-response across customer segments, balancing curtailment against grid needs and preferences." },
  "wf-036": { name: "GenAI Customer Service & Enquiry Resolution", description: "LLM agent that resolves customer enquiries autonomously and escalates complex cases to humans with full context." },
  "wf-037": { name: "Personalised Energy Advisory", description: "Appliance-level disaggregation of smart-meter data to deliver tailored energy-savings recommendations per household." },
  "wf-038": { name: "Autonomous Complaint Resolution", description: "Investigates complaint root cause and applies resolution within authority limits, confirming the outcome with the customer." },
  "wf-039": { name: "Proactive Outreach & Channel Orchestration", description: "Detects unusual consumption to proactively contact customers, unifying GenAI assistance across web, app, WhatsApp, and voice." },
  "wf-040": { name: "Energy Portfolio Optimisation", description: "Optimises retail energy procurement across cost, risk, renewable share, and demand uncertainty." },
  "wf-041": { name: "Wholesale Market Bidding & Trading", description: "Agentic bidding in day-ahead and real-time markets within risk parameters, learning continuously from market dynamics." },
  "wf-042": { name: "Renewable PPA & Generation Forecasting", description: "Forecasts solar and wind output from weather models to value PPAs accurately and manage intermittency exposure." },
  "wf-043": { name: "Capital Planning & Investment Prioritisation", description: "Ranks candidate generation projects by reliability contribution, regulatory recovery, risk, and portfolio balance." },
  "wf-044": { name: "GenAI Engineering Design & Specifications", description: "LLM drafts preliminary generation designs, specifications, and procurement packages from project parameters and standards." },
  "wf-045": { name: "Schedule Risk Modelling & Commissioning", description: "Flags schedule-delay risk for generation capital projects from contractor history, weather, and supply-chain signals." },
  "wf-046": { name: "AI-Assisted Specification Development", description: "GenAI drafts T&D technical specifications from requirements, the latest standards, and captured lessons learned." },
  "wf-047": { name: "Automated Tender Evaluation", description: "Scores T&D tender submissions on technical, commercial, and risk criteria and flags anomalies and non-compliances." },
  "wf-048": { name: "Spare Parts Demand Forecasting", description: "Predicts T&D spare-parts demand from maintenance schedules, failure predictions, and project pipelines." },
  "wf-049": { name: "Finance & Accounting Automation", description: "Automates reconciliations, invoice processing, and journal entries to accelerate month-end close end-to-end." },
  "wf-050": { name: "AI-Enabled Workforce Management", description: "ML-driven talent acquisition, workforce-demand forecasting, and attrition prediction for critical AI and engineering roles." },
  "wf-051": { name: "Corporate AI Operations & Knowledge Capture", description: "AIOps for autonomous IT, GenAI contract review, automated ESG reporting, and knowledge capture from retiring engineers." },
};

const painFor = (tier: BenchmarkFunction["tier"]): Candidate["pain"] =>
  tier === 1 ? "high" : tier === 3 ? "low" : "med";

/** All six readiness gates marked Yes so the golden project flows through the funnel. */
function passAllScreen(): ScreenAnswers {
  return Object.fromEntries(screenCriteria.map((cr) => [cr.id, { yes: true }])) as ScreenAnswers;
}

function main(): void {
  const data = JSON.parse(readFileSync(DATA_FILE, "utf8")) as BenchmarkFile;
  const byFn = new Map<string, BenchmarkWorkflow[]>();
  for (const w of data.workflows) {
    if (!byFn.has(w.functionId)) byFn.set(w.functionId, []);
    byFn.get(w.functionId)!.push(w);
  }

  const candidates: Candidate[] = data.functions.map((fn) => {
    const candidateId = `ut-${fn.id}`;
    const useCases: ProjectUseCase[] = (byFn.get(fn.id) ?? []).map((w) => {
      const summary = SUMMARIES[w.id];
      if (!summary) throw new Error(`Missing synthesized summary for ${w.id}`);
      return {
        id: `ut-${w.id}`,
        candidateId,
        name: summary.name,
        description: summary.description,
        impactRationale: `${w.impactEstimate}\n\nReference: ${w.evidenceSources.join("; ")}`,
      };
    });

    const base = makeBlankCandidate({
      name: fn.name,
      description: fn.hcNote,
      sourceSystem: "",
      volumePerMonth: 0,
      pain: painFor(fn.tier),
    });

    return {
      ...base,
      id: candidateId,
      businessFunction: fn.segment,
      screen: passAllScreen(),
      useCases,
    };
  });

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
  // This benchmark's grain is per-workflow use cases, so rank by use case.
  project.scoringMode = "useCase";
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
      `${new Set(data.functions.map((f) => f.segment)).size} segments.`,
  );
}

main();
