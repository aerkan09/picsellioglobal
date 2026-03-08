"use client";

import { useState, useMemo } from "react";
import { useI18n } from "../contexts/I18nContext";
import { useCategories, type CategoryGroup, type CategoryOption } from "./CategorySelect";

type CategorySearchInputProps = {
  value: string;
  onChange: (slug: string, name: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  categoryGroup: CategoryGroup;
  placeholder?: string;
};

export default function CategorySearchInput({
  value,
  onChange,
  label,
  required = false,
  className = "",
  categoryGroup,
  placeholder,
}: CategorySearchInputProps) {
  const { t } = useI18n();
  const categories = useCategories(categoryGroup);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.trim().toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, search]);

  const selectedName = value ? categories.find((c) => c.slug === value)?.name ?? value : "";

  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-sm text-slate-400">
          {label}
          {required && " *"}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={open ? search : selectedName}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={placeholder ?? t("category_search_placeholder")}
          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2.5 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none"
        />
        {open && filtered.length > 0 && (
          <ul
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-600 bg-slate-800 py-1 shadow-lg"
            role="listbox"
          >
            {filtered.map((c) => (
              <li
                key={c.slug}
                role="option"
                onMouseDown={() => {
                  onChange(c.slug, c.name);
                  setSearch("");
                  setOpen(false);
                }}
                className="cursor-pointer px-4 py-2 text-white hover:bg-slate-700"
              >
                {c.icon ? `${c.icon} ${c.name}` : c.name}
              </li>
            ))}
          </ul>
        )}
        {open && search.trim() && filtered.length === 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-slate-400">
            {t("category_no_match")}
          </div>
        )}
      </div>
    </div>
  );
}
