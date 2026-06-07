"use client";

import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shared form-control styling for the Knowledge add/edit surfaces. When the
 * control is disabled (read-only mode, e.g. inside a disabled <fieldset>), the
 * `disabled:` variants strip the input chrome so the value reads as plain text.
 */
export const FIELD_CLASS =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 " +
  "disabled:cursor-default disabled:appearance-none disabled:border-transparent disabled:bg-transparent disabled:px-0 disabled:text-slate-900 disabled:opacity-100 dark:disabled:bg-transparent dark:disabled:text-slate-100";

/** Multiline text ⇄ trimmed string[] helpers (one item per line). */
export function toLines(values: string[]): string {
  return values.join("\n");
}

export function fromLines(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

interface FieldProps {
  label: string;
  hint?: string;
  className?: string;
  /** Marks the field as mandatory: renders a red asterisk after the label. */
  required?: boolean;
  /** A single form control (input/select/textarea) — receives an injected id. */
  children: ReactElement<{ id?: string }>;
}

/** Labelled form field; injects an accessible id onto its single child control. */
export function Field({ label, hint, className, required, children }: FieldProps) {
  const id = useId();
  const control = isValidElement(children) ? cloneElement(children, { id }) : children;
  return (
    <div className={cn("block", className)}>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-rose-500" aria-hidden="true">*</span>}
      </label>
      {control}
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </div>
  );
}

interface SaveBarProps {
  dirty: boolean;
  saving: boolean;
  error: string | null;
  saveLabel: string;
  savingLabel: string;
  onSave: () => void;
  /** Optional content shown to the left of the save button (e.g. a status hint). */
  children?: ReactNode;
}

/** Sticky per-tab footer: optional status, an error line, and a dirty-gated Save. */
export function SaveBar({ dirty, saving, error, saveLabel, savingLabel, onSave, children }: SaveBarProps) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
      <div className="min-h-[1.25rem] text-xs">
        {error ? (
          <span className="text-rose-600">{error}</span>
        ) : (
          <span className="text-slate-400">{children}</span>
        )}
      </div>
      <Button onClick={onSave} disabled={!dirty || saving}>
        {saving ? savingLabel : saveLabel}
      </Button>
    </div>
  );
}
