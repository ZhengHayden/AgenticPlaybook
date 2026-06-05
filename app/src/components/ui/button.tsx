import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-300 disabled:bg-indigo-300",
  secondary:
    "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  danger:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-300 disabled:bg-rose-300",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-70",
        VARIANT_CLASS[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
