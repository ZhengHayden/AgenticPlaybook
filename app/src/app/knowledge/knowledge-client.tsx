"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import { archetypes } from "@/content/archetypes";
import { interactionModes } from "@/content/interactions";
import { a2aPatterns } from "@/content/a2a-patterns";

type Tab = "archetypes" | "interactions" | "a2a";

export function KnowledgeClient() {
  const { t, locale } = useLocale();
  const [tab, setTab] = useState<Tab>("archetypes");

  const tabs: ReadonlyArray<{ key: Tab; label: string }> = [
    { key: "archetypes", label: locale === "en" ? "5 Agent Archetypes" : "5 个智能体原型" },
    { key: "interactions", label: locale === "en" ? "3 Interaction Modes" : "3 种交互模式" },
    { key: "a2a", label: locale === "en" ? "6 A2A Patterns" : "6 种 A2A 模式" },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.nav.knowledge}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {locale === "en"
            ? "Reference library: taxonomies that power the design methodology."
            : "参考库:支撑设计方法论的分类法。"}
        </p>
      </div>

      <nav className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((x) => (
          <button
            key={x.key}
            onClick={() => setTab(x.key)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              tab === x.key
                ? "border-indigo-600 text-slate-900 dark:text-slate-50"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100",
            )}
          >
            {x.label}
          </button>
        ))}
      </nav>

      {tab === "archetypes" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {archetypes.map((a) => (
            <article key={a.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-3xl">{a.icon}</div>
              <h2 className="mt-2 text-lg font-semibold">{a[locale].name}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{a[locale].function}</p>
              <dl className="mt-3 space-y-1 text-xs">
                <div>
                  <dt className="font-semibold text-slate-700 dark:text-slate-300">{locale === "en" ? "Selection trigger" : "选择触发"}</dt>
                  <dd className="text-slate-500">{a[locale].trigger}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700 dark:text-slate-300">{locale === "en" ? "Example" : "示例"}</dt>
                  <dd className="text-slate-500">{a[locale].example}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}

      {tab === "interactions" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {interactionModes.map((m) => (
            <article key={m.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-3xl">{m.icon}</div>
              <h2 className="mt-2 text-lg font-semibold">{m[locale].name}</h2>
              <dl className="mt-3 space-y-1 text-xs">
                <div>
                  <dt className="font-semibold text-slate-700 dark:text-slate-300">{locale === "en" ? "Autonomy" : "自主程度"}</dt>
                  <dd className="text-slate-500">{m[locale].autonomy}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700 dark:text-slate-300">{locale === "en" ? "Use when" : "使用条件"}</dt>
                  <dd className="text-slate-500">{m[locale].criterion}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}

      {tab === "a2a" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {a2aPatterns.map((p) => (
            <article key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold">{p[locale].name}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{p[locale].description}</p>
              <p className="mt-3 text-xs">
                <strong className="text-slate-700 dark:text-slate-300">{locale === "en" ? "Use when:" : "使用条件:"}</strong>{" "}
                <span className="text-slate-500">{p[locale].useWhen}</span>
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
