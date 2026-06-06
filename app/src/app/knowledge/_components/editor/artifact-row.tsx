"use client";

import { useState } from "react";
import type { KnowledgeArtifact } from "@/content/knowledge-artifacts";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { artifactDownloadUrl } from "@/lib/api-client";

const STATUS_CLASS: Record<KnowledgeArtifact["status"], string> = {
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  deprecated: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

interface ArtifactRowProps {
  artifact: KnowledgeArtifact;
  onEdit: (a: KnowledgeArtifact) => void;
  onReplace: (a: KnowledgeArtifact) => void;
  onDelete: (a: KnowledgeArtifact) => void;
  statusLabel: (s: KnowledgeArtifact["status"]) => string;
}

export function ArtifactRow({ artifact, onEdit, onReplace, onDelete, statusLabel }: ArtifactRowProps) {
  const { t } = useLocale();
  const [showLog, setShowLog] = useState(false);
  const isFile = artifact.kind === "file";

  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span>{isFile ? "📄" : "🔗"}</span>
            <span className="font-medium text-slate-800 dark:text-slate-100">{artifact.title}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_CLASS[artifact.status])}>
              {statusLabel(artifact.status)}
            </span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              {artifact.type}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-400">
            {isFile
              ? `${artifact.file?.fileName} · ${(((artifact.file?.sizeBytes ?? 0) / 1024) | 0)} KB`
              : artifact.url}
            {artifact.versionLabel ? ` · ${artifact.versionLabel}` : ""} · {artifact.owner}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 text-xs">
          {isFile ? (
            <a
              className="rounded-lg border border-slate-200 px-2 py-1 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              href={artifactDownloadUrl(artifact.id)}
            >
              ⤓ {t.knowledge.download}
            </a>
          ) : (
            <a
              className="rounded-lg border border-slate-200 px-2 py-1 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              href={artifact.url}
              target="_blank"
              rel="noreferrer"
            >
              ↗ {t.knowledge.openLink}
            </a>
          )}
          {isFile && (
            <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => onReplace(artifact)}>
              {t.knowledge.replaceFile}
            </Button>
          )}
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => onEdit(artifact)}>
            {t.common.edit}
          </Button>
          <Button
            variant="ghost"
            className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
            onClick={() => onDelete(artifact)}
          >
            {t.common.delete}
          </Button>
        </div>
      </div>
      {artifact.changelog.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400"
            onClick={() => setShowLog((v) => !v)}
          >
            {t.knowledge.changeLog} ({artifact.changelog.length})
          </button>
          {showLog && (
            <ul className="mt-1 space-y-0.5 pl-4 text-xs text-slate-500">
              {artifact.changelog
                .slice()
                .reverse()
                .map((e, i) => (
                  <li key={i}>
                    {new Date(e.at).toISOString().slice(0, 10)} · {e.author}
                    {e.versionLabel ? ` · ${e.versionLabel}` : ""} — {e.note}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
