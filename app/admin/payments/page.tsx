"use client";

import { useState, useEffect } from "react";
import { admin } from "../../lib/api";

export default function AdminPaymentsPage() {
  const [list, setList] = useState<{ id: string; amount: number; status: string; createdAt?: string; user?: { email: string }; product?: { title: string } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    admin.payments().then((p) => setList(Array.isArray(p) ? p : [])).catch((e) => { setError((e as Error).message); setList([]); }).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold">Ödemeler</h1>
      <p className="mt-1 text-slate-400">Tüm ödeme kayıtları.</p>
      {error && <p className="mt-4 text-red-400">{error}</p>}
      {loading ? <p className="mt-8 text-slate-400">Yükleniyor…</p> : list.length === 0 ? <p className="mt-8 text-slate-400">Ödeme kaydı yok.</p> : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="pb-3 pr-4">Tarih</th>
                <th className="pb-3 pr-4">Kullanıcı</th>
                <th className="pb-3 pr-4">Ürün</th>
                <th className="pb-3 pr-4">Tutar</th>
                <th className="pb-3">Durum</th>
              </tr>
            </thead>
            <tbody>
              {list.map((pay) => (
                <tr key={pay.id} className="border-b border-slate-700/50">
                  <td className="py-3 pr-4 text-slate-300">{pay.createdAt ? new Date(pay.createdAt).toLocaleDateString("tr-TR") : "—"}</td>
                  <td className="py-3 pr-4 text-slate-300">{pay.user?.email ?? "—"}</td>
                  <td className="py-3 pr-4 text-slate-300">{pay.product?.title ?? "—"}</td>
                  <td className="py-3 pr-4 font-medium">{pay.amount} ₺</td>
                  <td className="py-3"><span className={pay.status === "COMPLETED" ? "text-green-400" : "text-amber-400"}>{pay.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
