import type { Metadata } from "next";
import { getCategoriesForSeo } from "@/lib/seo-data";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "https://picsellio.com";

type Props = {
  params: Promise<{ category: string; city: string; district: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, city, district } = await params;
  const decodedCity = decodeURIComponent(city);
  const decodedDistrict = decodeURIComponent(district);
  const categories = getCategoriesForSeo();
  const cat = categories.find((c) => c.slug === category);
  const title = cat
    ? `${cat.name} ${decodedCity} ${decodedDistrict} | Picsellio`
    : `${decodedCity} ${decodedDistrict} | Picsellio`;
  const description = cat
    ? `${decodedCity} ${decodedDistrict} bölgesinde ${cat.name} ilanları. Picsellio ile güvenilir alışveriş.`
    : `${decodedCity} ${decodedDistrict} ilanları.`;
  const canonical = `${BASE_URL}/kategori/${category}/${city}/${district}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default function Layout({ children }: Props) {
  return <>{children}</>;
}
