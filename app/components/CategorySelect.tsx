"use client";

import { useState, useEffect } from "react";
import { useI18n } from "../contexts/I18nContext";

export type CategoryOption = { name: string; slug: string; icon?: string; type?: "business" | "service" };

const CATEGORIES_URL = "/data/categories.json";

export type CategoryGroup = "business" | "service";

type CategoryRecord = { type?: string; name: string; slug: string; icon?: string };

export function useCategories(group: CategoryGroup = "service"): CategoryOption[] {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  useEffect(() => {
    fetch(CATEGORIES_URL)
      .then((r) => r.json())
      .then((data: CategoryRecord[]) => {
        const list = Array.isArray(data) ? data : [];
        const filtered = list.filter((c) => (c.type || "service") === group);
        setCategories(
          filtered.map((c) => ({ name: c.name, slug: c.slug, icon: c.icon, type: c.type as CategoryOption["type"] }))
        );
      })
      .catch(() => setCategories([]));
  }, [group]);
  return categories;
}

export function useAllCategories(): CategoryOption[] {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  useEffect(() => {
    fetch(CATEGORIES_URL)
      .then((r) => r.json())
      .then((data: CategoryRecord[]) => {
        const list = Array.isArray(data) ? data : [];
        setCategories(
          list.map((c) => ({ name: c.name, slug: c.slug, icon: c.icon, type: (c.type || "service") as CategoryOption["type"] }))
        );
      })
      .catch(() => setCategories([]));
  }, []);
  return categories;
}

type CategorySelectProps = {
  value: string;
  onChange: (slug: string, name: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  includeEmpty?: boolean;
  categoryGroup?: CategoryGroup;
};

export default function CategorySelect({
  value,
  onChange,
  label,
  required = true,
  className = "",
  includeEmpty = false,
  categoryGroup = "service",
}: CategorySelectProps) {
  const categories = useCategories(categoryGroup);
  const { t } = useI18n();
  const displayLabel = label ?? t("category");

  return (
    <div className={className}>
      <label className="mb-1 block text-sm text-slate-400">{displayLabel}</label>
      <select
        value={value}
        onChange={(e) => {
          const slug = e.target.value;
          const opt = categories.find((c) => c.slug === slug);
          onChange(slug, opt?.name ?? "");
        }}
        required={required}
        className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white"
      >
        {includeEmpty && <option value="">{t("category_all")}</option>}
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.icon ? `${c.icon} ${c.name}` : c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
