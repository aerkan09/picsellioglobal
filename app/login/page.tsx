"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await auth.login(email, password);
      if (typeof window !== "undefined") localStorage.setItem("picsellio_token", token);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-dark-blue)] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800/50 p-8">
        <h1 className="text-2xl font-bold text-white">Giriş Yap</h1>
        <p className="mt-1 text-slate-400">Picsellio hesabınızla giriş yapın.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2.5 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none"
              placeholder="ornek@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2.5 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent-green)] py-2.5 font-medium text-[var(--bg-dark-blue)] hover:bg-[var(--accent-green-hover)] disabled:opacity-50"
          >
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          Hesabınız yok mu? <Link href="/register" className="text-[var(--accent-green)] hover:underline">Kayıt olun</Link>
        </p>
        <Link href="/" className="mt-4 block text-center text-sm text-slate-500 hover:text-white">← Ana sayfa</Link>
      </div>
    </div>
  );
}
