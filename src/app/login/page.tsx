"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("ئیمەیڵ یان وشەی نهێنی هەڵەیە!");
      setLoading(false);
    } else {
      // Login successful! Redirect to home page
      router.push("/");
      router.refresh();
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <Link href="/" className="mb-6 block text-center text-2xl font-extrabold text-brand">
          کوردیش<span className="text-white">تیوب</span>
        </Link>

        <h1 className="mb-6 text-center text-3xl font-bold">چوونە ژوورەوە</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            required
            placeholder="ئیمەیڵ"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-800 p-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
          />

          <input
            type="password"
            required
            placeholder="وشەی نهێنی"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-800 p-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand p-3 font-bold text-black transition hover:bg-brand-hover disabled:opacity-50"
          >
            {loading ? "چاوەڕوانبە..." : "چوونە ژوورەوە"}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-400">هێشتا هەژمارت نییە؟</p>

        <Link href="/register">
          <button className="mt-3 w-full rounded-lg border border-zinc-700 p-3 transition hover:bg-zinc-800">
            خۆ تۆمارکردن
          </button>
        </Link>
      </div>
    </main>
  );
}