import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Lift on hover (adds the .card-lift transition + shadow). */
  lift?: boolean;
}

/** Flat white surface with a hairline border — the SLDS base card. */
export function Card({ children, className, lift = false }: CardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm",
        "dark:border-slate-800 dark:bg-slate-900",
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

/** Flat header strip used at the top of a Card. */
export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5",
        "dark:border-slate-800 dark:bg-slate-900",
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
