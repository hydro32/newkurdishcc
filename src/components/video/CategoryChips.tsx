"use client";

import { cn } from "@/lib/utils";

export default function CategoryChips({
  categories,
  active,
  onChange,
}: {
  categories: readonly string[];
  active: string;
  onChange: (category: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
            active === c
              ? "border-brand bg-brand text-black"
              : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white",
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
