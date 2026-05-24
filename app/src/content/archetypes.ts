export type ArchetypeId =
  | "orchestrator"
  | "executor"
  | "analyst"
  | "retriever"
  | "evaluator";

export type Archetype = {
  id: ArchetypeId;
  icon: string;
  en: { name: string; function: string; trigger: string; example: string };
  zh: { name: string; function: string; trigger: string; example: string };
};

export const archetypes: Archetype[] = [
  {
    id: "orchestrator",
    icon: "🎯",
    en: {
      name: "Orchestrator",
      function: "Decomposes tasks, routes work, maintains state.",
      trigger: "Step requires coordination of multiple sub-tasks.",
      example: "AP exception router across analyst queues.",
    },
    zh: {
      name: "编排者",
      function: "拆解任务、分发工作、维护状态。",
      trigger: "步骤需要协调多个子任务。",
      example: "应付账款异常路由至多个分析师队列。",
    },
  },
  {
    id: "executor",
    icon: "⚙️",
    en: {
      name: "Executor",
      function: "Performs specific operations via tools/APIs.",
      trigger: "Step is a well-defined action with clear I/O.",
      example: "GL posting agent writing journal entries.",
    },
    zh: {
      name: "执行者",
      function: "通过工具/API 执行具体操作。",
      trigger: "步骤是输入输出清晰的明确动作。",
      example: "总账记账智能体写入凭证。",
    },
  },
  {
    id: "analyst",
    icon: "📊",
    en: {
      name: "Analyst",
      function: "Synthesizes information, makes recommendations.",
      trigger: "Step requires reasoning over multiple inputs.",
      example: "Variance analysis suggesting root-cause categories.",
    },
    zh: {
      name: "分析者",
      function: "综合信息、给出建议。",
      trigger: "步骤需要对多个输入进行推理。",
      example: "差异分析推荐根因类别。",
    },
  },
  {
    id: "retriever",
    icon: "🔍",
    en: {
      name: "Retriever",
      function: "Provides context from knowledge bases.",
      trigger: "Step requires finding/surfacing relevant information.",
      example: "Vendor master lookup with fuzzy match.",
    },
    zh: {
      name: "检索者",
      function: "从知识库提供上下文。",
      trigger: "步骤需要查找/呈现相关信息。",
      example: "模糊匹配的供应商主数据查询。",
    },
  },
  {
    id: "evaluator",
    icon: "🛡️",
    en: {
      name: "Evaluator",
      function: "Validates outputs, enforces quality/safety.",
      trigger: "Step requires judgment on quality or compliance.",
      example: "Tax-code compliance check on invoices.",
    },
    zh: {
      name: "评估者",
      function: "验证输出、执行质量/合规检查。",
      trigger: "步骤需要对质量或合规作出判断。",
      example: "对发票进行税务合规检查。",
    },
  },
];
