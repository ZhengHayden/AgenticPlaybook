import type {
  KnowledgeLibrary,
  KnowledgeUseCase,
  LibraryFunction,
  LibraryWorkflow,
  Sector,
  Industry,
  Company,
  UseCaseSeed,
} from "./knowledge";
import { DEFAULT_VALIDATION } from "./knowledge";
import { utilityBranch } from "./knowledge-utility-seed";

/**
 * Bundled seed for the Agentic Use Case Library. The repository inserts this on
 * a fresh database (see `db/knowledge-repo.ts`).
 *
 * TMT → Telecom → Vodafone Idea is the fully populated flagship branch, ported
 * from `app/data/Vodafone_Idea_CVM_AI_Platform_updated.html` (`cases` +
 * `WORKFLOWS`). Two lightly-stubbed branches (Financial Services → Banking and
 * Industrials → Manufacturing) prove the Sector/Industry/Company switcher.
 *
 * Use case `kpis` were split from the mockup's `\n`-joined string into arrays;
 * `comp{n}/comp{n}Action` became `references[]`; `executives` became `sponsors`;
 * archetype / interaction / A2A tags were assigned with consulting judgment.
 */

// ─── Sectors ──────────────────────────────────────────────────
const sectors: Sector[] = [
  { id: "tmt", name: { en: "TMT", zh: "科技媒体电信" }, sort: 0 },
  { id: "financial-services", name: { en: "Financial Services", zh: "金融服务" }, sort: 1 },
  { id: "industrials", name: { en: "Industrials", zh: "工业制造" }, sort: 2 },
];

// ─── Industries ───────────────────────────────────────────────
const industries: Industry[] = [
  { id: "tmt-telecom", sectorId: "tmt", name: { en: "Telecom", zh: "电信" }, sort: 0 },
  { id: "fs-banking", sectorId: "financial-services", name: { en: "Banking", zh: "银行" }, sort: 0 },
  { id: "ind-manufacturing", sectorId: "industrials", name: { en: "Manufacturing", zh: "制造业" }, sort: 0 },
];

// ─── Companies ────────────────────────────────────────────────
const companies: Company[] = [
  { id: "vodafone-idea", industryId: "tmt-telecom", name: "Vodafone Idea", sort: 0 },
  { id: "meridian-bank", industryId: "fs-banking", name: "Meridian Bank (sample)", sort: 0 },
  { id: "apex-manufacturing", industryId: "ind-manufacturing", name: "Apex Manufacturing (sample)", sort: 0 },
];

// ─── Functions (was `vertical`) ───────────────────────────────
const functions: LibraryFunction[] = [
  { id: "vi-fn-churn", companyId: "vodafone-idea", name: { en: "Churn Prevention", zh: "流失防控" }, color: "#c8102e", sort: 0 },
  { id: "vi-fn-arpu", companyId: "vodafone-idea", name: { en: "ARPU & Revenue", zh: "ARPU 与营收" }, color: "#1565c0", sort: 1 },
  { id: "vi-fn-offer", companyId: "vodafone-idea", name: { en: "Offer Intelligence", zh: "营销智能" }, color: "#2e7d32", sort: 2 },
  { id: "vi-fn-lifecycle", companyId: "vodafone-idea", name: { en: "Customer Lifecycle", zh: "客户生命周期" }, color: "#f57c00", sort: 3 },
  { id: "mb-fn-fraud", companyId: "meridian-bank", name: { en: "Fraud & Risk", zh: "欺诈与风险" }, color: "#7c3aed", sort: 0 },
  { id: "am-fn-quality", companyId: "apex-manufacturing", name: { en: "Quality & Maintenance", zh: "质量与维护" }, color: "#0d9488", sort: 0 },
];

