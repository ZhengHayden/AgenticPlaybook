import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderHighlight {
  label: ReactNode;
  value: ReactNode;
}

interface PageHeaderProps {
  /** Small brand-tinted icon tile shown left of the title. */
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned actions (buttons, links). */
  actions?: ReactNode;
  /** Optional key/value strip rendered beneath the title row. */
  highlights?: ReadonlyArray<PageHeaderHighlight>;
  className?: string;
}

/**
 * SLDS-style page header: an icon tile, title + subtitle, right-aligned
 * actions, and an optional highlights strip. Standardizes the top of every
 * screen in place of hand-rolled flex headers.
 */
export function PageHeader({
  icon,
  title,
  subtitle,
  actions,
  highlights,
  className,
}: PageHeaderProps) {
  const hasHighlights = highlights !== undefined && highlights.length > 0;

  return (
    <div
      className={cn(
        "mb-6 rounded-md border border-slate-200 bg-white px-5 py-4 shadow-sm",
        "dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {icon !== undefined && (
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded bg-brand-50 text-brand-700 dark:bg-brand-800/40 dark:text-brand-300">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {title}
            </h1>
            {subtitle !== undefined && (
              <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions !== undefined && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>

      {hasHighlights && (
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          {highlights.map((item, index) => (
            <div key={index} className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {item.label}
              </dt>
              <dd className="mt-0.5 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
