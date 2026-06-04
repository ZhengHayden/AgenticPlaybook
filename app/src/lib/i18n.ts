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
    scan: string;
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
    opportunity: string;
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
  scan: {
    title: string;
    subtitle: string;
    uploadLabor: string;
    uploadHc: string;
    uploadAutomation: string;
    uploadLaborHint: string;
    uploadHcHint: string;
    uploadAutomationHint: string;
    compute: string;
    computing: string;
    recompute: string;
    empty: string;
    generatedAt: string;
    modeUsd: string;
    modeFte: string;
    modeBaseline: string;
    modeUsdLabel: string;
    modeFteLabel: string;
    modeBaselineLabel: string;
    total: string;
    function: string;
    legendLow: string;
    legendHigh: string;
    warnings: string;
    clickHint: string;
    currentActivities: string;
    futureActivities: string;
    freedCapacity: string;
    keyTakeaways: string;
    activityLegend: string;
    largestDrop: string;
    automationRatio: string;
    noInsight: string;
    close: string;
    // Opportunity Scanning wizard + dashboard
    wizardTitle: string;
    stepIdentity: string;
    stepUpload: string;
    companyName: string;
    companyNameHint: string;
    sector: string;
    sectorSelect: string;
    sectorOther: string;
    sectorOtherHint: string;
    startScan: string;
    launchScan: string;
    dataSummary: string;
    runScan: string;
    linkedToClient: string;
    kpiBaselineHc: string;
    kpiFunctions: string;
    kpiBgs: string;
    kpiReleasedFte: string;
    kpiUsdReleased: string;
    kpiAvgReleased: string;
    hcByBg: string;
    hcByFunction: string;
    coverage: string;
    functionsWithInsight: string;
    indexTitle: string;
    indexSubtitle: string;
    newScan: string;
    noScans: string;
    openDashboard: string;
    noScanYet: string;
    noScanYetHint: string;
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
      scan: "Scan",
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
      opportunity: "Opportunity Scan",
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
      scoring: "Impact Sizing and Risk Evaluation",
      portfolio: "Prioritization",
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
    scan: {
      title: "Top-Down Automation Scan",
      subtitle: "Where agentic automation frees the most labor capacity, by Function × Business Group.",
      uploadLabor: "Labor rate",
      uploadHc: "Headcount distribution",
      uploadAutomation: "Automation potential",
      uploadLaborHint: ".xlsx — Function, Job Level, Salary (USD)",
      uploadHcHint: ".xlsx — BG, Function, Job Level, FTE",
      uploadAutomationHint: ".md — per-function work-content breakdown",
      compute: "Compute scan",
      computing: "Computing…",
      recompute: "Re-upload & recompute",
      empty: "Upload the three source files to generate the automation-impact heatmap.",
      generatedAt: "Generated",
      modeUsd: "USD released",
      modeFte: "Released FTE",
      modeBaseline: "Baseline HC",
      modeUsdLabel: "Annual labor cost released",
      modeFteLabel: "Released capacity (FTE-equivalent)",
      modeBaselineLabel: "Baseline headcount",
      total: "Total",
      function: "Function",
      legendLow: "Low",
      legendHigh: "High",
      warnings: "Data notes",
      clickHint: "Click any cell to see the work-content shift for that function.",
      currentActivities: "Current activities",
      futureActivities: "Future activities",
      freedCapacity: "Freed-up capacity",
      keyTakeaways: "Key takeaways",
      activityLegend: "Activity categories",
      largestDrop: "Largest reduction",
      automationRatio: "Automation ratio",
      noInsight: "No qualitative insight provided for this function.",
      close: "Close",
      wizardTitle: "Opportunity Scan",
      stepIdentity: "Company & sector",
      stepUpload: "Upload data",
      companyName: "Company name",
      companyNameHint: "Used to link this scan to the client across projects.",
      sector: "Industry sector",
      sectorSelect: "Select a sector…",
      sectorOther: "Other (specify)",
      sectorOtherHint: "Enter a custom sector",
      startScan: "Start Opportunity Scan",
      launchScan: "Run scan",
      dataSummary: "Data summary",
      runScan: "Plot opportunity heatmap",
      linkedToClient: "Linked to client",
      kpiBaselineHc: "Baseline headcount",
      kpiFunctions: "Functions",
      kpiBgs: "Business groups",
      kpiReleasedFte: "Released FTE",
      kpiUsdReleased: "USD released",
      kpiAvgReleased: "Avg released ratio",
      hcByBg: "Headcount by business group",
      hcByFunction: "Headcount by function",
      coverage: "Automation coverage",
      functionsWithInsight: "functions with a key insight",
      indexTitle: "Opportunity Scans",
      indexSubtitle: "Automation-impact scans by company. Open one to view its heatmap and drill-downs.",
      newScan: "New scan",
      noScans: "No scans yet. Start one from a project or with “New scan”.",
      openDashboard: "Open dashboard",
      noScanYet: "No Opportunity Scan for this client yet.",
      noScanYetHint: "Upload the workforce and automation data to size the opportunity.",
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
      scan: "扫描",
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
      opportunity: "机会扫描",
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
      scoring: "影响评估与风险评估",
      portfolio: "优先级排序",
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
    scan: {
      title: "自顶向下自动化扫描",
      subtitle: "按职能 × 业务集团展示智能体自动化释放劳动力产能最多的领域。",
      uploadLabor: "薪资费率",
      uploadHc: "人力分布",
      uploadAutomation: "自动化潜力",
      uploadLaborHint: ".xlsx — 职能、职级、薪资（美元）",
      uploadHcHint: ".xlsx — 业务集团、职能、职级、FTE",
      uploadAutomationHint: ".md — 各职能工作内容拆分",
      compute: "生成扫描",
      computing: "计算中…",
      recompute: "重新上传并计算",
      empty: "上传三个源文件以生成自动化影响热力图。",
      generatedAt: "生成于",
      modeUsd: "释放金额",
      modeFte: "释放 FTE",
      modeBaseline: "基线人力",
      modeUsdLabel: "年度人力成本释放额",
      modeFteLabel: "释放产能（等效 FTE）",
      modeBaselineLabel: "基线人数",
      total: "合计",
      function: "职能",
      legendLow: "低",
      legendHigh: "高",
      warnings: "数据说明",
      clickHint: "点击任意单元格查看该职能的工作内容转变。",
      currentActivities: "当前活动",
      futureActivities: "未来活动",
      freedCapacity: "释放产能",
      keyTakeaways: "关键洞察",
      activityLegend: "活动类别",
      largestDrop: "降幅最大",
      automationRatio: "自动化比例",
      noInsight: "该职能暂无定性洞察。",
      close: "关闭",
      wizardTitle: "机会扫描",
      stepIdentity: "公司与行业",
      stepUpload: "上传数据",
      companyName: "公司名称",
      companyNameHint: "用于按客户跨项目关联此次扫描。",
      sector: "行业领域",
      sectorSelect: "选择行业领域…",
      sectorOther: "其他（自定义）",
      sectorOtherHint: "输入自定义行业",
      startScan: "开始机会扫描",
      launchScan: "运行扫描",
      dataSummary: "数据概要",
      runScan: "绘制机会热力图",
      linkedToClient: "已关联客户",
      kpiBaselineHc: "基线人数",
      kpiFunctions: "职能数",
      kpiBgs: "业务集团数",
      kpiReleasedFte: "释放 FTE",
      kpiUsdReleased: "释放金额",
      kpiAvgReleased: "平均释放比例",
      hcByBg: "按业务集团的人数",
      hcByFunction: "按职能的人数",
      coverage: "自动化覆盖",
      functionsWithInsight: "个职能含关键洞察",
      indexTitle: "机会扫描",
      indexSubtitle: "按公司汇总的自动化影响扫描。打开任一项查看其热力图与下钻。",
      newScan: "新建扫描",
      noScans: "暂无扫描。可从项目中或通过“新建扫描”开始。",
      openDashboard: "打开仪表盘",
      noScanYet: "该客户暂无机会扫描。",
      noScanYetHint: "上传人力与自动化数据以评估机会规模。",
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
