"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "EN" },
  { value: "zh", label: "简体中文" },
  { value: "zh-Hant", label: "繁體中文" },
] as const;

export function TopNav() {
  const { selected, setLocale, t } = useLocale();
  const pathname = usePathname();

  const links = [
    { href: "/projects", label: t.nav.projects },
    { href: "/scan", label: t.nav.scan },
    { href: "/benchmark", label: t.nav.benchmark },
    { href: "/knowledge", label: t.nav.knowledge },
    { href: "/settings", label: t.nav.settings },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-black/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-6">
        <Link href="/projects" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-brand-600 text-base font-bold text-white">A</span>
          <span className="hidden sm:inline">{t.app.name}</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded px-3 py-1.5 font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-800/40 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div
            data-no-convert
            className="ml-3 flex items-center gap-0.5 rounded-md border border-slate-200 p-0.5 dark:border-slate-800"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLocale(opt.value)}
                className={cn(
                  "rounded px-2 py-0.5 text-xs font-medium transition-colors",
                  selected === opt.value
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
