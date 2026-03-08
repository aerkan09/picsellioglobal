"use client";

import Link from "next/link";
import type { ServiceListing } from "../../lib/api";

const SERVICE_IMAGES: Record<string, string> = {
  Elektrikçi: "/services/service-elektrikci.jpg",
  "Klima Servisi": "/services/service-klima.jpg",
  Bilgisayar: "/services/service-bilgisayar.jpg",
  Tesisatçı: "/services/service-tesisatci.jpg",
  "Beyaz Eşya": "/services/service-beyazesya.jpg",
  "Oto Servisi": "/services/service-oto.jpg",
  Mobilya: "/services/service-mobilya.jpg",
  Boyacı: "/services/service-boyaci.jpg",
};

const DEFAULT_SERVICE_IMAGE = "/services/service-elektrikci.jpg";

function getDefaultImageForCategory(category: string | null): string {
  if (!category?.trim()) return DEFAULT_SERVICE_IMAGE;
  return SERVICE_IMAGES[category.trim()] ?? DEFAULT_SERVICE_IMAGE;
}

export default function ServiceCard({ service }: { service: ServiceListing }) {
  const imageSrc =
    service.image?.trim() || getDefaultImageForCategory(service.category);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4">
      <div className="overflow-hidden rounded-lg">
        <img
          src={imageSrc}
          alt={service.name}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <h3 className="text-lg font-semibold mt-3">
        {service.name}
      </h3>
      <p className="text-sm text-gray-500">
        {service.category}
      </p>
      <p className="text-sm text-gray-400">
        {service.city} / {service.district}
      </p>
      <div className="flex gap-2 mt-3">
        <a
          href={"tel:" + service.phone}
          className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm"
        >
          Ara
        </a>
        <a
          href={"https://wa.me/" + service.whatsapp.replace(/\D/g, "")}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm"
        >
          WhatsApp
        </a>
      </div>
      <Link
        href={`/usta/${service.id}`}
        className="mt-2 inline-block text-sm text-green-600 hover:underline"
      >
        Detay →
      </Link>
    </div>
  );
}
