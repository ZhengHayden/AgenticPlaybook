"use client";

import { useState } from "react";
import type { KnowledgeUseCase, UseCaseReference, ValidationStatus } from "@/content/knowledge";
import { VALIDATION_STATUSES } from "@/content/knowledge";
import type { UpdateUseCaseInput } from "@/db/knowledge-validation";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { BarChart3, Globe, Building2, type LucideIcon } from "lucide-react";
import { FIELD_CLASS, SaveBar } from "../field";
import { FormSection } from "../form-section";
import { validationDotClass, validationLabel } from "../display";

/**
 * Infer a source-type icon from a reference name (proposal §5.6): analyst
 * houses, an external vendor/URL, or an internal source by default.
 */
function sourceIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (/gartner|forrester|idc|mckinsey|bcg|deloitte|analyst/.test(n)) return BarChart3;
  if (/https?:\/\/|www\.|\.com|\.io|\.ai|vendor/.test(n)) return Globe;
  return Building2;
}

interface EvidenceTabProps {
  useCase: KnowledgeUseCase;
  onPatch: (patch: UpdateUseCaseInput) => Promise<void>;
  onSetValidation: (id: string, status: ValidationStatus, note: string) => Promise<void>;
  /** When false, fields render read-only (no Save bars / add controls). */
  editing: boolean;
}

function clean(rows: UseCaseReference[]): UseCaseReference[] {
  return rows.map((r) => ({ name: r.name.trim(), detail: r.detail.trim() })).filter((r) => r.name.length > 0);
}

/** Merged Evidence tab: validation status + note, then market/competitor references. */
export function EvidenceTab({ useCase, onPatch, onSetValidation, editing }: EvidenceTabProps) {
  const { t } = useLocale();

  // validation half
  const [status, setStatus] = useState<ValidationStatus>(useCase.validation.status);
  const [note, setNote] = useState(useCase.validation.note);
  const [vSaving, setVSaving] = useState(false);
  const [vError, setVError] = useState<string | null>(null);
  const vDirty = status !== useCase.validation.status || note !== useCase.validation.note;

  // references half
  const [rows, setRows] = useState<UseCaseReference[]>(useCase.references);
  const [rSaving, setRSaving] = useState(false);
  const [rError, setRError] = useState<string | null>(null);
  const rDirty = JSON.stringify(clean(rows)) !== JSON.stringify(useCase.references);

  async function saveValidation() {
    setVSaving(true);
    setVError(null);
    try {
      await onSetValidation(useCase.id, status, note);
    } catch (e) {
      setVError(e instanceof Error ? e.message : t.knowledge.saveError);
    } finally {
      setVSaving(false);
    }
  }

  async function saveReferences() {
    setRSaving(true);
    setRError(null);
    try {
      await onPatch({ references: clean(rows) });
    } catch (e) {
      setRError(e instanceof Error ? e.message : t.knowledge.saveError);
    } finally {
      setRSaving(false);
    }
  }

  return (
    <fieldset disabled={!editing} className="contents">
      <div className="space-y-6">
      <FormSection title={t.knowledge.tabValidation}>
        <div className="flex flex-wrap gap-1.5">
          {VALIDATION_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
                status === s
                  ? "border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-800/40 dark:text-brand-300"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", validationDotClass(s))} />
              {validationLabel(t, s)}
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t.knowledge.notePlaceholder}
          rows={6}
          className={cn(FIELD_CLASS, "mt-3")}
        />
        {editing && (
          <SaveBar dirty={vDirty} saving={vSaving} error={vError} saveLabel={t.common.save} savingLabel={t.common.save + "…"} onSave={saveValidation}>
            {vDirty ? t.knowledge.unsavedChanges : t.common.saved}
          </SaveBar>
        )}
      </FormSection>

      <FormSection title={t.knowledge.tabReferences}>
        <div className="space-y-3">
          {rows.length === 0 && (
            <EmptyState
              icon={<Building2 className="h-4 w-4" />}
              title={t.knowledge.noReferences}
              action={
                editing ? (
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => setRows((prev) => [...prev, { name: "", detail: "" }])}
                  >
                    + {t.knowledge.addReference}
                  </Button>
                ) : undefined
              }
            />
          )}
          {rows.map((row, i) => {
            const SourceIcon = sourceIcon(row.name);
            return (
            <div key={i} className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-subtle text-ink-faint dark:bg-slate-800">
                  <SourceIcon className="h-3.5 w-3.5" />
                </span>
                <input
                  className={FIELD_CLASS}
                  placeholder={t.knowledge.refName}
                  value={row.name}
                  onChange={(e) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))}
                />
                {editing && (
                  <Button
                    variant="ghost"
                    className="shrink-0 px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                    onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                  >
                    {t.knowledge.removeReference}
                  </Button>
                )}
              </div>
              <textarea
                className={FIELD_CLASS}
                rows={2}
                placeholder={t.knowledge.refDetail}
                value={row.detail}
                onChange={(e) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, detail: e.target.value } : r)))}
              />
            </div>
            );
          })}
          {editing && rows.length > 0 && (
            <Button variant="secondary" className="text-xs" onClick={() => setRows((prev) => [...prev, { name: "", detail: "" }])}>
              + {t.knowledge.addReference}
            </Button>
          )}
        </div>
        {editing && (
          <SaveBar dirty={rDirty} saving={rSaving} error={rError} saveLabel={t.common.save} savingLabel={t.common.save + "…"} onSave={saveReferences}>
            {rDirty ? t.knowledge.unsavedChanges : t.common.saved}
          </SaveBar>
        )}
      </FormSection>
      </div>
    </fieldset>
  );
}
