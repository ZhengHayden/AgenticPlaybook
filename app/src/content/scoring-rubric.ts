export type VmDimensionId = "costSavings" | "qualityImprovement" | "speedImprovement" | "strategicAlignment";

export interface VmAnchor {
  score: 1 | 2 | 3 | 4 | 5;
  label: { en: string; zh: string };
  range: { en: string; zh: string };
  description: { en: string; zh: string };
}

export interface VmDimension {
  id: VmDimensionId;
  weight: number;
  label: { en: string; zh: string };
  anchors: ReadonlyArray<VmAnchor>;
}

export const vmDimensions: ReadonlyArray<VmDimension> = [
  {
    id: "costSavings",
    weight: 0.35,
    label: { en: "Cost Savings", zh: "成本节省" },
    anchors: [
      { score: 1, label: { en: "Minimal", zh: "极小" }, range: { en: "< $50K/yr", zh: "< $50K/年" }, description: { en: "Saves < 1 FTE-equivalent; minor efficiency gain", zh: "节省 < 1 FTE 等效;轻微效率提升" } },
      { score: 2, label: { en: "Moderate", zh: "中等" }, range: { en: "$50K–$200K", zh: "$50K–$200K" }, description: { en: "Saves 1–2 FTE-equivalent or eliminates a recurring cost line", zh: "节省 1–2 FTE 或消除一项重复支出" } },
      { score: 3, label: { en: "Significant", zh: "显著" }, range: { en: "$200K–$500K", zh: "$200K–$500K" }, description: { en: "Saves 3–5 FTE or eliminates meaningful error/penalty cost", zh: "节省 3–5 FTE 或消除可观错误/罚款成本" } },
      { score: 4, label: { en: "High", zh: "高" }, range: { en: "$500K–$1M", zh: "$500K–$1M" }, description: { en: "Saves 5–10 FTE or eliminates a major SLA/compliance cost", zh: "节省 5–10 FTE 或消除一项大额 SLA/合规成本" } },
      { score: 5, label: { en: "Transformative", zh: "颠覆性" }, range: { en: "> $1M", zh: "> $1M" }, description: { en: "Saves 10+ FTE or fundamentally changes cost structure", zh: "节省 10+ FTE 或根本性改变成本结构" } },
    ],
  },
  {
    id: "qualityImprovement",
    weight: 0.25,
    label: { en: "Quality Improvement", zh: "质量提升" },
    anchors: [
      { score: 1, label: { en: "Marginal", zh: "微小" }, range: { en: "< 10% error ↓", zh: "错误率 ↓ < 10%" }, description: { en: "Already-low error rate; minimal room to improve", zh: "错误率本已很低,改进空间有限" } },
      { score: 2, label: { en: "Noticeable", zh: "可察觉" }, range: { en: "10–30% ↓", zh: "10–30% ↓" }, description: { en: "Reduces common errors but doesn't eliminate categories", zh: "降低常见错误但不消除某类错误" } },
      { score: 3, label: { en: "Meaningful", zh: "有意义" }, range: { en: "30–50% ↓", zh: "30–50% ↓" }, description: { en: "Eliminates one or more error categories entirely", zh: "完全消除一个或多个错误类别" } },
      { score: 4, label: { en: "Substantial", zh: "大幅" }, range: { en: "50–75% ↓", zh: "50–75% ↓" }, description: { en: "Eliminates most categories; residual errors are edge cases", zh: "消除大部分类别;残留仅边界情况" } },
      { score: 5, label: { en: "Near-elimination", zh: "近乎消除" }, range: { en: "> 75% ↓", zh: "> 75% ↓" }, description: { en: "Near-zero error rates on automatable portions", zh: "在可自动化部分接近零错误率" } },
    ],
  },
  {
    id: "speedImprovement",
    weight: 0.2,
    label: { en: "Speed Improvement", zh: "速度提升" },
    anchors: [
      { score: 1, label: { en: "Marginal", zh: "微小" }, range: { en: "< 20% cycle ↓", zh: "周期时间 ↓ < 20%" }, description: { en: "Minor time savings; process already relatively fast", zh: "时间节省有限;流程本已较快" } },
      { score: 2, label: { en: "Noticeable", zh: "可察觉" }, range: { en: "20–40% ↓", zh: "20–40% ↓" }, description: { en: "Meaningful acceleration; removes manual bottlenecks", zh: "实质性提速;消除人工瓶颈" } },
      { score: 3, label: { en: "Significant", zh: "显著" }, range: { en: "40–60% ↓", zh: "40–60% ↓" }, description: { en: "Major acceleration; agents handle most sequential steps", zh: "大幅提速;智能体处理大部分顺序步骤" } },
      { score: 4, label: { en: "Dramatic", zh: "急剧" }, range: { en: "60–80% ↓", zh: "60–80% ↓" }, description: { en: "Near-real-time execution of multi-day processes", zh: "原本多日的流程接近实时执行" } },
      { score: 5, label: { en: "Real-time", zh: "实时" }, range: { en: "> 80% ↓", zh: "> 80% ↓" }, description: { en: "Process becomes effectively instantaneous", zh: "流程实质上瞬时完成" } },
    ],
  },
  {
    id: "strategicAlignment",
    weight: 0.2,
    label: { en: "Strategic Alignment", zh: "战略对齐度" },
    anchors: [
      { score: 1, label: { en: "Tangential", zh: "无关" }, range: { en: "Operational only", zh: "仅运营便利" }, description: { en: "Useful but not connected to any strategic initiative", zh: "有用但与战略无关" } },
      { score: 2, label: { en: "Supportive", zh: "支撑" }, range: { en: "Enables strategy", zh: "支撑战略" }, description: { en: "Indirectly enables a strategic goal", zh: "间接支撑战略目标" } },
      { score: 3, label: { en: "Aligned", zh: "对齐" }, range: { en: "Named priority", zh: "明列优先级" }, description: { en: "Directly supports a named strategic priority", zh: "直接支持一项已命名的战略优先级" } },
      { score: 4, label: { en: "Central", zh: "核心" }, range: { en: "Core initiative", zh: "核心举措" }, description: { en: "Core to a strategic initiative's success", zh: "对一项战略举措的成功至关重要" } },
      { score: 5, label: { en: "Flagship", zh: "旗舰" }, range: { en: "Transformation narrative", zh: "转型叙事" }, description: { en: "Defines the organization's transformation narrative", zh: "定义组织的转型叙事" } },
    ],
  },
];

