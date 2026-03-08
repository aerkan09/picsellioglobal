"use client";

import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function ContentPage({ title, children }: Props) {
  return (
    <main className="min-h-screen text-white parallax-content-bg">
      <Header />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-14">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        <div className="prose prose-invert prose-slate max-w-none text-slate-300 space-y-4">
          {children}
        </div>
        <p className="mt-10">
          <Link href="/" className="text-[var(--accent-green)] hover:underline">
            ← Ana sayfaya dön
          </Link>
        </p>
      </article>
      <Footer />
    </main>
  );
}
