"use client";

import { useCallback, useEffect, useState } from "react";
import type { KnowledgeArtifact } from "@/content/knowledge-artifacts";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import {
  listArtifacts,
  createLinkArtifact,
  createFileArtifact,
  updateArtifact,
  replaceArtifactFile,
  deleteArtifact,
} from "@/lib/api-client";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";
import { ArtifactRow } from "./artifact-row";
import { ArtifactForm, type ArtifactDraft, type ArtifactSubmit } from "./artifact-form";

interface ArtifactsTabProps {
  useCaseId: string;
}

function buildForm(values: ArtifactSubmit): FormData {
  const fd = new FormData();
  fd.set("title", values.title);
  fd.set("type", values.type);
  fd.set("status", values.status);
  fd.set("owner", values.owner);
  if (values.versionLabel) fd.set("versionLabel", values.versionLabel);
  if (values.changeNote) fd.set("changeNote", values.changeNote);
  if (values.file) fd.set("file", values.file);
  return fd;
}

export function ArtifactsTab({ useCaseId }: ArtifactsTabProps) {
  const { t } = useLocale();
  const [artifacts, setArtifacts] = useState<KnowledgeArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<ArtifactDraft | null>(null);

  const statusLabel = (s: KnowledgeArtifact["status"]) =>
    s === "draft"
      ? t.knowledge.statusDraft
      : s === "published"
        ? t.knowledge.statusPublished
        : t.knowledge.statusDeprecated;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setArtifacts(await listArtifacts(useCaseId));
    } finally {
      setLoading(false);
    }
  }, [useCaseId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSubmit(values: ArtifactSubmit) {
    if (draft?.mode === "replace" && draft.artifact) {
      await replaceArtifactFile(draft.artifact.id, buildForm(values));
    } else if (draft?.mode === "edit" && draft.artifact) {
      await updateArtifact(draft.artifact.id, {
        title: values.title,
        type: values.type,
        status: values.status,
        owner: values.owner,
        versionLabel: values.versionLabel,
        url: values.kind === "link" ? values.url : undefined,
        changeNote: values.changeNote,
      });
    } else if (values.kind === "link") {
      await createLinkArtifact(useCaseId, {
        title: values.title,
        type: values.type,
        status: values.status,
        owner: values.owner,
        versionLabel: values.versionLabel,
        url: values.url!,
        changeNote: values.changeNote,
      });
    } else {
      await createFileArtifact(useCaseId, buildForm(values));
    }
    setDraft(null);
    await refresh();
  }

  async function handleDelete(a: KnowledgeArtifact) {
    if (!window.confirm(t.knowledge.deleteConfirm)) return;
    await deleteArtifact(a.id);
    await refresh();
  }

  const published = artifacts.filter((a) => a.status === "published").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {artifacts.length} {t.knowledge.artifacts.toLowerCase()} · {published}{" "}
          {t.knowledge.statusPublished.toLowerCase()}
        </p>
        {!draft && (
          <Button onClick={() => setDraft({ mode: "create" })}>+ {t.knowledge.addArtifact}</Button>
        )}
      </div>

      {draft && (
        <ArtifactForm draft={draft} onSubmit={handleSubmit} onCancel={() => setDraft(null)} />
      )}

      {loading ? (
        <p className="text-sm text-slate-400">…</p>
      ) : artifacts.length === 0 && !draft ? (
        <EmptyState
          icon={<FileText className="h-4 w-4" />}
          title={t.knowledge.noArtifacts}
          action={
            <Button onClick={() => setDraft({ mode: "create" })}>+ {t.knowledge.addArtifact}</Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {artifacts.map((a) => (
            <ArtifactRow
              key={a.id}
              artifact={a}
              statusLabel={statusLabel}
              onEdit={(x) => setDraft({ mode: "edit", artifact: x })}
              onReplace={(x) => setDraft({ mode: "replace", artifact: x })}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