// ─── DDI ─────────────────────────────────────────────────────

export type DecisionTypeId = "binary" | "multi" | "judgment";

export interface DecisionType {
  id: DecisionTypeId;
  weight: number;
  label: { en: string; zh: string };
  description: { en: string; zh: string };
  example: { en: string; zh: string };
}

export const decisionTypes: ReadonlyArray<DecisionType> = [
  {
    id: "binary",
    weight: 1,
    label: { en: "Binary", zh: "二元" },
    description: { en: "Two outcomes based on a simple condition", zh: "基于简单条件的两种结果" },
    example: { en: "Amount > $10K → route to senior approver", zh: "金额 > $10K → 路由至高级审批" },
  },
  {
    id: "multi",
    weight: 2,
    label: { en: "Multi-option", zh: "多分支" },
    description: { en: "Three+ paths based on multiple factors", zh: "基于多因素的三种以上路径" },
    example: { en: "Segment + size + history → 5 pricing tiers", zh: "客群 + 规模 + 历史 → 5 档定价" },
  },
  {
    id: "judgment",
    weight: 3,
    label: { en: "Judgment", zh: "判断型" },
    description: { en: "Requires reasoning, context interpretation, trade-offs", zh: "需要推理、上下文解释、权衡" },
    example: { en: "Evaluate supplier proposal: negotiate, accept, or reject", zh: "评估供应商提案:谈判、接受、拒绝" },
  },
];

export interface DdiInterpretation {
  range: [number, number];
  level: { en: string; zh: string };
  implication: { en: string; zh: string };
}

