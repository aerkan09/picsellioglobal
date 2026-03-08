"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { services, serviceReviews, type ServiceListing, type ServiceReview } from "../../../lib/api";
import Header from "../../../components/Header";
import ServiceReviewList from "../../../components/ServiceReviewList";
import ServiceReviewForm from "../../../components/ServiceReviewForm";

function useIsLoggedIn() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    setOk(typeof window !== "undefined" && !!localStorage.getItem("picsellio_token"));
  }, []);
  return ok;
}

export default function UstaDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [service, setService] = useState<ServiceListing | null>(null);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    if (!id) return;
    services
      .get(id)
      .then(setService)
      .catch(() => setError("Usta bulunamadı."))
      .finally(() => setLoading(false));
  }, [id]);

  const loadReviews = () => {
    if (!id) return;
    serviceReviews.list(id).then((res) => setReviews(res.data)).catch(() => setReviews([]));
  };

  useEffect(() => {
    if (!id || !service) return;
    loadReviews();
  }, [id, service?.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Header />
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-14 flex justify-center items-center min-h-[40vh]">
          <p className="text-slate-400">Yükleniyor…</p>
        </div>
      </main>
    );
  }

  if (error || !service) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Header />
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-14">
          <p className="text-red-400">{error || "Usta bulunamadı."}</p>
          <Link href="/ustalar" className="mt-4 inline-block text-green-400 hover:underline">
            ← Ustalar listesine dön
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-14">
        <Link href="/ustalar" className="text-slate-400 hover:text-white text-sm mb-6 inline-block">
          ← Ustalar
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="overflow-hidden rounded-xl">
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-80 object-cover transition duration-300 hover:scale-105"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{service.name}</h1>
            <p className="text-green-400 font-medium mt-1">{service.category}</p>
            {(service.averageRating != null && service.averageRating > 0) && (
              <p className="mt-2 text-slate-300">
                ⭐⭐⭐⭐⭐ {service.averageRating.toFixed(1)}
                {service.totalReviews != null && (
                  <span className="text-slate-400 ml-2">({service.totalReviews} yorum)</span>
                )}
              </p>
            )}
            <p className="text-slate-400 mt-2">
              {service.city} / {service.district}
            </p>
            {service.address && (
              <p className="text-slate-400 mt-1">Adres: {service.address}</p>
            )}
            {service.description && (
              <p className="mt-4 text-slate-300 leading-relaxed">{service.description}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href={`tel:${service.phone}`}
                className="bg-gray-800 text-white px-4 py-3 rounded-xl hover:bg-gray-700 transition"
              >
                Ara
              </a>
              <a
                href={`https://wa.me/${service.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <section className="mt-12 pt-8 border-t border-slate-700">
          <h2 className="text-xl font-bold mb-4">Yorumlar</h2>
          <ServiceReviewList
            reviews={reviews}
            averageRating={service.averageRating ?? 0}
            totalReviews={service.totalReviews ?? 0}
          />
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Yorum yaz</h3>
            <ServiceReviewForm serviceId={id} onSuccess={loadReviews} isLoggedIn={isLoggedIn} />
          </div>
        </section>
      </div>
    </main>
  );
}
