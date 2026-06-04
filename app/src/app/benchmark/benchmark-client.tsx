"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import {
  deleteBenchmarkVersion,
  fetchBenchmarkVersion,
  fetchBenchmarkVersions,
  fetchDefaultBenchmark,
  saveBenchmarkVersion,
} from "@/lib/api-client";
import { scanCompanyKey } from "@/lib/scan/normalize";
import { REGIONS } from "@/lib/scan/regions";
import { INDUSTRY_SECTORS } from "@/lib/scan/sectors";
import type { FunctionMeta, LaborRateRow } from "@/lib/scan/types";
import type { BenchmarkSnapshot, BenchmarkVersion, BenchmarkVersionMeta } from "@/lib/benchmark/types";
import { LaborRateEditor } from "@/app/scan/_components/labor-rate-editor";
import { WorkContentEditor } from "@/app/scan/_components/work-content-editor";
import { BenchmarkUploadModal } from "./_components/benchmark-upload-modal";

type Tab = "labor" | "automation";

const errMsg = (err: unknown): string => (err instanceof Error ? err.message : "Unexpected error");

/**
 * Benchmark Setting page. Pick a company + region + sector to load the shipped
 * read-only default (or a saved company version) into the labor-rate and
 * automation editors. Edits or uploads are saved as named, timestamped company
 * versions; the default itself is never mutated.
 */
export function BenchmarkClient() {
  const { t } = useLocale();
  const [company, setCompany] = useState("");
  const [region, setRegion] = useState("");
  const [sector, setSector] = useState("");
  const [versions, setVersions] = useState<BenchmarkVersionMeta[]>([]);
  const [versionsNonce, setVersionsNonce] = useState(0);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [snapshot, setSnapshot] = useState<BenchmarkSnapshot | null>(null);
  const [tab, setTab] = useState<Tab>("labor");
  const [versionName, setVersionName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const companyKey = company.trim() ? scanCompanyKey(company) : "";
  const ready = Boolean(region && sector);
  const snapshotReqRef = useRef(0);

  // Load this company's saved version metadata (refreshes on save/delete).
  useEffect(() => {
    if (!companyKey) {
      return;
    }
    let active = true;
    fetchBenchmarkVersions(companyKey)
      .then((list) => {
        if (active) setVersions(list);
      })
      .catch(() => {
        if (active) setVersions([]);
      });
    return () => {
      active = false;
    };
  }, [companyKey, versionsNonce]);

  // Load the active snapshot — a saved version when one is selected, else the
  // shipped regional default. A request token guards against out-of-order loads.
  useEffect(() => {
    if (!ready) {
      return;
    }
    const token = (snapshotReqRef.current += 1);
    const loader = selectedVersionId
      ? fetchBenchmarkVersion(companyKey, selectedVersionId).then((v) => v?.snapshot ?? null)
      : fetchDefaultBenchmark(region, sector);
    Promise.resolve(loader)
      .then((snap) => {
        if (token !== snapshotReqRef.current) return;
        setSnapshot(snap);
        setError(null);
      })
      .catch((err) => {
        if (token !== snapshotReqRef.current) return;
        setError(errMsg(err));
      });
  }, [ready, region, sector, selectedVersionId, companyKey]);

  const setLabor = (labor: LaborRateRow[]) => setSnapshot((prev) => (prev ? { ...prev, labor } : prev));
  const setAutomation = (automation: Record<string, FunctionMeta>) =>
    setSnapshot((prev) => (prev ? { ...prev, automation } : prev));

  const matchingVersions = versions.filter((v) => v.region === region && v.sector === sector);
  const canSave = Boolean(snapshot && versionName.trim() && companyKey && ready);

  const handleSave = async () => {
    if (!snapshot || !canSave) return;
    setSaving(true);
    setError(null);
    try {
      const version = await saveBenchmarkVersion(companyKey, { name: versionName.trim(), region, sector, snapshot });
      setVersionName("");
      setSelectedVersionId(version.versionId);
      setVersionsNonce((n) => n + 1);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVersionId || !companyKey) return;
    if (!window.confirm(t.benchmark.confirmDelete)) return;
    setError(null);
    try {
      await deleteBenchmarkVersion(companyKey, selectedVersionId);
      setSelectedVersionId("");
      setVersionsNonce((n) => n + 1);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const onUploaded = (version: BenchmarkVersion) => {
    setUploadOpen(false);
    setSelectedVersionId(version.versionId);
    setVersionsNonce((n) => n + 1);
  };

  const labelCls = "block text-xs text-zinc-500";
  const inputCls =
    "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";
  const tabCls = (active: boolean): string =>
    `rounded-md px-3 py-1.5 text-sm font-medium ${
      active
        ? "bg-indigo-600 text-white"
        : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
    }`;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{t.benchmark.title}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.benchmark.subtitle}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className={labelCls}>
          {t.scan.companyName}
          <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} />
        </label>
        <label className={labelCls}>
          {t.benchmark.region}
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setSelectedVersionId("");
            }}
            className={inputCls}
          >
            <option value="">{t.scan.regionSelect}</option>
            {REGIONS.map((r) => (
              <option key={r.code} value={r.label}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          {t.benchmark.sector}
          <select
            value={sector}
            onChange={(e) => {
              setSector(e.target.value);
              setSelectedVersionId("");
            }}
            className={inputCls}
          >
            <option value="">{t.scan.sectorSelect}</option>
            {INDUSTRY_SECTORS.map((s) => (
              <option key={s.code} value={s.label}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!ready ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40">
          {t.benchmark.selectPrompt}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <label className={labelCls}>
              {t.benchmark.version}
              <select
                value={selectedVersionId}
                onChange={(e) => setSelectedVersionId(e.target.value)}
                className={inputCls}
              >
                <option value="">{t.benchmark.shippedDefault}</option>
                {matchingVersions.map((v) => (
                  <option key={v.versionId} value={v.versionId}>
                    {v.name} · {new Date(v.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              disabled={!companyKey}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              {t.benchmark.upload}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!selectedVersionId}
              className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-40 dark:border-red-900/50 dark:bg-zinc-900 dark:text-red-300"
            >
              {t.benchmark.deleteVersion}
            </button>
          </div>

          <p className="text-[11px] text-zinc-400">{t.benchmark.readOnlyHint}</p>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </p>
          )}

          {!snapshot ? (
            <p className="py-8 text-center text-sm text-zinc-500">{t.common.loading}</p>
          ) : (
            <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap gap-2">
                <button type="button" className={tabCls(tab === "labor")} onClick={() => setTab("labor")}>
                  {t.benchmark.laborTab}
                </button>
                <button type="button" className={tabCls(tab === "automation")} onClick={() => setTab("automation")}>
                  {t.benchmark.automationTab}
                </button>
              </div>

              <div className="min-h-[16rem]">
                {tab === "labor" ? (
                  <LaborRateEditor rows={snapshot.labor} onChange={setLabor} />
                ) : (
                  <WorkContentEditor automation={snapshot.automation} onChange={setAutomation} />
                )}
              </div>

              <div className="flex flex-wrap items-end justify-end gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <label className={labelCls}>
                  {t.benchmark.versionName}
                  <input
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    placeholder={t.benchmark.versionNamePlaceholder}
                    className={inputCls}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave || saving}
                  className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
                >
                  {saving ? t.benchmark.saving : t.benchmark.saveAsVersion}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {uploadOpen && companyKey && (
        <BenchmarkUploadModal
          companyKey={companyKey}
          region={region}
          sector={sector}
          onClose={() => setUploadOpen(false)}
          onDone={onUploaded}
        />
      )}
    </div>
  );
}