export const ddiInterpretations: ReadonlyArray<DdiInterpretation> = [
  { range: [0, 0.2], level: { en: "Low", zh: "低" }, implication: { en: "RPA may be sufficient — agent adds limited value", zh: "RPA 可能足够,智能体增益有限" } },
  { range: [0.2, 0.4], level: { en: "Moderate", zh: "中" }, implication: { en: "Agent adds value at decision points; consider Co-Pilot mode", zh: "智能体在决策点增值;考虑 Co-Pilot 模式" } },
  { range: [0.4, 0.6], level: { en: "Good", zh: "良" }, implication: { en: "Meaningful decision density — standard agentic fit", zh: "决策密度有意义 — 典型智能体适配" } },
  { range: [0.6, 0.8], level: { en: "High", zh: "高" }, implication: { en: "Decision-rich; agent reasoning is primary value driver", zh: "决策密集;智能体推理是主要价值来源" } },
  { range: [0.8, 1.0], level: { en: "Very High", zh: "极高" }, implication: { en: "Highest agentic potential but highest validation complexity", zh: "智能体潜力最大,但验证复杂度最高" } },
];

// ─── Risk ────────────────────────────────────────────────────

export type RiskCategoryId = "implementation" | "adoption" | "compliance" | "dependency";
export type RiskLevel = "L" | "M" | "H";

export interface RiskCategory {
  id: RiskCategoryId;
  label: { en: string; zh: string };
  basedOn: { en: string; zh: string };
  criteria: ReadonlyArray<{
    level: RiskLevel;
    en: string;
    zh: string;
  }>;
}

export const riskCategories: ReadonlyArray<RiskCategory> = [
  {
    id: "implementation",
    label: { en: "Implementation Risk", zh: "实施风险" },
    basedOn: { en: "DDI × Integration Complexity", zh: "DDI × 集成复杂度" },
    criteria: [
      { level: "L", en: "DDI < 0.4 AND ≤ 2 systems", zh: "DDI < 0.4 且 ≤ 2 个系统" },
      { level: "M", en: "DDI 0.4–0.7 OR 3–4 systems", zh: "DDI 0.4–0.7 或 3–4 个系统" },
      { level: "H", en: "DDI > 0.7 AND 5+ systems", zh: "DDI > 0.7 且 5+ 个系统" },
    ],
  },
  {
    id: "adoption",
    label: { en: "Adoption Risk", zh: "采用风险" },
    basedOn: { en: "ORS score (carried from 2×2)", zh: "ORS 分数(从 2×2 携带)" },
    criteria: [
      { level: "L", en: "ORS ≥ 1.6 — strong sponsor + team", zh: "ORS ≥ 1.6 — 强 sponsor 与团队" },
      { level: "M", en: "ORS 1.2–1.6 — adequate", zh: "ORS 1.2–1.6 — 一般" },
      { level: "H", en: "ORS < 1.2 — weak / resistant", zh: "ORS < 1.2 — 弱/抗拒" },
    ],
  },
  {
    id: "compliance",
    label: { en: "Compliance Risk", zh: "合规风险" },
    basedOn: { en: "Regulatory exposure × Error cost", zh: "监管敞口 × 错误成本" },
    criteria: [
      { level: "L", en: "No oversight; errors < $1K each", zh: "无监管;错误成本 < $1K" },
      { level: "M", en: "Light reg OR moderate error cost ($1K–$50K)", zh: "弱监管或中等错误成本 ($1K–$50K)" },
      { level: "H", en: "Heavy reg AND high error cost (> $50K)", zh: "强监管且错误成本 > $50K" },
    ],
  },
  {
    id: "dependency",
    label: { en: "Dependency Risk", zh: "依赖风险" },
    basedOn: { en: "Count & reliability of external systems", zh: "外部系统数量与可靠性" },
    criteria: [
      { level: "L", en: "0–1 deps, all SLA > 99.5%", zh: "0–1 个依赖,均 SLA > 99.5%" },
      { level: "M", en: "2–3 deps, mixed reliability", zh: "2–3 个依赖,可靠性混合" },
      { level: "H", en: "4+ deps OR any SLA < 99%", zh: "4+ 个依赖或任一 SLA < 99%" },
    ],
  },
];

// ─── Final ───────────────────────────────────────────────────

export const PRIORITY_FLOOR = 3.0;

export interface PriorityInterpretation {
  range: [number, number];
  label: { en: string; zh: string };
  action: { en: string; zh: string };
}

