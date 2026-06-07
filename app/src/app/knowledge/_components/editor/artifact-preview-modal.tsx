"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";
import type { KnowledgeArtifact } from "@/content/knowledge-artifacts";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import { artifactDownloadUrl } from "@/lib/api-client";
import { artifactInlineUrl, previewKind } from "@/lib/artifact-preview";

interface ArtifactPreviewModalProps {
  artifact: KnowledgeArtifact;
  onClose: () => void;
}

/** Minimal, readable typography for rendered Markdown inside the sandboxed iframe. */
const MARKDOWN_STYLE = `
  *{box-sizing:border-box}
  body{margin:0;padding:24px 28px;font:14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1e293b;max-width:48rem}
  h1,h2,h3,h4{line-height:1.25;margin:1.4em 0 .5em;font-weight:600}
  h1{font-size:1.6em}h2{font-size:1.35em}h3{font-size:1.15em}
  p,ul,ol,blockquote,table,pre{margin:0 0 1em}
  a{color:#0176d3}
  code{background:#f1f5f9;border-radius:4px;padding:.1em .35em;font-size:.9em}
  pre{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;overflow:auto}
  pre code{background:none;padding:0}
  blockquote{border-left:3px solid #cbd5e1;padding-left:1em;color:#475569}
  table{border-collapse:collapse;width:100%}
  th,td{border:1px solid #e2e8f0;padding:6px 10px;text-align:left}
  img{max-width:100%}
`;

function markdownDocument(html: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${MARKDOWN_STYLE}</style></head><body>${html}</body></html>`;
}

/**
 * Read-only preview of a previewable file artifact (PDF, HTML, Markdown).
 * PDF and HTML render via an iframe pointed at the inline-served bytes; HTML is
 * sandboxed (no scripts/same-origin). Markdown is fetched, rendered to HTML with
 * `marked`, and shown in a sandboxed `srcDoc` iframe.
 */
export function ArtifactPreviewModal({ artifact, onClose }: ArtifactPreviewModalProps) {
  const { t } = useLocale();
  const file = artifact.file;
  const kind = file ? previewKind(file) : null;
  const inlineUrl = artifactInlineUrl(artifact.id);

  const [markdownDoc, setMarkdownDoc] = useState<string | null>(null);
  const [loading, setLoading] = useState(kind === "markdown");
  const [error, setError] = useState(false);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Fetch + render Markdown. Initial state (loading=true for markdown,
  // error=false) already covers the pending case, so no synchronous resets here.
  useEffect(() => {
    if (kind !== "markdown") return;
    let active = true;
    fetch(inlineUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await marked.parse(await res.text());
        if (active) {
          setMarkdownDoc(markdownDocument(html));
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [kind, inlineUrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label={t.common.close} className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-md bg-white shadow-2xl dark:bg-slate-900">
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 dark:border-slate-800">
          <h2 className="min-w-0 truncate text-base font-semibold text-slate-800 dark:text-slate-100">
            {artifact.title}
          </h2>
          <button
            type="button"
            aria-label={t.common.close}
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </header>

        <div className="relative flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950">
          {!file || !kind ? (
            <p className="p-8 text-center text-sm text-slate-500">{t.knowledge.previewError}</p>
          ) : kind === "pdf" ? (
            <iframe title={artifact.title} src={inlineUrl} className="h-full w-full border-0" />
          ) : kind === "html" ? (
            <iframe
              title={artifact.title}
              src={inlineUrl}
              sandbox=""
              className="h-full w-full border-0 bg-white"
            />
          ) : loading ? (
            <p className="p-8 text-center text-sm text-slate-500">{t.common.loading}</p>
          ) : error ? (
            <p className="p-8 text-center text-sm text-rose-600">{t.knowledge.previewError}</p>
          ) : (
            <iframe
              title={artifact.title}
              srcDoc={markdownDoc ?? ""}
              sandbox=""
              className="h-full w-full border-0 bg-white"
            />
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3 dark:border-slate-800">
          {file && (
            <a
              href={artifactDownloadUrl(artifact.id)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              ⤓ {t.knowledge.download}
            </a>
          )}
          <Button variant="secondary" onClick={onClose}>
            {t.common.close}
          </Button>
        </footer>
      </div>
    </div>
  );
}