// ─── Workflows ────────────────────────────────────────────────
const workflows: LibraryWorkflow[] = [
  {
    id: "vi-wf-churn",
    functionId: "vi-fn-churn",
    name: "Churn Shield Platform",
    description:
      "End-to-end churn defence: 30-day prediction to HV protection to pre-lapse early warning. Addresses Vi's primary challenge of systematic revenue leakage from prepaid churn.",
    color: "#c8102e",
    durationWeeks: 8,
    squadHint: "Platform squad 9 · 3 agent squads",
    sort: 0,
  },
  {
    id: "vi-wf-revenue",
    functionId: "vi-fn-arpu",
    name: "Revenue Growth Engine",
    description:
      "Base monetisation AI: NBO engine to data propensity to prepaid upgrade to price elasticity modelling. Targets Rs 2,000+ Cr incremental annual revenue from the existing subscriber base.",
    color: "#1565c0",
    durationWeeks: 7,
    squadHint: "Platform squad 8 · 3 agent squads",
    sort: 1,
  },
  {
    id: "vi-wf-campaign",
    functionId: "vi-fn-offer",
    name: "Campaign Intelligence Platform",
    description:
      "Smart CVM execution: AI micro-targeting to fatigue suppression to dynamic microsegmentation. Replaces batch campaigns with real-time individual-level personalisation delivering 3-5x response lift.",
    color: "#2e7d32",
    durationWeeks: 6,
    squadHint: "Platform squad 7 · 2 agent squads",
    sort: 2,
  },
  {
    id: "vi-wf-lifecycle",
    functionId: "vi-fn-lifecycle",
    name: "Lifecycle & Win-back AI",
    description:
      "Subscriber lifecycle management: win-back of lapsed base to 2G-to-4G migration to discount-optimised reactivation. Unlocks ~Rs 1,000 Cr/yr from reactivation, technology upgrade and pricing optimisation.",
    color: "#f57c00",
    durationWeeks: 6,
    squadHint: "Platform squad 7 · 2 agent squads",
    sort: 3,
  },
  {
    id: "mb-wf-fraud",
    functionId: "mb-fn-fraud",
    name: "Fraud Defense Platform",
    description:
      "Real-time transaction monitoring and case triage: anomaly detection feeding an investigator copilot that prioritises and explains alerts.",
    color: "#7c3aed",
    durationWeeks: 6,
    squadHint: "Scaffold branch",
    sort: 0,
  },
  {
    id: "am-wf-quality",
    functionId: "am-fn-quality",
    name: "Predictive Quality Platform",
    description:
      "Vision-based defect detection and predictive maintenance: shop-floor signals feeding quality scoring and maintenance scheduling agents.",
    color: "#0d9488",
    durationWeeks: 6,
    squadHint: "Scaffold branch",
    sort: 0,
  },
];

// ─── Branch composition ───────────────────────────────────────
// Additional sector branches (e.g. Energy & Utilities) live in their own
// modules and are concatenated here so a single `withParents` pass resolves the
// denormalized parent ids across the whole taxonomy.
const sectorsAll: Sector[] = [...sectors, ...utilityBranch.sectors];
const industriesAll: Industry[] = [...industries, ...utilityBranch.industries];
const companiesAll: Company[] = [...companies, ...utilityBranch.companies];
const functionsAll: LibraryFunction[] = [...functions, ...utilityBranch.functions];
const workflowsAll: LibraryWorkflow[] = [...workflows, ...utilityBranch.workflows];

// ─── Use case factory ─────────────────────────────────────────
/** Resolve denormalized parent ids by walking workflow → function → company → … */
function withParents(uc: UseCaseSeed): KnowledgeUseCase {
  const workflow = workflowsAll.find((w) => w.id === uc.workflowId);
  if (!workflow) throw new Error(`Seed: unknown workflowId ${uc.workflowId}`);
  const fn = functionsAll.find((f) => f.id === workflow.functionId);
  if (!fn) throw new Error(`Seed: unknown functionId ${workflow.functionId}`);
  const company = companiesAll.find((c) => c.id === fn.companyId);
  if (!company) throw new Error(`Seed: unknown companyId ${fn.companyId}`);
  const industry = industriesAll.find((i) => i.id === company.industryId);
  if (!industry) throw new Error(`Seed: unknown industryId ${company.industryId}`);
  return {
    ...uc,
    functionId: fn.id,
    companyId: company.id,
    industryId: industry.id,
    sectorId: industry.sectorId,
  };
}

