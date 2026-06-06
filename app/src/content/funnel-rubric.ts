export type OdsIndicatorId = "outputStructure" | "correctnessVerifiability" | "varianceTolerance" | "groundTruth";
export type OrsIndicatorId = "sponsorAuthority" | "teamReceptivity" | "integrationComplexity" | "changeHistory";

export interface RubricIndicator<TId extends string> {
  id: TId;
  weight: number;
  label: { en: string; zh: string };
  anchors: ReadonlyArray<{
    score: 0 | 1 | 2;
    en: string;
    zh: string;
  }>;
}

export const odsIndicators: ReadonlyArray<RubricIndicator<OdsIndicatorId>> = [
  {
    id: "outputStructure",
    weight: 0.3,
    label: { en: "Output Structure", zh: "输出结构化程度" },
    anchors: [
      { score: 0, en: "Unstructured (free-text, creative)", zh: "无结构(自由文本、创意)" },
      { score: 1, en: "Semi-structured (template w/ variable sections)", zh: "半结构化(含可变段的模板)" },
      { score: 2, en: "Fully structured (form fields, fixed schema)", zh: "全结构化(固定字段与 schema)" },
    ],
  },
  {
    id: "correctnessVerifiability",
    weight: 0.3,
    label: { en: "Correctness Verifiability", zh: "正确性可验证性" },
    anchors: [
      { score: 0, en: "Requires expert subjective review", zh: "依赖专家主观评审" },
      { score: 1, en: "Partially checkable (rules + judgment)", zh: "部分可检查(规则 + 判断)" },
      { score: 2, en: "Fully rule-checkable (deterministic pass/fail)", zh: "完全可规则化检查" },
    ],
  },
  {
    id: "varianceTolerance",
    weight: 0.2,
    label: { en: "Variance Tolerance", zh: "差异容忍度" },
    anchors: [
      { score: 0, en: "Zero tolerance (must be exact)", zh: "零容忍(必须精确)" },
      { score: 1, en: "Low tolerance (minor variations acceptable)", zh: "低容忍(可接受少量差异)" },
      { score: 2, en: "High tolerance (multiple valid outputs)", zh: "高容忍(多种合法输出)" },
    ],
  },
  {
    id: "groundTruth",
    weight: 0.2,
    label: { en: "Ground Truth Availability", zh: "标注数据可获取性" },
    anchors: [
      { score: 0, en: "No historical examples exist", zh: "无历史样例" },
      { score: 1, en: "Partial dataset (<50 labeled)", zh: "部分数据集(<50 条标注)" },
      { score: 2, en: "Complete dataset (100+ labeled)", zh: "完整数据集(100+ 条标注)" },
    ],
  },
];

export const orsIndicators: ReadonlyArray<RubricIndicator<OrsIndicatorId>> = [
  {
    id: "sponsorAuthority",
    weight: 0.3,
    label: { en: "Sponsor Authority", zh: "Sponsor 权威" },
    anchors: [
      { score: 0, en: "No sponsor identified", zh: "无 sponsor" },
      { score: 1, en: "Sponsor exists, limited budget/authority", zh: "有 sponsor,预算/权限有限" },
      { score: 2, en: "Mandating sponsor w/ budget and decision power", zh: "有授权 sponsor,具备预算与决策权" },
    ],
  },
  {
    id: "teamReceptivity",
    weight: 0.25,
    label: { en: "Team Receptivity", zh: "团队接受度" },
    anchors: [
      { score: 0, en: "Active resistance (\"this will replace us\")", zh: "明显抗拒(「这会取代我们」)" },
      { score: 1, en: "Neutral/cautious (\"show me it works\")", zh: "中性/谨慎(「证明给我看」)" },
      { score: 2, en: "Enthusiastic (\"we've been asking for this\")", zh: "热情(「我们早就想要了」)" },
    ],
  },
  {
    id: "integrationComplexity",
    weight: 0.25,
    label: { en: "Integration Complexity", zh: "集成复杂度" },
    anchors: [
      { score: 0, en: "5+ systems, no APIs, custom connectors", zh: "5+ 系统、无 API、需要定制连接器" },
      { score: 1, en: "2–4 systems, some APIs available", zh: "2–4 系统,部分有 API" },
      { score: 2, en: "1–2 systems, well-documented APIs", zh: "1–2 系统,API 文档完善" },
    ],
  },
  {
    id: "changeHistory",
    weight: 0.2,
    label: { en: "Change History", zh: "变革历史" },
    anchors: [
      { score: 0, en: "No prior automation; last change initiative failed", zh: "无既往自动化;上一次变革失败" },
      { score: 1, en: "Mixed history; some automation exists", zh: "有成有败;部分自动化已落地" },
      { score: 2, en: "Recent successful automation; strong change muscle", zh: "近期自动化成功;变革能力强" },
    ],
  },
];

export const FUNNEL_THRESHOLD = 1.2; // each axis 0..2; ≥1.2 = High

export type QuadrantId = "quickWin" | "sponsorAlign" | "investProve" | "deferMature";

export interface Quadrant {
  id: QuadrantId;
  shortName: { en: string; zh: string };
  timeline: { en: string; zh: string };
  rationale: { en: string; zh: string };
  actionPath: { en: ReadonlyArray<string>; zh: ReadonlyArray<string> };
  examples: { en: ReadonlyArray<string>; zh: ReadonlyArray<string> };
  hi: { ods: boolean; ors: boolean };
  color: string; // tailwind palette suffix
}

