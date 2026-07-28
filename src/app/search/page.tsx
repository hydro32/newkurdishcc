"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import VideoGrid from "@/components/video/VideoGrid";
import { videos } from "@/data/videos";
import { Search } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);

const results = useMemo(() => {
  const q = query.trim().toLowerCase();

  if (!q) return [];

  return videos.filter(
    (v) =>
      v.title.toLowerCase().includes(q) ||
      v.creator.toLowerCase().includes(q),
  );
}, [query]);

  return (
    <>
      <div className="relative mb-6 max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="گەڕان بۆ ڤیدیۆ، پۆل یان دروستکەر..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-3 pr-10 pl-4 outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
        />
        <Search size={18} className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400" />
      </div>

      {query.trim() ? (
        <>
          <p className="mb-4 text-zinc-400">
            {results.length} ئەنجام بۆ &quot;{query}&quot;
          </p>
          <VideoGrid
            videos={results}
            emptyMessage="هیچ ئەنجامێک نەدۆزرایەوە. تکایە وشەیەکی تر تاقی بکەوە."
          />
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-800 p-10 text-center text-zinc-400">
          دەست بکە بە نووسینی ناوی ڤیدیۆ، دروستکەر یان پۆل بۆ گەڕان.
        </p>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-bold">🔎 گەڕان</h1>
      <Suspense fallback={null}>
        <SearchContent />
      </Suspense>
    </AppShell>
  );
}
