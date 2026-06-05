"use client";

import { Info } from "lucide-react";
import { useState } from "react";

interface InlineAnchorProps {
  label: string;
  body: React.ReactNode;
}

/**
 * Lightweight info popover used inline with form inputs to surface
 * the calibrated anchor for the currently-selected value. Click to
 * toggle; click outside or escape to close.
 */
export function InlineAnchor({ label, body }: InlineAnchorProps) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((s) => !s);
        }}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        aria-label={label}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <span
            className="absolute left-5 top-1/2 z-20 w-72 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900"
            role="dialog"
          >
            <span className="block font-semibold text-slate-700 dark:text-slate-200">{label}</span>
            <span className="mt-1 block text-slate-600 dark:text-slate-400">{body}</span>
          </span>
        </>
      )}
    </span>
  );
}
