"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/api";
import type { RegisterBody } from "../../lib/api";
import LocationSelect, { type TurkeyLocation } from "../components/LocationSelect";

type UserType = "ESNAF" | "USTA" | null;

type CategoryItem = { name: string; slug: string };

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [profession, setProfession] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<TurkeyLocation>({ city: "", district: "" });
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    fetch("/data/categories.json")
      .then((res) => (res.ok ? res.json() : []))
      .then((json: CategoryItem[]) => setCategories(Array.isArray(json) ? json : []))
      .catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!userType) return;
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı");
      return;
    }
    if (userType === "ESNAF" && !businessName?.trim()) {
      setError("İşletme adı gerekli");
      return;
    }
    if (userType === "USTA" && (!name?.trim() || !profession?.trim())) {
      setError("Ad soyad ve meslek gerekli");
      return;
    }
    if (!phone?.trim() || !location.city?.trim() || !location.district?.trim() || !category?.trim() || !address?.trim()) {
      setError("Telefon, il, ilçe, kategori ve adres alanları zorunludur");
      return;
    }
    setLoading(true);
    try {
      const body: RegisterBody = {
        email,
        password,
        userType,
        phone: phone.trim(),
        city: location.city.trim(),
        district: location.district.trim(),
        category: category.trim(),
        address: address.trim(),
      };
      if (userType === "ESNAF") body.businessName = businessName.trim();
      if (userType === "USTA") {
        body.name = name.trim();
        body.profession = profession.trim();
      }
      const { token } = await auth.register(body);
      if (typeof window !== "undefined") localStorage.setItem("picsellio_token", token);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2.5 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none";
  const labelClass = "block text-sm font-medium text-slate-300";

  if (userType === null) {
    return (
      <div className="min-h-screen bg-[var(--bg-dark-blue)] flex items-center justify-center px-6 pt-24">
        <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800/50 p-8">
          <h1 className="text-2xl font-bold text-white">Kayıt Ol</h1>
          <p className="mt-1 text-slate-400">Hesap türünü seçin.</p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setUserType("ESNAF")}
              className="rounded-xl border-2 border-slate-600 bg-slate-800/50 p-6 text-left hover:border-[var(--accent-green)] hover:bg-slate-800 transition"
            >
              <span className="text-2xl" aria-hidden>🏪</span>
              <h2 className="mt-2 text-lg font-semibold text-white">Esnaf</h2>
              <p className="mt-1 text-sm text-slate-400">İşletme / dükkan sahibi</p>
            </button>
            <button
              type="button"
              onClick={() => setUserType("USTA")}
              className="rounded-xl border-2 border-slate-600 bg-slate-800/50 p-6 text-left hover:border-[var(--accent-green)] hover:bg-slate-800 transition"
            >
              <span className="text-2xl" aria-hidden>🔧</span>
              <h2 className="mt-2 text-lg font-semibold text-white">Usta</h2>
              <p className="mt-1 text-sm text-slate-400">Hizmet veren usta</p>
            </button>
          </div>
          <p className="mt-6 text-center text-sm text-slate-400">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="text-[var(--accent-green)] hover:underline">
              Giriş yapın
            </Link>
          </p>
          <Link href="/" className="mt-4 block text-center text-sm text-slate-500 hover:text-white">
            ← Ana sayfa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark-blue)] flex items-center justify-center px-6 py-12 pt-24">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800/50 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            {userType === "ESNAF" ? "Esnaf" : "Usta"} Kayıt
          </h1>
          <button
            type="button"
            onClick={() => setUserType(null)}
            className="text-sm text-slate-400 hover:text-white"
          >
            Değiştir
          </button>
        </div>
        <p className="mt-1 text-slate-400">
          {userType === "ESNAF"
            ? "İşletme bilgilerinizi girin."
            : "Ad, meslek ve iletişim bilgilerinizi girin."}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {userType === "ESNAF" && (
            <div>
              <label className={labelClass}>İşletme adı *</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className={inputClass}
                placeholder="İşletme adı"
              />
            </div>
          )}
          {userType === "USTA" && (
            <>
              <div>
                <label className={labelClass}>Ad soyad *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Adınız soyadınız"
                />
              </div>
              <div>
                <label className={labelClass}>Meslek *</label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Örn. Elektrikçi, Tesisatçı"
                />
              </div>
            </>
          )}
          <div>
            <label className={labelClass}>Telefon *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className={inputClass}
              placeholder="05XX XXX XX XX"
            />
          </div>
          <LocationSelect
            value={location}
            onChange={setLocation}
            cityLabel="İl *"
            districtLabel="İlçe *"
          />
          <div>
            <label className={labelClass}>Kategori *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Seçin</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Adres *</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={2}
              className={inputClass}
              placeholder="Açık adres"
            />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
              placeholder="ornek@email.com"
            />
          </div>
          <div>
            <label className={labelClass}>Şifre (min. 8 karakter) *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={inputClass}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent-green)] py-2.5 font-medium text-[var(--bg-dark-blue)] hover:bg-[var(--accent-green-hover)] disabled:opacity-50"
          >
            {loading ? "Kayıt yapılıyor…" : "Kayıt Ol"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="text-[var(--accent-green)] hover:underline">
            Giriş yapın
          </Link>
        </p>
        <Link href="/" className="mt-4 block text-center text-sm text-slate-500 hover:text-white">
          ← Ana sayfa
        </Link>
      </div>
    </div>
  );
}
