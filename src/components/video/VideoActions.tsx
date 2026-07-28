"use client";

import { useState } from "react";
import { Check, Link2, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VideoActions({ initialLikes }: { initialLikes: string }) {
  const [reaction, setReaction] = useState<"like" | "dislike" | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore in this demo UI.
    }
  };

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        onClick={() => setReaction((r) => (r === "like" ? null : "like"))}
        className={cn(
          "flex items-center gap-2 rounded-lg px-5 py-3 transition",
          reaction === "like"
            ? "bg-brand text-black"
            : "bg-zinc-800 hover:bg-zinc-700",
        )}
      >
        <ThumbsUp size={18} />
        {initialLikes}
      </button>

      <button
        onClick={() => setReaction((r) => (r === "dislike" ? null : "dislike"))}
        className={cn(
          "flex items-center gap-2 rounded-lg px-5 py-3 transition",
          reaction === "dislike"
            ? "bg-zinc-600 text-white"
            : "bg-zinc-800 hover:bg-zinc-700",
        )}
      >
        <ThumbsDown size={18} />
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-2 rounded-lg bg-zinc-800 px-5 py-3 transition hover:bg-zinc-700"
      >
        {copied ? <Check size={18} className="text-brand" /> : <Link2 size={18} />}
        {copied ? "کۆپی کرا" : "هاوبەشکردن"}
      </button>
    </div>
  );
}
