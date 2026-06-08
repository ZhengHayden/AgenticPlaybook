"use client";

import { Fragment, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import { uploadSop, requestUnderstanding } from "@/lib/api-client";
import type { Candidate, ScreenAnswer, SopFileRef, ProjectUseCase } from "@/content/sample-data";
import type { ReadinessSuggestions } from "@/lib/understanding-agent";
import { screenCriteria, SCREEN_PASS_THRESHOLD, SCREEN_TOTAL, type ScreenCriterionId } from "@/content/binary-screen";
import { ToolDrawer } from "@/components/tool-drawer";
import { InlineAnchor } from "@/components/inline-anchor";
import { StatusChip } from "@/components/ui/status-chip";
import { ScoreCell } from "@/components/ui/score-cell";
import { Card } from "@/components/ui/card";
import { UseCaseIdeasPanel } from "../_components/use-case-ideas-panel";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  FileText,
  Upload,
  X,
  Pencil,
  Check,
  Trash2,
  Database,
  Repeat2,
  UserCheck,
  BadgeCheck,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

interface ScreenMatrixProps {
  projectId: string;
  candidates: ReadonlyArray<Candidate>;
}

/** Sentinel filter value for candidates with no business function set. */
const UNASSIGNED = "__unassigned__";

/**
 * Per-criterion icon + Latin abbreviation for the compact column headers
 * (proposal §5.4). The abbreviation stays Latin so it survives EN/中 drift
 * (§6); the full label is available via the header title + `i` popover.
 */
const CRITERION_META: Record<ScreenCriterionId, { icon: LucideIcon; abbr: string }> = {
  documentability: { icon: FileText, abbr: "DOC" },
  dataAccessibility: { icon: Database, abbr: "DATA" },
  executionVolume: { icon: Repeat2, abbr: "VOL" },
  processOwner: { icon: UserCheck, abbr: "OWN" },
  outputQuality: { icon: BadgeCheck, abbr: "QLTY" },
  processStability: { icon: ShieldCheck, abbr: "STAB" },
};

// Semantic state tokens (§4.1): ready = passed gate, block = failed gate.
const yesBadge =
  "inline-flex h-7 w-7 items-center justify-center rounded-md bg-state-ready-bg text-state-ready";
const noBadge =
  "inline-flex h-7 w-7 items-center justify-center rounded-md bg-state-block-bg text-state-block";

const iconBtn =
  "inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 disabled:opacity-40";

export function ScreenMatrix({ projectId, candidates }: ScreenMatrixProps) {
  const { locale } = useLocale();
  const en = locale === "en";
  const { status, error, save } = useProjectSave(projectId);
  // Only one workflow is editable at a time; everything else is display-only.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Record<ScreenCriterionId, ScreenAnswer>>>(() => {
    const out: Record<string, Record<ScreenCriterionId, ScreenAnswer>> = {};
    candidates.forEach((c) => {
      out[c.id] = { ...c.screen };
    });
    return out;
  });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [fnFilter, setFnFilter] = useState<string>("all");
  const [sopByCandidate, setSopByCandidate] = useState<Record<string, SopFileRef | undefined>>(() => {
    const out: Record<string, SopFileRef | undefined> = {};
    candidates.forEach((c) => {
      out[c.id] = c.sopFile;
    });
    return out;
  });
  const [useCasesByCandidate, setUseCasesByCandidate] = useState<Record<string, ProjectUseCase[]>>(() => {
    const out: Record<string, ProjectUseCase[]> = {};
    candidates.forEach((c) => {
      out[c.id] = c.useCases ? [...c.useCases] : [];
    });
    return out;
  });
  const [bizFnByCandidate, setBizFnByCandidate] = useState<Record<string, string | undefined>>(() => {
    const out: Record<string, string | undefined> = {};
    candidates.forEach((c) => {
      out[c.id] = c.businessFunction;
    });
    return out;
  });

  /** Merge current screen answers, SOP refs, use-case ideas, and business function back onto candidates (immutably). */
  const buildMerged = (
    answersSnap: Record<string, Record<ScreenCriterionId, ScreenAnswer>>,
    sopsSnap: Record<string, SopFileRef | undefined>,
    useCasesSnap: Record<string, ProjectUseCase[]>,
    bizFnSnap: Record<string, string | undefined>,
  ): Candidate[] =>
    candidates.map((c) => {
      const { sopFile: _prevSop, businessFunction: _prevFn, ...rest } = c;
      const sop = sopsSnap[c.id];
      const ideas = useCasesSnap[c.id] ?? c.useCases ?? [];
      const fn = bizFnSnap[c.id]?.trim();
      return {
        ...rest,
        screen: answersSnap[c.id] ?? c.screen,
        ...(sop ? { sopFile: sop } : {}),
        ...(ideas.length > 0 ? { useCases: ideas } : {}),
        ...(fn ? { businessFunction: fn } : {}),
      };
    });

  /** Persist the full current state (PATCH replaces all candidates). */
  const persist = (
    sopsSnap = sopByCandidate,
    useCasesSnap = useCasesByCandidate,
    bizFnSnap = bizFnByCandidate,
  ) => save({ candidates: buildMerged(answers, sopsSnap, useCasesSnap, bizFnSnap) });

  const toggleYes = (candidateId: string, key: ScreenCriterionId) => {
    setAnswers((prev) => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [key]: { ...prev[candidateId][key], yes: !prev[candidateId][key].yes },
      },
    }));
  };

  const updateField = (
    candidateId: string,
    key: ScreenCriterionId,
    patch: Partial<ScreenAnswer>,
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [key]: { ...prev[candidateId][key], ...patch },
      },
    }));
  };

  /** Persist a SOP upload/removal immediately so the stored file is never orphaned. */
  const onSopChange = async (candidateId: string, ref: SopFileRef | undefined) => {
    const nextSops = { ...sopByCandidate, [candidateId]: ref };
    setSopByCandidate(nextSops);
    await persist(nextSops);
  };

  const updateUseCases = (candidateId: string, next: ProjectUseCase[]) => {
    setUseCasesByCandidate((prev) => ({ ...prev, [candidateId]: next }));
  };

  const updateBizFn = (candidateId: string, value: string | undefined) => {
    setBizFnByCandidate((prev) => ({ ...prev, [candidateId]: value }));
  };

  /** Apply grounded agent suggestions to local answers; null dimensions are left untouched. */
  const applySuggestions = (candidateId: string, suggestions: ReadinessSuggestions) => {
    setAnswers((prev) => {
      const cur = prev[candidateId];
      const next = { ...cur };
      for (const cr of screenCriteria) {
        const s = suggestions[cr.id];
        if (!s || s.yes === null) continue;
        next[cr.id] = {
          ...cur[cr.id],
          yes: s.yes,
          ...(s.evidence ? { evidence: s.evidence } : {}),
          ...(s.factValue ? { factValue: s.factValue } : {}),
        };
      }
      return { ...prev, [candidateId]: next };
    });
  };

  const enterEdit = (candidateId: string) => {
    setEditingId(candidateId);
    setExpandedRow(candidateId);
  };

  const saveWorkflow = async () => {
    await persist();
    setEditingId(null);
  };

  /** Discard a workflow's in-flight edits, reverting local state to the stored candidate. */
  const cancelWorkflow = (c: Candidate) => {
    setAnswers((prev) => ({ ...prev, [c.id]: { ...c.screen } }));
    setSopByCandidate((prev) => ({ ...prev, [c.id]: c.sopFile }));
    setUseCasesByCandidate((prev) => ({ ...prev, [c.id]: c.useCases ? [...c.useCases] : [] }));
    setBizFnByCandidate((prev) => ({ ...prev, [c.id]: c.businessFunction }));
    setEditingId(null);
  };

  /** Delete a workflow after explicit confirmation; preserves other rows' in-flight edits. */
  const deleteWorkflow = async (c: Candidate) => {
    const label = c.name || (en ? "this workflow" : "该工作流");
    const confirmed = window.confirm(
      en ? `Delete "${label}"? This cannot be undone.` : `删除「${label}」?此操作不可撤销。`,
    );
    if (!confirmed) return;
    const merged = buildMerged(answers, sopByCandidate, useCasesByCandidate, bizFnByCandidate);
    await save({ candidates: merged.filter((x) => x.id !== c.id) });
    if (editingId === c.id) setEditingId(null);
  };

  const scoreFor = (candidateId: string): number =>
    screenCriteria.reduce((sum, cr) => sum + (answers[candidateId][cr.id].yes ? 1 : 0), 0);

  const passCount = candidates.filter((c) => scoreFor(c.id) >= SCREEN_PASS_THRESHOLD).length;

  // Business-function filter: distinct values + an "unassigned" bucket when relevant.
  const fnOf = (c: Candidate): string => bizFnByCandidate[c.id]?.trim() || "";
  const distinctFns = Array.from(new Set(candidates.map(fnOf).filter(Boolean))).sort();
  const hasUnassigned = candidates.some((c) => !fnOf(c));
  const visible = candidates.filter((c) => {
    if (fnFilter === "all") return true;
    if (fnFilter === UNASSIGNED) return !fnOf(c);
    return fnOf(c) === fnFilter;
  });

  // expand col is rendered as an empty cell; the colspan covers the remaining columns.
  const SUBROW_COLSPAN = screenCriteria.length + 5;

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {en ? "Layer 1 · Binary Readiness Screen" : "Layer 1 · 二元准备度筛选"}
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            {en
              ? `6 binary gates · Pass threshold: ${SCREEN_PASS_THRESHOLD} of ${SCREEN_TOTAL} Yes (one allowed exception requires mitigation plan)`
              : `6 项二元判断 · 通过门槛: ${SCREEN_TOTAL} 项中 ≥${SCREEN_PASS_THRESHOLD} 项 Yes(可有 1 项例外,需附缓解方案)`}
          </p>
        </div>
        <ToolDrawer
          buttonLabel={en ? "Tool Reference" : "工具参考"}
          title={en ? "Binary Readiness Screen Guide" : "二元准备度筛选指南"}
          subtitle={
            en
              ? "Detailed criteria definitions, pass/fail examples, interview protocol."
              : "详细判定定义、Pass/Fail 样例、访谈协议。"
          }
        >
          <ScreenToolReference />
        </ToolDrawer>
      </header>

      {error && (
        <p className="rounded-md border border-danger/30 bg-danger-soft p-2 text-xs text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-medium text-ink-muted">
          {en ? "Business function" : "业务职能"}
        </label>
        <select
          value={fnFilter}
          onChange={(e) => setFnFilter(e.target.value)}
          className="rounded-md border border-border bg-surface px-2 py-1 text-sm"
        >
          <option value="all">{en ? "All functions" : "全部职能"}</option>
          {distinctFns.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
          {hasUnassigned && <option value={UNASSIGNED}>{en ? "Unassigned" : "未分配"}</option>}
        </select>
        {fnFilter !== "all" && (
          <span className="text-xs text-ink-faint">
            {en ? `${visible.length} shown` : `显示 ${visible.length} 个`}
          </span>
        )}
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-border bg-surface-muted/50 text-left eyebrow">
            <tr>
              <th className="w-8 px-3 py-2">
                <span className="sr-only">{en ? "Expand" : "展开"}</span>
              </th>
              <th className="px-3 py-2 font-medium">{en ? "Business function" : "业务职能"}</th>
              <th className="px-3 py-2 font-medium">{en ? "Workflow" : "工作流"}</th>
              {screenCriteria.map((cr) => {
                const meta = CRITERION_META[cr.id];
                const Icon = meta.icon;
                return (
                  <th
                    key={cr.id}
                    className="px-2 py-2 text-center font-medium"
                    title={cr.shortLabel[locale]}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="flex items-center gap-1">
                        <Icon className="h-4 w-4 text-slate-400" strokeWidth={1.5} aria-hidden />
                        <InlineAnchor
                          label={cr.shortLabel[locale]}
                          body={
                            <>
                              <span className="block italic text-slate-500">{cr.question[locale]}</span>
                              <span className="mt-1 block">
                                <span className="font-semibold">{en ? "Pass:" : "通过:"}</span>{" "}
                                {cr.passExamples[locale][0]}
                              </span>
                              <span className="block">
                                <span className="font-semibold">{en ? "Fail:" : "未通过:"}</span>{" "}
                                {cr.failExamples[locale][0]}
                              </span>
                            </>
                          }
                        />
                      </span>
                      <span className="text-[10px] font-semibold tracking-wide text-slate-500">
                        {meta.abbr}
                      </span>
                      <span className="sr-only">{cr.shortLabel[locale]}</span>
                    </div>
                  </th>
                );
              })}
              <th className="px-3 py-2 text-right font-medium">{en ? "Score" : "得分"}</th>
              <th className="px-3 py-2 font-medium">{en ? "Status" : "状态"}</th>
              <th className="px-3 py-2 text-right font-medium">
                <span className="sr-only">{en ? "Actions" : "操作"}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((c) => {
              const score = scoreFor(c.id);
              const pass = score >= SCREEN_PASS_THRESHOLD;
              const expanded = expandedRow === c.id;
              const editing = editingId === c.id;
              return (
                <Fragment key={c.id}>
                  <tr className="hover:bg-surface-muted/40">
                    <td className="px-3 py-3 align-top">
                      <button
                        type="button"
                        onClick={() => setExpandedRow(expanded ? null : c.id)}
                        className="text-ink-faint hover:text-foreground"
                        aria-label={en ? "Toggle evidence" : "切换证据"}
                      >
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-3 py-3 align-top text-ink-muted">
                      {fnOf(c) || <span className="text-ink-faint">—</span>}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-ink-faint">{c.sourceSystem}</div>
                    </td>
                    {screenCriteria.map((cr) => {
                      const a = answers[c.id][cr.id];
                      return (
                        <td key={cr.id} className="px-2 py-3 text-center align-middle">
                          {editing ? (
                            <button
                              type="button"
                              onClick={() => toggleYes(c.id, cr.id)}
                              className={a.yes ? yesBadge : noBadge}
                              title={a.evidence ?? a.mitigation ?? ""}
                            >
                              {a.yes ? "✓" : "✗"}
                            </button>
                          ) : (
                            <span
                              className={`${a.yes ? yesBadge : noBadge} cursor-default`}
                              title={a.evidence ?? a.mitigation ?? ""}
                            >
                              {a.yes ? "✓" : "✗"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 align-middle">
                      <ScoreCell
                        score={score}
                        total={SCREEN_TOTAL}
                        items={screenCriteria.map((cr) => answers[c.id][cr.id].yes)}
                      />
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <StatusChip state={pass ? "ready" : "block"}>
                        {pass ? "PASS" : "FAIL"}
                      </StatusChip>
                    </td>
                    <td className="px-3 py-3 text-right align-middle">
                      {editing ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={saveWorkflow}
                            disabled={status === "saving"}
                            aria-label={en ? "Save workflow" : "保存此工作流"}
                            title={en ? "Save workflow" : "保存此工作流"}
                            className={`${iconBtn} hover:text-emerald-600 dark:hover:text-emerald-400`}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelWorkflow(c)}
                            disabled={status === "saving"}
                            aria-label={en ? "Cancel" : "取消"}
                            title={en ? "Cancel" : "取消"}
                            className={`${iconBtn} hover:text-rose-600 dark:hover:text-rose-400`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => enterEdit(c.id)}
                            disabled={status === "saving"}
                            aria-label={en ? "Edit workflow" : "编辑工作流"}
                            title={en ? "Edit workflow" : "编辑工作流"}
                            className={`${iconBtn} hover:text-brand-600 dark:hover:text-brand-300`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteWorkflow(c)}
                            disabled={status === "saving"}
                            aria-label={en ? "Delete workflow" : "删除工作流"}
                            title={en ? "Delete workflow" : "删除工作流"}
                            className={`${iconBtn} hover:text-rose-600 dark:hover:text-rose-400`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>

                  {expanded && (
                    <tr className="bg-slate-50/60 dark:bg-slate-950/40">
                      <td></td>
                      <td colSpan={SUBROW_COLSPAN} className="px-3 py-4">
                        {editing && (
                          <label className="mb-3 block max-w-sm text-xs">
                            <span className="text-slate-500">{en ? "Business function" : "业务职能"}</span>
                            <input
                              value={bizFnByCandidate[c.id] ?? ""}
                              onChange={(e) => updateBizFn(c.id, e.target.value || undefined)}
                              placeholder={en ? "e.g. Accounts Payable" : "例如:应付账款"}
                              className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                            />
                          </label>
                        )}
                        <EvidencePanel
                          projectId={projectId}
                          candidate={c}
                          answers={answers[c.id]}
                          sopFile={sopByCandidate[c.id]}
                          readOnly={!editing}
                          onUpdate={(key, patch) => updateField(c.id, key, patch)}
                          onSopChange={(ref) => onSopChange(c.id, ref)}
                          onApplySuggestions={(s) => applySuggestions(c.id, s)}
                        />
                      </td>
                    </tr>
                  )}

                  {/* Always-visible use-case list (read-only unless this workflow is being edited). */}
                  <tr className="bg-white dark:bg-slate-900">
                    <td></td>
                    <td colSpan={SUBROW_COLSPAN} className="px-3 pb-4 pt-0">
                      <UseCaseIdeasPanel
                        candidateId={c.id}
                        useCases={useCasesByCandidate[c.id] ?? []}
                        onChange={(next) => updateUseCases(c.id, next)}
                        readOnly={!editing}
                      />
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </Card>

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm">
        <span className="text-ink-muted">
          {en
            ? `${passCount} of ${candidates.length} advance to Layer 2 (2x2 Funnel)`
            : `${candidates.length} 个候选中有 ${passCount} 个进入 Layer 2 (2x2 漏斗)`}
        </span>
      </div>
    </div>
  );
}

interface EvidencePanelProps {
  projectId: string;
  candidate: Candidate;
  answers: Record<ScreenCriterionId, ScreenAnswer>;
  sopFile: SopFileRef | undefined;
  /** Display-only: inputs are disabled and the upload/agent actions are hidden. */
  readOnly: boolean;
  onUpdate: (key: ScreenCriterionId, patch: Partial<ScreenAnswer>) => void;
  onSopChange: (ref: SopFileRef | undefined) => Promise<void>;
  onApplySuggestions: (suggestions: ReadinessSuggestions) => void;
}

function EvidencePanel({
  projectId,
  candidate,
  answers,
  sopFile,
  readOnly,
  onUpdate,
  onSopChange,
  onApplySuggestions,
}: EvidencePanelProps) {
  const { locale } = useLocale();
  const en = locale === "en";
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [notStated, setNotStated] = useState<ReadonlyArray<ScreenCriterionId>>([]);
  // Per-criterion accordion overrides; falls back to the default-open rule
  // (open when the gate failed or the dimension was not stated in the SOP).
  const [manualOpen, setManualOpen] = useState<Partial<Record<ScreenCriterionId, boolean>>>({});
  const toggleCard = (id: ScreenCriterionId, currentlyOpen: boolean) =>
    setManualOpen((prev) => ({ ...prev, [id]: !currentlyOpen }));

  const onFileSelected = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const ref = await uploadSop(projectId, file);
      await onSopChange(ref);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onRemoveSop = async () => {
    setUploadError(null);
    try {
      await onSopChange(undefined);
      setNotStated([]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Remove failed");
    }
  };

  const onRunAgent = async () => {
    if (!sopFile) return;
    setAgentError(null);
    setAgentLoading(true);
    try {
      const result = await requestUnderstanding(projectId, candidate.id);
      onApplySuggestions(result.suggestions);
      setNotStated(result.notStated);
    } catch (error) {
      setAgentError(error instanceof Error ? error.message : "Agent failed");
    } finally {
      setAgentLoading(false);
    }
  };

  const fieldClass =
    "mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm disabled:cursor-default disabled:bg-slate-50 disabled:text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:disabled:bg-slate-900";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {en ? `Evidence — ${candidate.name}` : `证据 — ${candidate.name}`}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {sopFile ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <a
                href={`/api/projects/${projectId}/sop/${sopFile.storedName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[12rem] truncate text-brand-600 hover:text-brand-700 dark:text-brand-300"
                title={sopFile.filename}
              >
                {sopFile.filename}
              </a>
              {!readOnly && (
                <button
                  type="button"
                  onClick={onRemoveSop}
                  className="text-slate-400 hover:text-rose-600"
                  aria-label={en ? "Remove SOP" : "移除 SOP"}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          ) : readOnly ? (
            <span className="text-xs text-slate-400">{en ? "No SOP uploaded" : "未上传 SOP"}</span>
          ) : (
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <Upload className="h-3.5 w-3.5" />
              {uploading
                ? en
                  ? "Uploading…"
                  : "上传中…"
                : en
                  ? "Upload SOP (PDF)"
                  : "上传 SOP(PDF)"}
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  void onFileSelected(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          )}
          {!readOnly && (
            <button
              type="button"
              onClick={onRunAgent}
              disabled={!sopFile || agentLoading}
              title={sopFile ? undefined : en ? "Upload a SOP first" : "请先上传 SOP"}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:cursor-not-allowed disabled:bg-brand-600/40"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {agentLoading
                ? en
                  ? "Reading SOP…"
                  : "读取 SOP…"
                : en
                  ? "Run Understanding Agent"
                  : "运行流程理解智能体"}
            </button>
          )}
        </div>
      </div>

      {uploadError && (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {uploadError}
        </p>
      )}
      {agentError && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          {agentError}
        </p>
      )}
      {notStated.length > 0 && (
        <p className="text-xs text-slate-500">
          {en
            ? "Dimensions left blank were not stated in the SOP — review and fill them in manually."
            : "留空的维度在 SOP 中未提及 — 请人工复核并填写。"}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {screenCriteria.map((cr) => {
          const a = answers[cr.id];
          const isNotStated = notStated.includes(cr.id);
          // Pre-open the cards that need attention; collapse the passing ones
          // into a "证据 · Yes" accordion to reduce noise (proposal §5.4).
          const defaultOpen = !a.yes || isNotStated;
          const open = manualOpen[cr.id] ?? defaultOpen;
          return (
            <div
              key={cr.id}
              className={
                "rounded-md border " +
                (a.yes
                  ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  : "border-state-block/30 bg-state-block-bg/60 dark:border-rose-900/40 dark:bg-rose-950/20")
              }
            >
              <button
                type="button"
                onClick={() => toggleCard(cr.id, open)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  {open ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  )}
                  {cr.shortLabel[locale]}
                </span>
                <span className="flex items-center gap-1">
                  {isNotStated && (
                    <StatusChip state="warn" size="sm">
                      {en ? "not stated" : "未提及"}
                    </StatusChip>
                  )}
                  <StatusChip state={a.yes ? "ready" : "block"} size="sm">
                    {a.yes ? (en ? "Yes" : "是") : en ? "No" : "否"}
                  </StatusChip>
                </span>
              </button>
              {open && (
                <div className="space-y-2 px-3 pb-3">
                  {cr.factField && (
                    <label className="block text-xs">
                      <span className="text-slate-500">{cr.factField[locale]}</span>
                      <input
                        value={a.factValue ?? ""}
                        disabled={readOnly}
                        onChange={(e) => onUpdate(cr.id, { factValue: e.target.value })}
                        placeholder={cr.factField.placeholder}
                        className={fieldClass}
                      />
                    </label>
                  )}
                  <label className="block text-xs">
                    <span className="text-slate-500">
                      {a.yes ? (en ? "Evidence" : "证据") : en ? "Gap description" : "缺口描述"}
                    </span>
                    <textarea
                      rows={2}
                      value={a.evidence ?? ""}
                      disabled={readOnly}
                      onChange={(e) => onUpdate(cr.id, { evidence: e.target.value })}
                      className={`${fieldClass} resize-y`}
                    />
                  </label>
                  {!a.yes && (
                    <label className="block text-xs">
                      <span className="text-slate-500">
                        {en ? "Mitigation feasibility" : "缓解方案可行性"}
                      </span>
                      <textarea
                        rows={2}
                        value={a.mitigation ?? ""}
                        disabled={readOnly}
                        onChange={(e) => onUpdate(cr.id, { mitigation: e.target.value })}
                        placeholder={
                          en
                            ? "Describe gap + mitigation; only 1 No allowed."
                            : "描述缺口与缓解方案;仅允许 1 项 No。"
                        }
                        className={`${fieldClass} resize-y`}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScreenToolReference() {
  const { locale } = useLocale();
  return (
    <div className="space-y-5">
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
        <strong>{locale === "en" ? "Gate rule:" : "门槛规则:"}</strong>{" "}
        {locale === "en"
          ? `${SCREEN_PASS_THRESHOLD} of ${SCREEN_TOTAL} Yes required. One allowed exception must include a documented mitigation plan.`
          : `${SCREEN_TOTAL} 项中需 ≥${SCREEN_PASS_THRESHOLD} 项 Yes。可有 1 项例外,但必须附书面缓解方案。`}
      </div>

      {screenCriteria.map((cr, idx) => (
        <article key={cr.id} className="space-y-2 border-b border-slate-100 pb-4 last:border-b-0 dark:border-slate-800">
          <header>
            <h3 className="text-sm font-semibold">
              {idx + 1}. {cr.shortLabel[locale]}
            </h3>
            <p className="mt-0.5 text-xs italic text-slate-500">{cr.question[locale]}</p>
          </header>
          <div className="space-y-1 text-xs">
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {locale === "en" ? "What this means:" : "含义:"}
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">{cr.whatItMeans[locale]}</span>
            </p>
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {locale === "en" ? "Why it matters:" : "重要性:"}
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">{cr.whyItMatters[locale]}</span>
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
            <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-2 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                {locale === "en" ? "Pass" : "通过"}
              </span>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-emerald-900 dark:text-emerald-200">
                {cr.passExamples[locale].map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-rose-200 bg-rose-50/40 p-2 dark:border-rose-900/40 dark:bg-rose-950/20">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                {locale === "en" ? "Fail" : "未通过"}
              </span>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-rose-900 dark:text-rose-200">
                {cr.failExamples[locale].map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      ))}

      <section className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950">
        <h3 className="font-semibold">
          {locale === "en" ? "Interview Protocol" : "访谈协议"}
        </h3>
        <p className="mt-1 text-slate-500">
          {locale === "en"
            ? "30 minutes per process owner, both team members for inter-rater calibration."
            : "每位负责人 30 分钟,两位团队成员同时参与以校准评分一致性。"}
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-slate-600 dark:text-slate-400">
          <li>{locale === "en" ? "Open (5 min): walk through trigger and final output." : "开场(5 分钟):梳理触发条件与最终输出。"}</li>
          <li>{locale === "en" ? "Probe each criterion (20 min): ask the question, then ask for a specific example." : "逐项探询(20 分钟):提问后请受访人给具体例子。"}</li>
          <li>{locale === "en" ? "Close (5 min): \"Is anything about this process about to change in 6 months?\"" : "收尾(5 分钟):「未来 6 个月内此流程会有变更吗?」"}</li>
        </ol>
        <p className="mt-2 text-slate-500">
          {locale === "en"
            ? "Tip: Do NOT explain the pass/fail threshold during interview — owners who know the gate bias their answers."
            : "提示: 访谈中不要解释通过门槛 — 已知规则的负责人会无意识地偏向 Yes。"}
        </p>
      </section>
    </div>
  );
}
