"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/lib/api";
import type { Product } from "@/lib/api";
import { useI18n } from "../contexts/I18nContext";
import { useHomeLocation } from "@/app/contexts/HomeLocationContext";
import { formatPrice } from "@/lib/formatPrice";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905551234567";

function ListingCard({ product, t }: { product: Product; t: (k: string) => string }) {
  const phone = product.sellerPhone || WA;
  const waUrl = "https://wa.me/" + phone.replace(/\D/g, "");
  return (
    <div className="rounded-xl shadow hover:shadow-lg transition parallax-card-bg border border-white/10">
      <div className="aspect-[9/16] overflow-hidden rounded-t-xl relative">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
          unoptimized
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-white">{product.title}</h3>
        <p className="text-lg font-bold text-emerald-400">{formatPrice(product.price)}</p>
        <p className="text-sm text-slate-400">
          {[product.city, product.district].filter(Boolean).join(" / ") || "-"}
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 bg-green-500 text-white text-center py-2 rounded-lg text-sm font-medium"
        >
          {t("contact_whatsapp")}
        </a>
      </div>
    </div>
  );
}

function ShowcaseBanner({ t }: { t: (k: string) => string }) {
  return (
    <div className="col-span-full py-8">
      <section className="max-w-7xl mx-auto px-6 py-10 rounded-2xl border border-white/10 parallax-section-bg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white">{t("banner_title")}</h3>
            <p className="text-slate-400 mt-1">{t("banner_price")}</p>
          </div>
          <Link
            href="/ilan-ver"
            className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium text-sm transition"
          >
            {t("post_ad_now")}
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function HomeShowcase() {
  const { t } = useI18n();
  const { effectiveCity } = useHomeLocation();
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    products
      .list({ status: "APPROVED", limit: 8, city: effectiveCity || undefined })
      .then(({ data }) => setList(data))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [effectiveCity]);

  const firstFour = list.slice(0, 4);
  const nextFour = list.slice(4, 8);

  return (
    <section className="pt-24 pb-12 md:pb-16 text-white parallax-section-bg" aria-label="İlan vitrini">
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <p className="text-slate-400 text-center py-12">{t("loading")}</p>
        ) : list.length === 0 ? (
          <p className="text-slate-400 text-center py-12">
            Henuz ilan yok. <Link href="/ilan-ver" className="text-emerald-400 hover:underline">Ilan verin</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {firstFour.map((product) => (
              <ListingCard key={product.id} product={product} t={t} />
            ))}
            <ShowcaseBanner t={t} />
            {nextFour.map((product) => (
              <ListingCard key={product.id} product={product} t={t} />
            ))}
            <ShowcaseBanner t={t} />
          </div>
        )}
      </div>
    </section>
  );
}
