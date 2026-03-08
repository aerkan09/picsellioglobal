"use client";

import { useState, useEffect } from "react";
import { admin } from "../../lib/api";
import type { User } from "../../lib/api";

export default function AdminUsersPage() {
  const [list, setList] = useState<(User & { _count?: { products: number; payments: number } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin
      .users()
      .then(setList as (u: unknown) => void)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold">Kullanıcılar</h1>
      <p className="mt-1 text-slate-400">Kayıtlı kullanıcı listesi.</p>
      {loading ? (
        <p className="mt-8 text-slate-400">Yükleniyor…</p>
      ) : list.length === 0 ? (
        <p className="mt-8 text-slate-400">Kullanıcı yok.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-700 bg-slate-800/50">
              <tr>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Ad</th>
                <th className="p-4 font-medium">Rol</th>
                <th className="p-4 font-medium">Ürün</th>
                <th className="p-4 font-medium">Ödeme</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} className="border-b border-slate-700/50">
                  <td className="p-4">{u.email}</td>
                  <td className="p-4 text-slate-400">{u.name ?? "—"}</td>
                  <td className="p-4">
                    <span className={u.role === "ADMIN" ? "text-amber-400" : "text-slate-400"}>{u.role}</span>
                  </td>
                  <td className="p-4 text-slate-400">{(u as { _count?: { products: number } })._count?.products ?? 0}</td>
                  <td className="p-4 text-slate-400">{(u as { _count?: { payments: number } })._count?.payments ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
