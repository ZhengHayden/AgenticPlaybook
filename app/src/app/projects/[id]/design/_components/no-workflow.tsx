"use client";

import { useLocale } from "@/lib/locale-context";

/** Shown on any Design tab when the project has no workflows yet. */
export function NoWorkflow() {
  const { locale } = useLocale();
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
      {locale === "en"
        ? 'No workflow selected. Use "Add workflow" above to promote a prioritized candidate or start a blank one.'
        : "未选择工作流。使用上方「添加工作流」以提升优先候选或新建空白工作流。"}
    </div>
  );
}
