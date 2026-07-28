"use client";

import Image from "next/image";
import Link from "next/link";
import type { Video } from "@/types/video";

export default function VideoCard({ video }: { video: Video }) {
  // Check if current user is logged in and is the owner of this video
  const isOwner = (() => {
    if (typeof window === "undefined") return false;

    // Get current logged in session username
    const sessionUser = JSON.parse(localStorage.getItem("kurdishtube_session") || "null");
    const currentUsername = sessionUser?.username || "";

    // Check if this video exists in user's uploaded list AND matches the current username or creator name
    const uploadedVideos = JSON.parse(localStorage.getItem("user_uploaded_videos") || "[]");
    const foundVideo = uploadedVideos.find((v: any) => v.id === video.id);

    if (!foundVideo) return false;

    // If the video creator matches the current active user, allow deletion
    return foundVideo.username === currentUsername || video.creator === currentUsername;
  })();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm("دڵنیایت لە سڕینەوەی ئەم ڤیدیۆیە؟")) {
      const existingVideos = JSON.parse(localStorage.getItem("user_uploaded_videos") || "[]");
      const updated = existingVideos.filter((v: any) => v.id !== video.id);
      localStorage.setItem("user_uploaded_videos", JSON.stringify(updated));
      window.location.reload();
    }
  };

  return (
    <Link
      href={`/watch/${video.id}`}
      className="group block overflow-hidden rounded-xl bg-zinc-950 transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute bottom-2 left-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {video.duration}
        </span>

        {/* Show trash button ONLY if the logged-in user owns this video */}
        {isOwner && (
          <button
            onClick={handleDelete}
            className="absolute bottom-2 left-16 z-10 flex h-7 w-7 items-center justify-center rounded bg-black/80 text-xs transition hover:bg-red-600 cursor-pointer shadow"
            title="سڕینەوەی ڤیدیۆ"
          >
            🗑️
          </button>
        )}
      </div>

      <div className="mt-3 flex gap-3">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-800">
          <Image
            src={video.creatorAvatar}
            alt={video.creator}
            fill
            sizes="36px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0">
          <h3 className="line-clamp-2 font-semibold leading-snug text-white transition group-hover:text-brand">
            {video.title}
          </h3>
          <p className="mt-1 truncate text-sm text-zinc-400">{video.creator}</p>
          <p className="text-sm text-zinc-500">
            {video.views} بینین • {video.uploadedAt}
          </p>
        </div>
      </div>
    </Link>
  );
}