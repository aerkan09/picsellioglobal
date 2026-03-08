"use client";

import Image from "next/image";
import { useI18n } from "../contexts/I18nContext";

const AI_VERIFICATION_IMAGE =
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80"

export default function Features() {
  const { t } = useI18n();
  return (
    <section
      className="py-24 md:py-28 bg-slate-50/90 text-gray-900"
      id="ai-verified"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center mb-20">
          <div>
            <img
              src="/icons/photo-check.svg"
              alt=""
              className="w-14 h-14 mx-auto mb-4 text-gray-700"
            />
            <h3 className="font-semibold text-gray-900">{t("feature_photo_title")}</h3>
            <p className="text-gray-500 text-sm mt-1">{t("feature_photo_desc")}</p>
          </div>
          <div>
            <img
              src="/icons/analysis.svg"
              alt=""
              className="w-14 h-14 mx-auto mb-4 text-gray-700"
            />
            <h3 className="font-semibold text-gray-900">{t("feature_tech_title")}</h3>
            <p className="text-gray-500 text-sm mt-1">{t("feature_tech_desc")}</p>
          </div>
          <div>
            <img
              src="/icons/shield.svg"
              alt=""
              className="w-14 h-14 mx-auto mb-4 text-gray-700"
            />
            <h3 className="font-semibold text-gray-900">{t("feature_badge_title")}</h3>
            <p className="text-gray-500 text-sm mt-1">{t("feature_badge_desc")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center px-6">
        <div className="relative">
          <div className="relative rounded-2xl overflow-hidden shadow-[var(--shadow-card)] ring-1 ring-black/5">
            <Image
              src={AI_VERIFICATION_IMAGE}
              alt={t("feature_ai_badge")}
              width={640}
              height={480}
              className="w-full aspect-[4/3] object-cover"
            />
          </div>
          <div
            className="absolute -bottom-5 -right-5 glass-card px-6 py-4 rounded-xl min-w-[140px] text-center"
            style={{ boxShadow: "var(--shadow-card-hover)" }}
          >
            <span className="text-sm font-semibold tracking-tight text-gray-800">
              {t("feature_ai_badge")}
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-emerald-600 tracking-wide uppercase mb-3">
            {t("feature_trusted")}
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-5">
            {t("feature_ai_system")}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-lg">
            {t("feature_ai_system_desc")}
          </p>

          <div className="space-y-4">
            {[
              { titleKey: "feature_photo_analysis", descKey: "feature_photo_analysis_desc", icon: "/icons/photo-check.svg" },
              { titleKey: "feature_tech_review", descKey: "feature_tech_review_desc", icon: "/icons/analysis.svg" },
              { titleKey: "feature_verified", descKey: "feature_verified_desc", icon: "/icons/shield.svg" },
            ].map((item) => (
              <div
                key={item.titleKey}
                className="glass-card p-5 rounded-xl transition-shadow flex gap-4 items-start"
              >
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden
                  className="w-10 h-10 shrink-0"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 tracking-tight">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                    {t(item.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