export const priorityInterpretations: ReadonlyArray<PriorityInterpretation> = [
  { range: [0, 2.0], label: { en: "Insufficient", zh: "不足" }, action: { en: "Park — not viable for this engagement", zh: "搁置 — 不适合本次项目" } },
  { range: [2.0, 3.0], label: { en: "Marginal", zh: "边缘" }, action: { en: "Park unless no better candidates; needs sponsor justification", zh: "若无更好候选则保留,需 sponsor 说明" } },
  { range: [3.0, 4.0], label: { en: "Solid", zh: "稳健" }, action: { en: "Proceed to Design — standard approach", zh: "进入 Design — 标准流程" } },
  { range: [4.0, 5.0], label: { en: "Strong", zh: "强" }, action: { en: "High-priority; allocate best resources; flagship candidate", zh: "高优先级;配置最佳资源;旗舰候选" } },
  { range: [5.0, 999], label: { en: "Exceptional", zh: "卓越" }, action: { en: "Rare — confirm calibration; proceed with confidence", zh: "罕见 — 确认未通胀;果断推进" } },
];

// ─── Pure computation helpers ────────────────────────────────

export function computeVm(scores: Record<VmDimensionId, number>): number {
  return vmDimensions.reduce((sum, d) => sum + scores[d.id] * d.weight, 0);
}

export function computeDdiRaw(counts: Record<DecisionTypeId, number>, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  const weighted = decisionTypes.reduce((sum, t) => sum + counts[t.id] * t.weight, 0);
  return weighted / totalSteps;
}

export function computeRiskPenalty(risks: Record<RiskCategoryId, RiskLevel>): number {
  return Object.values(risks).filter((r) => r === "H").length;
}

export function computeRas(vm: number, riskPenalty: number): number {
  return vm * (1 - 0.15 * riskPenalty);
}

export function computePriority(ras: number, ddiNormalized: number): number {
  return ras * (1 + 0.25 * ddiNormalized);
}

export function interpretPriority(score: number): PriorityInterpretation {
  return (
    priorityInterpretations.find((i) => score >= i.range[0] && score < i.range[1]) ??
    priorityInterpretations[priorityInterpretations.length - 1]
  );
}

export function interpretDdi(normalized: number): DdiInterpretation {
  return (
    ddiInterpretations.find((i) => normalized >= i.range[0] && normalized < i.range[1]) ??
    ddiInterpretations[ddiInterpretations.length - 1]
  );
}

// ─── two-mode scoring: cohort + workflow rollup ──────────────

/**
 * A unit that can be scored on the Layer-3 rubric — either a candidate
 * (workflow mode) or a {@link ProjectUseCase} (use-case mode). Defined with the
 * rubric's own id types so this module stays self-contained (no cross-import).
 */
export interface ScorableUnit {
  vm: Record<VmDimensionId, number>;
  ddi: Record<DecisionTypeId, number>;
  totalSteps: number;
  risk: Record<RiskCategoryId, RiskLevel>;
}

/** Largest raw DDI across a cohort; floored to a tiny positive to avoid /0. */
export function cohortMaxDdiRaw(units: ReadonlyArray<ScorableUnit>): number {
  return Math.max(0.0001, ...units.map((u) => computeDdiRaw(u.ddi, u.totalSteps)));
}

/** Full Priority for one unit, normalized against the cohort's max raw DDI. */
export function computeUnitPriority(unit: ScorableUnit, maxDdiRaw: number): number {
  const vm = computeVm(unit.vm);
  const ddiNormalized = maxDdiRaw > 0 ? computeDdiRaw(unit.ddi, unit.totalSteps) / maxDdiRaw : 0;
  const ras = computeRas(vm, computeRiskPenalty(unit.risk));
  return computePriority(ras, ddiNormalized);
}

/** A workflow's roll-up over its use-case priorities (use-case mode). */
export interface WorkflowRollup {
  /** Max of the use-case priorities; 0 when none are scored. */
  priority: number;
  /** Number of scored use cases. */
  total: number;
  /** Count of use-case priorities at or above {@link PRIORITY_FLOOR}. */
  aboveFloor: number;
}

/** Roll a workflow's use-case priorities up to a single ranking record. */
export function rollupWorkflow(useCasePriorities: ReadonlyArray<number>): WorkflowRollup {
  if (useCasePriorities.length === 0) return { priority: 0, total: 0, aboveFloor: 0 };
  return {
    priority: Math.max(...useCasePriorities),
    total: useCasePriorities.length,
    aboveFloor: useCasePriorities.filter((p) => p >= PRIORITY_FLOOR).length,
  };
}
