"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { UserPlus, UserCheck, Film, ThumbsUp, Edit2, Check, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawUsername = params?.username as string;
  const username = decodeURIComponent(rawUsername || "");

  const [user, setUser] = useState<any>(null);
  const [uploadedVideos, setUploadedVideos] = useState<any[]>([]);
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'uploads' | 'liked'>('uploads');

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Username editing & status states
  const [isEditing, setIsEditing] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState(username);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [isMyProfile, setIsMyProfile] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user && username) {
        // Check if this profile belongs to the logged-in user
        supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data && data.username === username) {
              setIsMyProfile(true);
            }
          });
      }
    });

    if (username) {
      setNewUsernameInput(username);

      // Load uploaded videos by this user (fallback to local storage for now until we move videos next)
      const savedVideos = localStorage.getItem("user_uploaded_videos");
      if (savedVideos) {
        const list = JSON.parse(savedVideos);
        const userVids = list.filter((v: any) => v.username === username || v.author === username || v.uploader === username);
        setUploadedVideos(userVids);

        const likedList: any[] = [];
        list.forEach((v: any) => {
          const ratings = JSON.parse(localStorage.getItem(`video_ratings_${v.id}`) || "{}");
          if (ratings.action === 'likes') {
            likedList.push(v);
          }
        });
        setLikedVideos(likedList);
      }

      // Load followers
      const allFollows = JSON.parse(localStorage.getItem("user_follows") || "{}");
      const userFollowers = allFollows[username] || [];
      setFollowersCount(userFollowers.length);
    }
  }, [username]);

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedName = newUsernameInput.trim();
    if (!updatedName || updatedName === username) {
      setIsEditing(false);
      return;
    }

    setErrorMessage("");
    const oldUsername = username;

    if (!user) {
      setErrorMessage("تکایە سەرەتا بچۆ ژوورەوە.");
      return;
    }

    // Update username in Supabase profiles table (Publicly visible!)
    const { error } = await supabase
      .from('profiles')
      .update({ username: updatedName })
      .eq('id', user.id);

    if (error) {
      setErrorMessage("ئەم ناوی بەکارهێنەرە پێشتر هەڵگیراوە یان هەڵەیەک ڕوویدا.");
      return;
    }

    // Update uploaded videos mapping locally so they match the new name
    const savedVideos = localStorage.getItem("user_uploaded_videos");
    if (savedVideos) {
      const list = JSON.parse(savedVideos);
      const updatedList = list.map((v: any) => {
        if (v.username === oldUsername || v.author === oldUsername || v.uploader === oldUsername) {
          return { 
            ...v, 
            username: updatedName, 
            author: updatedName, 
            uploader: updatedName 
          };
        }
        return v;
      });
      localStorage.setItem("user_uploaded_videos", JSON.stringify(updatedList));
    }

    setIsEditing(false);
    setSuccessMessage("ناوی بەکارهێنەر بە سەرکەوتوویی گۆڕدرا!");
    
    setTimeout(() => {
      window.location.href = `/profile/${encodeURIComponent(updatedName)}`;
    }, 500);
  };

  const authorInitial = username ? username.charAt(0).toUpperCase() : "ب";

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8" dir="rtl">
        {/* Profile Header */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-brand text-black font-extrabold text-3xl flex items-center justify-center shadow-lg shrink-0">
              {authorInitial}
            </div>
            
            <div className="space-y-1 text-center sm:text-right">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                {!isEditing ? (
                  <h1 className="text-xl sm:text-2xl font-bold text-white">@{username}</h1>
                ) : (
                  <form onSubmit={handleSaveUsername} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newUsernameInput}
                      onChange={(e) => setNewUsernameInput(e.target.value)}
                      className="bg-black border border-zinc-700 px-3 py-1 rounded-lg text-sm text-white outline-none focus:border-brand"
                      autoFocus
                    />
                    <button type="submit" className="bg-brand text-black p-1.5 rounded-lg hover:bg-brand-hover transition cursor-pointer" title="پاشەکەوتکردن">
                      <Check size={16} />
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="bg-zinc-800 text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-700 transition cursor-pointer" title="هەڵوەشاندنەوە">
                      <X size={16} />
                    </button>
                  </form>
                )}

                {isMyProfile && !isEditing && (
                  <button 
                    onClick={() => {
                      setSuccessMessage("");
                      setIsEditing(true);
                    }} 
                    className="text-zinc-400 hover:text-white transition p-1.5 cursor-pointer bg-zinc-800 rounded-lg flex items-center gap-1 text-xs"
                    title="گۆڕینی ناوی بەکارهێنەر"
                  >
                    <Edit2 size={14} />
                    <span className="hidden sm:inline">گۆڕینی ناوی بەکارهێنەر</span>
                  </button>
                )}
              </div>

              {successMessage && <p className="text-xs text-brand font-medium animate-pulse">{successMessage}</p>}
              {errorMessage && <p className="text-xs text-red-500 font-medium">{errorMessage}</p>}

              <p className="text-xs text-zinc-400">
                {followersCount} فۆڵۆوەرز • {uploadedVideos.length} ڤیدیۆ
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'uploads' ? "bg-brand text-black shadow" : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <Film size={16} />
            <span>ڤیدیۆەکان ({uploadedVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('liked')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'liked' ? "bg-brand text-black shadow" : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <ThumbsUp size={16} />
            <span>لایککراوەکان ({likedVideos.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'uploads' ? (
          <div>
            {uploadedVideos.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-sm">هیچ ڤیدیۆیەک لەم پرۆفایلەدا نییە.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedVideos.map((video) => (
                  <div key={video.id} className="space-y-3 group">
                    <Link href={`/watch/${video.id}`} className="block relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs">ڤیدیۆ</div>
                      )}
                    </Link>
                    <div className="space-y-1">
                      <Link href={`/watch/${video.id}`} className="block font-bold text-sm text-white line-clamp-2 hover:text-brand transition cursor-pointer">
                        {video.title}
                      </Link>
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>👁️ {video.views || 0} بینین</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {likedVideos.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-sm">هیچ ڤیدیۆیەکت لایک نەکردووە هێشتا.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {likedVideos.map((video) => (
                  <div key={video.id} className="space-y-3 group">
                    <Link href={`/watch/${video.id}`} className="block relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs">ڤیدیۆ</div>
                      )}
                    </Link>
                    <div className="space-y-1">
                      <Link href={`/watch/${video.id}`} className="block font-bold text-sm text-white line-clamp-2 hover:text-brand transition cursor-pointer">
                        {video.title}
                      </Link>
                      <span className="text-xs text-zinc-400">@{video.username || video.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}