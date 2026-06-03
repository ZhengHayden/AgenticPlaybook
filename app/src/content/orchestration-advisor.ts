import type { A2APatternId } from "./a2a-patterns";
import type { WorkflowStep } from "./sample-data";

/** How well a pattern fits the current workflow composition. */
export type Fit = "recommended" | "good" | "poor";

export interface Bilingual {
  en: string;
  zh: string;
}

export interface PatternFit {
  pattern: A2APatternId;
  fit: Fit;
  reason: Bilingual;
}

/** Signals derived purely from the workflow's steps. */
export interface WorkflowSignals {
  stepCount: number;
  orchestratorCount: number;
  retrieverCount: number;
  analystCount: number;
  evaluatorCount: number;
  executorCount: number;
  decisionTotal: number;
  evaluatorIsTerminal: boolean;
}

export interface OrchestrationAdvice {
  signals: WorkflowSignals;
  recommended?: A2APatternId;
  recommendedReason?: Bilingual;
  fits: PatternFit[];
}

const PATTERN_ORDER: A2APatternId[] = [
  "sequential",
  "pipeline",
  "parallel",
  "hierarchical",
  "negotiation",
  "broadcast",
];

export function deriveSignals(steps: ReadonlyArray<WorkflowStep>): WorkflowSignals {
  const count = (id: string) => steps.filter((s) => s.archetype === id).length;
  const last = steps[steps.length - 1];
  return {
    stepCount: steps.length,
    orchestratorCount: count("orchestrator"),
    retrieverCount: count("retriever"),
    analystCount: count("analyst"),
    evaluatorCount: count("evaluator"),
    executorCount: count("executor"),
    decisionTotal: steps.reduce((sum, s) => sum + (s.decisionPoints ?? 0), 0),
    evaluatorIsTerminal: last?.archetype === "evaluator",
  };
}

/** Ordered, explainable heuristics. Returns the single best-fit pattern. */
function recommend(s: WorkflowSignals): { pattern: A2APatternId; reason: Bilingual } | undefined {
  if (s.stepCount === 0) return undefined;
  if (s.orchestratorCount >= 1)
    return {
      pattern: "hierarchical",
      reason: {
        en: "An Orchestrator step coordinates the others — a supervisor delegating to and aggregating worker agents.",
        zh: "存在编排者步骤来协调其他步骤 — 由主管下派给工作智能体并聚合结果。",
      },
    };
  if (s.retrieverCount >= 2 || s.analystCount >= 2)
    return {
      pattern: "parallel",
      reason: {
        en: "Multiple independent retrieval/analysis steps can run concurrently, then join.",
        zh: "多个独立的检索/分析步骤可并行执行后再合并。",
      },
    };
  if (s.evaluatorIsTerminal && s.stepCount >= 3)
    return {
      pattern: "pipeline",
      reason: {
        en: "Stages stream into a terminal Evaluator gate — throughput benefits from overlapping work.",
        zh: "各阶段流式汇入末端评估者门控 — 叠加并行可提升吞吐量。",
      },
    };
  return {
    pattern: "sequential",
    reason: {
      en: "Steps form a linear chain with clear hand-offs and no parallelism opportunity detected.",
      zh: "步骤形成线性链、交接清晰,未检测到并行机会。",
    },
  };
}

const GOOD_ALTERNATIVES: Record<A2APatternId, A2APatternId[]> = {
  hierarchical: ["sequential", "pipeline"],
  parallel: ["pipeline", "broadcast"],
  pipeline: ["sequential", "parallel"],
  sequential: ["pipeline"],
  negotiation: ["hierarchical"],
  broadcast: ["parallel"],
};

const POOR_REASON: Record<A2APatternId, Bilingual> = {
  sequential: { en: "Forces linearity even where steps could overlap.", zh: "即便步骤可叠加也强制线性化。" },
  pipeline: { en: "Streaming hand-off adds complexity without ≥3 stages.", zh: "不足 3 个阶段时流式交接徒增复杂度。" },
  parallel: { en: "No independent, joinable sub-tasks detected.", zh: "未检测到可并行合并的独立子任务。" },
  hierarchical: { en: "No Orchestrator/supervisor step to delegate work.", zh: "缺少编排者/主管步骤来下派工作。" },
  negotiation: { en: "No competing proposals to reconcile between agents.", zh: "智能体间没有需要协调的竞争性提案。" },
  broadcast: { en: "No single event fanning out to many consumers.", zh: "没有单一事件向多个消费者扩散。" },
};

export function adviseOrchestration(steps: ReadonlyArray<WorkflowStep>): OrchestrationAdvice {
  const signals = deriveSignals(steps);
  const rec = recommend(signals);
  const goodSet = new Set(rec ? GOOD_ALTERNATIVES[rec.pattern] : []);

  const fits: PatternFit[] = PATTERN_ORDER.map((pattern) => {
    if (rec && pattern === rec.pattern) return { pattern, fit: "recommended", reason: rec.reason };
    if (goodSet.has(pattern))
      return {
        pattern,
        fit: "good",
        reason: { en: "A reasonable alternative for this composition.", zh: "对此组合而言是合理的备选方案。" },
      };
    return { pattern, fit: "poor", reason: POOR_REASON[pattern] };
  });

  return { signals, recommended: rec?.pattern, recommendedReason: rec?.reason, fits };
}

/** Static per-pattern coordination concerns an architect should address. */
export const COORDINATION_CONCERNS: Record<A2APatternId, Bilingual[]> = {
  sequential: [
    { en: "Define the contract (schema) handed between each adjacent step.", zh: "定义相邻步骤之间交接的契约(模式)。" },
    { en: "Decide retry vs. abort when a mid-chain step fails.", zh: "确定链中某步失败时是重试还是中止。" },
  ],
  pipeline: [
    { en: "Bound the buffer between stages to avoid back-pressure stalls.", zh: "限制阶段间缓冲以避免背压阻塞。" },
    { en: "Handle partial/streamed outputs and out-of-order completion.", zh: "处理部分/流式输出与乱序完成。" },
  ],
  parallel: [
    { en: "Specify the join/aggregation step and how conflicts are merged.", zh: "明确合并/聚合步骤及冲突如何归并。" },
    { en: "Set a fan-in timeout so one slow branch can't block the result.", zh: "设置扇入超时,避免单个慢分支阻塞结果。" },
  ],
  hierarchical: [
    { en: "Define the supervisor's task-decomposition and delegation policy.", zh: "定义主管的任务拆解与下派策略。" },
    { en: "Cap delegation depth and budget per worker to prevent runaway loops.", zh: "限制下派深度与每个工作者预算,防止失控循环。" },
  ],
  negotiation: [
    { en: "Define the convergence/termination rule and a tie-breaker.", zh: "定义收敛/终止规则与决胜机制。" },
    { en: "Bound the number of negotiation rounds.", zh: "限制协商轮次。" },
  ],
  broadcast: [
    { en: "Ensure subscribers are idempotent — events may be redelivered.", zh: "确保订阅者幂等 — 事件可能被重复投递。" },
    { en: "Decide whether the publisher waits for any/all acknowledgements.", zh: "确定发布者是否等待任意/全部确认。" },
  ],
};
