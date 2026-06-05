"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { GateCriterion } from "@/content/sample-data";
import { Pencil, Trash2, Plus, RotateCcw, Check } from "lucide-react";

interface EditableGateProps {
  title: string;
  initialCriteria: ReadonlyArray<GateCriterion>;
  defaults: ReadonlyArray<string>;
}

function uid(): string {
  return `gc-${Math.random().toString(36).slice(2, 8)}`;
}

export function EditableGate({ title, initialCriteria, defaults }: EditableGateProps) {
  const { locale } = useLocale();
  const [criteria, setCriteria] = useState<GateCriterion[]>(initialCriteria.map((c) => ({ ...c })));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const [newText, setNewText] = useState("");

  const togglePass = (id: string) => {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, passed: !c.passed } : c)));
  };

  const startEdit = (c: GateCriterion) => {
    setEditingId(c.id);
    setDraftText(c.text);
  };

  const saveEdit = (id: string) => {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, text: draftText } : c)));
    setEditingId(null);
  };

  const removeCriterion = (id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  };

  const addCriterion = () => {
    if (!newText.trim()) return;
    setCriteria((prev) => [...prev, { id: uid(), text: newText.trim(), passed: false, custom: true }]);
    setNewText("");
  };

  const resetToDefaults = () => {
    setCriteria(defaults.map((text, idx) => ({ id: `g-default-${idx}`, text, passed: false })));
  };

  const passedCount = criteria.filter((c) => c.passed).length;
  const allPass = criteria.length > 0 && passedCount === criteria.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <button
          onClick={resetToDefaults}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-3.5 w-3.5" /> {locale === "en" ? "Reset to defaults" : "恢复默认"}
        </button>
      </div>

      <ul className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {criteria.map((c) => (
          <li key={c.id} className="flex items-start gap-3 rounded-md p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <button
              onClick={() => togglePass(c.id)}
              className={
                c.passed
                  ? "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-emerald-500 bg-emerald-500 text-white"
                  : "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-slate-300 dark:border-slate-600"
              }
              aria-label="Toggle"
            >
              {c.passed && <Check className="h-3 w-3" />}
            </button>
            <div className="flex-1">
              {editingId === c.id ? (
                <div className="flex gap-2">
                  <input
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(c.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <button
                    onClick={() => saveEdit(c.id)}
                    className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    {locale === "en" ? "Save" : "保存"}
                  </button>
                </div>
              ) : (
                <>
                  <p className={c.passed ? "text-sm text-slate-500 line-through" : "text-sm"}>{c.text}</p>
                  {c.evidence && <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">↳ {c.evidence}</p>}
                </>
              )}
            </div>
            {editingId !== c.id && (
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100">
                <button
                  onClick={() => startEdit(c)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700"
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => removeCriterion(c.id)}
                  className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/40"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </li>
        ))}

        <li className="mt-2 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={locale === "en" ? "Add a custom criterion…" : "添加自定义判定项…"}
            className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            onKeyDown={(e) => e.key === "Enter" && addCriterion()}
          />
          <button
            onClick={addCriterion}
            className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" /> {locale === "en" ? "Add" : "添加"}
          </button>
        </li>
      </ul>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-sm">
          <span className="font-mono">
            {passedCount} / {criteria.length}
          </span>{" "}
          {locale === "en" ? "criteria passed" : "项已通过"}
        </div>
        <button
          disabled={!allPass}
          className={
            allPass
              ? "rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              : "cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 dark:bg-slate-800"
          }
        >
          {locale === "en" ? "Mark Phase Complete" : "标记阶段完成"}
        </button>
      </div>
    </div>
  );
}
