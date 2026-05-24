export type ScreenCriterionId =
  | "documentability"
  | "dataAccessibility"
  | "executionVolume"
  | "processOwner"
  | "outputQuality"
  | "processStability";

export interface ScreenCriterion {
  id: ScreenCriterionId;
  shortLabel: { en: string; zh: string };
  question: { en: string; zh: string };
  whatItMeans: { en: string; zh: string };
  whyItMatters: { en: string; zh: string };
  passExamples: { en: ReadonlyArray<string>; zh: ReadonlyArray<string> };
  failExamples: { en: ReadonlyArray<string>; zh: ReadonlyArray<string> };
  factField?: {
    en: string;
    zh: string;
    placeholder: string;
  };
}

export const screenCriteria: ReadonlyArray<ScreenCriterion> = [
  {
    id: "documentability",
    shortLabel: { en: "Process documentability", zh: "流程可记录性" },
    question: {
      en: "Is the process documented or describable in under 2 hours?",
      zh: "流程是否已记录,或可在 2 小时内被讲清?",
    },
    whatItMeans: {
      en: "A knowledgeable participant can walk through the end-to-end workflow in a structured 2-hour interview, or existing docs cover ≥80% of the process logic.",
      zh: "熟悉流程的人员可在 2 小时结构化访谈中完整讲述端到端工作流,或已有文档覆盖 ≥80% 的流程逻辑。",
    },
    whyItMatters: {
      en: "If discovery exceeds 2 hours just to understand the process, the 80-hour Design budget cannot complete. Hidden tribal knowledge signals the process is not yet mature for agentic automation.",
      zh: "若仅理解流程就需 >2 小时,Design 阶段的 80 小时预算无法完成。隐藏的部落知识意味着流程尚未成熟。",
    },
    passExamples: {
      en: [
        "Maintained SOP updated within the last 12 months",
        "Process owner can whiteboard the flow in 90 min with decision points",
        "Existing training guide covers all major paths and exceptions",
      ],
      zh: ["近 12 个月内维护过的 SOP", "流程负责人能在 90 分钟内画出含决策点的全流程", "既有培训手册覆盖所有主要路径与异常"],
    },
    failExamples: {
      en: [
        "\"Only Maria knows how this really works\"",
        "Multiple conflicting documents with no authoritative version",
        "20+ undocumented exception paths discovered only at runtime",
      ],
      zh: ["「只有 Maria 真正了解这个流程」", "多份相互冲突的文档,没有权威版本", "20+ 条仅运行时才发现的未记录异常路径"],
    },
  },
  {
    id: "dataAccessibility",
    shortLabel: { en: "Digital data accessibility", zh: "数据数字化可获取" },
    question: { en: "Is input data digitally accessible?", zh: "输入数据是否可数字化获取?" },
    whatItMeans: {
      en: "Data the agent consumes exists in a system accessible via API, DB query, file share, or structured export — no manual scanning or transcription required as a prerequisite.",
      zh: "智能体所需数据通过 API、数据库查询、文件共享或结构化导出可访问 — 不依赖手动扫描或誊抄。",
    },
    whyItMatters: {
      en: "Agents operate on digital inputs. Paper-only or non-integrated data requires a separate digitization project that exceeds engagement scope.",
      zh: "智能体只能处理数字输入。仅纸质或无集成路径的数据需要独立的数字化项目,超出本次范围。",
    },
    passExamples: {
      en: [
        "Data lives in ERP/CRM with REST API access",
        "Documents arrive as structured emails/PDFs in a monitored folder",
        "Source systems have ETL pipelines or webhooks",
      ],
      zh: ["数据存于带 REST API 的 ERP/CRM", "文档以结构化邮件/PDF 形式进入受监控的文件夹", "源系统已有 ETL 管道或 webhook"],
    },
    failExamples: {
      en: [
        "Input arrives as handwritten forms that must be manually keyed",
        "Data only in a legacy mainframe with terminal-only access",
        "Critical info lives in unstructured Slack threads or verbal approvals",
      ],
      zh: ["输入为需要手动录入的手写表单", "数据仅在仅终端访问的传统主机", "关键信息位于无结构 Slack 线程或口头审批中"],
    },
  },
  {
    id: "executionVolume",
    shortLabel: { en: "Execution volume", zh: "执行频次" },
    question: { en: "Does the process execute more than 50 times/month?", zh: "流程每月执行 >50 次?" },
    whatItMeans: {
      en: "End-to-end executions per month exceed 50, generating enough time/cost savings within 3-4 months to justify implementation.",
      zh: "每月端到端执行 >50 次,可在 3-4 个月内产生足够节省以摊回实施成本。",
    },
    whyItMatters: {
      en: "Below 50/month even a 1h-per-run process saves < 50h/month — usually insufficient to justify design + build + validation. If volume is below threshold but each run costs ≥8h, document as the allowed exception with ROI justification.",
      zh: "低于 50/月时,即便每次运行 1 小时也仅节省 <50 小时/月 — 通常不足以支撑设计、开发与验证。若低于阈值但单次 ≥8 小时,需作为允许的例外并附 ROI 证明。",
    },
    passExamples: {
      en: ["Invoice processing: 200–500/mo", "Customer onboarding: 80–150/mo", "Compliance checks: daily across 100+ tx"],
      zh: ["发票处理 200–500 次/月", "客户开户 80–150 次/月", "合规检查每日覆盖 100+ 笔交易"],
    },
    failExamples: {
      en: ["Quarterly board report (4×/yr)", "Annual audit coordination (1×/yr)", "Monthly executive briefing (12×/yr)"],
      zh: ["季度董事会报告(4 次/年)", "年度审计协调(1 次/年)", "月度高管简报(12 次/年)"],
    },
    factField: { en: "Volume per month", zh: "每月执行次数", placeholder: "e.g. 200" },
  },
  {
    id: "processOwner",
    shortLabel: { en: "Identifiable process owner", zh: "明确的流程负责人" },
    question: { en: "Is there an identifiable, willing process owner?", zh: "是否有可识别且愿意配合的流程负责人?" },
    whatItMeans: {
      en: "A named individual with authority to approve changes, allocate team time for testing, and sign off on future-state design has explicitly agreed to participate (≥4h/week, ≤48h decision turnaround).",
      zh: "已明确指定的负责人,拥有审批变更、分配测试时间、签署目标态设计的权限,并明确同意参与(≥4 小时/周,决策 ≤48 小时反馈)。",
    },
    whyItMatters: {
      en: "Without an empowered sponsor, Design cannot validate requirements, MVP cannot get test data, Production fails on adoption. Owner is the engagement's single point of client-side accountability.",
      zh: "无授权的 sponsor,设计阶段无法验证需求,MVP 无法获取测试数据,生产阶段会因采用度失败。",
    },
    passExamples: {
      en: [
        "Department head allocated 4h/week to the engagement",
        "VP designated a senior manager with decision authority",
        "Owner has signed the engagement charter with time commitment",
      ],
      zh: ["部门负责人每周分配 4 小时", "VP 指派一位拥有决策权的高级经理", "负责人已签署带时间承诺的项目章程"],
    },
    failExamples: {
      en: [
        "\"We think it's the ops team but nobody owns it formally\"",
        "Nominal owner is a junior analyst with no authority",
        "Owner agrees in principle but has no bandwidth (\"check back next quarter\")",
      ],
      zh: ["「我们觉得是运营团队但没人正式负责」", "名义负责人是无审批权的初级分析师", "负责人原则上同意但无 bandwidth(「下季度再看」)"],
    },
    factField: { en: "Owner name + role", zh: "负责人姓名+职务", placeholder: "e.g. Jane Doe, AP Lead" },
  },
  {
    id: "outputQuality",
    shortLabel: { en: "Definable output quality", zh: "可定义的输出质量" },
    question: { en: "Can \"good output\" be defined or shown via examples?", zh: "「好的输出」是否能通过规则或样例定义?" },
    whatItMeans: {
      en: "Outputs can be evaluated via explicit rules (format, accuracy, completeness) or example comparison (golden samples). At least 70% of quality is articulable without irreducible subjective judgment.",
      zh: "输出可通过显式规则(格式、准确性、完整性)或样例对比评估;质量中 ≥70% 可被表述,无需无法约简的主观判断。",
    },
    whyItMatters: {
      en: "MVP Validation requires a correctness model. Without a definition of \"correct,\" you cannot test agent outputs. Doesn't need 100% determinism — but ≥70% must be assessable without irreducible subjective judgment.",
      zh: "MVP 验证需要正确性模型。无「正确」定义则无法测试;不需完全确定,但 ≥70% 必须可评估。",
    },
    passExamples: {
      en: [
        "\"Correctly processed invoice = match ±$0.01, 12 required fields, correct approver routing\"",
        "100+ historically-approved outputs exist as reference dataset",
        "Output quality already measured by existing KPIs",
      ],
      zh: ["「正确处理的发票 = 金额匹配 ±$0.01,12 个必填字段齐全,正确路由」", "已有 100+ 历史合格输出作为参考集", "输出质量已由现有 KPI 衡量"],
    },
    failExamples: {
      en: [
        "\"Good creative copy is whatever the CMO likes that day\"",
        "Quality is purely relationship-dependent",
        "No historical examples exist — process is brand new",
      ],
      zh: ["「好的创意文案是 CMO 当天喜欢的样子」", "质量完全依赖人际关系", "流程全新,无历史样例"],
    },
  },
  {
    id: "processStability",
    shortLabel: { en: "Process stability", zh: "流程稳定性" },
    question: { en: "Is the process stable (no redesign planned in 6 months)?", zh: "流程在未来 6 个月内是否稳定(无重大重设计)?" },
    whatItMeans: {
      en: "Core logic, systems, and org context will remain substantially unchanged for ≥6 months. Minor tweaks acceptable; major changes (system migration, reorg, regulatory overhaul) are disqualifying.",
      zh: "核心逻辑、系统与组织环境在 ≥6 个月内基本不变。小调整可接受;大变更(系统迁移、组织重组、监管重大变化)不通过。",
    },
    whyItMatters: {
      en: "Building against a moving target wastes implementation effort — the agent architecture may be invalidated before reaching production.",
      zh: "针对不稳定目标构建会浪费实施成本 — 智能体架构可能在投产前就已失效。",
    },
    passExamples: {
      en: [
        "Stable for 2+ years with only parameter updates",
        "No system migrations or org changes planned in 12 months",
        "Regulatory framework is settled",
      ],
      zh: ["稳定 2 年以上,仅参数调整", "未来 12 个月无系统迁移或组织变更计划", "监管框架已定型"],
    },
    failExamples: {
      en: [
        "ERP migration to SAP S/4HANA in Q3 (4 months away)",
        "Team restructuring — half the roles may not exist in 6 months",
        "New regulation in 5 months that fundamentally changes process logic",
      ],
      zh: ["第三季度的 SAP S/4HANA 迁移(4 个月后)", "团队重组 — 一半的岗位 6 个月后可能不存在", "5 个月后生效的新规将根本性改变流程"],
    },
  },
];

export const SCREEN_PASS_THRESHOLD = 5; // 5 of 6, one allowed exception
export const SCREEN_TOTAL = 6;
