"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";

export default function HomePage() {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    const savedVideos = localStorage.getItem("user_uploaded_videos");
    if (savedVideos) {
      try {
        setVideos(JSON.parse(savedVideos));
      } catch (e) {
        setVideos([]);
      }
    }
  }, []);

  return (
    <AppShell>
      <div className="space-y-6" dir="rtl">
        <h1 className="text-xl sm:text-2xl font-bold text-white">ڤیدیۆە تازەکان</h1>

        {videos.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-sm">
            هیچ ڤیدیۆیەک بەردەست نییە. یەکەم کەس بە کە ڤیدیۆ بەرز بکەیتەوە!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="space-y-3 cursor-pointer group">
                {/* Thumbnail Box */}
                <Link href={`/watch/${video.id}`} className="block relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs">ڤیدیۆ</div>
                  )}

                  {/* Video Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-wider">
                      {video.duration}
                    </div>
                  )}
                </Link>

                {/* Video Info */}
                <div className="space-y-1">
                  <Link href={`/watch/${video.id}`} className="block font-bold text-sm text-white line-clamp-2 hover:text-brand transition">
                    {video.title}
                  </Link>
                  
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <Link href={`/profile/${encodeURIComponent(video.username)}`} className="hover:text-white transition">
                      @{video.username}
                    </Link>
                    
                    {/* Viewer Count with Eye Emoji */}
                    <div className="flex items-center gap-1">
                      <span>👁️</span>
                      <span>{video.views || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}