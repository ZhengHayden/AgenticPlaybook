"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import { getDictionary, type Dictionary, type Locale } from "./i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
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

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" || stored === "zh" ? stored : "en";
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
  const locale = useSyncExternalStore<Locale>(subscribe, readStoredLocale, () => "en");

  const setLocale = useCallback((l: Locale) => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l);
    listeners.forEach((cb) => cb());
  }, []);

  const value: LocaleContextValue = { locale, setLocale, t: getDictionary(locale) };
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
