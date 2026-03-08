import type { Metadata } from "next";
import { getCategoriesForSeo } from "@/lib/seo-data";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "https://picsellio.com";

type Props = { params: Promise<{ category: string; city: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, city } = await params;
  const decodedCity = decodeURIComponent(city);
  const categories = getCategoriesForSeo();
  const cat = categories.find((c) => c.slug === category);
  const title = cat
    ? `${cat.name} ${decodedCity} | Picsellio`
    : `${decodedCity} | Picsellio`;
  const description = cat
    ? `${decodedCity} ilinde ${cat.name} kategorisindeki ilanlar. Picsellio güvenilir ilan platformu.`
    : `${decodedCity} ilindeki ilanlar.`;
  const canonical = `${BASE_URL}/kategori/${category}/${encodeURIComponent(decodedCity)}`;
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
