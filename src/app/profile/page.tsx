"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import VideoGrid from "@/components/video/VideoGrid";
import { videos as staticVideos } from "@/data/videos";
import { cn } from "@/lib/utils";
import { Edit3, Check, Camera, Film, User, Trash2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABS = [
  { id: "uploads", label: "ڤیدیۆەکان" },
  { id: "likes", label: "لایکراوەکان" },
] as const;

function ProfileContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "uploads";
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(
    (TABS.find((t) => t.id === initialTab)?.id as (typeof TABS)[number]["id"]) ??
      "uploads",
  );

  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("بەکارهێنەری کوردیش تیوب");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("بەکارهێنەری کوردیش تیوب");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [userUploadedVideos, setUserUploadedVideos] = useState<any[]>([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);

  useEffect(() => {
    async function initUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser ?? null);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", currentUser.id)
          .single();

        if (profileData?.username) {
          setUsername(profileData.username);
          setNewUsername(profileData.username);
        } else {
          const fallbackName = currentUser.email?.split("@")[0] || "بەکارهێنەری کوردیش تیوب";
          setUsername(fallbackName);
          setNewUsername(fallbackName);
        }
      }

      const savedPhoto = localStorage.getItem("user_profile_photo");
      if (savedPhoto) {
        setProfilePhoto(savedPhoto);
      }

      loadUploadedVideos();
    }

    initUser();
  }, []);

  const loadUploadedVideos = () => {
    try {
      const existingVideosStr = localStorage.getItem("user_uploaded_videos") || "[]";
      const parsed = JSON.parse(existingVideosStr);
      const validVideos = Array.isArray(parsed) ? parsed.filter((v: any) => v && v.id) : [];
      setUserUploadedVideos(validVideos);
    } catch {
      setUserUploadedVideos([]);
    }
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim() || !user) return;

    const trimmedName = newUsername.trim();

    const { error } = await supabase
      .from("profiles")
      .upsert({ 
        id: user.id, 
        username: trimmedName, 
        updated_at: new Date() 
      });

    if (error) {
      alert("Error updating username: " + error.message);
      return;
    }

    setUsername(trimmedName);
    setIsEditingUsername(false);
    alert("Username updated successfully!");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        setProfilePhoto(result);
        localStorage.setItem("user_profile_photo", result);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const toggleSelectVideo = (videoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (selectedVideoIds.includes(videoId)) {
      setSelectedVideoIds(selectedVideoIds.filter((id) => id !== videoId));
    } else {
      setSelectedVideoIds([...selectedVideoIds, videoId]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedVideoIds.length === 0) return;

    if (confirm(`دڵنیایت لە سڕینەوەی (${selectedVideoIds.length}) ڤیدیۆی هەڵبژاردراو؟`)) {
      const updatedVideos = userUploadedVideos.filter((video: any) => !selectedVideoIds.includes(video.id));
      setUserUploadedVideos(updatedVideos);
      localStorage.setItem("user_uploaded_videos", JSON.stringify(updatedVideos));
      setSelectedVideoIds([]);
    }
  };

  let shown: any[] = [];
  if (tab === "likes") {
    shown = staticVideos.slice(4, 6);
  }

  return (
    <div dir="rtl">
      {/* Profile Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="relative group shrink-0">
          <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-brand bg-zinc-900 flex items-center justify-center">
            {profilePhoto ? (
              <img src={profilePhoto} alt="وێنەی من" className="h-full w-full object-cover" />
            ) : (
              <User size={40} className="text-zinc-500" />
            )}
          </div>
          
          <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
            <Camera size={22} className="text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>

        <div className="flex-1 text-center sm:text-right space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            {!isEditingUsername ? (
              <>
                <h1 className="text-2xl font-bold text-white">{username}</h1>
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="text-zinc-400 hover:text-brand transition cursor-pointer"
                  title="گۆڕینی ناوی بەکارهێنەر"
                >
                  <Edit3 size={18} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-white text-sm outline-none focus:border-brand"
                />
                <button
                  onClick={handleSaveUsername}
                  className="bg-brand text-black p-1.5 rounded-lg hover:bg-brand-hover cursor-pointer"
                >
                  <Check size={18} />
                </button>
              </div>
            )}
          </div>

          <p className="text-zinc-400 text-sm">
            {userUploadedVideos.length} ڤیدیۆی بەرزکراوە • {user?.email || "بەکارهێنەری مێوان"}
          </p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-3">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "border-b-2 pb-3 px-4 font-medium transition cursor-pointer -mb-3",
                tab === t.id
                  ? "border-brand text-brand"
                  : "border-transparent text-zinc-400 hover:text-white",
              )}
            >
              {t.label} ({t.id === "uploads" ? userUploadedVideos.length : 1})
            </button>
          ))}
        </div>

        {tab === "uploads" && userUploadedVideos.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">
              {selectedVideoIds.length} هەڵبژێردراوە
            </span>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedVideoIds.length === 0}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer",
                selectedVideoIds.length > 0
                  ? "bg-red-600 text-white hover:bg-red-700 shadow"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              )}
            >
              <Trash2 size={14} />
              <span>سڕینەوەی هەڵبژاردراوەکان</span>
            </button>
          </div>
        )}
      </div>

      {/* Uploads Tab Content */}
      {tab === "uploads" ? (
        <div className="space-y-4">
          {userUploadedVideos.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-12 text-center text-zinc-500">
              هیچ ڤیدیۆیەکت بڵاونەکردووەتەوە هێشتا.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userUploadedVideos.map((video) => (
                <div key={video.id} className="flex flex-col gap-3 relative group">
                  <Link href={`/watch/${video.id}`} className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 block">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-600">
                        <Film size={28} />
                      </div>
                    )}
                  </Link>

                  <div className="absolute top-2 left-2 z-20">
                    <input
                      type="checkbox"
                      checked={selectedVideoIds.includes(video.id)}
                      onChange={(e) => toggleSelectVideo(video.id, e)}
                      className="h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-brand accent-brand cursor-pointer shadow-lg"
                    />
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-white line-clamp-1">{video.title}</h3>
                      <p className="text-sm text-zinc-400">{video.username}@</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <VideoGrid videos={shown} emptyMessage="هیچ شتێک لێرە نییە." />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <ProfileContent />
      </Suspense>
    </AppShell>
  );
}