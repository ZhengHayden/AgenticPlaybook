import type {
  Candidate,
  ScreenAnswers,
  OdsScores,
  OrsScores,
  VmScores,
  DdiCounts,
  RiskAssessment,
} from "./sample-data";
import { screenCriteria } from "./binary-screen";
import { odsIndicators, orsIndicators } from "./funnel-rubric";
import { vmDimensions, decisionTypes, riskCategories } from "./scoring-rubric";

/** The basic, human-entered fields captured when adding a candidate. */
export interface CandidateBasics {
  name: string;
  description: string;
  sourceSystem: string;
  volumePerMonth: number;
  pain: Candidate["pain"];
}

// Neutral defaults for the rubric-scored fields, derived from the rubric
// definitions so they stay in sync if a rubric gains/loses an indicator.
const DEFAULT_VM_SCORE = 3 as const; // 1..5 midpoint
const DEFAULT_RISK_LEVEL = "M" as const;

function blankScreen(): ScreenAnswers {
  return Object.fromEntries(
    screenCriteria.map((cr) => [cr.id, { yes: false }]),
  ) as ScreenAnswers;
}

function zeroScores<T extends string>(ids: ReadonlyArray<{ id: T }>): Record<T, 0> {
  return Object.fromEntries(ids.map((i) => [i.id, 0])) as Record<T, 0>;
}

function defaultVm(): VmScores {
  return Object.fromEntries(
    vmDimensions.map((d) => [d.id, DEFAULT_VM_SCORE]),
  ) as VmScores;
}

function zeroDdi(): DdiCounts {
  return Object.fromEntries(decisionTypes.map((d) => [d.id, 0])) as DdiCounts;
}

function defaultRisk(): RiskAssessment {
  return Object.fromEntries(
    riskCategories.map((c) => [c.id, DEFAULT_RISK_LEVEL]),
  ) as RiskAssessment;
}

/**
 * Build a fully-formed, schema-valid {@link Candidate} from the basic fields.
 * All rubric-scored sections start neutral so the candidate begins at the top
 * of the funnel (screen 0/6, fails Layer 1) and is filled in via Screen →
 * Funnel → Scoring.
 */
export function makeBlankCandidate(basics: CandidateBasics): Candidate {
  return {
    id: `cand-${crypto.randomUUID()}`,
    name: basics.name,
    description: basics.description,
    sourceSystem: basics.sourceSystem,
    volumePerMonth: basics.volumePerMonth,
    pain: basics.pain,
    screen: blankScreen(),
    ods: zeroScores(odsIndicators) as OdsScores,
    ors: zeroScores(orsIndicators) as OrsScores,
    rationale: { ods: {}, ors: {} },
    vm: defaultVm(),
    ddi: zeroDdi(),
    totalSteps: 1,
    risk: defaultRisk(),
    recommendation: "",
  };
}
