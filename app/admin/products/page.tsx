"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { admin } from "../../lib/api";
import type { Product } from "../../lib/api";

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "";
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    admin
      .products(statusFilter ? { status: statusFilter } : undefined)
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const handleModerate = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActioning(id);
    try {
      await admin.moderateProduct(id, status);
      setList((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setActioning(null);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Ürün moderasyonu</h1>
      <p className="mt-1 text-slate-400">Ürünleri onaylayın veya reddedin.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href="/admin/products" className={`rounded-lg px-3 py-1.5 text-sm ${!statusFilter ? "bg-slate-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}>Tümü</a>
        <a href="/admin/products?status=PENDING" className={`rounded-lg px-3 py-1.5 text-sm ${statusFilter === "PENDING" ? "bg-amber-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}>Bekleyen</a>
        <a href="/admin/products?status=APPROVED" className={`rounded-lg px-3 py-1.5 text-sm ${statusFilter === "APPROVED" ? "bg-green-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}>Onaylı</a>
        <a href="/admin/products?status=REJECTED" className={`rounded-lg px-3 py-1.5 text-sm ${statusFilter === "REJECTED" ? "bg-red-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}>Reddedilen / Spam</a>
      </div>
      {loading ? (
        <p className="mt-8 text-slate-400">Yükleniyor…</p>
      ) : list.length === 0 ? (
        <p className="mt-8 text-slate-400">Ürün yok.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {list.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-700">
                <Image src={p.imageUrl} alt={p.title} fill className="object-cover" sizes="96px" unoptimized />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-slate-400">{(p.price / 100).toFixed(2)} TL · {p.status} · {p.user?.email}</p>
              </div>
              {p.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleModerate(p.id, "APPROVED")}
                    disabled={!!actioning}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModerate(p.id, "REJECTED")}
                    disabled={!!actioning}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                  >
                    Reddet
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
