"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";

interface SettingsClientProps {
  claudeDetected: boolean;
}

type Provider = "claude" | "openai" | "gemini";

const CLAUDE_MODELS = ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"];

export function SettingsClient({ claudeDetected }: SettingsClientProps) {
  const { t, locale } = useLocale();
  const [defaultProvider, setDefaultProvider] = useState<Provider>("claude");
  const [claudeModel, setClaudeModel] = useState(CLAUDE_MODELS[0]);
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-4o-mini");
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-2.5-pro");

  return (
    <section className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.settings.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t.settings.providers}</p>
      </div>

      <fieldset className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <legend className="px-1 text-xs uppercase tracking-wide text-zinc-500">
          {t.settings.defaultProvider}
        </legend>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          {(["claude", "openai", "gemini"] as const).map((p) => (
            <label key={p} className="flex items-center gap-2">
              <input
                type="radio"
                name="default-provider"
                checked={defaultProvider === p}
                onChange={() => setDefaultProvider(p)}
                className="accent-indigo-600"
              />
              <span className="capitalize">{p === "claude" ? "Claude" : p === "openai" ? "OpenAI" : "Gemini"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Claude (Anthropic)</h2>
          <span
            className={
              claudeDetected
                ? "rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "rounded-md bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
            }
          >
            ANTHROPIC_API_KEY {claudeDetected ? `✓ ${t.settings.detected}` : `✗ ${t.settings.notDetected}`}
          </span>
        </header>
        <p className="text-xs text-zinc-500">{t.settings.claudeDesc}</p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <label className="w-24 text-xs text-zinc-500">{t.settings.model}</label>
          <select
            value={claudeModel}
            onChange={(e) => setClaudeModel(e.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {CLAUDE_MODELS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold">OpenAI</h2>
        <p className="text-xs text-zinc-500">
          {locale === "en"
            ? "Paste key to enable. Stored locally in SQLite (encrypted)."
            : "粘贴密钥以启用。本地加密存储于 SQLite。"}
        </p>
        <div className="mt-3 space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <span className="w-24 text-xs text-zinc-500">{t.settings.apiKey}</span>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700">
              {t.settings.saveKey}
            </button>
          </label>
          <label className="flex items-center gap-2">
            <span className="w-24 text-xs text-zinc-500">{t.settings.model}</span>
            <input
              value={openaiModel}
              onChange={(e) => setOpenaiModel(e.target.value)}
              className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold">Google Gemini</h2>
        <p className="text-xs text-zinc-500">
          {locale === "en"
            ? "Paste key to enable. Stored locally in SQLite (encrypted)."
            : "粘贴密钥以启用。本地加密存储于 SQLite。"}
        </p>
        <div className="mt-3 space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <span className="w-24 text-xs text-zinc-500">{t.settings.apiKey}</span>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIza..."
              className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700">
              {t.settings.saveKey}
            </button>
          </label>
          <label className="flex items-center gap-2">
            <span className="w-24 text-xs text-zinc-500">{t.settings.model}</span>
            <input
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
