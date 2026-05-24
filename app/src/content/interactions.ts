export type InteractionId = "autopilot" | "copilot" | "guardian";

export type InteractionMode = {
  id: InteractionId;
  icon: string;
  en: { name: string; autonomy: string; criterion: string };
  zh: { name: string; autonomy: string; criterion: string };
};

export const interactionModes: InteractionMode[] = [
  {
    id: "autopilot",
    icon: "🚀",
    en: {
      name: "Autopilot",
      autonomy: "Full — agent executes and logs.",
      criterion: "Low-risk, reversible, high-volume.",
    },
    zh: {
      name: "自动驾驶",
      autonomy: "完全自主 — 智能体执行并记录。",
      criterion: "低风险、可逆、高频次。",
    },
  },
  {
    id: "copilot",
    icon: "🤝",
    en: {
      name: "Co-Pilot",
      autonomy: "Shared — agent proposes, human refines.",
      criterion: "Medium-risk, judgment-dependent.",
    },
    zh: {
      name: "协同副驾",
      autonomy: "共同决策 — 智能体提议、人工修正。",
      criterion: "中等风险、依赖人工判断。",
    },
  },
  {
    id: "guardian",
    icon: "🛡️",
    en: {
      name: "Guardian",
      autonomy: "Limited — agent prepares, human decides.",
      criterion: "High-risk, irreversible, regulated.",
    },
    zh: {
      name: "守护者",
      autonomy: "受限 — 智能体准备、人工决策。",
      criterion: "高风险、不可逆、强监管。",
    },
  },
];
