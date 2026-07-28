"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { Trash2, Eye, Play, Film, ThumbsUp, AlertTriangle, Settings, X, Upload } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawProfileUsername = (params?.username as string) || "";
  const profileUsername = decodeURIComponent(rawProfileUsername).trim();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"uploads" | "likes">("uploads");
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Custom delete modal state
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState(profileUsername);
  const [customAvatar, setCustomAvatar] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    loadProfileData();
  }, [profileUsername]);

  const loadProfileData = () => {
    if (!profileUsername) return;
    setNewUsername(profileUsername);

    // Load custom profile avatar if saved
    const savedAvatars = JSON.parse(localStorage.getItem("user_profile_avatars") || "{}");
    setCustomAvatar(savedAvatars[profileUsername] || "");

    // Load uploaded videos
    const savedVideos = localStorage.getItem("user_uploaded_videos");
    let allList: any[] = [];
    if (savedVideos) {
      try {
        allList = JSON.parse(savedVideos);
        const filtered = allList.filter((v: any) => 
          v.username && v.username.toLowerCase() === profileUsername.toLowerCase()
        );
        setUserVideos(filtered);
      } catch (e) {
        setUserVideos([]);
      }
    }

    // Load liked videos for this profile user
    const likedList: any[] = [];
    allList.forEach((v) => {
      const likedUsers = JSON.parse(localStorage.getItem(`video_liked_users_${v.id}`) || "[]");
      if (likedUsers.map((u: string) => u.toLowerCase()).includes(profileUsername.toLowerCase())) {
        likedList.push(v);
      }
    });
    setLikedVideos(likedList);

    const allFollows = JSON.parse(localStorage.getItem("user_follows") || "{}");
    const matchedKey = Object.keys(allFollows).find(k => k.toLowerCase() === profileUsername.toLowerCase());
    const userFollowers = matchedKey ? allFollows[matchedKey] : [];
    setFollowersCount(userFollowers.length);

    const sessionUser = JSON.parse(localStorage.getItem("kurdishtube_session") || "null");
    const myName = sessionUser?.username;
    if (myName && userFollowers.map((u: string) => u.toLowerCase()).includes(myName.toLowerCase())) {
      setIsFollowing(true);
    }
  };

  const confirmDeleteVideo = (videoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoToDelete(videoId);
  };

  const executeDelete = () => {
    if (!videoToDelete) return;

    const videoId = videoToDelete;
    const savedVideos = localStorage.getItem("user_uploaded_videos");
    if (savedVideos) {
      try {
        const list = JSON.parse(savedVideos);
        const updatedList = list.filter((v: any) => v.id !== videoId);
        localStorage.setItem("user_uploaded_videos", JSON.stringify(updatedList));
        setUserVideos((prev) => prev.filter((v) => v.id !== videoId));
        setLikedVideos((prev) => prev.filter((v) => v.id !== videoId));
      } catch (err) {
        console.error("Error deleting video:", err);
      }
    }

    localStorage.removeItem(`video_comments_${videoId}`);
    localStorage.removeItem(`video_likes_${videoId}`);
    localStorage.removeItem(`video_ratings_${videoId}`);
    localStorage.removeItem(`video_liked_users_${videoId}`);
    
    setVideoToDelete(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNewName = newUsername.trim();
    if (!trimmedNewName) {
      alert("ناونیشانی ناو بەتاڵ نەبێت.");
      return;
    }

    // 1. Update avatar storage under the new username key and clean up old one if renamed
    const savedAvatars = JSON.parse(localStorage.getItem("user_profile_avatars") || "{}");
    if (customAvatar) {
      savedAvatars[trimmedNewName] = customAvatar;
      if (profileUsername.toLowerCase() !== trimmedNewName.toLowerCase()) {
        delete savedAvatars[profileUsername];
      }
    } else {
      delete savedAvatars[trimmedNewName];
    }
    localStorage.setItem("user_profile_avatars", JSON.stringify(savedAvatars));

    // 2. If username changed, update all references across videos, comments, and sessions
    if (trimmedNewName.toLowerCase() !== profileUsername.toLowerCase()) {
      const savedVideos = localStorage.getItem("user_uploaded_videos");
      let allList: any[] = [];
      if (savedVideos) {
        try {
          allList = JSON.parse(savedVideos);
          const updatedList = allList.map((v: any) => {
            if (v.username && v.username.toLowerCase() === profileUsername.toLowerCase()) {
              return { ...v, username: trimmedNewName };
            }
            return v;
          });
          localStorage.setItem("user_uploaded_videos", JSON.stringify(updatedList));
        } catch (err) {
          console.error(err);
        }
      }

      // Update comments across all videos where username matches
      allList.forEach((v) => {
        const commentKey = `video_comments_${v.id}`;
        const comments = JSON.parse(localStorage.getItem(commentKey) || "[]");
        let updated = false;
        const modifiedComments = comments.map((c: any) => {
          if (c.username && c.username.toLowerCase() === profileUsername.toLowerCase()) {
            updated = true;
            return { ...c, username: trimmedNewName };
          }
          return c;
        });
        if (updated) {
          localStorage.setItem(commentKey, JSON.stringify(modifiedComments));
        }
      });
    }

    // 3. Update session storage so the navbar and active user states match immediately
    const sessionUser = JSON.parse(localStorage.getItem("kurdishtube_session") || "{}");
    sessionUser.username = trimmedNewName;
    localStorage.setItem("kurdishtube_session", JSON.stringify(sessionUser));

    // 4. Trigger global event so Navbar updates instantly everywhere
    window.dispatchEvent(new Event("profile_updated"));

    setIsEditModalOpen(false);

    if (trimmedNewName.toLowerCase() !== profileUsername.toLowerCase()) {
      router.push(`/profile/${encodeURIComponent(trimmedNewName)}`);
    } else {
      loadProfileData();
    }
  };

  const sessionUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("kurdishtube_session") || "null") : null;
  const myCurrentUsername = sessionUser?.username || currentUser?.user_metadata?.username || currentUser?.email?.split("@")[0] || "";

  const isMyProfile = myCurrentUsername && profileUsername && myCurrentUsername.toLowerCase() === profileUsername.toLowerCase();
  const profileInitial = profileUsername ? profileUsername.charAt(0).toUpperCase() : "پ";

  const displayedVideos = activeTab === "uploads" ? userVideos : likedVideos;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8 relative" dir="rtl">
        {/* Profile Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-brand text-black font-extrabold text-4xl flex items-center justify-center shadow-lg shrink-0">
            {customAvatar ? (
              <img src={customAvatar} alt={profileUsername} className="w-full h-full object-cover" />
            ) : (
              profileInitial
            )}
          </div>

          <div className="flex-1 text-center md:text-right space-y-2">
            <h1 className="text-2xl font-bold text-white">@{profileUsername}</h1>
            <p className="text-sm text-zinc-400">{followersCount} فۆڵۆوەرز • {userVideos.length} ڤیدیۆ</p>
          </div>

          {isMyProfile && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition cursor-pointer border border-zinc-700 shadow-md"
            >
              <Settings size={15} />
              <span>دەستکاریکردنی پروفایل</span>
            </button>
          )}
        </div>

        {/* Profile Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab("uploads")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeTab === "uploads" ? "bg-brand text-black" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800"
            }`}
          >
            <Film size={16} />
            <span>ڤیدیۆ بڵاوکراوەکان ({userVideos.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab("likes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeTab === "likes" ? "bg-brand text-black" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800"
            }`}
          >
            <ThumbsUp size={16} />
            <span>ڤیدیۆ پەسەندکراوەکان ({likedVideos.length})</span>
          </button>
        </div>

        {/* Videos Grid */}
        <div className="space-y-4">
          {displayedVideos.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-12 text-center text-zinc-500 space-y-2">
              <p className="text-sm">
                {activeTab === "uploads" ? "هیچ ڤیدیۆیەکی بڵاوکراوە لەم پروفایلەدا نییە." : "هیچ ڤیدیۆیەکی پەسەندکراو نییە."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {displayedVideos.map((video) => (
                <div 
                  key={video.id}
                  onClick={() => router.push(`/watch/${video.id}`)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition cursor-pointer flex flex-col group relative shadow-md"
                >
                  <div className="relative aspect-video w-full bg-black overflow-hidden">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Play size={32} />
                      </div>
                    )}
                    
                    {video.duration && (
                      <span className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                        {video.duration}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-brand transition">{video.title}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Eye size={13} />
                        <span>{video.views || 0} بینین</span>
                      </div>
                    </div>

                    {isMyProfile && activeTab === "uploads" && (
                      <div className="pt-2 border-t border-zinc-800 flex justify-end">
                        <button
                          onClick={(e) => confirmDeleteVideo(video.id, e)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition cursor-pointer border border-red-500/20"
                        >
                          <Trash2 size={14} />
                          سڕینەوەی ڤیدیۆ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="text-lg font-bold text-white">دەستکاریکردنی پروفایل</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-brand text-black font-bold text-2xl flex items-center justify-center border-2 border-zinc-700 shadow-inner">
                    {customAvatar ? (
                      <img src={customAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      newUsername.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-700 transition flex items-center gap-1.5">
                    <Upload size={14} />
                    <span>گۆڕینی وێنەی پروفایل</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">ناوی بەکارهێنەر (Username)</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-brand"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition cursor-pointer"
                  >
                    پاشگەزبوونەوە
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-black text-sm font-bold transition cursor-pointer shadow-lg"
                  >
                    پاشەکەوتکردن
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Custom Confirmation Dialog Modal */}
        {videoToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">سڕینەوەی ڤیدیۆ</h3>
                  <p className="text-xs text-zinc-400">ئایا دڵنیای لە سڕینەوەی ئەم ڤیدیۆیە؟ ئەم کردارە گەڕانەوەی نییە.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setVideoToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition cursor-pointer shadow-lg shadow-red-600/20"
                >
                  بەڵێ، بسڕەوە
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}