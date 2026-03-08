"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { admin } from "../../lib/api";

export default function AdminDashboardPage() {
  const [usersCount, setUsersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [paymentsCount, setPaymentsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      admin.users().then((u) => u.length),
      admin.products().then((p) => p.length),
      admin.payments().then((p) => p.length),
      admin.products({ status: "PENDING" }).then((p) => p.length),
      admin.products({ status: "REJECTED" }).then((p) => p.length),
      admin.services().then((s) => s.length),
    ])
      .then(([u, p, pay, pend, rej, svc]) => {
        setUsersCount(u);
        setProductsCount(p);
        setPaymentsCount(pay);
        setPendingCount(pend);
        setRejectedCount(rej);
        setServicesCount(svc);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-1 text-slate-400">İlanlar, kullanıcılar, ustalar, ödemeler ve AI raporlarını yönetin.</p>
      {error && <p className="mt-4 text-red-400">{error}</p>}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-400">İlanlar</p>
          <p className="mt-2 text-3xl font-bold">{productsCount}</p>
          <Link href="/admin/products" className="mt-2 inline-block text-sm text-green-400 hover:underline">Yönet</Link>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-400">Kullanıcılar</p>
          <p className="mt-2 text-3xl font-bold">{usersCount}</p>
          <Link href="/admin/users" className="mt-2 inline-block text-sm text-green-400 hover:underline">Yönet</Link>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-400">Ustalar</p>
          <p className="mt-2 text-3xl font-bold">{servicesCount}</p>
          <Link href="/admin/services" className="mt-2 inline-block text-sm text-green-400 hover:underline">Yönet / Onayla</Link>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-400">Ödemeler</p>
          <p className="mt-2 text-3xl font-bold">{paymentsCount}</p>
          <Link href="/admin/payments" className="mt-2 inline-block text-sm text-green-400 hover:underline">Görüntüle</Link>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-400">AI Raporları</p>
          <p className="mt-2 text-sm text-slate-300">Doğrulama ve raporlar</p>
          <Link href="/admin/ai-raporlari" className="mt-2 inline-block text-sm text-green-400 hover:underline">Görüntüle</Link>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-400">Spam / Reddedilen ilanlar</p>
          <p className="mt-2 text-3xl font-bold">{rejectedCount}</p>
          <Link href="/admin/products?status=REJECTED" className="mt-2 inline-block text-sm text-amber-400 hover:underline">Görüntüle</Link>
        </div>
      </div>
    </>
  );
}
