import type { MetadataRoute } from "next";
import { getCategoriesForSeo, getCitiesForSeo, getLocationsWithDistrictsForSeo } from "@/lib/seo-data";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "https://picsellio.com";

function url(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL.replace(/\/$/, "")}${p}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const categories = getCategoriesForSeo();
  const cities = getCitiesForSeo();
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: url(""), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: url("/kategoriler"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/sehirler"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/urunler"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: url("/products"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: url("/ustalar"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: url("/ilan-ver"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: url(`/kategori/${c.slug}`),
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const categoryCityPages: MetadataRoute.Sitemap = [];
  for (const cat of categories) {
    for (const { city } of cities) {
      categoryCityPages.push({
        url: url(`/${cat.slug}/${encodeURIComponent(city)}`),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.7,
      });
    }
  }

  const locationsWithDistricts = getLocationsWithDistrictsForSeo();
  const categoryCityDistrictPages: MetadataRoute.Sitemap = [];
  for (const cat of categories) {
    for (const { city, districts } of locationsWithDistricts) {
      for (const district of districts) {
        categoryCityDistrictPages.push({
          url: url(`/${cat.slug}/${encodeURIComponent(city)}/${encodeURIComponent(district)}`),
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.6,
        });
      }
    }
  }

  return [...staticPages, ...categoryPages, ...categoryCityPages, ...categoryCityDistrictPages];
}
