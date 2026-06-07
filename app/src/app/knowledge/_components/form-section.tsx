import type { ReactNode } from "react";

interface FormSectionProps {
  /** Section title (SLDS record-detail section header). */
  title: ReactNode;
  /** Optional one-line description shown beneath the title. */
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Titled record-detail section. Sibling sections render a hairline top
 * separator (suppressed on the first), giving the Knowledge edit surfaces the
 * sectioned, clearly-divided layout of a mature B2B record page. Wrap a set of
 * these in a `space-y-*` container.
 */
export function FormSection({ title, description, className, children }: FormSectionProps) {
  return (
    <section className={className}>
      <div className="mb-4 flex items-center gap-2.5 rounded-md border-l-[3px] border-brand-600 bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          {title}
        </h3>
        {description !== undefined && (
          <p className="text-xs font-normal normal-case text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      <div className="px-1">{children}</div>
    </section>
  );
}
