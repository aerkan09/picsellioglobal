"use client";

import Link from "next/link";
import { PicsellioLogo } from "./PicsellioLogo";
import { useI18n } from "../contexts/I18nContext";
import type { Locale } from "../contexts/I18nContext";

export default function Header() {
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="w-full backdrop-blur-xl bg-slate-900/70 border-b border-white/5 fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3.5 px-4 sm:px-6 text-white">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[var(--neon-green)]">
            <PicsellioLogo className="h-8 w-8" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">Picsellio</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-300">
          <Link href="/kategoriler" className="hover:text-white transition">{t("nav_kategoriler")}</Link>
          <Link href="/urunler" className="hover:text-white transition">{t("nav_urunler")}</Link>
          <Link href="/ustalar" className="hover:text-white transition">{t("nav_ustalar")}</Link>
          <Link href="/sehirler" className="hover:text-white transition">{t("nav_sehirler")}</Link>
          <Link href="/ilan-ver" className="hover:text-white transition">{t("nav_ilan_ver")}</Link>
          <a href="#ai-verified" className="hover:text-white transition">{t("ai_verified")}</a>
          <Link href="/login" className="hover:text-white transition">{t("login")}</Link>
          <div className="flex items-center gap-1 border-l border-slate-600 pl-4 ml-2">
            {(["tr", "en", "de"] as Locale[]).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                className={`w-8 h-8 rounded text-xs font-medium transition ${
                  locale === loc
                    ? "bg-[var(--neon-green)] text-slate-900"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
                title={loc === "tr" ? "Türkçe" : loc === "en" ? "English" : "Deutsch"}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 sm:hidden">
            {(["tr", "en", "de"] as Locale[]).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                className={`w-7 h-7 rounded text-xs font-medium ${
                  locale === loc ? "bg-[var(--neon-green)] text-slate-900" : "text-slate-400 bg-slate-800"
                }`}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>
          <Link
            href="/dashboard"
            className="bg-[var(--neon-green)] text-slate-900 px-4 py-2.5 rounded-xl font-semibold text-sm tracking-tight transition hover:brightness-110 shadow-[var(--shadow-card)]"
          >
            {t("login_register")}
          </Link>
        </div>
      </div>
    </header>
  );
}
