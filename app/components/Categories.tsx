"use client";

import Link from "next/link";
import { useCategories } from "./CategorySelect";
import { useI18n } from "../contexts/I18nContext";

export default function Categories() {
  const categories = useCategories();
  const { t } = useI18n();

  if (categories.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-slate-900/50 text-white border-y border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center mb-2">{t("categories_title")}</h2>
        <p className="text-slate-400 text-center mb-10">{t("categories_subtitle")}</p>
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
      </div>
    </section>
  );
}
