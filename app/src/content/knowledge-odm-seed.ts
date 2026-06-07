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
 * GenAI use cases for a Tier-1 ODM. Source is ODM-specific; this branch is
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
const useCaseSeeds: UseCaseSeed[] = [
  {
    id: "odm-uc-01",
    workflowId: "odm-wf-proc",
    name: "Agentic Material Planning & Demand-Supply Orchestration",
    domain: "Procurement & Supply Chain",
    description:
      "A closed-loop multi-agent system that senses, reasons, decides, executes and learns across OEM forecasts, internal plans and component supply — auto-resolving the 200–500 daily MRP exceptions per planner within guardrails. It detects emerging shortages 5–15 days out, optimizes multi-customer allocation of constrained components, and wraps existing ERP/APS (SAP, Kinaxis, o9) via APIs rather than replacing them. For a Tier-1 ODM running daily call-off cycles, 1–2% inventory optimization alone can release $50–100M in working capital.",
    kpis: [
      "Inventory carrying-cost reduction: 15–35%",
      "Manual planning effort: 40–90% reduction",
      "Exception resolution time: 80–90% faster",
      "Working capital release: up to ~$200M per $10B revenue",
    ],
    techTag: "Optimization",
    maturity: "emerging",
    businessObjectives: ["Working Capital", "Productivity", "Service Level"],
    archetypes: ["orchestrator", "retriever", "analyst", "executor"],
    interactionMode: "copilot",
    a2aPattern: "hierarchical",
    references: [
      { name: "Aera Technology", detail: "Digital Material Planner across high-tech manufacturers: 40–90% less manual planning effort; up to $200M working-capital release per $10B revenue." },
      { name: "Oracle Autonomous Supply Chain", detail: "Agentic inventory/supplier coordination: 60–80% reduction in manual procurement effort; auto-replenishment on predicted shortage." },
      { name: "ProvisionAI LevelLoad", detail: "Autonomous capacity-constrained deployment planning: 97% first-tender acceptance; 60% lower shipment volatility." },
      { name: "McKinsey Global Institute", detail: "AI-enabled supply chains: 35% inventory reduction for early adopters; 15–25% total cost savings." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "odm-uc-02",
    workflowId: "odm-wf-mfg",
    name: "Agentic Production Scheduling & Multi-Program Control",
    domain: "Manufacturing Operations",
    description:
      "A hierarchical multi-agent scheduler that continuously optimizes SMT line allocation, job sequencing, and resource deployment across 10–20 concurrent OEM programs on shared lines. Reinforcement-learning dispatch policies — trained on 6–12 months of MES history in a digital twin — execute real-time rescheduling within minutes of disruptions (machine breakdown, material delay, yield excursion), balancing on-time delivery, WIP minimization, and feeder-changeover reduction simultaneously. For a factory complex producing 100K+ units/day, even a 5% OEE gain adds millions in output without capital investment.",
    kpis: [
      "OEE improvement: 5–20%",
      "Changeover time reduction: 20–50%",
      "On-time delivery improvement: 15–50%",
      "Scheduling cycle time reduction: 50–95% (days to minutes)",
    ],
    techTag: "Optimization",
    maturity: "emerging",
    businessObjectives: ["Productivity", "Service Level", "Cost Reduction"],
    archetypes: ["orchestrator", "analyst", "executor", "evaluator"],
    interactionMode: "copilot",
    a2aPattern: "hierarchical",
    references: [
      { name: "McKinsey Global Lighthouse Network", detail: "AI-enabled scheduling is a top-3 value driver across 180+ Lighthouse factories: 30–50% lead time reduction, 5–20% OEE gain; electronics lighthouses (Foxconn, Samsung SDI) demonstrate scheduling AI at scale." },
      { name: "DELMIA High-Tech Manufacturing", detail: "20% on-time delivery improvement and 50% scheduling cycle time reduction through AI scheduling in contract manufacturing environments." },
      { name: "Asprova Electronics Deployments (Asia)", detail: "Sub-second rescheduling for factories with 100K+ operations; 95% reduction in scheduling time (from 2 days to minutes) across Taiwanese and Japanese electronics manufacturers." },
      { name: "Deep RL Job-Shop Scheduling (Zhang et al.)", detail: "RL agents outperform traditional dispatching rules by 15–25% on makespan; 32% cycle time improvement for high-priority products in semiconductor fab deployment." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "odm-uc-03",
    workflowId: "odm-wf-rnd",
    name: "GenAI Engineering Change Impact Analysis",
    domain: "R&D / Engineering",
    description:
      "An LLM-powered platform that automatically traces engineering changes across multi-level BOMs, tooling, test fixtures, supplier qualifications, and regulatory certifications — generating ECN/ECO documents in each OEM customer's required format from a single internal record. RAG over the PLM/PDM corpus enables comprehensive where-used analysis across all programs sharing a changed component, eliminating the secondary-effect misses that drive costly quality escapes. For an ODM processing 500–2,000 ECOs per month, reducing cycle time by 20–30% while improving impact accuracy directly accelerates time-to-market.",
    kpis: [
      "ECO document generation time: 30–50% faster",
      "Cross-BOM impact analysis speed: 50–70% faster",
      "End-to-end ECO cycle time: 20–30% shorter",
      "Change-related quality escapes: 30–50% reduction",
    ],
    techTag: "GenAI",
    maturity: "emerging",
    businessObjectives: ["Time-to-Market", "Quality", "Productivity"],
    archetypes: ["retriever", "analyst", "evaluator"],
    interactionMode: "copilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Tech Mahindra GenAI Workflow", detail: "GenAI deployment for engineering documentation workflows: 250+ person-hours/month saved in document generation and review." },
      { name: "Deloitte GenAI Knowledge Management", detail: "Leading manufacturer deployed GenAI for engineering knowledge retrieval: >85% accuracy across technical documentation; faster access to design history and change rationale." },
      { name: "McKinsey AI in Product Development: 20–80% Task Acceleration", detail: "20–80% acceleration in R&D knowledge-work tasks using GenAI; front-end design phases see largest gains (25–50% time reduction)." },
      { name: "PTC Windchill / Siemens Teamcenter", detail: "Both major PLM vendors embedding GenAI for change impact analysis: automatic where-used across multi-level BOMs and natural language query of ECO history." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "odm-uc-04",
    workflowId: "odm-wf-rnd",
    name: "Agentic NPI Phase-Gate Orchestration",
    domain: "R&D / Program Management",
    description:
      "A portfolio orchestrator with per-program agents that continuously monitors 200+ tasks across 8–12 functional teams, predicts gate readiness 2–4 weeks ahead using ML models trained on historical NPI data, and auto-generates risk-adjusted GO/HOLD/KILL recommendations with remediation action plans. Cross-program dependency detection resolves conflicts over shared engineers, test labs, and qualification capacity across 50–100 simultaneous programs — eliminating the manual status consolidation that currently consumes the majority of program-manager time. Robert G. Cooper (father of Stage-Gate) projects that 'Stage-Gate Agentic' will be the next major revolution in the new product process.",
    kpis: [
      "NPI time-to-market reduction: 15–30%",
      "Gate review preparation effort: 60–80% reduction",
      "Cross-functional coordination time: 30–50% reduction",
      "First-time-right at gate: 15–25% improvement",
    ],
    techTag: "AI/ML",
    maturity: "pilot",
    businessObjectives: ["Time-to-Market", "Quality", "Productivity"],
    archetypes: ["orchestrator", "analyst", "evaluator", "executor"],
    interactionMode: "copilot",
    a2aPattern: "hierarchical",
    references: [
      { name: "PDMA Stage-Gate Agentic (Robert G. Cooper)", detail: "Father of Stage-Gate projects 25–50% acceleration in front-end NPI phases; predicts AI agents managing gate criteria assessment and portfolio optimization will be the next major revolution." },
      { name: "McKinsey AI in Product Development: Accelerating Innovation", detail: "15–30% time-to-market reduction for early adopters; 20–25% overall development time reduction when AI embedded across the development system." },
      { name: "HPE Agentic AI for Project Management", detail: "Agentic AI replacing Gantt chart-based project management: autonomous task tracking, dependency resolution, and resource optimization — 'from managing projects to projects managing themselves.'" },
      { name: "WNS Manufacturing Blueprint", detail: "NPI coordination identified as high-value application in 5-stage agentic AI blueprint: autonomous tracking, predictive risk, and intelligent escalation across manufacturing functions." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "odm-uc-05",
    workflowId: "odm-wf-proc",
    name: "Agentic Supplier Risk & Performance Management",
    domain: "Procurement & Supply Chain",
    description:
      "A continuous-monitoring system that ingests financial filings, news sentiment, credit ratings, geopolitical alerts, and logistics disruption feeds to generate risk scores and proactive alerts 2–6 weeks before disruption materializes — replacing quarterly scorecard reviews with real-time intelligence across 500–2,000 active suppliers. NLP analysis of supplier communications detects hedging language and delivery-risk signals before formal date revisions; pre-configured mitigation playbooks auto-execute within guardrails (alternate source activation, safety-stock adjustment, allocation rebalancing). For an ODM with heavy semiconductor dependency, early warning of allocation risk delivers asymmetric returns relative to deployment cost.",
    kpis: [
      "Risk response time reduction: 90% (weeks to hours)",
      "Procurement savings across addressed spend: 12–20%",
      "Disruption prediction accuracy: 85–92%",
      "Alternate supplier identification: 60–75% faster",
    ],
    techTag: "AI/ML",
    maturity: "emerging",
    businessObjectives: ["Cost Reduction", "Service Level", "Productivity"],
    archetypes: ["analyst", "evaluator", "retriever", "executor"],
    interactionMode: "copilot",
    a2aPattern: "hierarchical",
    references: [
      { name: "McKinsey Agentic Procurement", detail: "Large manufacturer achieved $700M EBIT improvement with AI-enabled procurement; 12–20% savings across addressed spend; 90% reduction in risk response time; described as 'competitive weapon, not cost play.'" },
      { name: "Dataiku Automotive OEM", detail: "Multi-agent AI for supplier risk: $5K/minute downtime cost avoidance; $300K savings per disruption event identified and mitigated proactively through multi-tier supply chain visibility." },
      { name: "PwC Agentic AI Procurement Framework", detail: "30–70% productivity gains in procurement operations; phased autonomy from visibility → recommendation → guardrailed execution → full autonomy." },
      { name: "Resilinc / Everstream Analytics", detail: "Electronics-specific supply chain risk management: 4–5-tier supplier mapping with semiconductor-specific risk models; real-time disruption prediction at 85–92% accuracy." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "odm-uc-06",
    workflowId: "odm-wf-sales",
    name: "GenAI RFQ Response & Should-Cost Analysis",
    domain: "Sales & Commercial",
    description:
      "An LLM-powered platform that parses customer BOM requirements, maps components to real-time market pricing, generates parametric cost breakdowns (ICs, passives, PCB, assembly, test, NRE), and drafts structured RFQ response documents in each OEM customer's proprietary format — reducing response time from 2–3 weeks to 3–5 days. RAG over historical quote data informs competitive pricing strategy through won/loss analysis, while AI-identified cost-reduction opportunities flag 10–20% BOM cost savings via alternate components or design-for-manufacturing improvements. In ODM design-win competitions where speed-to-quote is typically decisive, this capability directly improves win rates.",
    kpis: [
      "RFQ response time reduction: 40–70% (weeks to days)",
      "Should-cost analysis time: 60–80% faster per BOM",
      "Cost estimation accuracy: 85–95% vs. final negotiated price",
      "Win rate improvement: 5–15%",
    ],
    techTag: "GenAI",
    maturity: "emerging",
    businessObjectives: ["Revenue Growth", "Productivity", "Cost Reduction"],
    archetypes: ["retriever", "analyst", "evaluator"],
    interactionMode: "copilot",
    a2aPattern: "pipeline",
    references: [
      { name: "aPriori Manufacturing Cost Intelligence", detail: "AI-powered should-cost: 60–80% faster estimation; 85–95% accuracy vs. final negotiated prices; identifies 10–20% cost reduction opportunities per BOM through design optimization." },
      { name: "Hyperthink GenAI Proposal Automation", detail: "50–80% reduction in proposal generation time; multi-format output adapted to customer requirements; historical win/loss analysis informing pricing strategy." },
      { name: "Gartner AI in Manufacturing Cost Estimation (2025)", detail: "Speed-to-quote typically decisive in ODM design-win bidding; AI-assisted target: 3–5 days for initial pricing vs. 2–3 week industry average; 5–15% win rate improvement from faster, more accurate responses." },
      { name: "FACTON Enterprise Product Costing", detail: "Full BOM cost rollup with process-based costing for electronics/automotive; deep integration with PLM for real-time design-to-cost feedback." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "odm-uc-07",
    workflowId: "odm-wf-mfg",
    name: "Agentic Yield Optimization & Process Engineering",
    domain: "Manufacturing Operations",
    description:
      "A closed-loop agentic system that monitors 100+ SMT and assembly process parameters in real time, detects subtle drift before it causes defects, isolates root causes through multi-variate correlation, and autonomously adjusts recipes within pre-approved bounds — validated in a digital twin before live deployment. ML models on AOI/X-ray imagery classify failure modes and eliminate 70% of false alarms, while RL agents learn product-specific optimal process windows and apply them automatically during changeovers. For an ODM producing 25M boards/year per factory complex, a 0.9 percentage-point yield improvement eliminates 225,000 defective boards worth $11–45M in recovered output, with payback under 3 months.",
    kpis: [
      "Yield improvement: 98.5% → 99.4% (0.9 pp gain demonstrated)",
      "AOI false call reduction: 70%",
      "Rework cycle reduction: 60%",
      "ROI payback: under 3 months; Year-2 ROI exceeding 1,500%",
    ],
    techTag: "Optimization",
    maturity: "emerging",
    businessObjectives: ["Quality", "Cost Reduction", "Productivity"],
    archetypes: ["analyst", "evaluator", "executor"],
    interactionMode: "autopilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Paxrel SMT Yield Agent", detail: "AI agent on 5-line SMT site producing 25M boards/year: yield 98.5% → 99.4%; 56,250 fewer defective boards/year; ROI payback under 3 months; Year-2 ROI exceeding 1,500%." },
      { name: "Semiconductor RL Process Optimization", detail: "RL agents controlling etch processes: 30–50% process variability reduction; 50% queue time reduction for priority products; 18% overall fab throughput increase." },
      { name: "ChaiOne Agentic AI Manufacturing ROI", detail: "60% rework reduction through predictive quality intervention; 20% faster test cycles through AI-optimized test sequencing; demonstrates compounding returns as agents learn." },
      { name: "Frontiers in Manufacturing: Multi-Agent RL for Smart Factory Optimization (2025)", detail: "Peer-reviewed MARL framework for high-mix electronics (Frontiers in Manufacturing, 2025): agents coordinate across equipment for factory-level optimization; generalizes across product types and process configurations." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "odm-uc-08",
    workflowId: "odm-wf-qa",
    name: "GenAI Quality Defect Analysis & 8D Automation",
    domain: "Quality Assurance / Service",
    description:
      "An LLM-powered quality intelligence platform that auto-generates structured 8D reports from defect data inputs — populating D1-D8 sections by querying QMS, MES, SPC, and maintenance records — in each OEM customer's required template in English and Mandarin simultaneously. A continuously updated defect knowledge graph links failure modes, root cause categories, corrective actions, and supplier lots, enabling cross-product pattern recognition that identifies 2–5x more systemic correlations than manual analysis. For an ODM handling 50–200 customer quality complaints per month under strict SLA, auto-drafting D1-D4 containment within hours of complaint receipt is a contractual differentiator.",
    kpis: [
      "8D report generation time: 60–80% reduction (days to hours)",
      "Customer initial response time: 70–85% faster",
      "CAPA closure time: 30–50% faster",
      "Repeat defect reduction: 20–35% fewer recurring quality issues",
    ],
    techTag: "GenAI",
    maturity: "emerging",
    businessObjectives: ["Quality", "Productivity", "Service Level"],
    archetypes: ["retriever", "analyst", "evaluator", "executor"],
    interactionMode: "copilot",
    a2aPattern: "pipeline",
    references: [
      { name: "ETQ Reliance GenAI 8D Report Automation", detail: "60–80% reduction in report generation time (3–5 days to 4–8 hours); consistent format compliance across all customer templates; engineers freed to focus on complex root cause analysis." },
      { name: "Hexagon/Q-DAS AI Quality Pattern Recognition", detail: "2–5x more cross-product correlations vs. manual analysis; defect patterns linked to specific supplier lots, shifts, and environmental conditions; 20–35% reduction in recurring defects." },
      { name: "InfinityQS AI-Powered CAPA Automation (ISO/IATF)", detail: "30–50% faster CAPA closure; 90%+ audit-ready documentation compliance vs. 60–70% with manual processes; automatic effectiveness verification via pre/post defect rate comparison." },
      { name: "ComplianceQuest / ETQ Reliance", detail: "AI-powered QMS platforms with automated CAPA and 8D generation: enterprise-grade pattern detection across products, CAPA workflow automation, and deep MES integration for traceability." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "odm-uc-09",
    workflowId: "odm-wf-proc",
    name: "Agentic Purchase Order Execution & Shortage Prediction",
    domain: "Procurement & Supply Chain",
    description:
      "A multi-agent system that monitors 50,000–100,000 active PO lines in real time across supplier portals, EDI feeds, and logistics tracking — predicting ETA deviations 5–15 days ahead via ML models incorporating historical delivery patterns, port congestion, and NLP analysis of supplier communications. Dynamic priority scoring ranks emerging shortages by production-impact value and customer priority, while tiered expediting workflows auto-execute within guardrails (supplier escalation, premium freight, alternate-source split) without buyer intervention for Tier-1 and Tier-2 actions. The 450+ minutes/day currently spent on manual ETA tracking across a buyer team is largely eliminated.",
    kpis: [
      "ETA prediction error reduction: 30–65%",
      "Shortage events reduction: up to 50%",
      "Manual tracking effort: 60–80% reduction",
      "Production delay events: 25% fewer",
    ],
    techTag: "Optimization",
    maturity: "emerging",
    businessObjectives: ["Service Level", "Productivity", "Cost Reduction"],
    archetypes: ["orchestrator", "analyst", "executor"],
    interactionMode: "autopilot",
    a2aPattern: "hierarchical",
    references: [
      { name: "Peak AI PO Management Agent", detail: "Live autonomous PO management: 98% reduction in PO entry and processing time; automated matching of confirmations, invoices, and receipts with tiered escalation to human buyers." },
      { name: "NXP Semiconductor ML Forecasting", detail: "20+ percentage-point improvement in demand forecast accuracy; ML models predicting component supply availability incorporating semiconductor industry-specific allocation signals." },
      { name: "Conro AI Component Shortage Prediction", detail: "AI predicting component shortages 2–4 weeks ahead of impact; 25% reduction in production delays through proactive intervention; market allocation signals incorporated into prediction models." },
      { name: "AWS Agentic AI Supply Chain", detail: "Agentic architecture for supply chain logistics: autonomous exception handling across ERP, TMS, and visibility platforms; demonstrated 15–40% logistics cost reduction through proactive management." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "odm-uc-10",
    workflowId: "odm-wf-rnd",
    name: "GenAI Engineering Knowledge Copilot",
    domain: "R&D / Engineering",
    description:
      "A RAG-powered conversational copilot that gives R&D engineers natural-language access to the organization's accumulated engineering knowledge — design specifications, DVT/PVT reports, component datasheets, ECO records, and lessons learned from past programs — with citation-backed responses and IP-firewalled access control ensuring customer data isolation. Proactive design-reuse suggestions surface proven solutions from prior programs when an engineer begins a new design, while automated meeting summarization and lessons-learned extraction continuously grow the knowledge base. For an ODM with 5,700+ R&D engineers spending 20–30% of their time searching for information, a 50% reduction in retrieval time recovers 570–850 engineer-equivalents of productive capacity annually.",
    kpis: [
      "Knowledge retrieval time reduction: 50–70%",
      "Engineer productivity gain: 10–30% overall",
      "Onboarding time reduction: 30–50% for new engineers",
      "Design reuse improvement: 20–40% more reuse identified",
    ],
    techTag: "GenAI",
    maturity: "emerging",
    businessObjectives: ["Productivity", "Time-to-Market", "Quality"],
    archetypes: ["retriever", "analyst"],
    interactionMode: "copilot",
    a2aPattern: "sequential",
    references: [
      { name: "Circuitry.ai Manufacturing RAG", detail: "RAG-powered decision intelligence for manufacturing knowledge management: 60–70% reduction in information search time; multi-source document integration (process specs, quality records, maintenance logs)." },
      { name: "ZettaLens Semiconductor RAG", detail: "Private on-premises RAG for semiconductor engineering teams: permission-aware citations maintaining IP confidentiality; engineers access technical knowledge without compromising customer IP firewalls." },
      { name: "HTEC Enterprise Knowledge RAG", detail: "50–70% faster knowledge retrieval across large engineering organizations; multi-format document handling (PDFs, presentations, spreadsheets, CAD metadata); continuous improvement through usage feedback." },
      { name: "Siemens Industrial Copilot", detail: "Engineering-specific copilot integrated with Teamcenter PLM and NX CAD: natural language access to design data, manufacturing constraints, and project history; demonstrated productivity gains in multi-site engineering teams." },
    ],
    validation: DEFAULT_VALIDATION,
  },
];

export const odmBranch: KnowledgeBranch = {
  sectors,
  industries,
  companies,
  functions,
  workflows,
  useCaseSeeds,
};
