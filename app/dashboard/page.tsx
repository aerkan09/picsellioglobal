"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api, auth, products, services as servicesApi, stripe, shopier, whatsappUrl, ai } from "../../lib/api";
import type { User, Product as ProductType, ServiceListing as ServiceListingType } from "../../lib/api";
import LocationSelect, { type TurkeyLocation } from "../components/LocationSelect";
import CategorySelect from "../components/CategorySelect";
import CategorySearchInput from "../components/CategorySearchInput";
import { useI18n } from "../contexts/I18nContext";
import { formatPrice } from "../../lib/formatPrice";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [myProducts, setMyProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "", imageUrl: "", sellerPhone: "", city: "", district: "", category: "", categorySlug: "" });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [publishLoading, setPublishLoading] = useState<string | null>(null);
  const [listingPlans, setListingPlans] = useState<{ id: string; slug: string; name: string; days: number; priceCents: number }[]>([]);
  const [aiEnhanceLoading, setAiEnhanceLoading] = useState(false);
  const [imageWebWarning, setImageWebWarning] = useState<string | null>(null);
  const [imageVerifyLoading, setImageVerifyLoading] = useState(false);

  const [serviceCreateOpen, setServiceCreateOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: "", category: "", categorySlug: "", phone: "", whatsapp: "", city: "", district: "", address: "", description: "", image: "",
  });
  const [myServices, setMyServices] = useState<ServiceListingType[]>([]);
  const [serviceSubmitLoading, setServiceSubmitLoading] = useState(false);
  const [planInfo, setPlanInfo] = useState<{ plan: string | null; plan_expire: string | null }>({ plan: null, plan_expire: null });

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("picsellio_token") : null;
    if (!token) {
      router.push("/login");
      return;
    }
    (async () => {
      try {
        const u = await auth.me(token);
        setUser(u);
        const { data } = await products.list({ status: "PENDING", userId: u.id });
        const { data: all } = await products.list({ userId: u.id });
        setMyProducts(all);
        try {
          const { data: svc } = await servicesApi.list({ my: 1 });
          setMyServices(svc);
        } catch {
          setMyServices([]);
        }
        try {
          const plan = await auth.plan();
          setPlanInfo({ plan: plan.plan, plan_expire: plan.plan_expire });
        } catch {
          setPlanInfo({ plan: null, plan_expire: null });
        }
        try {
          const plans = await api<{ id: string; slug: string; name: string; days: number; priceCents: number }[]>("/api/plans");
          setListingPlans(Array.isArray(plans) ? plans : []);
        } catch {
          setListingPlans([]);
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const price = Math.round(parseFloat(form.price) * 100);
      await products.create({
        title: form.title,
        description: form.description || undefined,
        price: isNaN(price) ? 0 : price,
        imageUrl: form.imageUrl,
        sellerPhone: form.sellerPhone || undefined,
        city: form.city || undefined,
        district: form.district || undefined,
        category: form.category || undefined,
        categorySlug: form.categorySlug || undefined,
      });
      setForm({ title: "", description: "", price: "", imageUrl: "", sellerPhone: "", city: "", district: "", category: "", categorySlug: "" });
      setImageWebWarning(null);
      setCreateOpen(false);
      const { data } = await products.list({ userId: user!.id });
      setMyProducts(data);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCheckout = async (productId: string) => {
    if (!user) return;
    setCheckoutLoading(productId);
    try {
      const { url } = await stripe.checkoutSession({
        userId: user.id,
        productId,
        successUrl: `${window.location.origin}/dashboard?success=1`,
        cancelUrl: `${window.location.origin}/dashboard`,
      });
      if (url) window.location.href = url;
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setCheckoutLoading(null);
    }
  };

  /** Redirect to Shopier to pay for publishing this draft listing. After success, listing becomes active. */
  const handlePublishListing = async (productId: string) => {
    if (!user) return;
    const planSlug = listingPlans[0]?.slug || "10_DAY";
    setPublishLoading(productId);
    try {
      const res = await shopier.checkout({
        planSlug,
        productId,
        successUrl: `${window.location.origin}/dashboard?payment=success`,
        cancelUrl: `${window.location.origin}/dashboard`,
      });
      if (res?.url && res?.formData) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = res.url;
        Object.entries(res.formData).forEach(([k, v]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = k;
          input.value = v;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setPublishLoading(null);
    }
  };

  const handleAiEnhance = async () => {
    const rawText = [form.title, form.description].filter(Boolean).join("\n");
    if (!rawText.trim()) {
      alert("Önce başlık veya açıklama yazın.");
      return;
    }
    setAiEnhanceLoading(true);
    try {
      const res = await ai.enhanceText(rawText);
      const desc = res.optimizedText || form.description;
      const tagStr = res.hashtags?.length ? "\n\n" + res.hashtags.join(" ") : "";
      setForm((f) => ({
        ...f,
        title: res.title || f.title,
        description: desc + tagStr,
      }));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setAiEnhanceLoading(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceSubmitLoading(true);
    try {
      await servicesApi.create({
        name: serviceForm.name,
        category: serviceForm.category,
        phone: serviceForm.phone,
        whatsapp: serviceForm.whatsapp,
        city: serviceForm.city,
        district: serviceForm.district,
        address: serviceForm.address || undefined,
        description: serviceForm.description || undefined,
        image: serviceForm.image,
      });
      setServiceForm({ name: "", category: "", categorySlug: "", phone: "", whatsapp: "", city: "", district: "", address: "", description: "", image: "" });
      setServiceCreateOpen(false);
      const { data } = await servicesApi.list({ my: 1 });
      setMyServices(data);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setServiceSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("picsellio_token");
    router.push("/");
    router.refresh();
  };

  if (loading) return <div className="min-h-screen bg-[var(--bg-dark-blue)] flex items-center justify-center text-white">Yükleniyor…</div>;

  return (
    <div className="min-h-screen bg-[var(--bg-dark-blue)] text-white">
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold text-white">Picsellio</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user?.email}</span>
            <Link href="/products" className="text-sm text-slate-400 hover:text-white">Ürünler</Link>
            {user?.role === "ADMIN" && <Link href="/admin" className="text-sm text-amber-400 hover:text-amber-300">Admin</Link>}
            <button type="button" onClick={handleLogout} className="text-sm text-slate-400 hover:text-white">Çıkış</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-slate-400">Ürünlerinizi yönetin, ödeme alın.</p>

        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <p className="text-sm text-slate-400">{t("active_plan")}: <span className="text-white font-medium">{planInfo.plan ?? "—"}</span></p>
          <p className="mt-1 text-sm text-slate-400">{t("plan_expire")}: <span className="text-white font-medium">{planInfo.plan_expire ?? "—"}</span></p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-[var(--accent-green)] px-4 py-2 font-medium text-[var(--bg-dark-blue)] hover:bg-[var(--accent-green-hover)]"
          >
            + Yeni ürün ekle
          </button>
          <Link href="/products" className="rounded-lg border border-slate-600 px-4 py-2 text-slate-300 hover:bg-slate-800">
            Tüm ürünlere git
          </Link>
          <button
            type="button"
            onClick={() => setServiceCreateOpen(true)}
            className="rounded-lg border border-slate-600 px-4 py-2 text-slate-300 hover:bg-slate-800"
          >
            + Hizmet ilanı (Usta) ekle
          </button>
          <Link href="/ustalar" className="rounded-lg border border-slate-600 px-4 py-2 text-slate-300 hover:bg-slate-800">
            Ustalar sayfası
          </Link>
        </div>

        {serviceCreateOpen && (
          <div className="mt-8 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h2 className="text-lg font-semibold">Yeni hizmet ilanı (Usta)</h2>
            <form onSubmit={handleCreateService} className="mt-4 space-y-4">
              <input placeholder="Ad / Firma" value={serviceForm.name} onChange={(e) => setServiceForm((f) => ({ ...f, name: e.target.value }))} required className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white" />
              <CategorySearchInput
                value={serviceForm.categorySlug}
                onChange={(slug, name) => setServiceForm((f) => ({ ...f, categorySlug: slug, category: name }))}
                label="Kategori"
                required
                categoryGroup="service"
                placeholder="Kategori ara (örn. elektrikçi, klima servisi)"
              />
              <input placeholder="Telefon" value={serviceForm.phone} onChange={(e) => setServiceForm((f) => ({ ...f, phone: e.target.value }))} required className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white" />
              <input placeholder="WhatsApp (örn. 905551234567)" value={serviceForm.whatsapp} onChange={(e) => setServiceForm((f) => ({ ...f, whatsapp: e.target.value }))} required className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white" />
              <LocationSelect value={{ city: serviceForm.city, district: serviceForm.district }} onChange={({ city, district }) => setServiceForm((f) => ({ ...f, city, district }))} />
              <input placeholder="Adres (opsiyonel)" value={serviceForm.address} onChange={(e) => setServiceForm((f) => ({ ...f, address: e.target.value }))} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white" />
              <textarea placeholder="Açıklama (opsiyonel)" value={serviceForm.description} onChange={(e) => setServiceForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white" rows={2} />
              <input placeholder="Görsel URL (örn. /services/service-elektrikci.jpg)" value={serviceForm.image} onChange={(e) => setServiceForm((f) => ({ ...f, image: e.target.value }))} required className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white" />
              <div className="flex gap-2">
                <button type="submit" disabled={serviceSubmitLoading} className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50">Kaydet</button>
                <button type="button" onClick={() => setServiceCreateOpen(false)} className="rounded-lg border border-slate-600 px-4 py-2 text-slate-400">İptal</button>
              </div>
            </form>
          </div>
        )}

        {createOpen && (
          <div className="mt-8 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h2 className="text-lg font-semibold">Yeni ürün</h2>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <input
                placeholder="Başlık"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm text-slate-400">Açıklama</label>
                  <button
                    type="button"
                    onClick={handleAiEnhance}
                    disabled={aiEnhanceLoading}
                    className="text-sm rounded bg-emerald-600/80 hover:bg-emerald-600 px-2 py-1 text-white disabled:opacity-50"
                  >
                    {aiEnhanceLoading ? "İyileştiriliyor…" : "AI ile iyileştir"}
                  </button>
                </div>
                <textarea
                  placeholder="Açıklama (veya başlık + açıklama yazıp AI ile iyileştir)"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white"
                  rows={3}
                />
              </div>
              <input
                placeholder="Fiyat (TL)"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white"
              />
              <input
                placeholder="Görsel URL"
                value={form.imageUrl}
                onChange={(e) => {
                  setForm((f) => ({ ...f, imageUrl: e.target.value }));
                  setImageWebWarning(null);
                }}
                onBlur={async () => {
                  if (!form.imageUrl?.trim()) {
                    setImageWebWarning(null);
                    return;
                  }
                  setImageVerifyLoading(true);
                  setImageWebWarning(null);
                  try {
                    const res = await ai.verifyImage({ imageUrl: form.imageUrl.trim() });
                    if (res.verification?.webWarning) setImageWebWarning(res.verification.webWarning);
                  } catch {
                    setImageWebWarning(null);
                  } finally {
                    setImageVerifyLoading(false);
                  }
                }}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white"
              />
              {imageVerifyLoading && (
                <p className="text-xs text-slate-500">Görsel kontrol ediliyor...</p>
              )}
              {imageWebWarning && (
                <p className="text-amber-400 text-sm" role="alert">
                  {imageWebWarning}
                </p>
              )}
              <input
                placeholder="Telefon / WhatsApp (örn. +90 555 123 45 67)"
                value={form.sellerPhone}
                onChange={(e) => setForm((f) => ({ ...f, sellerPhone: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white"
              />
              <LocationSelect
                value={{ city: form.city, district: form.district }}
                onChange={({ city, district }) => setForm((f) => ({ ...f, city, district }))}
              />
              <CategorySearchInput
                value={form.categorySlug}
                onChange={(slug, name) => setForm((f) => ({ ...f, categorySlug: slug, category: name }))}
                label="Kategori"
                required
                categoryGroup="business"
                placeholder="Kategori ara (örn. mobilya, tostçu)"
              />
              <div className="flex gap-2">
                <button type="submit" disabled={submitLoading} className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50">Kaydet</button>
                <button type="button" onClick={() => { setCreateOpen(false); setImageWebWarning(null); }} className="rounded-lg border border-slate-600 px-4 py-2 text-slate-400">İptal</button>
              </div>
            </form>
          </div>
        )}

        <h2 className="mt-10 text-lg font-semibold">Hizmet ilanlarım (Usta)</h2>
        {myServices.length === 0 ? (
          <p className="mt-2 text-slate-400">Henüz hizmet ilanı yok. Onay sonrası Ustalar sayfasında görünür.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myServices.map((s) => (
              <div key={s.id} className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50">
                <div className="relative aspect-[4/3] bg-slate-700">
                  <Image src={s.image} alt={s.name} fill className="object-cover transition duration-300 hover:scale-105" sizes="300px" unoptimized />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{s.category} · {s.city} / {s.district}</p>
                  <p className="text-xs text-slate-500 mt-1">Durum: {s.status}</p>
                  <Link href={`/usta/${s.id}`} className="mt-2 inline-block text-sm text-green-400 hover:underline">Detay →</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="mt-10 text-lg font-semibold">Ürünlerim</h2>
        {myProducts.length === 0 ? (
          <p className="mt-2 text-slate-400">Henüz ürün yok. Yeni ilan ekleyin; ödemeyi tamamladıktan sonra vitrinde yayına girer.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myProducts.map((p) => {
              const phone = p.sellerPhone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905551234567";
              const waUrl = whatsappUrl(phone, `Merhaba, "${p.title}" ürünü hakkında bilgi almak istiyorum.`);
              return (
                <div key={p.id} className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50">
                  <div className="relative aspect-[9/16] bg-slate-700">
                    <Image src={p.imageUrl} alt={p.title} fill className="object-cover transition duration-300 hover:scale-105" sizes="300px" unoptimized />
                    {p.aiVerified && <span className="absolute right-2 top-2 rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">AI</span>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="mt-1 text-lg font-bold text-emerald-400">{formatPrice(p.price)}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {[p.city, p.district].filter(Boolean).join(" / ") || "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{p.status}{p.category ? ` · ${p.category}` : ""}</p>
                    {p.status === "DRAFT" && (
                      <button
                        type="button"
                        onClick={() => handlePublishListing(p.id)}
                        disabled={!!publishLoading}
                        className="mt-3 w-full rounded-lg bg-amber-600 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                      >
                        {publishLoading === p.id ? "Yönlendiriliyor…" : "Öde ve yayınla"}
                      </button>
                    )}
                    {p.status === "PENDING" && (
                      <p className="mt-3 text-center text-sm text-amber-400">Onay bekliyor</p>
                    )}
                    {p.status === "APPROVED" && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-green)] py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-green-hover)]"
                      >
                        {t("contact_whatsapp")}
                      </a>
                    )}
                    {p.status === "APPROVED" && (
                      <button
                        type="button"
                        onClick={() => handleCheckout(p.id)}
                        disabled={!!checkoutLoading}
                        className="mt-2 w-full rounded-lg bg-green-600 py-1.5 text-sm text-white disabled:opacity-50"
                      >
                        {checkoutLoading === p.id ? "Yönlendiriliyor…" : "Ödeme linki al"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
