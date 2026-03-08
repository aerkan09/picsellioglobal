"use client";

import Link from "next/link";
import Header from "../components/Header";
import { useI18n } from "../contexts/I18nContext";

export default function IlanVerPage() {
  const { t } = useI18n();
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-14 text-center">
        <h1 className="text-3xl font-bold mb-4">{t("ilan_ver_title")}</h1>
        <p className="text-slate-400 mb-8">
          {t("ilan_ver_subtitle")}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-xl bg-[var(--accent-green)] text-slate-900 px-6 py-3.5 font-semibold hover:brightness-110 transition"
          >
            {t("ilan_ver_cta")}
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-slate-600 px-6 py-3.5 text-slate-300 hover:bg-slate-800 transition"
          >
            {t("login")}
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-slate-600 px-6 py-3.5 text-slate-300 hover:bg-slate-800 transition"
          >
            {t("login_register")}
          </Link>
        </div>
      </div>
    </main>
  );
}
