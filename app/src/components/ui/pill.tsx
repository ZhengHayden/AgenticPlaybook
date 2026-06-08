import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Decorative category tones for non-status pills (domain, sponsor, priority
 * quadrant, AI accent). For *semantic state* (pass/warn/block/in-progress) use
 * {@link file://./status-chip.tsx StatusChip} instead — it pairs color with a
 * glyph + label for WCAG, whereas Pill is a lightweight label chip.
 */
export type PillTone =
  | "neutral"
  | "primary"
  | "violet"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "q1"
  | "q2"
  | "q3"
  | "q4";

const TONE_CLASS: Record<PillTone, string> = {
  neutral: "bg-surface-muted text-ink-muted",
  primary: "bg-primary-soft text-primary",
  violet: "bg-accent-violet-soft text-accent-violet",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  q1: "bg-q1-soft text-q1",
  q2: "bg-q2-soft text-q2",
  q3: "bg-q3-soft text-q3",
  q4: "bg-q4-soft text-q4",
};

interface PillProps {
  tone?: PillTone;
  children: ReactNode;
  /** Render a leading filled dot in the current tone color. */
  dot?: boolean;
  className?: string;
}

export function Pill({ tone = "neutral", children, dot = false, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none",
        TONE_CLASS[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
