import type { ComponentType, ReactNode } from "react";
import { Check, AlertTriangle, X, CircleDot, Circle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Anything renderable as a sized glyph — lucide icons satisfy this. */
type IconLike = ComponentType<{
  className?: string;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
}>;

/**
 * Semantic state, per the UI/UX proposal §4.1. Color communicates state and
 * is *always* paired with an icon + text so it survives translation and
 * passes WCAG (color is never the only carrier of meaning — §8).
 */
export type ChipState = "ready" | "warn" | "block" | "info" | "neutral";

type ChipSize = "sm" | "md";

interface StateStyle {
  /** Default lucide glyph for the state (overridable via `icon`). */
  icon: LucideIcon;
  /** Tailwind utilities derived from the §4 state tokens. */
  className: string;
}

const STATE_STYLE: Record<ChipState, StateStyle> = {
  ready: {
    icon: Check,
    className: "border-state-ready/30 bg-state-ready-bg text-state-ready",
  },
  warn: {
    icon: AlertTriangle,
    className: "border-state-warn/40 bg-state-warn-bg text-state-warn",
  },
  block: {
    icon: X,
    className: "border-state-block/30 bg-state-block-bg text-state-block",
  },
  info: {
    icon: CircleDot,
    className: "border-state-info/30 bg-state-info-bg text-state-info",
  },
  neutral: {
    icon: Circle,
    className: "border-state-neutral/30 bg-state-neutral-bg text-state-neutral",
  },
};

const SIZE_CLASS: Record<ChipSize, { wrap: string; icon: string }> = {
  sm: { wrap: "h-5 gap-1 px-1.5 text-[11px]", icon: "h-3 w-3" },
  md: { wrap: "h-6 gap-1.5 px-2 text-xs", icon: "h-3.5 w-3.5" },
};

interface StatusChipProps {
  state: ChipState;
  children: ReactNode;
  /** Override the default state glyph. */
  icon?: IconLike;
  size?: ChipSize;
  className?: string;
}

/**
 * Icon + text status pill. The single source of truth for state color across
 * the app — use this instead of hand-rolled emerald/rose/amber pills so
 * status weight stays consistent (proposal §2, §6).
 */
export function StatusChip({
  state,
  children,
  icon,
  size = "md",
  className,
}: StatusChipProps) {
  const style = STATE_STYLE[state];
  const Icon = icon ?? style.icon;
  const sizes = SIZE_CLASS[size];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold leading-none tracking-tight",
        sizes.wrap,
        style.className,
        className,
      )}
    >
      <Icon className={cn("shrink-0", sizes.icon)} strokeWidth={2} aria-hidden />
      {children}
    </span>
  );
}
