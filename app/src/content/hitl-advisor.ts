import type { HitlCheckpoint, WorkflowStep } from "./sample-data";

export interface Bilingual {
  en: string;
  zh: string;
}

/** Inherent risk of a step, derived from failure cost and reversibility. */
export type RiskLevel = "critical" | "elevated" | "moderate" | "minimal";

export const RISK_LABEL: Record<RiskLevel, Bilingual> = {
  critical: { en: "Critical", zh: "极高" },
  elevated: { en: "Elevated", zh: "较高" },
  moderate: { en: "Moderate", zh: "中等" },
  minimal: { en: "Minimal", zh: "较低" },
};

export function stepRisk(step: WorkflowStep): RiskLevel {
  const cost = step.failureCost ?? "low";
  const reversible = step.reversible ?? false;
  if (cost === "high" && !reversible) return "critical";
  if (cost === "high" || (cost === "med" && !reversible)) return "elevated";
  if (cost === "med") return "moderate";
  return "minimal";
}

export interface HitlRecommendation {
  checkpoint: HitlCheckpoint;
  confidenceThreshold: number;
  note: Bilingual;
}

/** Suggested oversight baseline for a step that warrants human review. */
export function recommendHitl(step: WorkflowStep): HitlRecommendation {
  const risk = stepRisk(step);
  const guardian = step.interactionMode === "guardian";
  if (risk === "critical")
    return {
      checkpoint: "pre",
      confidenceThreshold: 90,
      note: {
        en: "Critical & irreversible — require human approval before execution.",
        zh: "极高且不可逆 — 执行前必须人工批准。",
      },
    };
  if (risk === "elevated")
    return {
      checkpoint: guardian ? "pre" : "post",
      confidenceThreshold: 75,
      note: {
        en: "Elevated risk — approve high-stakes cases; review the rest.",
        zh: "风险较高 — 对高风险案例批准,其余事后复核。",
      },
    };
  return {
    checkpoint: "post",
    confidenceThreshold: 60,
    note: {
      en: "Moderate risk — async review after execution is sufficient.",
      zh: "中等风险 — 执行后异步复核即可。",
    },
  };
}

/** Steps that should carry an explicit HITL configuration. */
export function isOversightStep(step: WorkflowStep): boolean {
  const mode = step.interactionMode;
  return mode === "copilot" || mode === "guardian";
}

/** A step is configured once a checkpoint is chosen. */
export function isHitlConfigured(step: WorkflowStep): boolean {
  return Boolean(step.hitl?.checkpoint);
}

/**
 * High/elevated-risk steps left on Autopilot (or with no mode) — a safety gap
 * the architect should reconsider before shipping.
 */
export function isRiskGap(step: WorkflowStep): boolean {
  const risk = stepRisk(step);
  const unattended = !step.interactionMode || step.interactionMode === "autopilot";
  return unattended && (risk === "critical" || risk === "elevated");
}

export interface HitlCoverage {
  oversightTotal: number;
  configured: number;
  gaps: number;
}

export function summarizeCoverage(steps: ReadonlyArray<WorkflowStep>): HitlCoverage {
  const oversight = steps.filter(isOversightStep);
  return {
    oversightTotal: oversight.length,
    configured: oversight.filter(isHitlConfigured).length,
    gaps: steps.filter(isRiskGap).length,
  };
}
