import type { Video } from "@/types/video";
import VideoCard from "./VideoCard";

export default function VideoGrid({
  videos,
  emptyMessage = "هیچ ڤیدیۆیەک نەدۆزرایەوە.",
}: {
  videos: Video[];
  emptyMessage?: string;
}) {
  if (videos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-800 p-10 text-center text-zinc-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
