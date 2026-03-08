"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../contexts/I18nContext";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="text-white py-14 border-t border-white/5 parallax-section-bg">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 px-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Picsellio</h3>
          <ul className="mt-5 space-y-2.5 text-sm text-slate-400">
            <li>
              <Link href="#urunler" className="hover:text-white transition">{t("products")}</Link>
            </li>
            <li>
              <Link href="#ai-verified" className="hover:text-white transition">{t("ai_verified")}</Link>
            </li>
            <li>
              <Link href="#ilan-ver" className="hover:text-white transition">{t("post_ad")}</Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-white transition">{t("login")}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold tracking-tight">Yasal & Bilgi</h3>
          <ul className="mt-5 space-y-2.5 text-sm text-slate-400">
            <li><Link href="/hakkimizda" className="hover:text-white transition">Hakkımızda</Link></li>
            <li><Link href="/kullanim-sartlari" className="hover:text-white transition">Kullanım Şartları</Link></li>
            <li><Link href="/gizlilik-politikasi" className="hover:text-white transition">Gizlilik Politikası</Link></li>
            <li><Link href="/kvkk" className="hover:text-white transition">KVKK Aydınlatma Metni</Link></li>
            <li><Link href="/cerez-politikasi" className="hover:text-white transition">Çerez Politikası</Link></li>
            <li><Link href="/ilan-kurallari" className="hover:text-white transition">İlan Yayınlama Kuralları</Link></li>
            <li><Link href="/sorumluluk-reddi" className="hover:text-white transition">Sorumluluk Reddi</Link></li>
            <li><Link href="/iletisim" className="hover:text-white transition">İletişim</Link></li>
          </ul>
        </div>

        <div className="relative w-full min-h-[200px] md:col-span-2">
          <Image
            src="/map.png"
            alt={t("footer_map_alt")}
            fill
            className="object-cover rounded-xl ring-1 ring-white/5"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>

      <p className="text-center text-slate-500 text-sm mt-12">
        {t("footer_copyright")}
      </p>
    </footer>
  );
}
