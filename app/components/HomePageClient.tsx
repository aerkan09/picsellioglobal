"use client";

import Header from "@/components/Header";
import HomeShowcase from "@/app/components/HomeShowcase";
import Footer from "@/components/Footer";
import { HomeLocationProvider } from "@/app/contexts/HomeLocationContext";

export default function HomePageClient() {
  return (
    <HomeLocationProvider>
      <main className="min-h-screen text-white parallax-content-bg">
        <Header />
        <HomeShowcase />
        <Footer />
      </main>
    </HomeLocationProvider>
  );
}
