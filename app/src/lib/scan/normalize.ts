/**
 * Shared key-normalization helpers so the three scan inputs join despite the
 * label drift between them (different casing, level suffixes, parentheticals).
 */

/** Canonical function key: trimmed + upper-cased. e.g. " r&d " → "R&D". */
export function toFunctionKey(raw: string): string {
  return raw.trim().toUpperCase();
}

/**
 * Strip a trailing parenthetical from a markdown function header so it matches
 * the headcount/labor function names. e.g. "QA (Quality Assurance)" → "QA",
 * "MRO (Maintenance, Repair & Operations)" → "MRO".
 */
export function stripParenthetical(raw: string): string {
  return raw.replace(/\s*\(.*\)\s*$/, "").trim();
}

/**
 * Extract the canonical `L#` level code from any level string.
 * Handles "L4 – Senior Engineer", "L2 – Technician / Junior Staff", " L7 ", etc.
 * Returns null when no level token is present.
 */
export function toLevelCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const match = raw.match(/L\s*(\d+)/i);
  return match ? `L${match[1]}` : null;
}

/** Numeric sort key for a level code ("L4" → 4); unknown codes sort last. */
export function levelOrder(levelCode: string): number {
  const match = levelCode.match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

/**
 * Slugify a company name into a stable storage/url key. Pure (no I/O) so it is
 * safe to import from client components — the scan store re-exports it for
 * server callers. e.g. "Acme Corp." → "acme-corp".
 */
export function scanCompanyKey(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "company";
}
