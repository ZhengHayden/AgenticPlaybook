"use client";

import { useState } from "react";
import type {
  CreateUseCaseFields,
  KnowledgeLibrary,
  KnowledgeUseCase,
  Maturity,
  TechTag,
} from "@/content/knowledge";
import { MATURITIES, TECH_TAGS } from "@/content/knowledge";
import { archetypes, type ArchetypeId } from "@/content/archetypes";
import { interactionModes, type InteractionId } from "@/content/interactions";
import { a2aPatterns, type A2APatternId } from "@/content/a2a-patterns";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { maturityLabel } from "./display";
import { Field, FIELD_CLASS, fromLines, toLines } from "./field";
import { FormSection } from "./form-section";
import { workflowsForCompany } from "./filtering";

interface UseCaseModalProps {
  library: KnowledgeLibrary;
  companyId: string;
  /** When set, the form edits this use case; otherwise it creates a new one. */
  existing?: KnowledgeUseCase;
  onClose: () => void;
  onSubmit: (fields: CreateUseCaseFields) => Promise<void>;
}

export function UseCaseModal({ library, companyId, existing, onClose, onSubmit }: UseCaseModalProps) {
  const { t, locale } = useLocale();
  const workflows = workflowsForCompany(library, companyId).sort((a, b) => a.sort - b.sort);

  const [workflowId, setWorkflowId] = useState(existing?.workflowId ?? workflows[0]?.id ?? "");
  const [name, setName] = useState(existing?.name ?? "");
  const [domain, setDomain] = useState(existing?.domain ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [kpis, setKpis] = useState(toLines(existing?.kpis ?? []));
  const [objectives, setObjectives] = useState(toLines(existing?.businessObjectives ?? []));
  const [techTag, setTechTag] = useState<TechTag>(existing?.techTag ?? "AI/ML");
  const [maturity, setMaturity] = useState<Maturity>(existing?.maturity ?? "pilot");
  const [sponsors, setSponsors] = useState(existing?.sponsors ?? "");
  const [selectedArchetypes, setSelectedArchetypes] = useState<ArchetypeId[]>(existing?.archetypes ?? []);
  const [interactionMode, setInteractionMode] = useState<InteractionId | "">(existing?.interactionMode ?? "");
  const [a2aPattern, setA2aPattern] = useState<A2APatternId | "">(existing?.a2aPattern ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleArchetype(id: ArchetypeId) {
    setSelectedArchetypes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSubmit() {
    if (!workflowId || !name.trim()) {
      setError(t.knowledge.saveError);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        workflowId,
        name: name.trim(),
        domain: domain.trim(),
        description: description.trim(),
        kpis: fromLines(kpis),
        techTag,
        maturity,
        businessObjectives: fromLines(objectives),
        archetypes: selectedArchetypes,
        interactionMode: interactionMode || undefined,
        a2aPattern: a2aPattern || undefined,
        references: existing?.references ?? [],
        sponsors: sponsors.trim() || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t.knowledge.saveError);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label={t.common.cancel} className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-md bg-white shadow-2xl dark:bg-slate-900">
        <header className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {existing ? t.knowledge.editUseCase : t.knowledge.addUseCase}
          </h2>
        </header>

        <div className="space-y-6 overflow-y-auto px-5 py-5">
          <FormSection title={t.knowledge.secIdentity}>
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
            </div>
          </FormSection>

          <FormSection title={t.knowledge.fieldDescription}>
            <textarea
              className={FIELD_CLASS}
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormSection>

          <FormSection title={t.knowledge.secClassification}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          </FormSection>

          <FormSection title={t.knowledge.impactKpis}>
            <div className="space-y-4">
              <Field label={t.knowledge.fieldKpis} hint={t.knowledge.kpisHint}>
                <textarea className={FIELD_CLASS} rows={4} value={kpis} onChange={(e) => setKpis(e.target.value)} />
              </Field>
              <Field label={t.knowledge.fieldObjectives} hint={t.knowledge.objectivesHint}>
                <textarea
                  className={FIELD_CLASS}
                  rows={4}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title={t.knowledge.agenticDesign}>
            <div className="space-y-4">
              <Field label={t.knowledge.archetypesUsed}>
                <div className="flex flex-wrap gap-1.5">
                  {archetypes.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleArchetype(a.id)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
                        selectedArchetypes.includes(a.id)
                          ? "border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-800/40 dark:text-brand-300"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800",
                      )}
                    >
                      {a[locale].name}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label={t.knowledge.interactionMode}>
                  <select
                    className={FIELD_CLASS}
                    value={interactionMode}
                    onChange={(e) => setInteractionMode(e.target.value as InteractionId | "")}
                  >
                    <option value="">—</option>
                    {interactionModes.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m[locale].name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t.knowledge.a2aPattern}>
                  <select
                    className={FIELD_CLASS}
                    value={a2aPattern}
                    onChange={(e) => setA2aPattern(e.target.value as A2APatternId | "")}
                  >
                    <option value="">—</option>
                    {a2aPatterns.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p[locale].name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          </FormSection>

          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? t.common.save + "…" : t.common.save}
          </Button>
        </footer>
      </div>
    </div>
  );
}
