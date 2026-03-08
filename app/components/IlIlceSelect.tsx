"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TomSelect from "tom-select";
import "tom-select/dist/css/tom-select.css";

export type IlIlceValue = { il: string; ilce: string };

type IlIlceItem = { il: string; ilceler: string[] };

type Props = {
  value?: IlIlceValue;
  onChange?: (value: IlIlceValue) => void;
  className?: string;
  /** Optional: use light theme (e.g. for white/light sections) */
  theme?: "dark" | "light";
};

const wrapperClassDark =
  "rounded-xl border border-slate-600 bg-slate-900 focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500";
const wrapperClassLight =
  "rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500";

export default function IlIlceSelect({
  value = { il: "", ilce: "" },
  onChange,
  className = "",
  theme = "dark",
}: Props) {
  const [data, setData] = useState<IlIlceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ilRef = useRef<HTMLInputElement>(null);
  const ilceRef = useRef<HTMLInputElement>(null);
  const tomIlRef = useRef<TomSelect | null>(null);
  const tomIlceRef = useRef<TomSelect | null>(null);

  const isDark = theme === "dark";
  const wrapperClass = isDark ? wrapperClassDark : wrapperClassLight;

  useEffect(() => {
    fetch("/data/turkiye-il-ilce.json")
      .then((res) => {
        if (!res.ok) throw new Error("Veri yüklenemedi");
        return res.json();
      })
      .then((json: IlIlceItem[]) => {
        setData(Array.isArray(json) ? json : []);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Hata"))
      .finally(() => setLoading(false));
  }, []);

  const initTomSelect = useCallback(() => {
    if (!ilRef.current || !ilceRef.current || data.length === 0) return;

    if (tomIlRef.current) {
      tomIlRef.current.destroy();
      tomIlRef.current = null;
    }
    if (tomIlceRef.current) {
      tomIlceRef.current.destroy();
      tomIlceRef.current = null;
    }

    const ilOptions = data.map((item) => ({ value: item.il, text: item.il }));

    const tomIl = new TomSelect(ilRef.current, {
      options: ilOptions,
      valueField: "value",
      labelField: "text",
      searchField: ["text"],
      placeholder: "İl ara veya seçin...",
      maxItems: 1,
      create: false,
      allowEmptyOption: false,
      closeAfterSelect: true,
      openOnFocus: true,
      maxOptions: 100,
      diacritics: true,
      onChange: (val: string) => {
        onChange?.({ il: val, ilce: "" });
      },
      render: {
        no_results: (data) =>
          `<div class="no-results">"${data.input}" için sonuç yok</div>`,
      },
      ...(isDark
        ? {
            classNames: {
              control: "ts-control !border-0 !bg-transparent !shadow-none",
              input: "!text-white",
              dropdown: "!bg-slate-800 !border-slate-600",
              option: "!text-slate-200 hover:!bg-slate-700",
              option_active: "!bg-emerald-600/30 !text-white",
            },
          }
        : {
            classNames: {
              control: "ts-control !border-0 !bg-transparent !shadow-none",
              input: "!text-gray-900",
              dropdown: "!bg-white !border-slate-200",
              option: "!text-gray-700 hover:!bg-slate-100",
              option_active: "!bg-emerald-50 !text-emerald-700",
            },
          }),
    });

    const tomIlce = new TomSelect(ilceRef.current, {
      options: [],
      valueField: "value",
      labelField: "text",
      searchField: ["text"],
      placeholder: "Önce il seçin",
      maxItems: 1,
      create: false,
      allowEmptyOption: false,
      closeAfterSelect: true,
      openOnFocus: true,
      maxOptions: 200,
      diacritics: true,
      disabled: true,
      onChange: (val: string) => {
        const il = tomIlRef.current?.getValue() as string;
        if (il) onChange?.({ il, ilce: val });
      },
      render: {
        no_results: (data) =>
          `<div class="no-results">"${data.input}" için sonuç yok</div>`,
      },
      ...(isDark
        ? {
            classNames: {
              control: "ts-control !border-0 !bg-transparent !shadow-none",
              input: "!text-white",
              dropdown: "!bg-slate-800 !border-slate-600",
              option: "!text-slate-200 hover:!bg-slate-700",
              option_active: "!bg-emerald-600/30 !text-white",
            },
          }
        : {
            classNames: {
              control: "ts-control !border-0 !bg-transparent !shadow-none",
              input: "!text-gray-900",
              dropdown: "!bg-white !border-slate-200",
              option: "!text-gray-700 hover:!bg-slate-100",
              option_active: "!bg-emerald-50 !text-emerald-700",
            },
          }),
    });

    tomIlRef.current = tomIl;
    tomIlceRef.current = tomIlce;

    if (value.il) {
      tomIl.setValue(value.il);
      const selected = data.find((x) => x.il === value.il);
      if (selected) {
        tomIlce.clearOptions();
        tomIlce.addOptions(
          selected.ilceler.map((ilce) => ({ value: ilce, text: ilce }))
        );
        tomIlce.settings.placeholder = "İlçe ara veya seçin...";
        tomIlce.inputState();
        tomIlce.disabled = false;
        if (value.ilce) tomIlce.setValue(value.ilce);
      }
    }
  }, [data, isDark, onChange]);

  useEffect(() => {
    if (!data.length) return;
    initTomSelect();
    return () => {
      if (tomIlRef.current) {
        tomIlRef.current.destroy();
        tomIlRef.current = null;
      }
      if (tomIlceRef.current) {
        tomIlceRef.current.destroy();
        tomIlceRef.current = null;
      }
    };
  }, [data, initTomSelect]);

  useEffect(() => {
    if (!tomIlceRef.current || !data.length) return;
    if (!value.il) {
      tomIlceRef.current.clear();
      tomIlceRef.current.clearOptions();
      tomIlceRef.current.settings.placeholder = "Önce il seçin";
      tomIlceRef.current.inputState();
      tomIlceRef.current.disabled = true;
      return;
    }
    const selected = data.find((x) => x.il === value.il);
    if (!selected) return;
    tomIlceRef.current.clearOptions();
    tomIlceRef.current.addOptions(
      selected.ilceler.map((ilce) => ({ value: ilce, text: ilce }))
    );
    tomIlceRef.current.settings.placeholder = "İlçe ara veya seçin...";
    tomIlceRef.current.inputState();
    tomIlceRef.current.disabled = false;
    tomIlceRef.current.setValue(value.ilce);
  }, [value.il, value.ilce, data]);

  useEffect(() => {
    if (!tomIlRef.current || !data.length) return;
    const cur = tomIlRef.current.getValue();
    if (cur !== value.il) tomIlRef.current.setValue(value.il);
  }, [value.il, data]);

  const labelClass = isDark
    ? "mb-1.5 block text-sm font-medium text-slate-400"
    : "mb-1.5 block text-sm font-medium text-gray-700";

  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
        <div className="animate-pulse rounded-xl h-12 bg-slate-700/50" />
        <div className="animate-pulse rounded-xl h-12 bg-slate-700/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 ${className}`}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      <div>
        <label htmlFor="il-select" className={labelClass}>
          İl
        </label>
        <div className={wrapperClass}>
          <input
            id="il-select"
            ref={ilRef}
            type="text"
            autoComplete="off"
            className="w-full px-4 py-3 bg-transparent border-0 text-sm outline-none rounded-xl"
            placeholder="İl ara veya seçin..."
          />
        </div>
      </div>
      <div>
        <label htmlFor="ilce-select" className={labelClass}>
          İlçe
        </label>
        <div className={wrapperClass}>
          <input
            id="ilce-select"
            ref={ilceRef}
            type="text"
            autoComplete="off"
            className="w-full px-4 py-3 bg-transparent border-0 text-sm outline-none rounded-xl"
            placeholder="Önce il seçin"
          />
        </div>
      </div>
    </div>
  );
}
