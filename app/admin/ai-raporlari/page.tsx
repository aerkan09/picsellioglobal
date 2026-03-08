"use client";

import { useState, useEffect } from "react";
import { admin } from "../../../lib/api";

type VerificationItem = {
  id: string;
  status?: string;
  createdAt?: string;
  image?: { id: string; url?: string } | null;
};

export default function AdminAiRaporlariPage() {
  const [list, setList] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    admin
      .verifications()
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => {
        setList([]);
        setError("Raporlar yüklenemedi.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold">AI Raporları</h1>
      <p className="mt-1 text-slate-400">Görsel doğrulama ve AI inceleme raporları.</p>
      {error && <p className="mt-4 text-red-400">{error}</p>}
      {loading ? (
        <p className="mt-8 text-slate-400">Yükleniyor…</p>
      ) : list.length === 0 ? (
        <p className="mt-8 text-slate-400">Henüz rapor yok. AI doğrulama sonuçları burada listelenecek.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {list.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-sm text-slate-400">
                {item.createdAt ? new Date(item.createdAt).toLocaleString("tr-TR") : item.id}
              </p>
              <p className="mt-1 text-slate-300">Durum: {item.status ?? "—"}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
