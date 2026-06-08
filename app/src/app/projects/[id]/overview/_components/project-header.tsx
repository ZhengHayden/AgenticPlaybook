"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import { deleteProject } from "@/lib/api-client";
import type { Project } from "@/content/sample-data";
import { Pencil, Trash2 } from "lucide-react";
import { OverflowMenu } from "@/components/ui/overflow-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pill } from "@/components/ui/pill";

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  const en = locale === "en";
  const saving = status === "saving";

  const onSave = async () => {
    await save({ name: name.trim() || project.name, description });
    setEditing(false);
  };

  const onDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteProject(project.id);
      router.push("/projects");
    } catch (err) {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const inputCls =
    "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm";

  if (editing) {
    return (
      <section className="space-y-3 rounded-xl border border-border bg-surface p-6">
        <label className="block text-xs text-slate-500">
          {locale === "en" ? "Project name" : "项目名称"}
          <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} mt-1`} />
        </label>
        <label className="block text-xs text-slate-500">
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
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            {locale === "en" ? "Cancel" : "取消"}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-deep disabled:opacity-40"
          >
            {saving ? (locale === "en" ? "Saving…" : "保存中…") : locale === "en" ? "Save" : "保存"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-6">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Pill tone="info">{project.domain}</Pill>
          {project.client && <Pill tone="violet">{project.client}</Pill>}
          <Pill tone={project.status === "active" ? "success" : "neutral"} dot>
            {project.status === "active"
              ? en
                ? "Active"
                : "进行中"
              : en
                ? "Archived"
                : "已归档"}
          </Pill>
        </div>
        <h1 className="truncate font-display text-[28px] font-semibold leading-9 tracking-tight">
          {project.name}
        </h1>
        {project.description ? (
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">{project.description}</p>
        ) : (
          <p className="mt-2 text-sm italic text-ink-faint">
            {locale === "en" ? "No description yet." : "尚无描述。"}
          </p>
        )}
        {deleteError && <p className="mt-2 text-xs text-danger">{deleteError}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3.5 py-2 text-sm font-medium transition hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Pencil className="h-4 w-4" /> {en ? "Edit" : "编辑"}
        </button>
        <OverflowMenu
          label={en ? "More actions" : "更多操作"}
          items={[
            {
              label: en ? "Delete project" : "删除项目",
              icon: <Trash2 className="h-4 w-4" />,
              danger: true,
              disabled: deleting,
              onSelect: () => setConfirmOpen(true),
            },
          ]}
        />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        busy={deleting}
        title={en ? `Delete "${project.name}"?` : `删除「${project.name}」?`}
        description={
          en
            ? "This permanently removes the project and all of its candidates and workflows. This cannot be undone."
            : "将永久移除该项目及其所有候选与工作流,此操作不可撤销。"
        }
        requireText={project.name}
        requireTextLabel={
          en ? (
            <>
              Type <span className="font-semibold text-ink">{project.name}</span> to confirm
            </>
          ) : (
            <>
              请输入 <span className="font-semibold text-ink">{project.name}</span> 以确认
            </>
          )
        }
        confirmLabel={deleting ? (en ? "Deleting…" : "删除中…") : en ? "Delete project" : "删除项目"}
        cancelLabel={en ? "Cancel" : "取消"}
      />
    </section>
  );
}
