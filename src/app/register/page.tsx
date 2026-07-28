"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: username,
        },
      },
    });

    if (error) {
      setError(error.message || "خەتایەک ڕوویدا لە کاتی خۆتۆمارکردن!");
      setLoading(false);
    } else {
      setSuccess("هەژمارەکەت بە سەرکەوتوویی دروستکرا! ئێستا دەتوانیت بچیتە ژوورەوە.");
      setLoading(false);
      // Optional: send them to login page after a few seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <Link href="/" className="mb-6 block text-center text-2xl font-extrabold text-brand">
          کوردیش<span className="text-white">تیوب</span>
        </Link>

        <h1 className="mb-6 text-center text-3xl font-bold">خۆ تۆمارکردن</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-500/10 p-3 text-center text-sm text-green-500 border border-green-500/20">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            required
            placeholder="ناوی بەکارهێنەر"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-800 p-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
          />

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
            {loading ? "تۆمارکردن..." : "خۆ تۆمارکردن"}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-400">
          هەژمارت هەیە؟{" "}
          <Link href="/login" className="text-brand hover:underline">
            چوونە ژوورەوە
          </Link>
        </p>
      </div>
    </main>
  );
}