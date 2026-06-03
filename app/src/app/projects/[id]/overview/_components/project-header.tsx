"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import { deleteProject } from "@/lib/api-client";
import type { Project } from "@/content/sample-data";
import { Pencil, Trash2 } from "lucide-react";

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const { locale } = useLocale();
  const router = useRouter();
  const { status, error, save } = useProjectSave(project.id);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const saving = status === "saving";

  const onSave = async () => {
    await save({ name: name.trim() || project.name, description });
    setEditing(false);
  };

  const onDelete = async () => {
    const confirmed = window.confirm(
      locale === "en"
        ? `Delete project "${project.name}"? This permanently removes all candidates and workflows.`
        : `删除项目「${project.name}」?将永久移除所有候选与工作流。`,
    );
    if (!confirmed) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteProject(project.id);
      router.push("/projects");
    } catch (err) {
      setDeleting(false);
      setDeleteError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const inputCls =
    "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";

  if (editing) {
    return (
      <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <label className="block text-xs text-zinc-500">
          {locale === "en" ? "Project name" : "项目名称"}
          <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} mt-1`} />
        </label>
        <label className="block text-xs text-zinc-500">
          {locale === "en" ? "Description" : "描述"}
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={locale === "en" ? "What is this engagement about?" : "本次项目的简述?"}
            className={`${inputCls} mt-1 resize-y`}
          />
        </label>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setName(project.name);
              setDescription(project.description ?? "");
              setEditing(false);
            }}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            {locale === "en" ? "Cancel" : "取消"}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            {saving ? (locale === "en" ? "Saving…" : "保存中…") : locale === "en" ? "Save" : "保存"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight">{project.name}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {project.client} · {project.domain}
        </p>
        {project.description ? (
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
        ) : (
          <p className="mt-2 text-sm italic text-zinc-400">
            {locale === "en" ? "No description yet." : "尚无描述。"}
          </p>
        )}
        {deleteError && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{deleteError}</p>}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <Pencil className="h-4 w-4" /> {locale === "en" ? "Edit" : "编辑"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-40 dark:border-rose-900/50 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-rose-950/30"
        >
          <Trash2 className="h-4 w-4" /> {deleting ? (locale === "en" ? "Deleting…" : "删除中…") : locale === "en" ? "Delete" : "删除"}
        </button>
      </div>
    </section>
  );
}
