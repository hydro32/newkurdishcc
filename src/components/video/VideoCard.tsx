import Image from "next/image";
import Link from "next/link";
import type { Video } from "@/types/video";

export default function VideoCard({ video }: { video: Video }) {
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
