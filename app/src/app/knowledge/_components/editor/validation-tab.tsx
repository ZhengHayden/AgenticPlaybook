"use client";

import { useState } from "react";
import type { KnowledgeUseCase, ValidationStatus } from "@/content/knowledge";
import { VALIDATION_STATUSES } from "@/content/knowledge";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import { FIELD_CLASS, SaveBar } from "../field";
import { validationDotClass, validationLabel } from "../display";

interface ValidationTabProps {
  useCase: KnowledgeUseCase;
  onSetValidation: (id: string, status: ValidationStatus, note: string) => Promise<void>;
}

/** Inline validation: single status + free-text evidence note. */
export function ValidationTab({ useCase, onSetValidation }: ValidationTabProps) {
  const { t } = useLocale();
  const [status, setStatus] = useState<ValidationStatus>(useCase.validation.status);
  const [note, setNote] = useState(useCase.validation.note);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = status !== useCase.validation.status || note !== useCase.validation.note;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSetValidation(useCase.id, status, note);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.knowledge.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {VALIDATION_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
                status === s
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", validationDotClass(s))} />
              {validationLabel(t, s)}
            </button>
          ))}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
            {t.knowledge.validationNote}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.knowledge.notePlaceholder}
            rows={5}
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        saving={saving}
        error={error}
        saveLabel={t.common.save}
        savingLabel={t.common.save + "…"}
        onSave={handleSave}
      >
        {dirty ? t.knowledge.unsavedChanges : t.common.saved}
      </SaveBar>
    </div>
  );
}
