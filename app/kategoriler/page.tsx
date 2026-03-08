"use client";

import Link from "next/link";
import Header from "../components/Header";
import { useCategories } from "../components/CategorySelect";
import { useI18n } from "../contexts/I18nContext";

export default function KategorilerPage() {
  const categories = useCategories();
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-14">
        <h1 className="text-3xl font-bold mb-2">{t("kategoriler_title")}</h1>
        <p className="text-slate-400 mb-10">{t("kategoriler_subtitle")}</p>
        {categories.length === 0 ? (
          <p className="text-slate-400">{t("loading")}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/kategori/${c.slug}`}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-6 text-center transition hover:border-[var(--accent-green)] hover:bg-slate-800"
              >
                <span className="text-2xl mb-2" aria-hidden>{c.icon ?? "📂"}</span>
                <span className="font-medium text-sm text-white">{c.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
