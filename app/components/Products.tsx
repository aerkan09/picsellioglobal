"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { products, whatsappUrl } from "@/lib/api";
import type { Product } from "@/lib/api";
import { useI18n } from "../contexts/I18nContext";
import { useHomeLocation } from "@/app/contexts/HomeLocationContext";
import { formatPrice } from "@/lib/formatPrice";
import LocationSelect from "./LocationSelect";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905551234567";

function IlanVerBanner({ t }: { t: (k: string) => string }) {
  return (
    <div className="md:col-span-4 rounded-2xl overflow-hidden glass-card border border-slate-200/80 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-900/5 ring-1 ring-slate-200/50">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
          {t("banner_title")}
        </h3>
        <p className="text-gray-500 mt-1">{t("banner_price")}</p>
      </div>
      <Link
        href="/ilan-ver"
        className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium text-sm transition shadow-[var(--shadow-card)]"
      >
        {t("post_ad_now")}
      </Link>
    </div>
  );
}

function ProductCard({ product, t }: { product: Product; t: (k: string) => string }) {
  const phone = product.sellerPhone || WA;
  const waUrl = `https://wa.me/${phone.replace(/\D/g, "")}`;

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition">
      <div className="aspect-[9/16] overflow-hidden rounded-t-xl relative">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 25vw"
          unoptimized
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold">{product.title}</h3>
        <p className="text-lg font-bold text-green-600">{formatPrice(product.price)}</p>
        <p className="text-sm text-gray-500">
          {[product.city, product.district].filter(Boolean).join(" / ") || "—"}
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 bg-green-500 text-white text-center py-2 rounded-lg"
        >
          {t("contact_whatsapp")}
        </a>
      </div>
    </div>
  );
}

export default function Products() {
  const { t } = useI18n();
  const { effectiveCity, setUserSelectedCity, isLoadingLocation } = useHomeLocation();
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLocationChange, setShowLocationChange] = useState(false);

  useEffect(() => {
    setLoading(true);
    products
      .list({ status: "APPROVED", limit: 12, city: effectiveCity || undefined })
      .then(({ data }) => setList(data))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [effectiveCity]);

  const hasCityFilter = Boolean(effectiveCity);

  return (
    <section className="py-24 bg-white text-gray-900" id="urunler">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-sm font-medium text-emerald-600 tracking-wide uppercase mb-2">
          {t("products_section_label")}
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
          {t("global_showcase")}
        </h2>

        {hasCityFilter && effectiveCity && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-slate-600">
              Size en yakın ilanlar gösteriliyor: <strong>{effectiveCity}</strong>
            </p>
            <button
              type="button"
              onClick={() => setShowLocationChange((v) => !v)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium underline"
            >
              Konumu değiştir
            </button>
            {showLocationChange && (
              <div className="w-full max-w-xs mt-2">
                <LocationSelect
                  value={{ city: effectiveCity, district: "" }}
                  onChange={(loc) => {
                    setUserSelectedCity(loc.city || null);
                    setShowLocationChange(false);
                  }}
                  cityLabel="Şehir"
                  cityOnly
                />
              </div>
            )}
          </div>
        )}

        {isLoadingLocation && !effectiveCity && (
          <p className="mt-4 text-slate-500 text-sm">Konumunuz alınıyor...</p>
        )}

        <div className="grid md:grid-cols-4 gap-6 mt-12">
          {loading ? (
            <p className="col-span-full text-slate-500">{t("loading")}</p>
          ) : list.length === 0 ? (
            <p className="col-span-full text-slate-500">
              {hasCityFilter
                ? "Bu şehirde henüz ilan bulunmuyor. Yukarıdan başka bir şehir seçebilirsiniz."
                : "Henüz müşteri ilanı yok. İlk ilanı siz verin!"}
            </p>
          ) : (
            list.map((product, i) => (
              <div key={product.id} className="contents">
                <ProductCard product={product} t={t} />
                {(i + 1) % 4 === 0 && <IlanVerBanner t={t} />}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
