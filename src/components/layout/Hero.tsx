import Link from "next/link";
import type { Video } from "@/types/video";

export default function Hero({ video }: { video: Video }) {
  return (
    <section
      className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-l from-brand-deep to-red-700 p-8 sm:p-10"
      style={{
        backgroundImage: `linear-gradient(to left, rgba(234,88,12,0.92), rgba(185,28,28,0.92)), url(${video.thumbnail})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-xl">
        <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
        </span>

        <h1 className="mt-4 text-3xl font-bold sm:text-5xl">{video.title}</h1>

        <p className="mt-4 text-lg text-orange-100">{video.description}</p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={`/watch/${video.id}`}
            className="rounded-lg bg-white px-6 py-3 font-bold text-black transition hover:bg-gray-200"
          >
            ▶ ئێستا ببینە
          </Link>

          <Link
            href={`/watch/${video.id}`}
            className="rounded-lg border border-white/30 px-6 py-3 transition hover:bg-white/10"
          >
          </Link>
        </div>
      </div>
    </section>
  );
}