const useCaseSeeds: UseCaseSeed[] = [
  {
    id: "vi-uc-1",
    workflowId: "vi-wf-churn",
    name: "Subscriber Churn Prediction & Proactive Retention AI",
    domain: "Churn Prediction & Retention AI",
    description:
      "Ensemble ML platform predicting 30-day churn probability for each of Vi's ~210M subscribers — integrating CDR usage trends, recharge recency and frequency, network experience signals (call drop rates, signal quality), app engagement, VAS subscription status and device type. Vi faces industry-high churn of ~2.2% monthly driven by intense competition from Jio and Airtel; a 0.1pp monthly churn reduction on a 150M prepaid subscriber base saves ~Rs 900 Cr/yr. Current retention is reactive and rule-based; AI-driven early intervention 7-14 days before churn generates 3-5x higher save rates.",
    kpis: [
      "Monthly churn rate: down 0.10-0.20pp (~Rs 1,350-2,700 Cr/yr revenue saved)",
      "Churn prediction precision at top-decile: up to 65-75%",
    ],
    techTag: "AI/ML",
    maturity: "proven",
    businessObjectives: ["Revenue Growth", "Customer Experience"],
    archetypes: ["analyst", "evaluator", "executor"],
    interactionMode: "copilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Airtel", detail: "Airtel's churn AI on its 375M subscriber base reduced monthly prepaid churn from 3.1% to 2.4% in FY24, with gradient boosting models identifying the usage-decline cohort 14 days ahead — enabling targeted retention offers that generated Rs 2,200 Cr in retained revenue versus prior rule-based interventions." },
      { name: "Jio", detail: "Jio's subscriber health AI flags at-risk subscribers based on recharge lapse signals 10 days before validity expiry, with real-time RTBS integration enabling automated IVR and push notification interventions that achieved 38% save rates on its 470M user base." },
      { name: "Singtel", detail: "Singtel's churn AI reduced quarterly churn 28% through network-quality-linked intervention, with ML identifying that 42% of churn was network-experience-driven rather than price-driven." },
    ],
    sponsors: "CEO - Akshaya Moondra, Chief Marketing Officer - (VERIFY)",
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "vi-uc-2",
    workflowId: "vi-wf-churn",
    name: "High-Value Subscriber Protection & Premium Retention AI",
    domain: "High-Value Subscriber Protection AI",
    description:
      "Dedicated AI platform protecting Vi's top 15% subscribers (Platinum/Gold value band) who contribute ~55% of total revenue — using separate churn models calibrated for postpaid and high-ARPU prepaid profiles, with network-quality SLA monitoring, proactive service recovery for call drop events, and personalised retention propositions. Vi's HV base has ARPU of Rs 350-700/month; each percentage point of HV churn represents Rs 600+ Cr annual revenue loss. Current HV management is largely manual; AI enables individual-level risk scoring and action prioritisation.",
    kpis: [
      "High-value subscriber churn: down 0.20-0.35pp (~Rs 400-600 Cr/yr)",
      "HV subscriber NPS: up 12-18 points",
      "Proactive network issue resolution before complaint: up to 75%+ of events",
    ],
    techTag: "AI/ML",
    maturity: "proven",
    businessObjectives: ["Revenue Growth", "Customer Experience"],
    archetypes: ["analyst", "evaluator"],
    interactionMode: "copilot",
    a2aPattern: "hierarchical",
    references: [
      { name: "Airtel", detail: "Airtel's premium subscriber AI reduced Gold and Platinum churn 38% in FY24 through proactive network issue alerts, with ML identifying that network experience drives 60% of HV churn versus price sensitivity — enabling targeted network investment that improved retention ROI 4x." },
      { name: "Verizon", detail: "Verizon's HV subscriber protection AI reduced postpaid premium churn 22% in FY23, with real-time network quality scoring triggering proactive service credits — generating $890M in retained annual revenue." },
      { name: "T-Mobile", detail: "T-Mobile's AI flagged 2.1M at-risk premium subscribers for proactive outreach in Q4 FY23, achieving a 44% save rate through personalised plan upgrade offers timed to contract review windows." },
    ],
    sponsors: "CEO - Akshaya Moondra, CFO - Murthy GVAS",
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "vi-uc-3",
    workflowId: "vi-wf-churn",
    name: "Value-at-Risk Scoring & Lapsed Subscriber Early Warning AI",
    domain: "Value-at-Risk Early Warning AI",
    description:
      "Real-time early warning system combining recharge gap detection, usage velocity decline and network-complaint signal monitoring to identify subscribers moving from at-risk to pre-lapsed state — triggering automated interventions 5-15 days before the subscriber goes inactive. Vi's prepaid base recharges on pack validity cycles of 28, 56 or 84 days; AI tracks deviation from established personal recharge patterns at the individual level. Integration with Vi's RTBS enables real-time triggers within 2 hours of a recharge gap signal versus the current 48-72 hour batch process.",
    kpis: [
      "Early warning lead time vs. current detection: up from 2 to 10-14 days",
      "Revenue at risk identified before lapse: up Rs 800-1,200 Cr/yr recoverable pool",
      "Pre-lapse save rate vs. post-lapse win-back: up 3-5x better conversion",
    ],
    techTag: "AI/ML",
    maturity: "emerging",
    businessObjectives: ["Revenue Growth", "Customer Experience"],
    archetypes: ["retriever", "analyst", "executor"],
    interactionMode: "autopilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Jio", detail: "Jio's pre-lapse detection AI identifies recharge gap risk within 4 hours for subscribers with >6 months history, enabling automated IVR calls that achieve 22% same-day recharge conversion — generating Rs 1,800 Cr annually in revenue that would otherwise have lapsed." },
      { name: "Airtel", detail: "Airtel's subscriber lapse model achieved 71% precision in identifying 7-day pre-lapse subscribers in FY24, with SMS nudge campaigns personalised to pack preference generating 18% conversion versus 4% for broadcast messages." },
      { name: "Ooredoo", detail: "Ooredoo's early warning AI reduced prepaid churn 31% by detecting recharge pattern anomalies 12 days before lapse and triggering personalised validity extension offers." },
    ],
    sponsors: "Chief Marketing Officer - (VERIFY), CTO - (VERIFY)",
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "vi-uc-4",
    workflowId: "vi-wf-revenue",
    name: "Next Best Offer (NBO) Engine & Real-time Personalisation AI",
    domain: "Next Best Offer Engine",
    description:
      "Real-time ML engine generating personalised tariff upgrade, data pack, roaming and VAS offers for each Vi subscriber at every digital and assisted touchpoint — integrating current pack, usage patterns, recharge history, device capability, propensity scores and offer fatigue signals to select the offer with the highest probability of acceptance and ARPU uplift. Vi's current CVM operates batch campaigns with 3-5 day cycle times; the NBO engine enables sub-second real-time recommendations via API to MyVi App, USSD, retailer POS and IVR.",
    kpis: [
      "Offer acceptance rate: up from ~3% broadcast to 12-18% AI-targeted",
      "ARPU uplift from upsell: up Rs 8-15/month per converted subscriber (~Rs 1,200-2,200 Cr/yr)",
      "Cost per successful offer conversion: down 55-65%",
    ],
    techTag: "GenAI",
    maturity: "proven",
    businessObjectives: ["Revenue Growth", "Innovation"],
    archetypes: ["orchestrator", "analyst", "executor"],
    interactionMode: "autopilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Jio", detail: "Jio's real-time NBO engine generates 8M+ personalised offer recommendations per day via JioPhone and MyJio app, achieving 14.2% acceptance versus 2.8% for broadcast — generating an estimated Rs 3,500 Cr incremental annual revenue from upsells." },
      { name: "Airtel", detail: "Airtel's Thanks AI platform NBO engine increased data pack upsell revenue 28% in FY24, with real-time API integration into its retailer app enabling AI recommendations at the point of recharge that achieved 16% acceptance rates." },
      { name: "Telefonica", detail: "Telefonica's real-time NBO engine across Spain and LatAm increased ARPU 6.8% in FY23 through ML-driven plan migration offers delivered at optimal moments in the customer journey." },
    ],
    sponsors: "Chief Marketing Officer - (VERIFY), CEO - Akshaya Moondra",
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "vi-uc-5",
    workflowId: "vi-wf-revenue",
    name: "Data Pack Propensity Scoring & Intelligent Recharge Nudge AI",
    domain: "Data Pack Propensity & Recharge AI",
    description:
      "Dedicated ML platform predicting each subscriber's propensity to purchase a data pack in the next 7 days — combining current data consumption trajectory (days-to-exhaustion of active pack), historical pack preferences, network experience on 4G versus 2G, device data capability and seasonal patterns. Vi's data revenue is the primary growth lever; ~80M subscribers on the base are data-underserved (on voice-only or low-data packs with 4G-capable handsets). The model identifies the right pack recommendation and optimal timing window (at 80% consumption) to maximise acceptance.",
    kpis: [
      "Data pack conversion rate: up from ~5% to 12-18% on AI-targeted cohort",
      "Data ARPU uplift from propensity targeting: up Rs 600-1,200 Cr/yr",
      "Time-to-next-recharge: down from 4.2 to 2.8 days average",
    ],
    techTag: "AI/ML",
    maturity: "proven",
    businessObjectives: ["Revenue Growth"],
    archetypes: ["analyst", "executor"],
    interactionMode: "autopilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Airtel", detail: "Airtel's data pack propensity AI reduced time-to-recharge 1.3 days on average by identifying the 80%-consumption trigger window as the optimal nudge moment — generating Rs 900 Cr additional data revenue in FY24 versus the prior fixed-validity reminder approach." },
      { name: "Jio", detail: "Jio's consumption-triggered recharge nudge system generates 15M+ personalised data pack suggestions daily via JioPhone, achieving 11.8% same-day pack activation versus 3.2% for date-based reminders." },
      { name: "BSNL", detail: "BSNL's data propensity targeting pilot in two circles improved data pack uptake 35% among 4G device holders still on 2G packs." },
    ],
    sponsors: "Chief Marketing Officer - (VERIFY), CFO - Murthy GVAS",
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "vi-uc-6",
    workflowId: "vi-wf-revenue",
    name: "Prepaid-to-Postpaid Migration Propensity & Conversion AI",
    domain: "Prepaid-to-Postpaid Upgrade AI",
    description:
      "ML platform identifying prepaid subscribers with high propensity to migrate to postpaid plans — targeting the ~3M Vi prepaid subscribers who exhibit consistent Rs 300+ monthly spend, regular heavy data usage, and stable 6+ month tenure. Postpaid ARPU (Rs 210+/month) is 40-60% higher than equivalent prepaid, with significantly lower churn rates (under 0.8%/month versus 2.2% prepaid). The propensity model integrates financial stability signals and usage patterns to prioritise highest-conversion prepaid subscribers for targeted postpaid migration offers with zero-deposit incentives.",
    kpis: [
      "Prepaid-to-postpaid migration rate: up from ~0.2% to 1.0-1.5% of eligible base/month",
      "ARPU uplift from migrated subscribers: up Rs 50-80/month per migrant (~Rs 300-500 Cr/yr)",
      "Postpaid net adds from existing base: up 15,000-25,000/month incremental",
    ],
    techTag: "AI/ML",
    maturity: "emerging",
    businessObjectives: ["Revenue Growth"],
    archetypes: ["analyst", "executor"],
    interactionMode: "copilot",
    a2aPattern: "sequential",
    references: [
      { name: "Airtel", detail: "Airtel's prepaid-to-postpaid AI identified 8.2M prepaid subscribers spending Rs 300+ monthly in FY24, with targeted migration offers achieving 2.1% monthly conversion — contributing 172K incremental postpaid additions per month versus 45K from broadcast campaigns." },
      { name: "Jio", detail: "Jio's migration AI combined recharge value scoring with digital-engagement signals to identify 12M prepaid subscribers with postpaid propensity above 0.4, with zero-deposit bundle offers achieving 1.8% monthly conversion." },
      { name: "Reliance Jio", detail: "Jio's bundle migration model targeting high-recharge prepaid subscribers contributed 28% of its postpaid net adds in Q3 FY24." },
    ],
    sponsors: "CEO - Akshaya Moondra, Chief Marketing Officer - (VERIFY)",
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "vi-uc-8",
    workflowId: "vi-wf-campaign",
    name: "Offer Fatigue Detection & Communication Frequency Optimisation AI",
    domain: "Offer Fatigue & Suppression AI",
    description:
      "ML system monitoring each subscriber's offer interaction history across all CVM channels to detect and prevent offer fatigue — tracking opt-out rates, non-response streaks, message frequency and channel saturation signals to dynamically suppress over-contacted subscribers and optimise communication frequency per individual. Vi currently sends 8-12 CVM communications per subscriber per month; industry research shows 6+ communications/month significantly increases opt-out and complaint rates. The suppression engine reduces total campaign sends by 25-35% while improving overall response rates.",
    kpis: [
      "Campaign opt-out rate: down 35-50%",
      "Overall CVM campaign ROI: up 20-30% from noise reduction",
      "DNC (Do Not Contact) violations: down towards zero",
    ],
    techTag: "AI/ML",
    maturity: "proven",
    businessObjectives: ["Customer Experience", "Innovation"],
    archetypes: ["evaluator", "analyst"],
    interactionMode: "guardian",
    a2aPattern: "broadcast",
    references: [
      { name: "Airtel", detail: "Airtel's communication frequency AI reduced its CVM contact volume 30% in FY24 by suppressing over-contacted and non-responsive subscribers — counter-intuitively increasing total campaign revenue by 18% as channel effectiveness recovered, with opt-out rates falling 42%." },
      { name: "Vodafone Germany", detail: "Vodafone Germany's fatigue detection AI reduced monthly SMS campaign volume 35% while increasing response rates 28% in 2023, with ML frequency optimisation identifying that high-value subscribers needed 40% fewer contacts to achieve optimal conversion." },
      { name: "Orange", detail: "Orange's AI-driven contact frequency optimisation reduced DNC complaints 60% while maintaining campaign revenue flat — demonstrating that volume reduction does not impair revenue when combined with better targeting." },
    ],
    sponsors: "Chief Marketing Officer - (VERIFY), CTO - (VERIFY)",
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "vi-uc-10",
    workflowId: "vi-wf-lifecycle",
    name: "Lapsed Subscriber Win-back & Reactivation AI",
    domain: "Win-back & Reactivation AI",
    description:
      "ML platform scoring Vi's lapsed subscriber base (~60M subscribers inactive >90 days) for win-back propensity — combining last-active usage profile, reason-for-lapse inference (price vs. network vs. migration), historical recharge value, tenure and competitive context to prioritise outreach and personalise win-back offers. Post-churn win-back generates 3-4x lower lifetime value than retention; AI triage focuses spend on the 15-20% of lapsed subscribers most likely to return with acceptable ARPU. Integration with MNP data identifies subscribers who ported to Airtel/Jio and redirects spend to in-store and digital channels.",
    kpis: [
      "Win-back rate (90-day): up from ~8% to 18-25% on AI-targeted cohort",
      "Win-back ARPU vs. new subscriber cost: up 30-45% ROI advantage",
      "Win-back campaign cost per reactivated subscriber: down 35-50%",
    ],
    techTag: "AI/ML",
    maturity: "emerging",
    businessObjectives: ["Revenue Growth"],
    archetypes: ["analyst", "executor"],
    interactionMode: "copilot",
    a2aPattern: "parallel",
    references: [
      { name: "Airtel", detail: "Airtel's win-back AI on its lapsed base of ~45M subscribers achieved 21% 90-day reactivation on AI-prioritised cohorts in FY24, with ML lapse-reason inference enabling price-sensitive lapsed subscribers to receive targeted Rs 99/28-day offers versus network-quality-driven churners who received upgrade-to-4G pitches — outperforming broadcast offers 4.2x." },
      { name: "BSNL", detail: "BSNL's win-back targeting AI identified 8M recently-churned subscribers (within 60 days) as the highest-conversion window, achieving 28% reactivation with device upgrade incentives." },
      { name: "Telenor Pakistan", detail: "Telenor's AI win-back programme identified 3.2M lapsed subscribers with >12-month tenure as the highest-CLV reactivation target, achieving 24% conversion with personalised offers calibrated to prior ARPU." },
    ],
    sponsors: "Chief Marketing Officer - (VERIFY), CEO - Akshaya Moondra",
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "vi-uc-11",
    workflowId: "vi-wf-lifecycle",
    name: "2G-to-4G Technology Migration Propensity & Upgrade AI",
    domain: "2G-to-4G Migration AI",
    description:
      "ML propensity platform identifying the optimal 2G subscribers to target for 4G device upgrade and service migration — analysing current data usage appetite (even on 2G), handset data capability, recharge value, geographic 4G coverage quality and competitive pressure. Vi has ~80M subscribers on 2G networks with ~45M holding 4G-capable handsets who have not yet migrated. 4G ARPU (Rs 180+ versus Rs 95 on 2G) represents a Rs 900+ Cr revenue opportunity. The model flags subscribers in Vi's strongest 4G coverage areas for priority targeting.",
    kpis: [
      "2G to 4G migration rate on targeted cohort: up from ~1.5% to 6-10%/month",
      "Post-migration ARPU uplift: up Rs 75-110/month per migrated subscriber (~Rs 400-600 Cr/yr)",
      "4G data revenue from migration programme: up Rs 300-500 Cr/yr",
    ],
    techTag: "AI/ML",
    maturity: "proven",
    businessObjectives: ["Revenue Growth", "Innovation"],
    archetypes: ["analyst", "retriever", "executor"],
    interactionMode: "copilot",
    a2aPattern: "sequential",
    references: [
      { name: "Airtel", detail: "Airtel's 2G migration AI identified 65M 2G subscribers with 4G-capable handsets as the priority upgrade cohort in FY24, with propensity models achieving 8.3% monthly conversion — generating Rs 2,800 Cr incremental 4G revenue and accelerating its 2G sunset timeline by 18 months." },
      { name: "Jio", detail: "Jio's 4G upgrade AI targeted 2G subscribers from competing operators with personalised porting offers calibrated to their usage — acquiring 12M subscribers in FY24 who had previously been on 2G networks." },
      { name: "MTN Nigeria", detail: "MTN Nigeria's 2G migration AI achieved 11% monthly migration rate on propensity-targeted cohorts versus 2% for broadcast, driven by coverage quality scoring." },
    ],
    sponsors: "CTO - (VERIFY), Chief Marketing Officer - (VERIFY)",
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "vi-uc-12",
    workflowId: "vi-wf-revenue",
    name: "Price Elasticity Modelling & Differentiated Pricing AI",
    domain: "Price Elasticity & Differentiated Pricing AI",
    description:
      "AI-driven price elasticity engine that identifies the optimal price points for differentiated tariff offerings across Vi's subscriber base — leveraging demand sensitivity modelling, competitive pricing signals, and subscriber value segmentation to apply targeted price uplifts of ~5% to price-inelastic cohorts (top 5% of the base). The model identifies subscribers with low churn sensitivity to price changes based on tenure, usage depth, and competitive alternatives in their geography, enabling Vi to maximise ARPU without materially increasing churn risk. Integration with real-time pricing APIs enables dynamic pack pricing by circle and segment.",
    kpis: [
      "Price-inelastic subscriber base: top 1.25% of 150M = ~1.875M subscribers",
      "ARPU uplift from differentiated pricing: 5% uplift on targeted cohort",
      "Revenue impact: 150M × 1.25% base × 12mo × Rs 150 ARPU × 5% uplift × 85% horizon × 70% capture = Rs 100 Cr/yr",
    ],
    techTag: "AI/ML",
    maturity: "emerging",
    businessObjectives: ["Revenue Growth"],
    archetypes: ["analyst", "evaluator"],
    interactionMode: "guardian",
    a2aPattern: "negotiation",
    references: [
      { name: "Airtel", detail: "Airtel's dynamic pricing AI segments subscribers by price sensitivity using tenure, usage and competitive data, enabling 3–8% targeted ARPU uplifts on price-inelastic cohorts without measurable churn impact — contributing Rs 900+ Cr incremental revenue in FY24." },
      { name: "Jio", detail: "Jio's price optimisation engine uses ML propensity models to identify subscribers tolerant of incremental plan repricing, with A/B testing across circles enabling controlled ARPU uplift of 4–6% on selected cohorts." },
      { name: "Vodafone Germany", detail: "Vodafone Germany's price elasticity AI reduced revenue leakage from under-monetised segments by 22% in 2023, identifying 8% of its base as price-inelastic and applying differentiated pricing tiers with minimal churn impact." },
    ],
    sponsors: "Chief Marketing Officer - (VERIFY), CFO - Murthy GVAS",
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "vi-uc-13",
    workflowId: "vi-wf-lifecycle",
    name: "Discount Reduction for Silent Reactivation & Usage Recovery AI",
    domain: "Win-back Discount Optimisation AI",
    description:
      "AI platform optimising win-back offer economics by identifying lapsed subscribers most likely to reactivate with reduced discount incentives — replacing blanket high-discount win-back campaigns with precision targeting that recovers lapsed subscribers at a lower cost per reactivation. The model analyses the top 20% of Vi's 60M lapsed base (~12M subscribers) by propensity score and historical value, applying differentiated reactivation nudges: Rs 10/month ARPU uplift over 12 months drives Rs 100+ Cr incremental revenue when combined with a 7% recovery rate, 85% maturity horizon and 70% capture rate. Silent subscribers (no engagement but valid MNP) are prioritised for low-discount reactivation, while usage-reduction cohorts receive tailored upgrade offers to restore pre-lapse ARPU levels.",
    kpis: [
      "Win-back recovery: 7% of top 20% of 60M lapsed base = ~840K reactivations/yr",
      "ARPU uplift per reactivated subscriber: Rs 10/month above minimal win-back offer",
      "Revenue: 60M × 20% × 12mo × Rs 10 × 7% recovery × 85% horizon × 70% capture = Rs 100.8 Cr/yr",
    ],
    techTag: "AI/ML",
    maturity: "emerging",
    businessObjectives: ["Revenue Growth"],
    archetypes: ["analyst", "evaluator", "executor"],
    interactionMode: "copilot",
    a2aPattern: "parallel",
    references: [
      { name: "Airtel", detail: "Airtel's win-back discount optimisation AI reduced average reactivation offer cost 35% in FY24 by identifying price-sensitive lapsed subscribers who respond to minimal incentives, versus value-sensitive churners requiring premium offers — increasing win-back ROI by 2.8x versus uniform discount campaigns." },
      { name: "Jio", detail: "Jio's lapsed subscriber AI segments the inactive base by reactivation probability and offer sensitivity, serving zero-discount data top-up nudges to high-propensity lapsed subscribers while reserving aggressive offers for low-propensity but high-CLV targets." },
      { name: "Telenor", detail: "Telenor's discount reduction AI on its win-back programme reduced campaign spend 28% while maintaining reactivation rates, by identifying that 40% of lapsed subscribers respond to engagement-led reactivation rather than price incentives." },
    ],
    sponsors: "Chief Marketing Officer - (VERIFY), CEO - Akshaya Moondra",
    validation: DEFAULT_VALIDATION,
  },

  // ── Scaffold: Financial Services → Banking → Meridian Bank ──
  {
    id: "mb-uc-1",
    workflowId: "mb-wf-fraud",
    name: "Real-time Transaction Fraud Detection AI",
    domain: "Transaction Fraud Detection",
    description:
      "Streaming anomaly-detection model scoring card and account transactions in real time, blocking high-risk events and routing ambiguous cases to an investigator copilot. Illustrative scaffold entry for the Banking branch.",
    kpis: ["Fraud loss rate: down 30-45%", "False-positive decline rate: down 20-30%"],
    techTag: "AI/ML",
    maturity: "proven",
    businessObjectives: ["Risk Reduction", "Customer Experience"],
    archetypes: ["analyst", "evaluator", "executor"],
    interactionMode: "guardian",
    a2aPattern: "pipeline",
    references: [
      { name: "Industry benchmark", detail: "Leading banks report 30-45% fraud-loss reduction from real-time ML scoring versus rule-based engines." },
    ],
    sponsors: "Chief Risk Officer (sample)",
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "mb-uc-2",
    workflowId: "mb-wf-fraud",
    name: "Investigator Copilot & Alert Triage AI",
    domain: "Case Triage & Investigation",
    description:
      "GenAI copilot that prioritises fraud alerts, assembles case context and drafts disposition narratives for human investigators. Illustrative scaffold entry for the Banking branch.",
    kpis: ["Alerts handled per investigator: up 2-3x", "Average investigation time: down 40-55%"],
    techTag: "GenAI",
    maturity: "emerging",
    businessObjectives: ["Operational Efficiency"],
    archetypes: ["retriever", "analyst"],
    interactionMode: "copilot",
    a2aPattern: "hierarchical",
    references: [
      { name: "Industry benchmark", detail: "Copilot-assisted triage commonly doubles investigator throughput while improving consistency." },
    ],
    sponsors: "Head of Financial Crime (sample)",
    validation: DEFAULT_VALIDATION,
  },

  // ── Scaffold: Industrials → Manufacturing → Apex Manufacturing ──
  {
    id: "am-uc-1",
    workflowId: "am-wf-quality",
    name: "Vision-based Defect Detection AI",
    domain: "Automated Quality Inspection",
    description:
      "Computer-vision model inspecting parts on the line, flagging defects and feeding a quality-scoring agent. Illustrative scaffold entry for the Manufacturing branch.",
    kpis: ["Defect escape rate: down 40-60%", "Manual inspection effort: down 50-70%"],
    techTag: "AI/ML",
    maturity: "proven",
    businessObjectives: ["Quality Improvement", "Cost Reduction"],
    archetypes: ["analyst", "evaluator"],
    interactionMode: "autopilot",
    a2aPattern: "pipeline",
    references: [
      { name: "Industry benchmark", detail: "Vision inspection typically halves manual QA effort while cutting defect escapes by 40-60%." },
    ],
    sponsors: "VP Operations (sample)",
    validation: DEFAULT_VALIDATION,
  },
  {
    id: "am-uc-2",
    workflowId: "am-wf-quality",
    name: "Predictive Maintenance Scheduling AI",
    domain: "Predictive Maintenance",
    description:
      "Sensor-driven model predicting equipment failure and scheduling maintenance to minimise unplanned downtime. Illustrative scaffold entry for the Manufacturing branch.",
    kpis: ["Unplanned downtime: down 25-40%", "Maintenance cost: down 15-25%"],
    techTag: "Analytics",
    maturity: "emerging",
    businessObjectives: ["Cost Reduction", "Reliability"],
    archetypes: ["analyst", "orchestrator"],
    interactionMode: "copilot",
    a2aPattern: "sequential",
    references: [
      { name: "Industry benchmark", detail: "Predictive maintenance programmes commonly cut unplanned downtime 25-40%." },
    ],
    sponsors: "Plant Manager (sample)",
    validation: DEFAULT_VALIDATION,
  },
];

const useCases: KnowledgeUseCase[] = [...useCaseSeeds, ...utilityBranch.useCaseSeeds].map(
  withParents,
);

export const knowledgeSeed: KnowledgeLibrary = {
  sectors: sectorsAll,
  industries: industriesAll,
  companies: companiesAll,
  functions: functionsAll,
  workflows: workflowsAll,
  useCases,
};