export const quadrants: ReadonlyArray<Quadrant> = [
  {
    id: "quickWin",
    shortName: { en: "Quick Win", zh: "速胜" },
    timeline: { en: "Month 1–3", zh: "第 1–3 月" },
    rationale: {
      en: "Outputs are objectively verifiable AND the organization is ready. Lowest risk, fastest time-to-value, highest probability of success — start here to build confidence.",
      zh: "输出客观可验证,且组织准备就绪。风险最低、收益最快、成功概率最高 — 从这里开始建立信心。",
    },
    actionPath: {
      en: [
        "Proceed directly to Depth Layer scoring (Days 3–5)",
        "Fast-track through Design and MVP phases",
        "Use as engagement's lighthouse case study",
      ],
      zh: ["直接进入详细评分(Day 3–5)", "Design 与 MVP 阶段加速推进", "作为本次项目的灯塔案例"],
    },
    examples: {
      en: ["Invoice matching with structured PO data + enthusiastic finance team", "Standard customer onboarding with API-connected CRM", "Compliance screening with clear rules + regulatory sponsor"],
      zh: ["结构化 PO + 热情财务团队的发票匹配", "已 API 集成 CRM 的标准客户开户", "规则清晰、有监管 sponsor 的合规筛查"],
    },
    hi: { ods: true, ors: true },
    color: "emerald",
  },
  {
    id: "sponsorAlign",
    shortName: { en: "Sponsor & Align", zh: "争取 Sponsor 与对齐" },
    timeline: { en: "Month 4–9", zh: "第 4–9 月" },
    rationale: {
      en: "Technically tractable but adoption is the bottleneck — weak sponsorship, resistant teams, or complex integration. Will succeed technically; can fail on adoption without explicit change-management investment.",
      zh: "技术上可行,但采用度是瓶颈 — sponsor 弱、团队抗拒或集成复杂。技术可成功,但若不投入变革管理则可能在落地阶段失败。",
    },
    actionPath: {
      en: [
        "Flag for change-management workstream in Design",
        "Production deployment uses Trust-Led profile (extended shadow/parallel run)",
        "Pair with a completed Quick Win as proof",
      ],
      zh: ["在 Design 阶段标记变革管理工作流", "投产采用 Trust-Led 模式(延长影子/并行运行期)", "搭配已完成的 Quick Win 作为证据"],
    },
    examples: {
      en: ["Claims processing with clear rules but skeptical adjusters", "Data entry with structured inputs but 6 legacy systems", "Report generation with no single owner across 3 teams"],
      zh: ["规则清晰但理赔员怀疑的索赔处理", "输入结构化但有 6 个传统系统的数据录入", "无单一负责人、跨 3 个团队的报告生成"],
    },
    hi: { ods: true, ors: false },
    color: "amber",
  },
  {
    id: "investProve",
    shortName: { en: "Invest & Prove", zh: "投入与验证" },
    timeline: { en: "Month 3–6", zh: "第 3–6 月" },
    rationale: {
      en: "Org is ready and willing, but outputs are hard to verify. Requires Guardian/Co-Pilot mode and human evaluation panels (budget 2× testing time).",
      zh: "组织有热情但输出难验证。需要 Guardian/Co-Pilot 模式与人工评审 panel(测试时间预算 ×2)。",
    },
    actionPath: {
      en: [
        "Confirm HITL validation pattern is viable BEFORE proceeding",
        "Default to Guardian or Co-Pilot — never Autopilot",
        "Build explicit feedback loops to train eval criteria over time",
      ],
      zh: ["进入前先确认 HITL 验证模式可行", "默认 Guardian 或 Co-Pilot — 严禁 Autopilot", "建立显式反馈回路以训练评估标准"],
    },
    examples: {
      en: ["Customer email response drafting w/ eager support team", "Research summarization w/ enthusiastic analyst team", "Proposal first-draft for technology-forward sales team"],
      zh: ["有热情的客服团队 + 邮件回复初稿", "积极的分析师团队 + 研究摘要", "倾向技术的销售团队 + 提案初稿"],
    },
    hi: { ods: false, ors: true },
    color: "sky",
  },
  {
    id: "deferMature",
    shortName: { en: "Defer & Mature", zh: "暂缓与培育" },
    timeline: { en: "Month 9–18", zh: "第 9–18 月" },
    rationale: {
      en: "Neither dimension is ready. Forcing forward causes failed implementations that damage future agentic adoption. These are \"not yet\" candidates — define preconditions and revisit.",
      zh: "两个维度都不到位。强行推进会失败,损害未来的 agentic 采用。这是「尚未」类候选 — 定义先决条件,后续重新评估。",
    },
    actionPath: {
      en: [
        "Eliminate from current engagement scope",
        "Document maturity gaps + prerequisites for future viability",
        "Define trigger conditions for re-evaluation",
        "Include in 12–18 month transformation roadmap",
      ],
      zh: ["从本次项目范围中剔除", "记录成熟度缺口与未来可行的前置条件", "定义重新评估的触发条件", "纳入 12–18 个月的转型路线图"],
    },
    examples: {
      en: ["Creative campaign ideation w/ AI-resistant marketing team", "Strategic planning w/ no clear sponsor", "Cross-department coordination across silos"],
      zh: ["对 AI 抗拒的营销团队 + 创意活动构思", "无明确 sponsor 的战略规划", "跨部门、跨条线协调"],
    },
    hi: { ods: false, ors: false },
    color: "slate",
  },
];

export function quadrantFromScores(ods: number, ors: number): QuadrantId {
  const highOds = ods >= FUNNEL_THRESHOLD;
  const highOrs = ors >= FUNNEL_THRESHOLD;
  if (highOds && highOrs) return "quickWin";
  if (highOds && !highOrs) return "sponsorAlign";
  if (!highOds && highOrs) return "investProve";
  return "deferMature";
}
