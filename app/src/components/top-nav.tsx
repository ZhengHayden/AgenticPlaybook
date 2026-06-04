"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";

export function TopNav() {
  const { locale, setLocale, t } = useLocale();
  const pathname = usePathname();

  const links = [
    { href: "/projects", label: t.nav.projects },
    { href: "/scan", label: t.nav.scan },
    { href: "/knowledge", label: t.nav.knowledge },
    { href: "/settings", label: t.nav.settings },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-6">
        <Link href="/projects" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white">A</span>
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
                  "rounded-md px-3 py-1.5 transition-colors",
                  active
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={() => setLocale(locale === "en" ? "zh" : "en")}
            className="ml-3 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            title="Toggle language"
          >
            {locale === "en" ? "EN" : "中文"} ⇄ {locale === "en" ? "中文" : "EN"}
          </button>
        </nav>
      </div>
    </header>
  );
}
