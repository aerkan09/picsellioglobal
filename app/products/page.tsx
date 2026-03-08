"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/urunler");
  }, [router]);
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <p className="text-slate-400">Yönlendiriliyor…</p>
    </div>
  );
}
