import { Download, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Pill, type PillTone } from "@/components/ui/pill";

/**
 * Generated-artifacts list. NOTE: this is a presentational placeholder — there
 * is no project-artifact backend yet, so the rows below are illustrative. When
 * a real artifact store lands, swap `ARTIFACTS` for the fetched list; the
 * layout (Card + type pill + download) already matches the design system.
 */
const ARTIFACTS: ReadonlyArray<{ type: string; name: string; phase: string; date: string }> = [
  { type: "PDF", name: "Phase 1 — Prioritized Workflow Portfolio", phase: "Impact Sizing", date: "2026-05-22" },
  { type: "XLSX", name: "Phase 1 — Scoring Matrix", phase: "Impact Sizing", date: "2026-05-22" },
  { type: "PDF", name: "Phase 2 — Agent Architecture Doc (draft v0.3)", phase: "Design", date: "2026-05-23" },
];

const TYPE_TONE: Record<string, PillTone> = {
  PDF: "danger",
  XLSX: "success",
  DOCX: "info",
};

export default function ArtifactsPage() {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-lg font-semibold tracking-tight">Generated Artifacts</h2>
      <Card>
        <ul className="divide-y divide-border">
          {ARTIFACTS.map((a, idx) => (
            <li key={idx} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-surface-muted text-ink-faint">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground">{a.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-faint">
                  <Pill tone={TYPE_TONE[a.type] ?? "neutral"}>{a.type}</Pill>
                  <span>
                    {a.phase} · {a.date}
                  </span>
                </div>
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-surface-muted">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
