"use client";

import { useState } from "react";
import type { KnowledgeUseCase } from "@/content/knowledge";
import type { UpdateUseCaseInput } from "@/db/knowledge-validation";
import { useLocale } from "@/lib/locale-context";
import { Field, FIELD_CLASS, SaveBar, fromLines, toLines } from "../field";
import { FormSection } from "../form-section";

interface ImpactTabProps {
  useCase: KnowledgeUseCase;
  onPatch: (patch: UpdateUseCaseInput) => Promise<void>;
  /** When false, fields render read-only (no Save bar). */
  editing: boolean;
}

/** Impact KPIs and business objectives — one entry per line. */
export function ImpactTab({ useCase, onPatch, editing }: ImpactTabProps) {
  const { t } = useLocale();
  const [kpis, setKpis] = useState(toLines(useCase.kpis));
  const [objectives, setObjectives] = useState(toLines(useCase.businessObjectives));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    kpis !== toLines(useCase.kpis) || objectives !== toLines(useCase.businessObjectives);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onPatch({ kpis: fromLines(kpis), businessObjectives: fromLines(objectives) });
    } catch (e) {
      setError(e instanceof Error ? e.message : t.knowledge.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <fieldset disabled={!editing} className="contents">
      <FormSection title={t.knowledge.impactKpis}>
        <div className="space-y-4">
          <Field label={t.knowledge.fieldKpis} hint={t.knowledge.kpisHint}>
            <textarea className={FIELD_CLASS} rows={6} value={kpis} onChange={(e) => setKpis(e.target.value)} />
          </Field>
          <Field label={t.knowledge.fieldObjectives} hint={t.knowledge.objectivesHint}>
            <textarea
              className={FIELD_CLASS}
              rows={6}
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
            />
          </Field>
        </div>
      </FormSection>

      {editing && (
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
      )}
    </fieldset>
  );
}
