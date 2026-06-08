"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import type { Project, TeamMember } from "@/content/sample-data";
import { Pencil, Plus, Trash2 } from "lucide-react";

interface TeamEditorProps {
  project: Project;
}

/** Shown when a project has never had its team edited. */
const DEFAULT_TEAM: ReadonlyArray<TeamMember> = [
  { name: "Hayden", role: "Functional Consultant" },
  { name: "", role: "Agentic Architect" },
];

const inputCls =
  "w-full rounded-md border border-border bg-surface px-2 py-1 text-sm";

function initialMembers(project: Project): TeamMember[] {
  const source = project.team ?? DEFAULT_TEAM;
  return source.map((m) => ({ ...m }));
}

export function TeamEditor({ project }: TeamEditorProps) {
  const { locale, t } = useLocale();
  const en = locale === "en";
  const { status, error, save } = useProjectSave(project.id);
  const [editing, setEditing] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>(() => initialMembers(project));

  const saving = status === "saving";

  const updateMember = (index: number, patch: Partial<TeamMember>) => {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  };

  const removeMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const addMember = () => {
    setMembers((prev) => [...prev, { name: "", role: "" }]);
  };

  const onSave = async () => {
    const cleaned = members
      .map((m) => ({ name: m.name.trim(), role: m.role.trim() }))
      .filter((m) => m.name || m.role);
    await save({ team: cleaned });
    setMembers(cleaned.length > 0 ? cleaned : []);
    setEditing(false);
  };

  const onCancel = () => {
    setMembers(initialMembers(project));
    setEditing(false);
  };

  return (
    <section>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold tracking-tight">{t.project.team}</h3>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <Pencil className="h-3.5 w-3.5" /> {en ? "Edit" : "编辑"}
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-2 space-y-2 rounded-xl border border-border bg-surface p-4">
          {members.map((member, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                value={member.name}
                onChange={(e) => updateMember(index, { name: e.target.value })}
                placeholder={en ? "Name" : "姓名"}
                className={inputCls}
              />
              <input
                value={member.role}
                onChange={(e) => updateMember(index, { role: e.target.value })}
                placeholder={en ? "Role" : "角色"}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => removeMember(index)}
                aria-label={en ? "Remove member" : "移除成员"}
                className="shrink-0 rounded-md border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addMember}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" /> {en ? "Add member" : "添加成员"}
          </button>

          {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              {en ? "Cancel" : "取消"}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-deep disabled:opacity-40"
            >
              {saving ? (en ? "Saving…" : "保存中…") : en ? "Save" : "保存"}
            </button>
          </div>
        </div>
      ) : (
        <ul className="mt-2 space-y-1 rounded-xl border border-border bg-surface p-4 text-sm">
          {members.length === 0 ? (
            <li className="text-slate-400">{en ? "No team members yet." : "尚无团队成员。"}</li>
          ) : (
            members.map((member, index) => (
              <li key={index} className={member.name ? "" : "text-slate-400"}>
                {(member.name || (en ? "(unassigned)" : "(未分配)")) +
                  (member.role ? ` — ${member.role}` : "")}
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
}
