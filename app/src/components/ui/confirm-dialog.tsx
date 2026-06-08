"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  /**
   * When set, the confirm button stays disabled until the user re-types this
   * exact string (proposal §5.7 — required for top-level deletes).
   */
  requireText?: string;
  /** Prompt shown above the re-type input. */
  requireTextLabel?: ReactNode;
  /** Visual tone of the confirm button. */
  tone?: "danger" | "brand";
  /** True while the confirm action is in flight. */
  busy?: boolean;
}

/**
 * Modal confirmation for irreversible actions. Escape and overlay-click cancel.
 * Optionally gates confirmation behind a re-typed string. Pairs with
 * {@link file://./overflow-menu.tsx OverflowMenu} for the §5.7 destructive flow.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  requireText,
  requireTextLabel,
  tone = "danger",
  busy = false,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");
  const [wasOpen, setWasOpen] = useState(open);

  // Reset the re-type field when the dialog transitions to open. Adjusting
  // state during render (vs. in an effect) avoids a cascading re-render.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setTyped("");
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const gateUnmet = requireText !== undefined && typed !== requireText;
  const confirmDisabled = busy || gateUnmet;

  const confirmClass =
    tone === "danger"
      ? "bg-state-block text-white hover:opacity-90 disabled:opacity-40"
      : "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/40";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-900/40 backdrop-blur-[1px]"
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl duration-[180ms] dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          {tone === "danger" && (
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-state-block-bg text-state-block">
              <AlertTriangle className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-ink dark:text-slate-100">{title}</h2>
            {description !== undefined && (
              <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">{description}</p>
            )}
          </div>
        </div>

        {requireText !== undefined && (
          <label className="mt-3 block text-xs">
            {requireTextLabel !== undefined && (
              <span className="mb-1 block text-ink-muted dark:text-slate-400">{requireTextLabel}</span>
            )}
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-ink shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={cn(
              "rounded-md px-3.5 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:cursor-not-allowed",
              confirmClass,
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
