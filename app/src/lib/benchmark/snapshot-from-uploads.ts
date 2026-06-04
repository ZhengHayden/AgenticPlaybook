import { dedupeLaborRows } from "@/lib/scan/inputs";
import { parseLaborRate } from "@/lib/scan/parse-xlsx";
import { parseAutomationMd } from "@/lib/scan/parse-automation-md";
import type { BenchmarkSnapshot } from "./types";

/**
 * Build a {@link BenchmarkSnapshot} from optional uploaded buffers, each missing
 * half falling back to the provided default. Labor comes from an `.xlsx` buffer
 * (deduped per function×level, same as a scan); automation comes from a Markdown
 * buffer. Pure — buffers/strings are passed in, no I/O here.
 *
 * When BOTH buffers are omitted the result deep-equals `fallback`, so callers can
 * use this uniformly for "upload one, both, or neither".
 */
export function buildSnapshotFromUploads(
  fallback: BenchmarkSnapshot,
  laborBuffer?: Buffer,
  automationMarkdown?: string,
): BenchmarkSnapshot {
  const labor = laborBuffer ? dedupeLaborRows(parseLaborRate(laborBuffer)) : fallback.labor;
  const automation = automationMarkdown ? parseAutomationMd(automationMarkdown) : fallback.automation;
  return { labor, automation };
}
