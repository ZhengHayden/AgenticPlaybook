"use client";

import { useState } from "react";
import type {
  KnowledgeLibrary,
  KnowledgeUseCase,
  Maturity,
  TechTag,
} from "@/content/knowledge";
import { MATURITIES, TECH_TAGS } from "@/content/knowledge";
import type { UpdateUseCaseInput } from "@/db/knowledge-validation";
import { useLocale } from "@/lib/locale-context";
import { Field, FIELD_CLASS, SaveBar } from "../field";
import { maturityLabel } from "../display";
import { workflowsForCompany } from "../filtering";

interface OverviewTabProps {
  useCase: KnowledgeUseCase;
  library: KnowledgeLibrary;
  onPatch: (patch: UpdateUseCaseInput) => Promise<void>;
}

/** Identity & framing of a use case: workflow, name, domain, description, tags. */
export function OverviewTab({ useCase, library, onPatch }: OverviewTabProps) {
  const { t } = useLocale();
  const workflows = workflowsForCompany(library, useCase.companyId).sort((a, b) => a.sort - b.sort);

  const [workflowId, setWorkflowId] = useState(useCase.workflowId);
  const [name, setName] = useState(useCase.name);
  const [domain, setDomain] = useState(useCase.domain);
  const [description, setDescription] = useState(useCase.description);
  const [techTag, setTechTag] = useState<TechTag>(useCase.techTag);
  const [maturity, setMaturity] = useState<Maturity>(useCase.maturity);
  const [sponsors, setSponsors] = useState(useCase.sponsors ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    workflowId !== useCase.workflowId ||
    name !== useCase.name ||
    domain !== useCase.domain ||
    description !== useCase.description ||
    techTag !== useCase.techTag ||
    maturity !== useCase.maturity ||
    sponsors !== (useCase.sponsors ?? "");

  async function handleSave() {
    if (!name.trim()) {
      setError(t.knowledge.saveError);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onPatch({
        workflowId,
        name: name.trim(),
        domain: domain.trim(),
        description: description.trim(),
        techTag,
        maturity,
        sponsors: sponsors.trim() || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t.knowledge.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label={t.knowledge.fieldWorkflow} className="md:col-span-2">
          <select className={FIELD_CLASS} value={workflowId} onChange={(e) => setWorkflowId(e.target.value)}>
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.knowledge.fieldName}>
          <input className={FIELD_CLASS} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t.knowledge.fieldDomain}>
          <input className={FIELD_CLASS} value={domain} onChange={(e) => setDomain(e.target.value)} />
        </Field>

        <Field label={t.knowledge.fieldDescription} className="md:col-span-2">
          <textarea
            className={FIELD_CLASS}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <Field label={t.knowledge.fieldTechTag}>
          <select className={FIELD_CLASS} value={techTag} onChange={(e) => setTechTag(e.target.value as TechTag)}>
            {TECH_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.knowledge.fieldMaturity}>
          <select
            className={FIELD_CLASS}
            value={maturity}
            onChange={(e) => setMaturity(e.target.value as Maturity)}
          >
            {MATURITIES.map((m) => (
              <option key={m} value={m}>
                {maturityLabel(t, m)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.knowledge.fieldSponsors} className="md:col-span-2">
          <input className={FIELD_CLASS} value={sponsors} onChange={(e) => setSponsors(e.target.value)} />
        </Field>
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
