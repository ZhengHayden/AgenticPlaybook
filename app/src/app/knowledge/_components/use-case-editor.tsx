"use client";

import { useEffect, useState, type ReactNode } from "react";
import type {
  KnowledgeLibrary,
  KnowledgeUseCase,
  ValidationStatus,
} from "@/content/knowledge";
import type { UpdateUseCaseInput } from "@/db/knowledge-validation";
import { useLocale } from "@/lib/locale-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusChip, type ChipState } from "@/components/ui/status-chip";
import { OverflowMenu } from "@/components/ui/overflow-menu";
import { cn } from "@/lib/utils";
import { Pencil, Check, Trash2, X } from "lucide-react";
import { maturityAccent, maturityLabel, validationLabel } from "./display";
import { OverviewTab } from "./editor/overview-tab";
import { ImpactTab } from "./editor/impact-tab";
import { AgenticTab } from "./editor/agentic-tab";
import { EvidenceTab } from "./editor/evidence-tab";
import { ArtifactsTab } from "./editor/artifacts-tab";

interface UseCaseEditorProps {
  useCase: KnowledgeUseCase;
  library: KnowledgeLibrary;
  onClose: () => void;
  onPatch: (id: string, patch: UpdateUseCaseInput) => Promise<void>;
  onSetValidation: (id: string, status: ValidationStatus, note: string) => Promise<void>;
  onDelete: (useCase: KnowledgeUseCase) => void;
}

/** Validation status → semantic state (proposal §5.5). */
const VALIDATION_STATE: Record<ValidationStatus, ChipState> = {
  validated: "ready",
  partial: "warn",
  notYet: "neutral",
};

/**
 * Right slide-over for a single use case (proposal §5.5). Replaces the former
 * tabbed modal with one scrollable canvas of sticky-headed sections so a use
 * case can be scanned end-to-end. Each section still edits and persists its own
 * slice; an Edit/Done toggle gates editing across all of them.
 */
export function UseCaseEditor({
  useCase,
  library,
  onClose,
  onPatch,
  onSetValidation,
  onDelete,
}: UseCaseEditorProps) {
  const { t, locale } = useLocale();
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const patch = (p: UpdateUseCaseInput) => onPatch(useCase.id, p);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label={t.common.close}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-900/40 backdrop-blur-[1px]"
      />
      <aside
        className={cn(
          "relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl transition-transform duration-[240ms] ease-out dark:bg-slate-950",
          mounted ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-slate-800 dark:text-slate-100">
              {useCase.name}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {useCase.domain && <span className="text-sm text-ink-muted">{useCase.domain}</span>}
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-white",
                  maturityAccent(useCase.maturity),
                )}
              >
                {maturityLabel(t, useCase.maturity)}
              </span>
              <Badge>{useCase.techTag}</Badge>
              <StatusChip state={VALIDATION_STATE[useCase.validation.status]} size="sm">
                {validationLabel(t, useCase.validation.status)}
              </StatusChip>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {editing ? (
              <Button variant="secondary" className="gap-1.5" onClick={() => setEditing(false)}>
                <Check className="h-4 w-4" /> {locale === "en" ? "Done" : "完成"}
              </Button>
            ) : (
              <Button className="gap-1.5" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" /> {t.common.edit}
              </Button>
            )}
            <OverflowMenu
              label={locale === "en" ? "More actions" : "更多操作"}
              items={[
                {
                  label: t.common.delete,
                  icon: <Trash2 className="h-4 w-4" />,
                  danger: true,
                  onSelect: () => onDelete(useCase),
                },
              ]}
            />
            <button
              type="button"
              aria-label={t.common.close}
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Section title={t.knowledge.tabOverview}>
            <OverviewTab useCase={useCase} library={library} onPatch={patch} editing={editing} />
          </Section>
          <Section title={t.knowledge.tabImpact}>
            <ImpactTab useCase={useCase} onPatch={patch} editing={editing} />
          </Section>
          <Section title={t.knowledge.tabAgentic}>
            <AgenticTab useCase={useCase} onPatch={patch} editing={editing} />
          </Section>
          <Section title={t.knowledge.tabArtifacts}>
            <ArtifactsTab useCaseId={useCase.id} />
          </Section>
          <Section title={t.knowledge.tabEvidence}>
            <EvidenceTab
              useCase={useCase}
              onPatch={patch}
              onSetValidation={onSetValidation}
              editing={editing}
            />
          </Section>
        </div>
      </aside>
    </div>
  );
}

/** A use-case section with a sticky header within the slide-over scroll area. */
function Section({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="border-b border-slate-100 last:border-b-0 dark:border-slate-800">
      <h3 className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-5 py-2 text-xs font-semibold uppercase tracking-[0.04em] text-ink-faint backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        {title}
      </h3>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}
