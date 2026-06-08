"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Command, Search, Bell } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";

/** Chinese variants live behind the single "中" toggle (proposal §5.1). */
const ZH_OPTIONS = [
  { value: "zh", label: "简体中文" },
  { value: "zh-Hant", label: "繁體中文" },
] as const;

export function TopNav() {
  const { selected, setLocale, t } = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // The 1-px bottom border appears only after the page has scrolled (§5.1).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/projects", label: t.nav.projects },
    { href: "/scan", label: t.nav.scan },
    { href: "/benchmark", label: t.nav.benchmark },
    { href: "/knowledge", label: t.nav.knowledge },
    { href: "/settings", label: t.nav.settings },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-surface/90 backdrop-blur transition-shadow",
        scrolled ? "border-b border-border" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-8 px-6">
        <Link
          href="/projects"
          className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent-violet font-display text-base font-bold text-white">
            F
          </span>
          <span className="hidden font-display sm:inline">{t.app.name}</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative px-3 py-5 font-medium transition-colors",
                  active ? "text-foreground" : "text-ink-muted hover:text-foreground",
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Search affordance — presentational placeholder for a future ⌘K palette. */}
          <div
            aria-hidden
            className="hidden h-9 w-72 items-center gap-2 rounded-md border border-border bg-surface-muted px-3 text-sm text-ink-faint md:flex"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">{t.nav.searchPlaceholder}</span>
            <kbd className="flex items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-md text-ink-muted hover:bg-surface-muted"
          >
            <Bell className="h-4 w-4" />
          </span>
          <LanguageSwitcher selected={selected} setLocale={setLocale} />
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-accent-violet to-primary text-xs font-semibold text-white">
            JL
          </span>
        </div>
      </div>
    </header>
  );
}

interface LanguageSwitcherProps {
  selected: "en" | "zh" | "zh-Hant";
  setLocale: (l: "en" | "zh" | "zh-Hant") => void;
}

function LanguageSwitcher({ selected, setLocale }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const zhActive = selected === "zh" || selected === "zh-Hant";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const segment = "rounded px-2 py-0.5 text-xs font-semibold transition-colors";

  return (
    <div
      ref={ref}
      data-no-convert
      className="relative flex shrink-0 items-center gap-0.5 rounded-md border border-slate-200 p-0.5 dark:border-slate-800"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          segment,
          selected === "en"
            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50",
        )}
      >
        EN
      </button>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          if (!zhActive) setLocale("zh");
          setOpen((s) => !s);
        }}
        className={cn(
          segment,
          "inline-flex items-center gap-0.5",
          zhActive
            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50",
        )}
      >
        中
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-1 min-w-[7rem] overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {ZH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="menuitem"
              onClick={() => {
                setLocale(opt.value);
                setOpen(false);
              }}
              className={cn(
                "block w-full px-3 py-1.5 text-left text-xs transition-colors",
                selected === opt.value
                  ? "bg-subtle font-semibold text-ink dark:bg-slate-800 dark:text-slate-50"
                  : "text-ink-muted hover:bg-subtle dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
