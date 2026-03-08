"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { admin } from "../../../lib/api";
import type { ServiceListing } from "../../../lib/api";

export default function AdminServicesPage() {
  const [list, setList] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actioning, setActioning] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    admin
      .services(statusFilter ? { status: statusFilter } : undefined)
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    setActioning(id);
    try {
      await admin.approveService(id);
      setList((prev) => prev.map((s) => (s.id === id ? { ...s, status: "APPROVED" } : s)));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setActioning(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu hizmet ilanını silmek istediğinize emin misiniz?")) return;
    setActioning(id);
    try {
      await admin.deleteService(id);
      setList((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setActioning(null);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Hizmet ilanları (Ustalar)</h1>
      <p className="mt-1 text-slate-400">Hizmet ilanlarını görüntüleyin, onaylayın veya silin.</p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("")}
          className={`rounded-lg px-3 py-1.5 text-sm ${!statusFilter ? "bg-slate-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}
        >
          Tümü
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("PENDING")}
          className={`rounded-lg px-3 py-1.5 text-sm ${statusFilter === "PENDING" ? "bg-amber-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}
        >
          Bekleyen
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("APPROVED")}
          className={`rounded-lg px-3 py-1.5 text-sm ${statusFilter === "APPROVED" ? "bg-green-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}
        >
          Onaylı
        </button>
      </div>
      {loading ? (
        <p className="mt-8 text-slate-400">Yükleniyor…</p>
      ) : list.length === 0 ? (
        <p className="mt-8 text-slate-400">Hizmet ilanı yok.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {list.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-700">
                <Image src={s.image} alt={s.name} fill className="object-cover" sizes="96px" unoptimized />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-sm text-slate-400">{s.category} · {s.city} / {s.district} · {s.status}</p>
              </div>
              {s.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => handleApprove(s.id)}
                  disabled={!!actioning}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                >
                  Onayla
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                disabled={!!actioning}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                Sil
              </button>
              <Link href={`/usta/${s.id}`} className="text-sm text-green-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Detay
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
