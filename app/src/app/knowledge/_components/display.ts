import type { Dictionary, Locale } from "@/lib/i18n";
import type { LocalizedText, Maturity, ValidationStatus } from "@/content/knowledge";
import { archetypes, type ArchetypeId } from "@/content/archetypes";
import { interactionModes, type InteractionId } from "@/content/interactions";
import { a2aPatterns, type A2APatternId } from "@/content/a2a-patterns";

/** Resolve a localized label, falling back to English. */
export function localized(text: LocalizedText, locale: Locale): string {
  return text[locale] || text.en;
}

// ─── agentic-design tag labels ────────────────────────────────
export function archetypeLabel(id: ArchetypeId, locale: Locale): string {
  return archetypes.find((a) => a.id === id)?.[locale].name ?? id;
}

export function interactionLabel(id: InteractionId, locale: Locale): string {
  return interactionModes.find((m) => m.id === id)?.[locale].name ?? id;
}

export function a2aLabel(id: A2APatternId, locale: Locale): string {
  return a2aPatterns.find((p) => p.id === id)?.[locale].name ?? id;
}

// ─── maturity ─────────────────────────────────────────────────
export function maturityLabel(t: Dictionary, m: Maturity): string {
  return m === "proven" ? t.knowledge.maturityProven : m === "emerging" ? t.knowledge.maturityEmerging : t.knowledge.maturityPilot;
}

/** Accent bar utility (StatCard) per maturity. */
export function maturityAccent(m: Maturity): string {
  return m === "proven" ? "bg-emerald-500" : m === "emerging" ? "bg-sky-500" : "bg-amber-500";
}

// ─── validation status ────────────────────────────────────────
export function validationLabel(t: Dictionary, s: ValidationStatus): string {
  return s === "validated" ? t.knowledge.statusValidated : s === "partial" ? t.knowledge.statusPartial : t.knowledge.statusNotYet;
}

/** Solid dot/background color per validation status. */
export function validationDotClass(s: ValidationStatus): string {
  return s === "validated" ? "bg-emerald-500" : s === "partial" ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600";
}
