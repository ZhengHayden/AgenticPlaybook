"use client";

import { useEffect, useState } from "react";
import { BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolDrawerProps {
  buttonLabel: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ToolDrawer({ buttonLabel, title, subtitle, children }: ToolDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <BookOpen className="h-3.5 w-3.5" /> {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside
            className={cn(
              "absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl",
              "dark:bg-slate-900 dark:border-l dark:border-slate-800",
              "animate-in slide-in-from-right duration-200",
            )}
          >
            <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-base font-semibold tracking-tight">{title}</h2>
                {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-4 text-sm">{children}</div>
          </aside>
        </div>
      )}
    </>
  );
}
