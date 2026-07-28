"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import VideoGrid from "@/components/video/VideoGrid";
import { videos } from "@/data/videos";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

const TABS = [
  { id: "uploads", label: "ڤیدیۆکانم" },
  { id: "favorites", label: "دڵخوازەکان" },
  { id: "history", label: "مێژوو" },
] as const;

function ProfileContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "uploads";
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(
    (TABS.find((t) => t.id === initialTab)?.id as (typeof TABS)[number]["id"]) ??
      "uploads",
  );

  const shown =
    tab === "uploads" ? videos.slice(0, 4) : tab === "favorites" ? videos.slice(4, 8) : videos.slice(8, 12);

  return (
    <>
      <div className="mb-8 flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://i.pravatar.cc/150?u=current-user"
            alt="وێنەی من"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">بەکارهێنەری کوردیش تیوب</h1>
          <p className="text-zinc-400">٣٤٢ بەشداربوو • ١٢ ڤیدیۆ</p>
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "border-b-2 px-4 py-3 font-medium transition",
              tab === t.id
                ? "border-brand text-brand"
                : "border-transparent text-zinc-400 hover:text-white",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <VideoGrid videos={shown} emptyMessage="هیچ شتێک لێرە نییە." />
    </>
  );
}

export default function ProfilePage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <ProfileContent />
      </Suspense>
    </AppShell>
  );
}