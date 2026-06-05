"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import {
  contentLocale,
  getDictionary,
  type Dictionary,
  type Locale,
  type SelectedLocale,
} from "./i18n";
import { TraditionalConverter } from "@/components/traditional-converter";

type LocaleContextValue = {
  /** Content locale ("en" | "zh") — drives dictionary lookup and `[locale]` indexing. */
  locale: Locale;
  /** User-selected locale ("en" | "zh" | "zh-Hant") — drives the switcher UI. */
  selected: SelectedLocale;
  setLocale: (l: SelectedLocale) => void;
  t: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "awp.locale";

/**
 * Locale lives in `localStorage` — an external store. We read it via
 * `useSyncExternalStore` rather than a mount effect so the server snapshot is a
 * stable `"en"` (no hydration mismatch) and there's no synchronous `setState`
 * in an effect. The shared listener set lets `setLocale` and cross-tab
 * `storage` events both notify subscribers.
 */
const listeners = new Set<() => void>();

function readStoredLocale(): SelectedLocale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" || stored === "zh" || stored === "zh-Hant" ? stored : "en";
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  if (typeof window !== "undefined") window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") window.removeEventListener("storage", callback);
  };
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const selected = useSyncExternalStore<SelectedLocale>(subscribe, readStoredLocale, () => "en");

  const setLocale = useCallback((l: SelectedLocale) => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l);
    listeners.forEach((cb) => cb());
  }, []);

  const locale = contentLocale(selected);
  const value: LocaleContextValue = { locale, selected, setLocale, t: getDictionary(locale) };

  // Key the content subtree on `selected` so switching to/from Traditional
  // remounts it — the converter then runs on a clean Simplified DOM (and reverts
  // cleanly when leaving Traditional). The converter itself stays unkeyed.
  return (
    <LocaleContext.Provider value={value}>
      <TraditionalConverter active={selected === "zh-Hant"} />
      <div key={selected} className="contents">
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
