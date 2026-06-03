export type Locale = "en" | "zh";

export type Dictionary = {
  app: {
    name: string;
    tagline: string;
  };
  nav: {
    projects: string;
    knowledge: string;
    settings: string;
  };
  common: {
    new: string;
    save: string;
    cancel: string;
    next: string;
    back: string;
    continue: string;
    edit: string;
    delete: string;
    add: string;
    confirm: string;
    open: string;
    export: string;
    suggest: string;
    rationale: string;
    apply: string;
    override: string;
    accepted: string;
    pending: string;
    failed: string;
    passed: string;
    locked: string;
    recommended: string;
    selected: string;
    loading: string;
  };
  phases: {
    impactSizing: string;
    design: string;
    mvp: string;
    production: string;
    deferred: string;
  };
  project: {
    overview: string;
    progress: string;
    team: string;
    activity: string;
    client: string;
    domain: string;
    language: string;
    variant: string;
    methodology: string;
    createNew: string;
    name: string;
    nameLabel: string;
  };
  impactSizing: {
    title: string;
    candidates: string;
    screen: string;
    funnel: string;
    scoring: string;
    portfolio: string;
    gate: string;
    addCandidate: string;
    importCsv: string;
    variantA: string;
    variantB: string;
    variantC: string;
    determinism: string;
    readiness: string;
    quadrant: string;
    priority: string;
    recommendation: string;
    layer1: string;
    layer2: string;
    layer3: string;
  };
  design: {
    title: string;
    workflow: string;
    archetypes: string;
    interactions: string;
    orchestration: string;
    hitl: string;
    architecture: string;
    gate: string;
    step: string;
    archetype: string;
    mode: string;
    pattern: string;
  };
  archetypes: {
    orchestrator: string;
    executor: string;
    analyst: string;
    retriever: string;
    evaluator: string;
  };
  modes: {
    autopilot: string;
    copilot: string;
    guardian: string;
  };
  settings: {
    title: string;
    providers: string;
    defaultProvider: string;
    claudeDesc: string;
    detected: string;
    notDetected: string;
    apiKey: string;
    model: string;
    saveKey: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    app: {
      name: "Agentic Workflow Playbook",
      tagline: "Roadmap Prioritization → Design → MVP → Production",
    },
    nav: {
      projects: "Projects",
      knowledge: "Knowledge",
      settings: "Settings",
    },
    common: {
      new: "New",
      save: "Save",
      cancel: "Cancel",
      next: "Next",
      back: "Back",
      continue: "Continue",
      edit: "Edit",
      delete: "Delete",
      add: "Add",
      confirm: "Confirm",
      open: "Open",
      export: "Export",
      suggest: "Suggest",
      rationale: "Rationale",
      apply: "Apply",
      override: "Override",
      accepted: "Accepted",
      pending: "Pending",
      failed: "Failed",
      passed: "Passed",
      locked: "Locked",
      recommended: "Recommended",
      selected: "Selected",
      loading: "Loading…",
    },
    phases: {
      impactSizing: "Roadmap Prioritization",
      design: "Design",
      mvp: "MVP",
      production: "Production",
      deferred: "(deferred)",
    },
    project: {
      overview: "Overview",
      progress: "Phase Progress",
      team: "Team",
      activity: "Recent Activity",
      client: "Client",
      domain: "Domain",
      language: "Language",
      variant: "Variant",
      methodology: "Methodology",
      createNew: "New Project",
      name: "Project",
      nameLabel: "Project name",
    },
    impactSizing: {
      title: "Roadmap Prioritization",
      candidates: "Candidates",
      screen: "Readiness Check",
      funnel: "Prioritization",
      scoring: "Impact Sizing and Risk Evaluation",
      portfolio: "Portfolio",
      gate: "Gate",
      addCandidate: "Add Candidate",
      importCsv: "Import CSV",
      variantA: "A — Sequential Precision",
      variantB: "B — Funnel-First Triage",
      variantC: "C — Adaptive Layered",
      determinism: "Output Determinism",
      readiness: "Organizational Readiness",
      quadrant: "Quadrant",
      priority: "Priority",
      recommendation: "Recommendation",
      layer1: "Layer 1 · Binary Readiness Screen",
      layer2: "Layer 2 · 2x2 Prioritization Funnel",
      layer3: "Layer 3 · Detailed Scoring",
    },
    design: {
      title: "Design",
      workflow: "Workflow",
      archetypes: "Archetypes",
      interactions: "Interactions",
      orchestration: "Orchestration",
      hitl: "HITL",
      architecture: "Architecture",
      gate: "Gate",
      step: "Step",
      archetype: "Archetype",
      mode: "Mode",
      pattern: "Pattern",
    },
    archetypes: {
      orchestrator: "Orchestrator",
      executor: "Executor",
      analyst: "Analyst",
      retriever: "Retriever",
      evaluator: "Evaluator",
    },
    modes: {
      autopilot: "Autopilot",
      copilot: "Co-Pilot",
      guardian: "Guardian",
    },
    settings: {
      title: "Settings",
      providers: "Providers",
      defaultProvider: "Default Provider",
      claudeDesc: "Uses ANTHROPIC_API_KEY from your laptop environment",
      detected: "detected",
      notDetected: "not detected",
      apiKey: "API key",
      model: "Model",
      saveKey: "Save",
    },
  },
  zh: {
    app: {
      name: "Agentic 工作流剧本",
      tagline: "路线图优先级 → 设计 → MVP → 生产",
    },
    nav: {
      projects: "项目",
      knowledge: "知识库",
      settings: "设置",
    },
    common: {
      new: "新建",
      save: "保存",
      cancel: "取消",
      next: "下一步",
      back: "返回",
      continue: "继续",
      edit: "编辑",
      delete: "删除",
      add: "添加",
      confirm: "确认",
      open: "打开",
      export: "导出",
      suggest: "建议",
      rationale: "理由",
      apply: "应用",
      override: "覆盖",
      accepted: "已采纳",
      pending: "待处理",
      failed: "未通过",
      passed: "通过",
      locked: "锁定",
      recommended: "推荐",
      selected: "已选",
      loading: "加载中…",
    },
    phases: {
      impactSizing: "路线图优先级",
      design: "设计",
      mvp: "MVP",
      production: "生产",
      deferred: "（后续）",
    },
    project: {
      overview: "概览",
      progress: "阶段进度",
      team: "团队",
      activity: "最近活动",
      client: "客户",
      domain: "领域",
      language: "语言",
      variant: "方案",
      methodology: "方法论",
      createNew: "新建项目",
      name: "项目",
      nameLabel: "项目名称",
    },
    impactSizing: {
      title: "路线图优先级",
      candidates: "候选流程",
      screen: "准备度检查",
      funnel: "优先级排序",
      scoring: "影响评估与风险评估",
      portfolio: "组合",
      gate: "决策门",
      addCandidate: "添加候选",
      importCsv: "导入 CSV",
      variantA: "A — 精确顺序型",
      variantB: "B — 漏斗优先分流",
      variantC: "C — 自适应分层",
      determinism: "输出确定性",
      readiness: "组织准备度",
      quadrant: "象限",
      priority: "优先级",
      recommendation: "建议动作",
      layer1: "Layer 1 · 二元准备度筛选",
      layer2: "Layer 2 · 2x2 优先级漏斗",
      layer3: "Layer 3 · 详细评分",
    },
    design: {
      title: "设计",
      workflow: "工作流",
      archetypes: "智能体原型",
      interactions: "交互模式",
      orchestration: "编排",
      hitl: "HITL",
      architecture: "架构文档",
      gate: "决策门",
      step: "步骤",
      archetype: "原型",
      mode: "模式",
      pattern: "模式",
    },
    archetypes: {
      orchestrator: "编排者",
      executor: "执行者",
      analyst: "分析者",
      retriever: "检索者",
      evaluator: "评估者",
    },
    modes: {
      autopilot: "自动驾驶",
      copilot: "协同副驾",
      guardian: "守护者",
    },
    settings: {
      title: "设置",
      providers: "模型提供方",
      defaultProvider: "默认提供方",
      claudeDesc: "使用本机环境变量 ANTHROPIC_API_KEY",
      detected: "已检测到",
      notDetected: "未检测到",
      apiKey: "API 密钥",
      model: "模型名称",
      saveKey: "保存",
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
