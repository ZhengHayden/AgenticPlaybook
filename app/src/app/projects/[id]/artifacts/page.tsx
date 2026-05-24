import { Download } from "lucide-react";

export default function ArtifactsPage() {
  const artifacts = [
    { type: "PDF", name: "Phase 1 — Prioritized Workflow Portfolio", phase: "Impact Sizing", date: "2026-05-22" },
    { type: "XLSX", name: "Phase 1 — Scoring Matrix", phase: "Impact Sizing", date: "2026-05-22" },
    { type: "PDF", name: "Phase 2 — Agent Architecture Doc (draft v0.3)", phase: "Design", date: "2026-05-23" },
  ];
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold">Generated Artifacts</h2>
      <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {artifacts.map((a, idx) => (
          <li key={idx} className="flex items-center gap-3 px-4 py-3 text-sm">
            <span className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold dark:bg-zinc-800">
              {a.type}
            </span>
            <div className="flex-1">
              <div className="font-medium">{a.name}</div>
              <div className="text-xs text-zinc-500">
                {a.phase} · {a.date}
              </div>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
