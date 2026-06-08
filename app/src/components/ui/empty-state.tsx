import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Optional lucide icon (rendered in a subtle tile). */
  icon?: ReactNode;
  /** One short line of guidance. */
  title: ReactNode;
  /** Optional secondary line. */
  description?: ReactNode;
  /** Primary action (button/link). */
  action?: ReactNode;
  className?: string;
}

/**
 * Designed empty state (proposal §5.8): a muted icon, one line of guidance,
 * and a primary action — replaces bare/unlabeled empty regions so a user is
 * never left staring at a blank textarea.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-white px-6 py-8 text-center",
        "dark:border-slate-700 dark:bg-slate-900",
        className,
      )}
    >
      {icon !== undefined && (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-subtle text-ink-faint dark:bg-slate-800 dark:text-slate-500">
          {icon}
        </span>
      )}
      <p className="text-sm font-medium text-ink dark:text-slate-200">{title}</p>
      {description !== undefined && (
        <p className="max-w-sm text-xs text-ink-faint dark:text-slate-500">{description}</p>
      )}
      {action !== undefined && <div className="mt-1">{action}</div>}
    </div>
  );
}
