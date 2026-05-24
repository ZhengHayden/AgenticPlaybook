"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";

type Step = 1 | 2 | 3;
type Variant = "A" | "B" | "C";
type Language = "en" | "zh" | "bilingual";

interface FormState {
  name: string;
  client: string;
  domain: string;
  language: Language;
  p1Variant: Variant;
  p2Variant: Variant;
}

const DOMAINS = ["Finance", "Supply Chain", "HR", "Customer Service", "Manufacturing", "Other"];

export function NewProjectWizard() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({
    name: "",
    client: "",
    domain: "Finance",
    language: "en",
    p1Variant: "C",
    p2Variant: "A",
  });

  const update = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const variantPicker = (
    phase: "p1Variant" | "p2Variant",
    options: ReadonlyArray<{ value: Variant; en: string; zh: string; desc_en: string; desc_zh: string; recommended?: boolean }>,
  ) => (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={
            form[phase] === opt.value
              ? "block cursor-pointer rounded-md border-2 border-indigo-500 bg-indigo-50 p-3 dark:bg-indigo-950/30"
              : "block cursor-pointer rounded-md border-2 border-transparent bg-zinc-50 p-3 hover:border-zinc-300 dark:bg-zinc-800/50 dark:hover:border-zinc-700"
          }
        >
          <input
            type="radio"
            name={phase}
            value={opt.value}
            checked={form[phase] === opt.value}
            onChange={() => update({ [phase]: opt.value } as Partial<FormState>)}
            className="mr-2 accent-indigo-600"
          />
          <span className="font-medium text-sm">
            {opt[locale === "zh" ? "zh" : "en"]}
            {opt.recommended && <span className="ml-2 text-xs text-indigo-600">⭐ {t.common.recommended}</span>}
          </span>
          <p className="ml-6 mt-1 text-xs text-zinc-500">
            {locale === "zh" ? opt.desc_zh : opt.desc_en}
          </p>
        </label>
      ))}
    </div>
  );

  const onSubmit = () => {
    // V0: no persistence yet — route back to project list with sample
    router.push("/projects");
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t.project.createNew}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {locale === "en" ? `Step ${step} of 3` : `第 ${step} 步,共 3 步`}
        </p>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold">{locale === "en" ? "Engagement basics" : "项目基础信息"}</h2>
            <label className="block text-sm">
              <span className="block text-xs text-zinc-500">{t.project.nameLabel}</span>
              <input
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="ACME Finance — AP Automation"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="block text-xs text-zinc-500">{t.project.client}</span>
              <input
                value={form.client}
                onChange={(e) => update({ client: e.target.value })}
                placeholder="ACME Corp"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="block text-xs text-zinc-500">{t.project.domain}</span>
              <select
                value={form.domain}
                onChange={(e) => update({ domain: e.target.value })}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              >
                {DOMAINS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend className="text-xs text-zinc-500">{t.project.language}</legend>
              <div className="mt-1 flex gap-3 text-sm">
                {(["en", "zh", "bilingual"] as const).map((l) => (
                  <label key={l} className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="language"
                      checked={form.language === l}
                      onChange={() => update({ language: l })}
                      className="accent-indigo-600"
                    />
                    {l === "en" ? "English" : l === "zh" ? "中文" : "Bilingual"}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold">
                {t.phases.impactSizing} · {t.project.variant}
              </h2>
              {variantPicker("p1Variant", [
                {
                  value: "C",
                  en: "C — Adaptive Layered",
                  zh: "C — 自适应分层",
                  desc_en: "3-layer progressive (Recommended)",
                  desc_zh: "3 层渐进式 (推荐)",
                  recommended: true,
                },
                {
                  value: "B",
                  en: "B — Funnel-First Triage",
                  zh: "B — 漏斗优先分流",
                  desc_en: "2x2 first, score Q1/Q2 only",
                  desc_zh: "先 2x2,仅对 Q1/Q2 评分",
                },
                {
                  value: "A",
                  en: "A — Sequential Precision",
                  zh: "A — 精确顺序型",
                  desc_en: "Full 4-dim scoring, then 2x2",
                  desc_zh: "完整 4 维评分,再做 2x2",
                },
              ])}
            </div>
            <div>
              <h2 className="text-base font-semibold">
                {t.phases.design} · {t.project.variant}
              </h2>
              {variantPicker("p2Variant", [
                {
                  value: "A",
                  en: "A — Taxonomy-First",
                  zh: "A — 分类法优先",
                  desc_en: "Classification grids (Recommended)",
                  desc_zh: "分类网格 (推荐)",
                  recommended: true,
                },
                {
                  value: "B",
                  en: "B — Decision-Tree",
                  zh: "B — 决策树",
                  desc_en: "Branching wizard with complexity gate",
                  desc_zh: "带复杂度门的分支向导",
                },
                {
                  value: "C",
                  en: "C — Sprint Dual-Track",
                  zh: "C — 双轨冲刺",
                  desc_en: "Parallel discovery + design tracks",
                  desc_zh: "并行探索 + 设计双轨",
                },
              ])}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold">{locale === "en" ? "Review & create" : "确认并创建"}</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                <dt className="text-zinc-500">{t.project.name}</dt>
                <dd className="font-medium">{form.name || "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                <dt className="text-zinc-500">{t.project.client}</dt>
                <dd className="font-medium">{form.client || "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                <dt className="text-zinc-500">{t.project.domain}</dt>
                <dd className="font-medium">{form.domain}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                <dt className="text-zinc-500">{t.project.language}</dt>
                <dd className="font-medium">{form.language}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                <dt className="text-zinc-500">{t.phases.impactSizing}</dt>
                <dd className="font-medium">Variant {form.p1Variant}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                <dt className="text-zinc-500">{t.phases.design}</dt>
                <dd className="font-medium">Variant {form.p2Variant}</dd>
              </div>
            </dl>
            <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
              {locale === "en"
                ? "V0 mockup: project creation is not persisted yet. You'll be returned to the project list."
                : "V0 原型: 当前尚未持久化项目创建。完成后将回到项目列表。"}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          disabled={step === 1}
          onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
          className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          ← {t.common.back}
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => ((s + 1) as Step))}
            className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {t.common.next} →
          </button>
        ) : (
          <button
            onClick={onSubmit}
            className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            {locale === "en" ? "Create Project" : "创建项目"}
          </button>
        )}
      </div>
    </section>
  );
}
