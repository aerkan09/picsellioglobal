"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { products, whatsappUrl } from "../../lib/api";
import type { Product } from "../../lib/api";
import LocationSelect, { type TurkeyLocation } from "../components/LocationSelect";
import CategorySelect from "../components/CategorySelect";
import Header from "../components/Header";
import { useI18n } from "../contexts/I18nContext";
import { formatPrice } from "../../lib/formatPrice";

const DEFAULT_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905551234567";

export default function UrunlerPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<TurkeyLocation>(() => ({
    city: searchParams.get("city") || "",
    district: searchParams.get("district") || "",
  }));
  const [categorySlug, setCategorySlug] = useState("");

  useEffect(() => {
    setLoading(true);
    products
      .list({
        status: "APPROVED",
        limit: 48,
        city: location.city || undefined,
        district: location.district || undefined,
        categorySlug: categorySlug || undefined,
      })
      .then(({ data }) => setList(data))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [location.city, location.district, categorySlug]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6 pt-24">
        <h1 className="text-3xl font-bold mb-2">Esnaf Vitrini</h1>
        <p className="text-slate-400 mb-6">
          Ürün satan işletmeler: tostçu, giyim mağazası, oto galeri, klima satıcısı, telefon mağazası, mobilya mağazası, cam balkon satıcısı ve daha fazlası.
        </p>

        <div className="flex flex-wrap items-end gap-4 mb-8">
          <CategorySelect
            value={categorySlug}
            onChange={(slug) => setCategorySlug(slug)}
            label={t("category")}
            required={false}
            includeEmpty
            categoryGroup="business"
            className="min-w-[200px]"
          />
          <div className="min-w-[200px]">
            <LocationSelect
              value={location}
              onChange={setLocation}
              cityLabel="İl"
              districtLabel="İlçe"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-slate-400">{t("loading")}</p>
        ) : list.length === 0 ? (
          <p className="text-slate-400">{t("no_approved_products")}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((p) => {
              const phone = p.sellerPhone || DEFAULT_WHATSAPP;
              const waUrl = whatsappUrl(phone, `Merhaba, "${p.title}" ürünü hakkında bilgi almak istiyorum.`);
              return (
                <div key={p.id} className="overflow-hidden rounded-xl bg-white text-slate-900 shadow-lg">
                  <div className="relative aspect-[9/16] bg-slate-100">
                    <Image
                      src={p.imageUrl}
                      alt={p.title}
                      fill
                      className="object-cover transition duration-300 hover:scale-105"
                      sizes="(max-width:768px) 100vw, 25vw"
                      unoptimized
                    />
                    {p.aiVerified && (
                      <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-green)] text-xs font-bold text-white">
                        AI
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="mt-1 text-lg font-bold text-green-600">{formatPrice(p.price)}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {[p.city, p.district].filter(Boolean).join(" / ") || "—"}
                    </p>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-green)] py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-green-hover)]"
                    >
                      <WhatsAppIcon />
                      {t("contact_whatsapp")}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
