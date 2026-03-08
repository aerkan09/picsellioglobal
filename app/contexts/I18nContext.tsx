"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Locale = "tr" | "en" | "de";

const STORAGE_KEY = "picsellio_locale";
const SUPPORTED: Locale[] = ["tr", "en", "de"];
const DEFAULT: Locale = "tr";

function getBrowserLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT;
  const lang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || "";
  const code = lang.slice(0, 2).toLowerCase();
  if (code === "de") return "de";
  if (code === "en") return "en";
  return "tr";
}

function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored as Locale)) return stored as Locale;
  return null;
}

type Messages = Record<string, string>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  messages: Messages | null;
  loading: boolean;
};

const defaultValue: I18nContextValue = {
  locale: DEFAULT,
  setLocale: () => {},
  t: (key) => key,
  messages: null,
  loading: true,
};

const I18nContext = createContext<I18nContextValue>(defaultValue);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT);
  const [messages, setMessages] = useState<Messages | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredLocale();
    const initial = stored || getBrowserLocale();
    setLocaleState(initial);
  }, []);

  useEffect(() => {
    if (!locale) return;
    setLoading(true);
    fetch(`/locales/${locale}.json`)
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        setMessages(typeof data === "object" && data !== null ? data : {});
      })
      .catch(() => setMessages({}))
      .finally(() => setLoading(false));
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    if (!SUPPORTED.includes(newLocale)) return;
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale === "tr" ? "tr" : newLocale === "de" ? "de" : "en";
    }
  }, []);

  const t = useCallback(
    (key: string) => {
      if (messages && key in messages) return messages[key];
      return key;
    },
    [messages]
  );

  useEffect(() => {
    document.documentElement.lang = locale === "tr" ? "tr" : locale === "de" ? "de" : "en";
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, messages, loading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
