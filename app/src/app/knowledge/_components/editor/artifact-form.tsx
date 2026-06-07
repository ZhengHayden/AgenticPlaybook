"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { KnowledgeArtifact, ArtifactType, ArtifactStatus, ArtifactKind } from "@/content/knowledge-artifacts";
import { ARTIFACT_TYPES, ARTIFACT_STATUSES } from "@/content/knowledge-artifacts";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import { Field, FIELD_CLASS } from "../field";

export interface ArtifactDraft {
  mode: "create" | "edit" | "replace";
  artifact?: KnowledgeArtifact;
}

export interface ArtifactSubmit {
  title: string;
  type: ArtifactType;
  status: ArtifactStatus;
  owner: string;
  versionLabel?: string;
  changeNote?: string;
  kind: ArtifactKind;
  url?: string;
  file?: File;
}

interface ArtifactFormProps {
  draft: ArtifactDraft;
  onSubmit: (values: ArtifactSubmit) => Promise<void>;
  onCancel: () => void;
}

export function ArtifactForm({ draft, onSubmit, onCancel }: ArtifactFormProps) {
  const { t } = useLocale();
  const a = draft.artifact;
  const [title, setTitle] = useState(a?.title ?? "");
  const [kind, setKind] = useState<ArtifactKind>(a?.kind ?? "file");
  const [type, setType] = useState<ArtifactType>(a?.type ?? "playbook");
  const [status, setStatus] = useState<ArtifactStatus>(a?.status ?? "draft");
  const [owner, setOwner] = useState(a?.owner ?? "");
  const [versionLabel, setVersionLabel] = useState(a?.versionLabel ?? "");
  const [url, setUrl] = useState(a?.url ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [changeNote, setChangeNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const lockKind = draft.mode !== "create";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !owner.trim()) {
      setError(t.knowledge.requiredFields);
      return;
    }
    if (kind === "file" && draft.mode !== "edit" && !file) {
      setError("Please choose a file");
      return;
    }
    if (kind === "link" && !url.trim()) {
      setError("Please enter a URL");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        type,
        status,
        owner: owner.trim(),
        versionLabel: versionLabel.trim() || undefined,
        changeNote: changeNote.trim() || undefined,
        kind,
        url: kind === "link" ? url.trim() : undefined,
        file: file ?? undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.knowledge.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-md border border-brand-100 bg-brand-50/40 p-4 dark:border-brand-700 dark:bg-brand-800/10"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label={t.knowledge.artifactTitle} required className="md:col-span-2">
          <input className={FIELD_CLASS} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label={t.knowledge.artifactKind}>
          <select
            className={FIELD_CLASS}
            value={kind}
            disabled={lockKind}
            onChange={(e) => setKind(e.target.value as ArtifactKind)}
          >
            <option value="file">{t.knowledge.artifactKindFile}</option>
            <option value="link">{t.knowledge.artifactKindLink}</option>
          </select>
        </Field>
        <Field label={t.knowledge.artifactType}>
          <select
            className={FIELD_CLASS}
            value={type}
            onChange={(e) => setType(e.target.value as ArtifactType)}
          >
            {ARTIFACT_TYPES.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </Field>
        {kind === "file" ? (
          <Field label="File" className="md:col-span-2">
            <input
              type="file"
              className={FIELD_CLASS}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </Field>
        ) : (
          <Field label={t.knowledge.artifactUrl} className="md:col-span-2">
            <input
              className={FIELD_CLASS}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
            />
          </Field>
        )}
        <Field label={t.knowledge.artifactStatus}>
          <select
            className={FIELD_CLASS}
            value={status}
            onChange={(e) => setStatus(e.target.value as ArtifactStatus)}
          >
            {ARTIFACT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.knowledge.artifactOwner} required>
          <input className={FIELD_CLASS} value={owner} onChange={(e) => setOwner(e.target.value)} />
        </Field>
        <Field label={t.knowledge.artifactVersion}>
          <input
            className={FIELD_CLASS}
            value={versionLabel}
            onChange={(e) => setVersionLabel(e.target.value)}
            placeholder="v1"
          />
        </Field>
        <Field label={t.knowledge.changeNote} className="md:col-span-2">
          <input className={FIELD_CLASS} value={changeNote} onChange={(e) => setChangeNote(e.target.value)} />
        </Field>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? t.common.save + "…" : t.common.save}
        </Button>
      </div>
    </form>
  );
}
