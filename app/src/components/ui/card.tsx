import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Lift on hover (adds the .card-lift transition + shadow). */
  lift?: boolean;
}

/** Surface card with a hairline border (reference §2.3, radius `xl`). */
export function Card({ children, className, lift = false }: CardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface",
        lift && "card-lift",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

/** Header strip used at the top of a Card. */
export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-border bg-surface px-4 py-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

interface SectionHeaderProps {
  title: ReactNode;
  sub?: ReactNode;
  /** Right-aligned slot (actions, chips). */
  right?: ReactNode;
  className?: string;
}

/**
 * Section title + optional sub-line and right-aligned actions (reference §5).
 * Used inside cards and at the top of dashboard sections.
 */
export function SectionHeader({ title, sub, right, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {sub !== undefined && <p className="mt-0.5 text-sm text-ink-muted">{sub}</p>}
      </div>
      {right !== undefined && <div className="shrink-0">{right}</div>}
    </div>
  );
}
