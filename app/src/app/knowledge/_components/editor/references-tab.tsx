"use client";

import { useState } from "react";
import type { KnowledgeUseCase, UseCaseReference } from "@/content/knowledge";
import type { UpdateUseCaseInput } from "@/db/knowledge-validation";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import { FIELD_CLASS, SaveBar } from "../field";

interface ReferencesTabProps {
  useCase: KnowledgeUseCase;
  onPatch: (patch: UpdateUseCaseInput) => Promise<void>;
}

/** Trim + drop rows without a source name (schema requires a non-empty name). */
function clean(rows: UseCaseReference[]): UseCaseReference[] {
  return rows
    .map((r) => ({ name: r.name.trim(), detail: r.detail.trim() }))
    .filter((r) => r.name.length > 0);
}

/** Editable market/competitor intelligence rows. */
export function ReferencesTab({ useCase, onPatch }: ReferencesTabProps) {
  const { t } = useLocale();
  const [rows, setRows] = useState<UseCaseReference[]>(useCase.references);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = JSON.stringify(clean(rows)) !== JSON.stringify(useCase.references);

  function updateRow(index: number, patch: Partial<UseCaseReference>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { name: "", detail: "" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onPatch({ references: clean(rows) });
    } catch (e) {
      setError(e instanceof Error ? e.message : t.knowledge.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="space-y-3">
        {rows.length === 0 && <p className="text-sm text-slate-400">{t.knowledge.noReferences}</p>}
        {rows.map((row, i) => (
          <div
            key={i}
            className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
          >
            <div className="flex items-center gap-2">
              <input
                className={FIELD_CLASS}
                placeholder={t.knowledge.refName}
                value={row.name}
                onChange={(e) => updateRow(i, { name: e.target.value })}
              />
              <Button
                variant="ghost"
                className="shrink-0 px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                onClick={() => removeRow(i)}
              >
                {t.knowledge.removeReference}
              </Button>
            </div>
            <textarea
              className={FIELD_CLASS}
              rows={2}
              placeholder={t.knowledge.refDetail}
              value={row.detail}
              onChange={(e) => updateRow(i, { detail: e.target.value })}
            />
          </div>
        ))}
        <Button variant="secondary" className="text-xs" onClick={addRow}>
          + {t.knowledge.addReference}
        </Button>
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
