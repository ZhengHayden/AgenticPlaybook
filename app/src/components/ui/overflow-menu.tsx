"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OverflowMenuItem {
  label: ReactNode;
  onSelect: () => void;
  icon?: ReactNode;
  /** Renders the item in the destructive tone. */
  danger?: boolean;
  disabled?: boolean;
}

interface OverflowMenuProps {
  items: ReadonlyArray<OverflowMenuItem>;
  /** Accessible label for the trigger. */
  label: string;
  align?: "left" | "right";
  className?: string;
}

/**
 * Compact "⋯" overflow menu (proposal §5.7) — keeps secondary/destructive
 * actions out of the primary action row. Click-outside and Escape close it.
 */
export function OverflowMenu({ items, label, align = "right", className }: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-30 mt-1 min-w-[10rem] overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors disabled:opacity-40",
                item.danger
                  ? "text-state-block hover:bg-state-block-bg"
                  : "text-ink-muted hover:bg-subtle hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50",
              )}
            >
              {item.icon !== undefined && <span className="shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
