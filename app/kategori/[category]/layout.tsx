import type { Metadata } from "next";
import { getCategoriesForSeo } from "@/lib/seo-data";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : null) ||
  "https://picsellio.com";

type Props = { params: Promise<{ category: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categories = getCategoriesForSeo();
  const cat = categories.find((c) => c.slug === category);
  const title = cat ? `${cat.name} İlanları | Picsellio` : "Kategori | Picsellio";
  const description = cat
    ? `${cat.name} kategorisindeki güvenilir ilanlar. Picsellio ile doğrulanmış ürün ve hizmet ilanları.`
    : "Picsellio kategori sayfası.";
  const canonical = `${BASE_URL}/kategori/${category}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default function Layout({ children }: Props) {
  return children;
}
