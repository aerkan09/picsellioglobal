"use client";

import { useState, useEffect } from "react";
import { useI18n } from "../contexts/I18nContext";

export type TurkeyLocation = { city: string; district: string };

type LocationItem = { city: string; districts: string[] };

type Props = {
  value?: TurkeyLocation;
  onChange?: (value: TurkeyLocation) => void;
  className?: string;
  cityLabel?: string;
  districtLabel?: string;
  stacked?: boolean;
  /** When true, only show city dropdown (e.g. for homepage "change location"). */
  cityOnly?: boolean;
};

export default function LocationSelect({
  value = { city: "", district: "" },
  onChange,
  className = "",
  cityLabel,
  districtLabel,
  stacked = false,
  cityOnly = false,
}: Props) {
  const { t } = useI18n();
  const [data, setData] = useState<LocationItem[]>([]);
  const cityLabelDisplay = cityLabel ?? t("city");
  const districtLabelDisplay = districtLabel ?? t("district");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/turkeyLocations.json")
      .then((res) => {
        if (!res.ok) throw new Error("Veri yüklenemedi");
        return res.json();
      })
      .then((json: LocationItem[]) => {
        setData(Array.isArray(json) ? json : []);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Hata"))
      .finally(() => setLoading(false));
  }, []);

  const selectedCity = data.find((x) => x.city === value.city);
  const districts = selectedCity?.districts ?? [];

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    onChange?.({ city, district: "" });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    onChange?.({ ...value, district });
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
        <div className="animate-pulse rounded-lg h-10 bg-slate-200 dark:bg-slate-700" />
        <div className="animate-pulse rounded-lg h-10 bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400 ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${stacked && !cityOnly ? "grid-cols-1" : cityOnly ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"} ${className}`}>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-400">
          {cityLabelDisplay}
        </label>
        <select
          value={value.city}
          onChange={handleCityChange}
          className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">{t("city_select_placeholder")}</option>
          {data.map((item) => (
            <option key={item.city} value={item.city}>
              {item.city}
            </option>
          ))}
        </select>
      </div>
      {!cityOnly && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-400">
            {districtLabelDisplay}
          </label>
          <select
            value={value.district}
            onChange={handleDistrictChange}
            disabled={!value.city}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">{t("district_select_placeholder")}</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
