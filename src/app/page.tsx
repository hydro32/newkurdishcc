"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";

export default function HomePage() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  const [videos, setVideos] = useState<any[]>([]);
  const hiddenVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    const loadVideos = () => {
      const savedVideos = localStorage.getItem("user_uploaded_videos");
      if (savedVideos) {
        try {
          const parsed = JSON.parse(savedVideos);
          let updated = parsed.map((v: any, index: number) => ({
            ...v,
            duration: v.duration || "0:00",
            views: v.views || 0,
            // Fallback timestamp using index position or id if createdAt is missing
            createdAt: v.createdAt || v.id || index
          }));

          // Sort or filter based on the active tab
          if (currentTab === "top") {
            // Sort highest view count to lowest view count
            updated.sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
          } else if (currentTab === "new") {
            // Sort newest first (using dates or fallback sequential checks)
            updated.sort((a: any, b: any) => {
              const dateA = new Date(a.createdAt).getTime();
              const dateB = new Date(b.createdAt).getTime();
              
              if (!isNaN(dateA) && !isNaN(dateB)) {
                return dateB - dateA;
              }
              // Fallback comparison if IDs are timestamps
              return String(b.id).localeCompare(String(a.id));
            });
          }

          setVideos(updated);
        } catch (e) {
          setVideos([]);
        }
      }
    };

    loadVideos();
  }, [currentTab]);

  const handleLoadedMetadata = (id: string, videoElement: HTMLVideoElement | null) => {
    if (!videoElement) return;
    const actualDurationSec = videoElement.duration;
    
    if (!isNaN(actualDurationSec) && isFinite(actualDurationSec) && actualDurationSec > 0) {
      const mins = Math.floor(actualDurationSec / 60);
      const secs = Math.floor(actualDurationSec % 60);
      const formattedDuration = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      setVideos((prevVideos) => {
        const videoIndex = prevVideos.findIndex((v) => v.id === id);
        if (videoIndex !== -1 && prevVideos[videoIndex].duration !== formattedDuration) {
          const updatedList = [...prevVideos];
          updatedList[videoIndex] = { ...updatedList[videoIndex], duration: formattedDuration };
          
          localStorage.setItem("user_uploaded_videos", JSON.stringify(updatedList));
          return updatedList;
        }
        return prevVideos;
      });
    }
  };

  const getHeaderTitle = () => {
    if (currentTab === "top") return "زۆرترین بینین";
    if (currentTab === "new") return "نوێترین بڵاوکراوەکان";
    return "ڤیدیۆە تازەکان";
  };

  return (
    <AppShell>
      <div className="space-y-6" dir="rtl">
        <h1 className="text-xl sm:text-2xl font-bold text-white">{getHeaderTitle()}</h1>

        {videos.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-sm">
            هیچ ڤیدیۆیەک بەردەست نییە. یەکەم کەس بە کە ڤیدیۆ بەرز بکەیتەوە!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="space-y-3 group">
                {video.videoUrl && (
                  <video
                    ref={(el) => { hiddenVideoRefs.current[video.id] = el; }}
                    src={video.videoUrl}
                    preload="metadata"
                    onLoadedMetadata={(e) => handleLoadedMetadata(video.id, e.currentTarget)}
                    className="hidden"
                  />
                )}

                <Link href={`/watch/${video.id}`} className="block relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs">ڤیدیۆ</div>
                  )}

                  <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-wider">
                    {video.duration || "0:00"}
                  </div>
                </Link>

                <div className="space-y-1">
                  <Link href={`/watch/${video.id}`} className="block font-bold text-sm text-white line-clamp-2 hover:text-brand transition cursor-pointer">
                    {video.title}
                  </Link>
                  
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <Link href={`/profile/${encodeURIComponent(video.username)}`} className="hover:text-white transition cursor-pointer">
                      @{video.username}
                    </Link>
                    
                    <div className="flex items-center gap-1 font-mono">
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