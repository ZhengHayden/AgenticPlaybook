"use client";

import { useState } from "react";
import type { KnowledgeUseCase } from "@/content/knowledge";
import type { UpdateUseCaseInput } from "@/db/knowledge-validation";
import { archetypes, type ArchetypeId } from "@/content/archetypes";
import { interactionModes, type InteractionId } from "@/content/interactions";
import { a2aPatterns, type A2APatternId } from "@/content/a2a-patterns";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import { Field, FIELD_CLASS, SaveBar } from "../field";

interface AgenticTabProps {
  useCase: KnowledgeUseCase;
  onPatch: (patch: UpdateUseCaseInput) => Promise<void>;
}

function sortedKey(ids: readonly string[]): string {
  return [...ids].sort().join(",");
}

/** Agentic-design tags: archetypes used, interaction mode, A2A pattern. */
export function AgenticTab({ useCase, onPatch }: AgenticTabProps) {
  const { t, locale } = useLocale();
  const [selected, setSelected] = useState<ArchetypeId[]>(useCase.archetypes);
  const [interactionMode, setInteractionMode] = useState<InteractionId | "">(useCase.interactionMode ?? "");
  const [a2aPattern, setA2aPattern] = useState<A2APatternId | "">(useCase.a2aPattern ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    sortedKey(selected) !== sortedKey(useCase.archetypes) ||
    interactionMode !== (useCase.interactionMode ?? "") ||
    a2aPattern !== (useCase.a2aPattern ?? "");

  function toggle(id: ArchetypeId) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onPatch({
        archetypes: selected,
        interactionMode: interactionMode || undefined,
        a2aPattern: a2aPattern || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t.knowledge.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="space-y-4">
        <Field label={t.knowledge.archetypesUsed}>
          <div className="flex flex-wrap gap-1.5">
            {archetypes.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => toggle(a.id)}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
                  selected.includes(a.id)
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
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
