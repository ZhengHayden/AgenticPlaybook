export type A2APatternId =
  | "sequential"
  | "pipeline"
  | "parallel"
  | "hierarchical"
  | "negotiation"
  | "broadcast";

export type A2APattern = {
  id: A2APatternId;
  en: { name: string; description: string; useWhen: string };
  zh: { name: string; description: string; useWhen: string };
};

export const a2aPatterns: A2APattern[] = [
  {
    id: "sequential",
    en: {
      name: "Sequential",
      description: "Strict linear hand-off, agent N+1 starts after agent N completes.",
      useWhen: "Each step depends on the prior; no parallelism possible.",
    },
    zh: {
      name: "顺序",
      description: "严格线性交接,第 N+1 个智能体在第 N 个完成后启动。",
      useWhen: "每步依赖前一步;无法并行。",
    },
  },
  {
    id: "pipeline",
    en: {
      name: "Pipeline",
      description: "Streaming hand-off with overlapping work; agents process partial outputs.",
      useWhen: "Steps can stream; throughput matters more than per-item latency.",
    },
    zh: {
      name: "流水线",
      description: "流式交接、可叠加并行;智能体处理部分输出。",
      useWhen: "步骤可流式处理;吞吐量优先于单条延迟。",
    },
  },
  {
    id: "parallel",
    en: {
      name: "Parallel",
      description: "Independent agents work simultaneously; results joined.",
      useWhen: "Sub-tasks are independent and joinable.",
    },
    zh: {
      name: "并行",
      description: "多个独立智能体同时工作;结果合并。",
      useWhen: "子任务互相独立且可合并。",
    },
  },
  {
    id: "hierarchical",
    en: {
      name: "Hierarchical",
      description: "Supervisor agent delegates to worker agents and aggregates.",
      useWhen: "Workflow has natural manager/worker structure.",
    },
    zh: {
      name: "层级",
      description: "主管智能体下派给工作智能体并聚合结果。",
      useWhen: "工作流存在天然的主管/工作者结构。",
    },
  },
  {
    id: "negotiation",
    en: {
      name: "Negotiation",
      description: "Agents exchange proposals to converge on shared outcome.",
      useWhen: "Multiple valid solutions; trade-offs require discussion.",
    },
    zh: {
      name: "协商",
      description: "智能体交换提案以达成共识。",
      useWhen: "存在多个可行方案、需要权衡讨论。",
    },
  },
  {
    id: "broadcast",
    en: {
      name: "Broadcast",
      description: "One event triggers many subscribers in parallel.",
      useWhen: "Event-driven; many independent consumers of same signal.",
    },
    zh: {
      name: "广播",
      description: "单一事件并行触发多个订阅者。",
      useWhen: "事件驱动;同一信号有多个独立消费者。",
    },
  },
];
