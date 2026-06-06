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
 * Energy & Utilities branch of the Agentic Use Case Library.
 *
 * Ported from `app/data/utility/prioritized-use-cases-benchmark.md` — 23 proven,
 * globally-deployed AI/agentic use cases for an electric utility (generation,
 * grid/T&D, field operations, customer & retail, enterprise). Each leaf carries
 * the benchmark's measured KPIs (`kpis`), named deployers as market references
 * (`references`), and agentic-design tags assigned with consulting judgment.
 *
 * Browse tree (5 functions → 9 workflows → 23 use cases):
 *   Generation        → Generation Asset Intelligence | Plant Operations AI | Fuel Procurement Agent
 *   Grid & Network    → Grid Asset Management | Network Planning & DER
 *   Field Operations  → Field Service & Restoration
 *   Customer & Retail → Customer Experience AI | Retail & Metering Operations
 *   Enterprise        → Back-Office Automation
 *
 * The source is CLP-specific; this branch is generalized to a reference electric
 * utility, so CLP's internal HK$ estimates are summarized in the description and
 * the externally-measured outcomes are kept as KPIs.
 */

// ─── Sector / Industry / Company ──────────────────────────────
const sectors: Sector[] = [
  { id: "energy-utilities", name: { en: "Energy & Utilities", zh: "能源与公用事业" }, sort: 3 },
];

const industries: Industry[] = [
  { id: "eu-power", sectorId: "energy-utilities", name: { en: "Power & Utilities", zh: "电力与公用事业" }, sort: 0 },
];

const companies: Company[] = [
  { id: "ref-utility", industryId: "eu-power", name: "Electric Utility — Reference", sort: 0 },
];

// ─── Functions (value-chain areas) ────────────────────────────
const functions: LibraryFunction[] = [
  { id: "eu-fn-generation", companyId: "ref-utility", name: { en: "Generation", zh: "发电" }, color: "#b45309", sort: 0 },
  { id: "eu-fn-grid", companyId: "ref-utility", name: { en: "Grid & Network (T&D)", zh: "电网与输配电" }, color: "#1565c0", sort: 1 },
  { id: "eu-fn-field", companyId: "ref-utility", name: { en: "Field Operations", zh: "现场运营" }, color: "#0d9488", sort: 2 },
  { id: "eu-fn-customer", companyId: "ref-utility", name: { en: "Customer & Retail", zh: "客户与零售" }, color: "#7c3aed", sort: 3 },
  { id: "eu-fn-enterprise", companyId: "ref-utility", name: { en: "Enterprise Functions", zh: "企业职能" }, color: "#64748b", sort: 4 },
];

// ─── Workflows (the 9 source domains) ─────────────────────────
const workflows: LibraryWorkflow[] = [
  {
    id: "eu-wf-gen-asset",
    functionId: "eu-fn-generation",
    name: "Generation Asset Intelligence",
    description:
      "Predictive maintenance, heat-rate optimisation, outage scheduling and remaining-life estimation across the thermal generation fleet — turning SCADA/historian streams into reliability and fuel-cost gains.",
    color: "#b45309",
    sort: 0,
  },
  {
    id: "eu-wf-plant-ops",
    functionId: "eu-fn-generation",
    name: "Plant Operations AI",
    description:
      "Real-time combustion tuning and GenAI shift handover that lift plant efficiency, cut emissions and protect safety-critical knowledge transfer between crews.",
    color: "#c2700b",
    sort: 1,
  },
  {
    id: "eu-wf-fuel",
    functionId: "eu-fn-generation",
    name: "Fuel Procurement Agent",
    description:
      "Agentic spot LNG/gas purchasing within pre-approved risk limits, monitoring global market, shipping and weather signals around the clock.",
    color: "#d97706",
    sort: 2,
  },
  {
    id: "eu-wf-grid-asset",
    functionId: "eu-fn-grid",
    name: "Grid Asset Management",
    description:
      "Transformer health scoring, satellite-AI vegetation management and risk-based maintenance planning that maximise reliability per dollar of T&D maintenance spend.",
    color: "#1565c0",
    sort: 0,
  },
  {
    id: "eu-wf-planning",
    functionId: "eu-fn-grid",
    name: "Network Planning & DER",
    description:
      "Probabilistic load forecasting and AI-accelerated hosting-capacity analysis that de-risk multi-billion capital plans and speed DER/data-centre connections.",
    color: "#1e6fd0",
    sort: 1,
  },
  {
    id: "eu-wf-field",
    functionId: "eu-fn-field",
    name: "Field Service & Restoration",
    description:
      "Self-healing FLISR, outage prediction with crew pre-positioning, AI dispatch optimisation and AR field copilots — the most direct levers on SAIDI/SAIFI/CAIDI.",
    color: "#0d9488",
    sort: 0,
  },
  {
    id: "eu-wf-cx",
    functionId: "eu-fn-customer",
    name: "Customer Experience AI",
    description:
      "GenAI customer-service agents and personalised energy advisory that cut cost-to-serve while lifting CSAT and supporting energy-efficiency targets.",
    color: "#7c3aed",
    sort: 0,
  },
  {
    id: "eu-wf-retail",
    functionId: "eu-fn-customer",
    name: "Retail & Metering Operations",
    description:
      "Smart-meter data validation, non-technical-loss detection and demand-response orchestration across the AMI base — the data foundation for all downstream retail analytics.",
    color: "#8b5cf6",
    sort: 1,
  },
  {
    id: "eu-wf-enterprise",
    functionId: "eu-fn-enterprise",
    name: "Back-Office Automation",
    description:
      "AI-driven finance & accounting automation: invoice processing, reconciliations and month-end close across enterprise functions.",
    color: "#64748b",
    sort: 0,
  },
];

