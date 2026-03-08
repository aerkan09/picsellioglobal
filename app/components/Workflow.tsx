"use client";

import { useI18n } from "../contexts/I18nContext";

const STEPS = [
  { labelKey: "workflow_upload", subKey: "workflow_upload_sub", icon: "/icons/upload.svg" },
  { labelKey: "workflow_payment", subKey: "workflow_payment_sub", icon: "/icons/payment.svg" },
  { labelKey: "workflow_ai", subKey: "workflow_ai_sub", icon: "/icons/ai.svg" },
  { labelKey: "workflow_publish", subKey: "workflow_publish_sub", icon: "/icons/rocket.svg" },
];

export default function Workflow() {
  const { t } = useI18n();
  return (
    <section className="py-24 bg-slate-50/90 text-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-medium text-emerald-600 tracking-wide uppercase mb-2">
          {t("workflow_process")}
        </p>
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight mb-12">
          {t("workflow_how")}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {STEPS.map((step) => (
            <div
              key={step.labelKey}
              className="glass-card rounded-2xl p-6 transition-shadow hover:shadow-[var(--shadow-card-hover)]"
            >
              <img
                src={step.icon}
                alt=""
                className="w-10 h-10 mx-auto mb-4"
              />
              <p className="font-semibold text-gray-900 tracking-tight">
                {t(step.labelKey)}
              </p>
              <p className="text-sm text-gray-500 mt-1">{t(step.subKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
