"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, Search, Upload, X, Bell } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Navbar({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("");
  const [customAvatar, setCustomAvatar] = useState<string>("");

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifBox, setShowNotifBox] = useState(false);

  const syncUserData = () => {
    const sessionUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("kurdishtube_session") || "null") : null;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser || sessionUser);
      setLoading(false);

      if (sessionUser?.username) {
        setUsername(sessionUser.username);
        loadNotifications(sessionUser.username);
        const savedAvatars = JSON.parse(localStorage.getItem("user_profile_avatars") || "{}");
        setCustomAvatar(savedAvatars[sessionUser.username] || "");
      } else if (activeUser) {
        const fallbackName = activeUser.user_metadata?.username || activeUser.email?.split("@")[0] || "بەکارهێنەر";
        setUsername(fallbackName);
        loadNotifications(fallbackName);
        const savedAvatars = JSON.parse(localStorage.getItem("user_profile_avatars") || "{}");
        setCustomAvatar(savedAvatars[fallbackName] || "");
      } else {
        setUsername("");
        setCustomAvatar("");
        setNotifications([]);
      }
    });
  };

  useEffect(() => {
    syncUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      syncUserData();
    });

    const handleStorageChange = () => {
      syncUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  const loadNotifications = (currentName: string) => {
    if (currentName) {
      const savedNotifs = localStorage.getItem(`notifications_${currentName}`);
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      } else {
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = () => {
    if (!username) return;
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(`notifications_${username}`, JSON.stringify(updated));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("kurdishtube_session");
    setUser(null);
    setUsername("");
    setCustomAvatar("");
    setNotifications([]);
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const authorInitial = username ? username.charAt(0).toUpperCase() : "ب";

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80" dir="rtl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-900 hover:text-white lg:hidden"
          aria-label="کردنەوەی لیستە"
        >
          <Menu size={22} />
        </button>

        <Link href="/" className="shrink-0">
          <h1 className="text-2xl font-extrabold text-brand sm:text-3xl">
            کوردیش<span className="text-white">تیوب</span>
          </h1>
        </Link>

        <form onSubmit={handleSearch} className="relative hidden max-w-xl flex-1 md:block">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="گەڕان بۆ ڤیدیۆ..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pr-4 pl-10 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40 text-right"
          />
          <button type="submit" className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400 hover:text-brand" aria-label="گەڕان">
            <Search size={18} />
          </button>
        </form>

        <div className="mr-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-900 hover:text-white md:hidden"
            aria-label="گەڕان"
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-lg bg-brand p-2 font-semibold text-black transition hover:bg-brand-hover sm:px-4 sm:py-2 text-sm sm:text-base"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">بڵاوکردنەوە</span>
          </Link>

          {!loading && user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifBox(!showNotifBox);
                    if (!showNotifBox) markAsRead();
                  }}
                  className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer transition flex items-center justify-center"
                  aria-label="ئاگادارکەرەوەکان"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-black">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifBox && (
                  <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-xl z-50 text-right">
                    <h3 className="text-sm font-bold text-white mb-3 border-b border-zinc-800 pb-2">ئاگادارکەرەوەکان</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-4">هیچ ئاگادارکەرەوەیەک نییە.</p>
                      ) : (
                        notifications.map((notif, idx) => (
                          <div key={idx} className={`p-2.5 rounded-lg text-xs space-y-1 ${notif.read ? 'bg-black/20 text-zinc-400' : 'bg-brand/10 text-white border border-brand/20'}`}>
                            <p>{notif.message}</p>
                            <span className="text-[10px] text-zinc-500">{notif.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Clean Profile Link with Custom Avatar Support */}
              <Link href={`/profile/${encodeURIComponent(username)}`} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full group cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-brand text-black font-bold text-xs flex items-center justify-center shrink-0 shadow overflow-hidden">
                  {customAvatar ? (
                    <img src={customAvatar} alt={username} className="w-full h-full object-cover" />
                  ) : (
                    authorInitial
                  )}
                </div>
                <span className="text-xs font-bold text-white group-hover:text-brand transition">@{username}</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="rounded-lg bg-zinc-800 px-2.5 py-2 text-xs font-medium text-white transition hover:bg-red-900 sm:px-4 sm:py-2 sm:text-base cursor-pointer"
              >
                چوونەدەرەوە
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-zinc-800 px-2.5 py-2 text-xs font-medium text-white transition hover:bg-zinc-700 sm:px-4 sm:py-2 sm:text-base"
            >
              چوونەژوورەوە
            </Link>
          )}
        </div>
      </div>

      {mobileSearchOpen && (
        <form onSubmit={handleSearch} className="border-t border-zinc-800 p-3 md:hidden">
          <div className="relative">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="گەڕان بۆ ڤیدیۆ..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pr-4 pl-10 outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 text-right"
            />
            <button type="submit" className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400 hover:text-brand" aria-label="گەڕان">
              <Search size={18} />
            </button>
          </div>
        </form>
      )}
    </header>
  );
}