// ─── Use cases (UC-01 … UC-23) ────────────────────────────────
const useCaseSeeds: UseCaseSeed[] = [
  {
    id: "eu-uc-01",
    workflowId: "eu-wf-gen-asset",
    name: "Predictive Maintenance & Condition Monitoring (Generation)",
    domain: "Generation Asset Management",
    description:
      "Sensor-fusion ML across vibration, temperature, pressure, acoustic and electrical signals predicts rotating-equipment failure 30–90 days ahead, compares each unit against a fleet baseline, and risk-ranks alerts by failure consequence × probability. Feeds work orders into the CMMS/SAP-PM stack to convert reactive maintenance into condition-based intervention.",
    kpis: [
      "Maintenance expense reduction: 43–56% (Argonne National Lab benchmark)",
      "Unplanned downtime reduction: 10–30%",
      "Measured value: ~$1.8M/year per 5.3 GW fleet (GE)",
    ],
    techTag: "Analytics",
    maturity: "proven",
    businessObjectives: ["Reliability", "Cost Reduction"],
    archetypes: ["analyst", "evaluator"],
    interactionMode: "copilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Enel Global Thermal", detail: "14 plants, 7 GW: fleet-wide predictive maintenance reduced unplanned trips (2017+)." },
      { name: "US IPP (PJM/ISO-NE/NYISO)", detail: "7 gas plants, 5.3 GW: $1.8M/year value and a 2-point gain in day-ahead prediction accuracy (2020s)." },
      { name: "GE Vernova fleet", detail: "1,000+ plants: avoided a 6-month unplanned outage via bearing-temperature anomaly detection (2020–2025)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-02",
    workflowId: "eu-wf-gen-asset",
    name: "Heat-Rate Optimization (Generation)",
    domain: "Generation Asset Management",
    description:
      "A hybrid reinforcement-learning optimiser, bounded by a physics-constrained safety envelope, adjusts 50–200 control variables (firing temperature, HRSG operation, auxiliary power, inlet guide vanes) in real time. Continuously retrains on degradation and ambient conditions and propagates best-performing operating regimes across similar units.",
    kpis: [
      "Efficiency gain: >2% at single plant (Vistra Martin Lake = $4.5M/yr + 340k tons CO₂ abated)",
      "Fleet rollout: ~1% average across 67 units = >$23M/yr + 1.6M tons CO₂/yr",
      "EPRI benchmark: 3–5% heat-rate improvement (279–557 BTU/kWh) at full load",
    ],
    techTag: "Optimization",
    maturity: "proven",
    businessObjectives: ["Cost Reduction", "Decarbonisation"],
    archetypes: ["analyst", "executor", "evaluator"],
    interactionMode: "copilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Vistra Corp (Martin Lake)", detail: "Single plant: >2% efficiency gain, $4.5M/yr, 340k tons CO₂ abated (2021–2022)." },
      { name: "Vistra Corp (fleet)", detail: "67 units, 26 plants: ~1% average, >$23M/yr, 1.6M tons CO₂/yr (2022–2024)." },
      { name: "EPRI assessed plants", detail: "US fleet sample: 3–5% improvement (279–557 BTU/kWh) at full load (2020+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-03",
    workflowId: "eu-wf-grid-asset",
    name: "Transformer Health Scoring & Predictive Analytics (Grid)",
    domain: "Grid Asset Management",
    description:
      "ML on dissolved-gas analysis (H2, CH4, C2H2, C2H4, C2H6, CO) combined with load history, temperature, age and maintenance history yields a 0–100 health index and a 6–12 month failure probability per transformer. Risk-ranks the fleet for inspection and replacement, preventing catastrophic failures that drive SAIDI/SAIFI.",
    kpis: [
      "Transformer failure reduction: 48% (C3 AI); 98% detection accuracy",
      "Economic value: ~$40M/year; $800K annual O&M avoided",
      "Unplanned outage reduction: 35% (US digital substation programme)",
    ],
    techTag: "Analytics",
    maturity: "proven",
    businessObjectives: ["Reliability", "Capital Efficiency"],
    archetypes: ["analyst", "evaluator"],
    interactionMode: "copilot",
    a2aPattern: "pipeline",
    references: [
      { name: "C3 AI Reliability (US utility)", detail: "Large fleet: 48% fewer failures, 98% detection accuracy, $40M/year value (2022–2024)." },
      { name: "US utility digital substation", detail: "Distribution fleet: 35% reduction in unplanned outages (2021–2023)." },
      { name: "Ausgrid (Australia)", detail: "30,000+ distribution transformers: risk-based scoring integrated with the replacement programme (2019+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-04",
    workflowId: "eu-wf-grid-asset",
    name: "Satellite-AI Vegetation Management (Grid)",
    domain: "Grid Asset Management",
    description:
      "Deep neural networks segment satellite and LiDAR imagery to detect vegetation encroachment, classify species, and predict growth trajectory along transmission corridors. Replaces fixed-cycle clearing with risk-prioritised work orders scored by distance-to-conductor × growth rate × species risk × historical outage correlation.",
    kpis: [
      "Lowest vegetation-caused customer interruptions in company history (AiDash); beat targets by one-third",
      "O&M cost reduction: 30% + 14% SAIFI improvement (E Source clients)",
      "Industry benchmark: 15% reliability improvement + 20% budget reduction",
    ],
    techTag: "AI/ML",
    maturity: "proven",
    businessObjectives: ["Reliability", "Cost Reduction"],
    archetypes: ["retriever", "analyst", "executor"],
    interactionMode: "copilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Fortune 500 utility (AiDash)", detail: "Full T&D network: lowest vegetation CI in company history; beat targets by 1/3 (2023–2024)." },
      { name: "Northeastern US utility (E Source)", detail: "Regional network: 30% O&M reduction + 14% SAIFI improvement (2022–2023)." },
      { name: "PG&E", detail: "25,000+ miles of distribution: expanding Planet satellite imagery for wildfire risk (2022+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-05",
    workflowId: "eu-wf-field",
    name: "Autonomous Fault Isolation & Service Restoration (FLISR)",
    domain: "Field Operations & Work Management",
    description:
      "A multi-agent self-healing system detects and locates faults from current/voltage waveforms within seconds, opens switches to isolate the faulted section, and reconfigures network topology to restore power to un-faulted sections via alternate feeds — autonomously within a pre-approved topology, advisory for complex reconfigurations. The single most direct lever on SAIDI/SAIFI.",
    kpis: [
      "270,000 fewer customers interrupted; 38M fewer customer-minutes (DOE study, 5 utilities)",
      "Up to 45% CI reduction and 51% CMI reduction per event",
      "Restoration in 70 seconds vs. hours manual (Duke Energy)",
    ],
    techTag: "Optimization",
    maturity: "proven",
    businessObjectives: ["Reliability", "Customer Experience"],
    archetypes: ["orchestrator", "analyst", "executor"],
    interactionMode: "autopilot",
    a2aPattern: "hierarchical",
    references: [
      { name: "DOE study (5 US utilities)", detail: "Multiple circuits: 270K fewer customers interrupted, 38M fewer customer-minutes, 45% CI / 51% CMI reduction (2020–2023)." },
      { name: "Duke Energy", detail: "Multi-state deployment: 70-second restoration vs. hours manual (2020+)." },
      { name: "ComEd (Exelon)", detail: "Chicago metro: significant SAIDI improvement attributed to FLISR (2018+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-06",
    workflowId: "eu-wf-cx",
    name: "GenAI Customer Service Agent",
    domain: "Customer Experience & Care",
    description:
      "An LLM agent with tool use ingests the full customer 360° (billing, outage history, smart-meter data, service requests) and resolves routine enquiries end-to-end across app, web, WhatsApp, voice and email — escalating complex or safety-critical cases with context. Guardrails bound credit authority and enforce escalation triggers.",
    kpis: [
      "80% CSAT vs. 65% for human agents; handles 34% of all customer emails (Octopus/Kraken)",
      "Equivalent work of 250 FTEs; 38–40% cost-to-serve reduction",
      "McKinsey benchmark: up to 73% cost-to-serve reduction",
    ],
    techTag: "GenAI",
    maturity: "proven",
    businessObjectives: ["Customer Experience", "Cost Reduction"],
    archetypes: ["orchestrator", "retriever", "executor"],
    interactionMode: "copilot",
    a2aPattern: "hierarchical",
    references: [
      { name: "Octopus Energy (Kraken)", detail: "54M+ accounts: 80% CSAT, 34% of email volume handled, 250-FTE equivalent, 38–40% cost reduction (2023–2025)." },
      { name: "EDF (via Kraken)", detail: "5M UK customers: platform efficiencies 'unseen in energy retail' (2024–2025)." },
      { name: "Origin Energy (Australia)", detail: "4M+ customers: Kraken deployment for retail operations (2024+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-07",
    workflowId: "eu-wf-plant-ops",
    name: "Digital Shift Handover (Generation)",
    domain: "Plant Operations & Work Management",
    description:
      "GenAI summarises plant state, active alarms and pending actions from the DCS/historian, links active permits and isolations to the handover briefing, and captures operator voice notes via NLP entity extraction. Persists shift insights in a searchable knowledge base, targeting zero information-loss incidents between crews.",
    kpis: [
      "Handover duration: 50% reduction (45 min → 20 min)",
      "Target: zero information-loss incidents between shifts",
      "Eliminates paper logbooks; trend detection across shifts",
    ],
    techTag: "GenAI",
    maturity: "proven",
    businessObjectives: ["Safety", "Operational Efficiency"],
    archetypes: ["retriever", "analyst"],
    interactionMode: "copilot",
    a2aPattern: "sequential",
    references: [
      { name: "Innovapptive (industrial plants)", detail: "Oil & gas, power, chemicals: digital shift handover with safety integration and compliance automation (2023–2025)." },
      { name: "Opsima (manufacturing/O&G)", detail: "Process industry: voice-to-text capture, auto-classification, knowledge extraction (2024–2025)." },
      { name: "iFactory (steel/chemical)", detail: "Process plants: NLP entity extraction, severity classification, LLM shift summaries (2024–2025)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-08",
    workflowId: "eu-wf-retail",
    name: "Smart Meter Data Validation & Anomaly Detection",
    domain: "Retail Operations",
    description:
      "ML identifies stuck meters, communication failures and implausible reads across millions of meters, auto-corrects missing/invalid reads via temporal and spatial interpolation, and triages exceptions by revenue impact and root cause. The data-quality foundation for all downstream retail analytics — billing, theft detection, energy advisory.",
    kpis: [
      "1,400+ validated anomalies in 6 weeks; 65% resolved before customer calls (Landis+Gyr AGA)",
      "Target: >99.5% data completeness rate",
      "Manual exception handling: 80–90% reduction",
    ],
    techTag: "Analytics",
    maturity: "proven",
    businessObjectives: ["Data Quality", "Operational Efficiency"],
    archetypes: ["analyst", "evaluator", "executor"],
    interactionMode: "autopilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Landis+Gyr AGA platform", detail: "Utility deployment: 1,400+ validated anomalies in 6 weeks, 65% resolved before customer contact (2023)." },
      { name: "Multiple European utilities", detail: "Large AMI deployments: 80–90% reduction in manual exception handling reported (2022–2024)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-09",
    workflowId: "eu-wf-grid-asset",
    name: "Risk-Based Asset Maintenance Planning (Grid)",
    domain: "Grid Asset Management",
    description:
      "Scores every grid asset by P(failure) × consequence (customers, criticality, restoration time, replacement cost), replacing time-based cycles with condition-driven intervals and allocating a constrained maintenance budget to maximise reliability per dollar. Outputs map directly to Ofgem RIIO / SoC performance metrics.",
    kpis: [
      "48% fewer transformer failures; $40M annual economic value (C3 AI)",
      "Resilience index improved 56% → 99.9% (+58% CML reduction) (Imperial/Grantham)",
      "15% rework reduction; 50% faster blocker resolution (FYLD)",
    ],
    techTag: "Analytics",
    maturity: "proven",
    businessObjectives: ["Reliability", "Capital Efficiency"],
    archetypes: ["analyst", "evaluator"],
    interactionMode: "copilot",
    a2aPattern: "pipeline",
    references: [
      { name: "C3 AI (US utility)", detail: "Large T&D fleet: 48% fewer failures, $40M/year value (2022–2024)." },
      { name: "UK DNOs (RIIO-ED2)", detail: "Multiple networks: risk-based asset management mandated by Ofgem (2023+)." },
      { name: "National Grid (US)", detail: "Northeast US: 8,000+ poles/year upgraded via data-driven prioritisation (2022+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-10",
    workflowId: "eu-wf-field",
    name: "Outage Prediction & Crew Pre-Positioning",
    domain: "Field Operations & Work Management",
    description:
      "An ML ensemble (XGBoost/LSTM) links weather forecasts to outage probability per feeder section 24–72 hours ahead, estimates outage scope and duration, and optimises crew/vehicle deployment to minimise expected response time. Improves CAIDI through faster, better-positioned restoration.",
    kpis: [
      "Prediction accuracy: 98.43% (Turkish utility, XGBoost); R² > 0.98 (Texas/Michigan models)",
      "536 outages prevented; 48,000+ outage minutes avoided (EirGrid/ESB)",
      "7-day operational lookahead (IBM EIS)",
    ],
    techTag: "Analytics",
    maturity: "proven",
    businessObjectives: ["Reliability", "Operational Efficiency"],
    archetypes: ["analyst", "retriever"],
    interactionMode: "copilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Turkish distribution utility", detail: "Regional network: 98.43% accuracy with XGBoost (2024)." },
      { name: "EirGrid/ESB Networks (Ireland)", detail: "National grid: 536 outages prevented, 48,000+ minutes avoided (2023–2024)." },
      { name: "IBM EIS utility clients", detail: "Multiple US utilities: 7-day lookahead operational forecasting (2022+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-11",
    workflowId: "eu-wf-field",
    name: "AI Crew Scheduling & Dispatch Optimization",
    domain: "Field Operations & Work Management",
    description:
      "Real-time optimisation of crew assignments by skill, location, priority and travel time, with dynamic re-scheduling as emergencies arise. Faster restoration translates directly into SAIDI/CAIDI improvement and higher first-time-fix rates.",
    kpis: [
      "20% productivity increase + 30% travel-time reduction (IFS PSO, 22+ utilities)",
      "73% work-order volume increase; 76% cost-per-job reduction",
      "35% first-time-fix improvement; 40% mobile-worker productivity",
    ],
    techTag: "Optimization",
    maturity: "proven",
    businessObjectives: ["Operational Efficiency", "Reliability"],
    archetypes: ["orchestrator", "executor"],
    interactionMode: "copilot",
    a2aPattern: "hierarchical",
    references: [
      { name: "22+ utilities (IFS PSO, ex-ClickSoftware)", detail: "Field service: 20% productivity + 30% travel reduction (2020–2024)." },
      { name: "IFS field operations benchmark", detail: "Cross-industry: 73% WO volume increase; 76% cost-per-job reduction (2023–2024)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-12",
    workflowId: "eu-wf-plant-ops",
    name: "Real-Time Combustion Optimization",
    domain: "Plant Operations & Work Management",
    description:
      "Continuous ML adjustment of air-fuel ratio, flame pattern and NOx parameters — tuning as often as every 2 seconds — to lift heat rate while cutting emissions, within plant safety and emissions limits.",
    kpis: [
      "0.44–0.91% heat-rate improvement + ~19.6–19.7% NOx reduction (Basin Electric AVS)",
      "25% NOx reduction; $2M/yr in NOx credits; 2-month payback (Constellation Crane)",
      "0.5–1% fuel/CO₂ reduction; up to 12% NOx reduction (GE Autonomous Tuning)",
    ],
    techTag: "Optimization",
    maturity: "proven",
    businessObjectives: ["Decarbonisation", "Cost Reduction"],
    archetypes: ["analyst", "executor", "evaluator"],
    interactionMode: "autopilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Basin Electric AVS", detail: "2 units: 0.44–0.91% HR + 19.6–19.7% NOx reduction (2019–2021)." },
      { name: "Constellation Energy (Crane)", detail: "Single plant: 25% NOx reduction, $2M/yr credits, 2-month payback (2010s)." },
      { name: "GE gas turbine fleet", detail: "Global: 0.5–1% fuel reduction, 12% NOx, tuning every 2 seconds (2022+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-13",
    workflowId: "eu-wf-retail",
    name: "Revenue Assurance & Non-Technical Loss Detection",
    domain: "Retail Operations",
    description:
      "Pattern recognition on millions of smart-meter streams detects energy theft, tampering and billing anomalies, prioritising inspections by confidence and revenue impact to replace low-yield random checks with targeted field dispatch.",
    kpis: [
      "30% NTL reduction in 6 months; 95% detection accuracy (European utility, 1M meters)",
      "17.1% total loss reduction; 96.4% theft-incident reduction (Akre)",
      "95.3% accuracy; ~96 confirmed thefts per 100 inspections vs. 25–40% legacy (SGCC)",
    ],
    techTag: "Analytics",
    maturity: "proven",
    businessObjectives: ["Revenue Protection"],
    archetypes: ["analyst", "evaluator"],
    interactionMode: "guardian",
    a2aPattern: "pipeline",
    references: [
      { name: "European utility", detail: "1M smart meters: 30% NTL reduction in 6 months, 95% accuracy (2024–2025)." },
      { name: "Akre (Kurdistan)", detail: "Smart-meter rollout: 17.1% total loss reduction, 96.4% theft-incident reduction (2024)." },
      { name: "SGCC (China)", detail: "42K-account benchmark: 95.3% accuracy, 96/100 inspection hit rate (2023)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-14",
    workflowId: "eu-wf-planning",
    name: "Probabilistic Load Forecasting",
    domain: "Grid & Network Planning",
    description:
      "ML load and renewable forecasting that incorporates EV adoption, data-centre growth, DER and weather to produce probabilistic demand profiles — sharpening day-ahead and longer-horizon planning and avoiding capex misallocation on multi-billion development plans.",
    kpis: [
      "33% improvement in day-ahead solar forecast accuracy (~150 MW MAE reduction) (NG ESO + Alan Turing)",
      "3× better solar nowcasting vs. traditional methods (Open Climate Fix)",
      "Target: 20–40% MAPE improvement; avoids 5–15% capex misallocation",
    ],
    techTag: "Analytics",
    maturity: "proven",
    businessObjectives: ["Capital Efficiency", "Reliability"],
    archetypes: ["analyst"],
    interactionMode: "copilot",
    a2aPattern: "pipeline",
    references: [
      { name: "National Grid ESO + Alan Turing", detail: "UK national grid: 33% day-ahead solar forecast improvement, operational since Sept 2018 (2018+)." },
      { name: "Open Climate Fix + NVIDIA", detail: "UK grid nowcasting: 3× better solar nowcasting vs. traditional (2022+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-15",
    workflowId: "eu-wf-retail",
    name: "Demand-Response Orchestration",
    domain: "Retail Operations",
    description:
      "Agentic AI coordinates demand-response signals across customer segments, optimising curtailment against grid needs and renewable availability in real time — reducing both over- and under-dispatch while monetising flexible capacity.",
    kpis: [
      "28% over-dispatch reduction; 35% under-dispatch reduction; $12M/yr value (SCE + AutoGrid)",
      "92% solar forecast accuracy at 5-min intervals; 40% curtailment reduction (CLP + AutoGrid)",
      "6 GW flexible capacity across 15 countries (Enel X + AutoGrid)",
    ],
    techTag: "Optimization",
    maturity: "emerging",
    businessObjectives: ["Decarbonisation", "Reliability"],
    archetypes: ["orchestrator", "analyst", "executor"],
    interactionMode: "autopilot",
    a2aPattern: "hierarchical",
    references: [
      { name: "SCE + AutoGrid", detail: "1.5 GW, 5M accounts: 28% over-dispatch reduction, $12M/year (2022–2024)." },
      { name: "CLP + AutoGrid", detail: "Solar portfolio: 92% forecast accuracy, 40% curtailment reduction (2023+)." },
      { name: "Enel X + AutoGrid", detail: "6 GW across 15 countries: global DR platform (2020+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-16",
    workflowId: "eu-wf-cx",
    name: "Personalised Energy Advisory & Disaggregation",
    domain: "Customer Experience & Care",
    description:
      "Appliance-level energy disaggregation (NILM) from smart-meter data drives personalised savings recommendations based on each household's actual consumption pattern — supporting energy-efficiency targets at a fraction of the cost of traditional home-energy reports.",
    kpis: [
      "41 GWh saved in <1 year; ~1% savings/customer at $0.04/kWh, 25% cheaper than prior HER (RMP + Bidgely)",
      "7% CX score increase; 68% agent utilisation; 82% advisor satisfaction (APS + Bidgely)",
      "Consistent 1–3% energy savings per household across 30+ deployments",
    ],
    techTag: "AI/ML",
    maturity: "emerging",
    businessObjectives: ["Customer Experience", "Decarbonisation"],
    archetypes: ["analyst", "executor"],
    interactionMode: "autopilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Rocky Mountain Power + Bidgely", detail: "~1M customers: 41 GWh saved in <1 year, 25% cheaper than prior HER (2022–2023)." },
      { name: "APS + Bidgely", detail: "Arizona customers: 7% CX improvement, 68% agent utilisation (2022–2024)." },
      { name: "Multiple US utilities (Bidgely iHER)", detail: "30+ deployments: consistent 1–3% energy savings per household (2020+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-17",
    workflowId: "eu-wf-fuel",
    name: "Autonomous Fuel Procurement Agent",
    domain: "Generation & Fuel Procurement",
    description:
      "Agentic AI executes spot LNG/gas purchases within pre-approved risk limits around the clock, monitoring global market conditions, shipping and weather simultaneously. Adjacent BESS autonomous-trading deployments evidence the revenue-uplift potential of RL-based execution.",
    kpis: [
      "Target: 3–7% saving on spot purchases vs. manual trading; 24/7 global coverage",
      "Adjacent (BESS): +6.4% revenue uplift; 11% utilisation improvement; +1.4pp IRR",
      "Algorithmic execution: 3–10% improvement vs. manual documented",
    ],
    techTag: "Optimization",
    maturity: "pilot",
    businessObjectives: ["Cost Reduction"],
    archetypes: ["orchestrator", "analyst", "executor"],
    interactionMode: "guardian",
    a2aPattern: "negotiation",
    references: [
      { name: "Infinity Technologies (BESS)", detail: "Battery fleet: +6.4% revenue, 11% utilisation, +1.4pp IRR from RL-based autonomous trading (2024–2025)." },
      { name: "Algorithmic commodity trading (adjacent)", detail: "Multiple markets: 3–10% improvement vs. manual execution documented (2022+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-18",
    workflowId: "eu-wf-field",
    name: "Field AI Copilot & Augmented Reality",
    domain: "Field Operations & Work Management",
    description:
      "AR smart glasses / tablets provide field crews with real-time equipment data, step-by-step procedure guidance and remote expert support — reducing repeat site visits, procedural errors and task-completion time.",
    kpis: [
      "Reduced repeat tower climbs; remote expert guidance enabled (Enel Green Power)",
      "34% reduction in inspection time with AR-guided maintenance (GE Renewable Energy)",
      "Target: 20–30% task-time reduction; 40–50% procedural-error reduction",
    ],
    techTag: "GenAI",
    maturity: "emerging",
    businessObjectives: ["Operational Efficiency", "Safety"],
    archetypes: ["retriever", "analyst"],
    interactionMode: "copilot",
    a2aPattern: "hierarchical",
    references: [
      { name: "Enel Green Power", detail: "Wind fleet O&M: reduced repeat climbs, remote expert guidance (2021–2023)." },
      { name: "GE Renewable Energy", detail: "Turbine inspections: 34% inspection-time reduction (2022+)." },
      { name: "US utilities (Canary Media survey)", detail: "Multiple deployments: measurable field-service productivity gains (2022–2024)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-19",
    workflowId: "eu-wf-planning",
    name: "DER Hosting Capacity Acceleration",
    domain: "Grid & Network Planning",
    description:
      "ML accelerates hosting-capacity studies from weeks to hours for DER and data-centre connections, with model-free analysis from smart-meter data enabling per-site DER sizing without full power-flow simulation — clearing interconnection backlogs and supporting renewable-energy targets.",
    kpis: [
      "Target: 80–90% study-duration reduction",
      "Model-free HCA from smart-meter data; per-site DER sizing (DOE i2X)",
      "AI-accelerated interconnection studies reducing queue backlog (CA utilities)",
    ],
    techTag: "Analytics",
    maturity: "emerging",
    businessObjectives: ["Decarbonisation", "Customer Experience"],
    archetypes: ["analyst"],
    interactionMode: "copilot",
    a2aPattern: "pipeline",
    references: [
      { name: "DOE i2X / GridTECH", detail: "US national programme: model-free HCA from smart-meter data, per-site DER sizing (2023+)." },
      { name: "California utilities (PG&E, SCE)", detail: "Large DER queue: AI-accelerated interconnection studies to reduce backlog (2023+)." },
      { name: "Awesense", detail: "Multiple utilities: ML hosting-capacity analysis from AMI data (2023–2024)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-20",
    workflowId: "eu-wf-enterprise",
    name: "Finance & Accounting Automation",
    domain: "Enterprise Functions",
    description:
      "AI automates invoice processing, reconciliations, journal entries and month-end close across enterprise finance — extracting and validating document data, posting routine entries, and flagging exceptions for review.",
    kpis: [
      "90% reduction in manual data entry; cycle time weeks → hours; ~$2M/yr savings (Duke Energy)",
      "$50M+ working capital freed; 1.5 days faster close; 360K+ tickets/yr automated (USEReady)",
      "95% extraction accuracy; 80% processing-time reduction (Smartbridge)",
    ],
    techTag: "Analytics",
    maturity: "proven",
    businessObjectives: ["Operational Efficiency", "Cost Reduction"],
    archetypes: ["executor", "analyst"],
    interactionMode: "autopilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Duke Energy", detail: "Enterprise finance: 90% manual data-entry reduction, $2M/yr savings (2022–2023)." },
      { name: "Energy company (USEReady)", detail: "AP/AR automation: $50M+ working capital freed, 1.5 days faster close (2023–2024)." },
      { name: "Smartbridge (Oil & Gas client)", detail: "Invoice processing: 95% extraction accuracy, 80% processing-time reduction (2023)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-21",
    workflowId: "eu-wf-gen-asset",
    name: "Outage Planning & Scheduling Optimization (Generation)",
    domain: "Generation Asset Management",
    description:
      "AI optimises planned maintenance windows across the fleet by jointly considering demand, weather, fuel availability and equipment condition — minimising outage-related generation cost and over-run days.",
    kpis: [
      "536 outages prevented; 48,000+ outage minutes avoided (EirGrid/ESB)",
      "Target: 5–10% reduction in outage-related generation cost",
      "Target: 15–20% reduction in over-run days",
    ],
    techTag: "Optimization",
    maturity: "emerging",
    businessObjectives: ["Reliability", "Cost Reduction"],
    archetypes: ["analyst", "orchestrator"],
    interactionMode: "copilot",
    a2aPattern: "sequential",
    references: [
      { name: "EirGrid/ESB Networks", detail: "Irish grid: 536 outages prevented, 48,000+ minutes avoided via joint optimisation (2023–2024)." },
      { name: "N-SIDE / Elia (Belgium)", detail: "TSO operations: optimised outage scheduling minimising congestion (2022+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-22",
    workflowId: "eu-wf-gen-asset",
    name: "Reliability-Centred Maintenance (Agentic Scheduling)",
    domain: "Generation Asset Management",
    description:
      "An autonomous agent optimises maintenance intervals based on actual condition rather than calendar, dynamically reprioritising routine work across the fleet without human approval — lifting wrench time and cutting total maintenance cost.",
    kpis: [
      "Target: 15–25% total maintenance cost reduction",
      "Target: 20–30% wrench-time improvement",
      "Predictive-to-prescriptive maintenance with GenAI (Siemens Senseye)",
    ],
    techTag: "Optimization",
    maturity: "emerging",
    businessObjectives: ["Reliability", "Cost Reduction"],
    archetypes: ["orchestrator", "analyst", "executor"],
    interactionMode: "autopilot",
    a2aPattern: "hierarchical",
    references: [
      { name: "JERA + AWS", detail: "Japanese generation fleet: autonomous O&M optimisation partnership (2023+)." },
      { name: "Siemens Senseye", detail: "Industrial fleet: predictive-to-prescriptive maintenance with GenAI (2024+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "eu-uc-23",
    workflowId: "eu-wf-gen-asset",
    name: "Asset Remaining Useful Life Estimation",
    domain: "Generation Asset Management",
    description:
      "Deep learning (LSTM, CNN) on sensor time-series and failure history estimates remaining useful life of turbine blades, boiler tubes and transformers — informing capital deferral and avoiding premature replacement.",
    kpis: [
      "Predictions within 3 cycles of end-of-life; >90% anomaly detection accuracy (NASA C-MAPSS)",
      "Probabilistic RUL accurate even in early turbine life (offshore wind, LSTM + Monte Carlo)",
      "Target: 10–20% asset-life extension; significant multi-year capital deferral",
    ],
    techTag: "Analytics",
    maturity: "emerging",
    businessObjectives: ["Capital Efficiency", "Reliability"],
    archetypes: ["analyst"],
    interactionMode: "copilot",
    a2aPattern: "pipeline",
    references: [
      { name: "NASA C-MAPSS benchmark", detail: "Aero gas turbines: within 3 cycles of EOL, >90% detection accuracy (2020+)." },
      { name: "Offshore wind (academic)", detail: "Turbine drivetrain: LSTM + Monte Carlo probabilistic RUL, accurate in early life (2022–2024)." },
      { name: "Multiple industrial (Fiix/Rockwell)", detail: "Manufacturing fleet: RUL-informed maintenance reducing premature replacements (2023+)." },
    ],
    validation: DEFAULT_VALIDATION,
  },
];

// ─── Assembled branch ─────────────────────────────────────────
export const utilityBranch: KnowledgeBranch = {
  sectors,
  industries,
  companies,
  functions,
  workflows,
  useCaseSeeds,
};
