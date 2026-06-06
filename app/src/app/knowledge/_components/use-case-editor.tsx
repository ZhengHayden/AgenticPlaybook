"use client";

import { useState } from "react";
import type {
  KnowledgeLibrary,
  KnowledgeUseCase,
  ValidationStatus,
} from "@/content/knowledge";
import type { UpdateUseCaseInput } from "@/db/knowledge-validation";
import { useLocale } from "@/lib/locale-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SegTabs, type SegTab } from "@/components/ui/seg-tabs";
import { cn } from "@/lib/utils";
import { maturityAccent, maturityLabel, validationDotClass, validationLabel } from "./display";
import { OverviewTab } from "./editor/overview-tab";
import { ImpactTab } from "./editor/impact-tab";
import { AgenticTab } from "./editor/agentic-tab";
import { EvidenceTab } from "./editor/evidence-tab";
import { ArtifactsTab } from "./editor/artifacts-tab"; // created in Task 12

type EditorTab = "overview" | "impact" | "agentic" | "artifacts" | "evidence";

interface UseCaseEditorProps {
  useCase: KnowledgeUseCase;
  library: KnowledgeLibrary;
  onClose: () => void;
  onPatch: (id: string, patch: UpdateUseCaseInput) => Promise<void>;
  onSetValidation: (id: string, status: ValidationStatus, note: string) => Promise<void>;
  onDelete: (useCase: KnowledgeUseCase) => void;
}

/**
 * Full-screen, tabbed editor for a single use case. Each tab edits and persists
 * its own slice independently (Overview / Impact / Agentic Design / References
 * via {@link UpdateUseCaseInput} patches; Validation via its own endpoint). All
 * panels stay mounted so unsaved edits survive tab switches.
 */
export function UseCaseEditor({
  useCase,
  library,
  onClose,
  onPatch,
  onSetValidation,
  onDelete,
}: UseCaseEditorProps) {
  const { t } = useLocale();
  const [tab, setTab] = useState<EditorTab>("overview");

  const patch = (p: UpdateUseCaseInput) => onPatch(useCase.id, p);

  const tabs: ReadonlyArray<SegTab<EditorTab>> = [
    { value: "overview", label: t.knowledge.tabOverview },
    { value: "impact", label: t.knowledge.tabImpact },
    { value: "agentic", label: t.knowledge.tabAgentic },
    { value: "artifacts", label: t.knowledge.tabArtifacts },
    { value: "evidence", label: t.knowledge.tabEvidence },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950">
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-8">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold text-slate-800 dark:text-slate-100">
            {useCase.name}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {useCase.domain && <p className="text-sm text-slate-500">{useCase.domain}</p>}
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-white",
                maturityAccent(useCase.maturity),
              )}
            >
              {maturityLabel(t, useCase.maturity)}
            </span>
            <Badge>{useCase.techTag}</Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <span className={cn("h-2 w-2 rounded-full", validationDotClass(useCase.validation.status))} />
              {validationLabel(t, useCase.validation.status)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
            onClick={() => onDelete(useCase)}
          >
            {t.common.delete}
          </Button>
          <Button variant="ghost" aria-label={t.common.close} className="px-2 py-1 text-lg leading-none" onClick={onClose}>
            ✕
          </Button>
        </div>
      </header>

      <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800 sm:px-8">
        <SegTabs tabs={tabs} value={tab} onChange={setTab} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className={tab === "overview" ? "" : "hidden"}>
            <OverviewTab useCase={useCase} library={library} onPatch={patch} />
          </div>
          <div className={tab === "impact" ? "" : "hidden"}>
            <ImpactTab useCase={useCase} onPatch={patch} />
          </div>
          <div className={tab === "agentic" ? "" : "hidden"}>
            <AgenticTab useCase={useCase} onPatch={patch} />
          </div>
          <div className={tab === "artifacts" ? "" : "hidden"}>
            <ArtifactsTab useCaseId={useCase.id} />
          </div>
          <div className={tab === "evidence" ? "" : "hidden"}>
            <EvidenceTab useCase={useCase} onPatch={patch} onSetValidation={onSetValidation} />
          </div>
        </div>
      </div>
    </div>
  );
}
