"use client";

import Link from "next/link";
import { useI18n } from "../contexts/I18nContext";

export default function Banner() {
  const { t } = useI18n();
  return (
    <section
      id="ilan-ver"
      className="py-16 md:py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 px-6">
        <div>
          <h3 className="text-xl md:text-2xl text-white font-semibold tracking-tight">
            {t("banner_title")}
          </h3>
          <p className="text-slate-400 mt-1">{t("banner_price")}</p>
        </div>
        <Link
          href="/ilan-ver"
          className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold text-sm tracking-tight shadow-[var(--shadow-card)] transition"
        >
          {t("post_ad_now")}
        </Link>
      </div>
    </section>
  );
}
