"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { useI18n } from "../contexts/I18nContext";

type CityItem = { city: string; districts: string[] };

export default function SehirlerPage() {
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    fetch("/data/turkeyLocations.json")
      .then((r) => r.json())
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-14">
        <h1 className="text-3xl font-bold mb-2">{t("sehirler_title")}</h1>
        <p className="text-slate-400 mb-8">{t("sehirler_subtitle")}</p>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : cities.length === 0 ? (
          <p className="text-slate-400">{t("sehirler_loading_error")}</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {cities.map((item) => (
              <li key={item.city}>
                <Link
                  href={"/products?city=" + encodeURIComponent(item.city)}
                  className="block rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-white hover:border-[var(--accent-green)] hover:bg-slate-800 transition"
                >
                  {item.city}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
