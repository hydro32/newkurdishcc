"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  Compass,
  Home,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "لاپەڕەی سەرەکی", icon: Home },
  { href: "/stories", label: "چیرۆکەکان", icon: BookOpenText },
  { href: "/?tab=top", label: "زۆرترین بینین", icon: Sparkles },
  { href: "/?tab=new", label: "نوێترین بڵاوکراوەکان", icon: Compass },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  const content = (
    <nav className="space-y-1 p-4" dir="rtl">
      <div className="mb-2 flex items-center justify-between lg:hidden">
        <span className="text-sm font-semibold text-zinc-400">لیستە</span>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          aria-label="داخستن"
        >
          <X size={20} />
        </button>
      </div>

      {menuItems.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]) && href.split("?")[0] !== "/";
        return (
          <Link
            key={label}
            href={href}
            onClick={onClose}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-right transition",
              isActive
                ? "bg-brand/15 text-brand"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
            )}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-l border-zinc-800 bg-zinc-950 lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute top-0 right-0 h-full w-72 border-l border-zinc-800 bg-zinc-950 shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}