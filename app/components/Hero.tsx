"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useI18n } from "../contexts/I18nContext"
import { useHomeLocation } from "@/app/contexts/HomeLocationContext"
import LocationSelect, { type TurkeyLocation } from "./LocationSelect"

export default function Hero() {
  const { t } = useI18n()
  const router = useRouter()
  const { effectiveCity, setUserSelectedCity } = useHomeLocation()
  const [district, setDistrict] = useState("")
  const location: TurkeyLocation = { city: effectiveCity ?? "", district }

  const handleSearch = () => {
    if (location.city && location.district) {
      const city = encodeURIComponent(location.city)
      const district = encodeURIComponent(location.district)
      router.push(`/urunler?city=${encodeURIComponent(location.city)}&district=${encodeURIComponent(location.district)}`)
    } else if (location.city) {
      router.push(`/urunler?city=${encodeURIComponent(location.city)}`)
    } else {
      router.push("/urunler")
    }
  }

  return (
    <section className="pt-20 pb-14 text-white" aria-label="Picsellio Ana Sayfa">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold uppercase bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-gradient text-center">
            TİCARETİN MERKEZİ
            <br />
            PİCSELLİO
          </h1>
          <p className="mt-2 text-slate-400 text-sm md:text-base">
            Yerel emeği yapay zeka ile doğrular, dünyaya açarız.
          </p>
          <p className="mt-4 text-gray-300 text-lg">
            {t("hero_subline")}
          </p>
        </div>

        <div className="dark mt-10 rounded-2xl border border-slate-600/50 bg-slate-800/40 p-6 shadow-xl backdrop-blur-sm">
          <div className="space-y-4">
            <LocationSelect
              value={location}
              onChange={(loc) => {
                setUserSelectedCity(loc.city || null)
                setDistrict(loc.district)
              }}
              cityLabel={t("city")}
              districtLabel={t("district")}
              stacked
            />
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSearch}
                className="w-full rounded-xl bg-green-500 hover:bg-green-600 px-6 py-3.5 font-medium text-white transition-colors"
              >
                {t("hero_search_btn")}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/dashboard"
            className="text-green-400 hover:text-green-300 font-medium"
          >
            {t("create_listing")}
          </Link>
        </p>
      </div>
    </section>
  )
}
