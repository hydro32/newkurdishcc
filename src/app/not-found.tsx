import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black p-6 text-center text-white">
      <p className="text-6xl">🧭</p>
      <h1 className="text-3xl font-bold">لاپەڕەکە نەدۆزرایەوە</h1>
      <p className="max-w-md text-zinc-400">
        ئەم لاپەڕەیە بوونی نییە یان گواسترایەوە. وەرە بگەڕێینەوە بۆ سەرەکی.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-brand px-6 py-3 font-bold text-black transition hover:bg-brand-hover"
      >
        گەڕانەوە بۆ سەرەکی
      </Link>
    </main>
  );
}
