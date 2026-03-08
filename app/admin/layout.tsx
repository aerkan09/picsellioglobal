"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "../../lib/api";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Listings" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/ai-raporlari", label: "AI System" },
  { href: "/admin/products?status=PENDING", label: "Moderation" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/ayarlar", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("picsellio_token") : null;
    if (!token) {
      router.push("/login");
      return;
    }
    auth
      .me(token)
      .then((u) => {
        if (u.role !== "ADMIN") router.push("/dashboard");
        else setUser(u);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <span className="text-slate-400">Yükleniyor…</span>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href.startsWith("/admin/products")) return pathname?.startsWith("/admin/products") ?? false;
    if (href.startsWith("/admin/services")) return pathname?.startsWith("/admin/services") ?? false;
    return pathname === href;
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 flex h-full w-56 flex-col border-r border-slate-700/80 bg-slate-800/95">
        <div className="flex h-14 items-center border-b border-slate-700/80 px-5">
          <span className="font-semibold tracking-tight text-amber-400">Picsellio Admin</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive(href)
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-slate-400 hover:bg-slate-700/60 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-700/80 p-3">
          <Link
            href="/dashboard"
            className="block rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-700/60 hover:text-white"
          >
            ← Public site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 pl-56">
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
