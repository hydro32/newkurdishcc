"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { Eye, ThumbsUp, MessageSquare, Share2, Check, UserPlus, UserCheck, Film } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { getUserAvatar } from "@/lib/userProfiles";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("KurdishTubeDB", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("videos")) {
        db.createObjectStore("videos");
      }
    };
  });
};

const getVideoFromIDB = async (id: string): Promise<string | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("videos", "readonly");
    const store = transaction.objectStore("videos");
    const request = store.get(id);
    request.onsuccess = () => {
      const file = request.result;
      if (file) {
        resolve(URL.createObjectURL(file));
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params?.id as string;

  const [video, setVideo] = useState<any>(null);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    loadVideoData();
  }, [videoId]);

  const loadVideoData = async () => {
    if (!videoId) return;

    setLoading(true);
    const savedVideos = localStorage.getItem("user_uploaded_videos");
    if (savedVideos) {
      try {
        const list = JSON.parse(savedVideos);
        const found = list.find((v: any) => v.id === videoId);
        if (found) {
          setVideo(found);

          let blobUrl = await getVideoFromIDB(videoId);
          if (!blobUrl && found.videoUrl) {
            blobUrl = found.videoUrl;
          }
          setVideoBlobUrl(blobUrl);

          found.views = (found.views || 0) + 1;
          localStorage.setItem("user_uploaded_videos", JSON.stringify(list));

          const savedLikes = JSON.parse(localStorage.getItem(`video_likes_${videoId}`) || "0");
          setLikes(savedLikes);

          const sessionUser = JSON.parse(localStorage.getItem("kurdishtube_session") || "null");
          const myName = sessionUser?.username || currentUser?.email?.split("@")[0];
          
          const likedUsersKey = `video_liked_users_${videoId}`;
          const likedUsers: string[] = JSON.parse(localStorage.getItem(likedUsersKey) || "[]");
          if (myName && likedUsers.map(u => u.toLowerCase()).includes(myName.toLowerCase())) {
            setHasLiked(true);
          }

          const savedComments = JSON.parse(localStorage.getItem(`video_comments_${videoId}`) || "[]");
          setComments(savedComments);

          loadFollowData(found.username, myName);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  };

  const loadFollowData = (channelName: string, myName: string) => {
    const allFollows = JSON.parse(localStorage.getItem("user_follows") || "{}");
    const followers = allFollows[channelName] || [];
    setFollowersCount(followers.length);
    if (myName && followers.includes(myName)) {
      setIsFollowing(true);
    }
  };

  const handleLike = () => {
    const sessionUser = JSON.parse(localStorage.getItem("kurdishtube_session") || "null");
    const myName = sessionUser?.username || currentUser?.email?.split("@")[0];
    if (!myName) {
      alert("تکایە سەرەتا چوونەژوورەوە بکە بۆ کاردانەوە.");
      return;
    }

    const likedUsersKey = `video_liked_users_${videoId}`;
    const likedUsers: string[] = JSON.parse(localStorage.getItem(likedUsersKey) || "[]");
    
    let newLikesCount = likes;
    let updatedLikedUsers = [...likedUsers];

    const hasAlreadyLiked = likedUsers.map((u: string) => u.toLowerCase()).includes(myName.toLowerCase());

    if (hasAlreadyLiked) {
      newLikesCount = Math.max(0, likes - 1);
      setHasLiked(false);
      updatedLikedUsers = likedUsers.filter((u: string) => u.toLowerCase() !== myName.toLowerCase());
    } else {
      newLikesCount = likes + 1;
      setHasLiked(true);
      updatedLikedUsers.push(myName);
    }

    setLikes(newLikesCount);
    localStorage.setItem(`video_likes_${videoId}`, JSON.stringify(newLikesCount));
    localStorage.setItem(likedUsersKey, JSON.stringify(updatedLikedUsers));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const sessionUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("kurdishtube_session") || "null") : null;
    const username = sessionUser?.username || currentUser?.user_metadata?.username || currentUser?.email?.split("@")[0] || "";

    if (!username) {
      alert("تکایە سەرەتا چوونەژوورەوە بکە بۆ نووسینی کۆمێنت.");
      return;
    }

    const commentObj = {
      id: Date.now().toString(),
      username,
      text: newComment.trim(),
      createdAt: new Date().toLocaleDateString()
    };

    const updatedComments = [commentObj, ...comments];
    setComments(updatedComments);
    localStorage.setItem(`video_comments_${videoId}`, JSON.stringify(updatedComments));
    setNewComment("");
  };

  const handleFollowToggle = () => {
    if (!video) return;
    const sessionUser = JSON.parse(localStorage.getItem("kurdishtube_session") || "null");
    const myName = sessionUser?.username;
    if (!myName) {
      alert("تکایە سەرەتا چوونەژوورەوە بکە.");
      return;
    }

    const allFollows = JSON.parse(localStorage.getItem("user_follows") || "{}");
    let followers = allFollows[video.username] || [];

    if (isFollowing) {
      followers = followers.filter((u: string) => u !== myName);
      setIsFollowing(false);
      setFollowersCount((prev) => Math.max(0, prev - 1));
    } else {
      followers.push(myName);
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
    }

    allFollows[video.username] = followers;
    localStorage.setItem("user_follows", JSON.stringify(allFollows));
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center min-h-[60vh] text-zinc-400">
          خەریکە ڤیدیۆ باردەکرێت...
        </div>
      </AppShell>
    );
  }

  if (!video) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto text-center py-20 space-y-4" dir="rtl">
          <Film size={48} className="mx-auto text-zinc-600" />
          <h2 className="text-xl font-bold text-white">ڤیدیۆکە نەدۆزرایەوە</h2>
          <button onClick={() => router.push("/")} className="px-4 py-2 bg-brand text-black font-bold rounded-xl text-sm">
            گەڕانەوە بۆ سەرەتا
          </button>
        </div>
      </AppShell>
    );
  }

  const uploaderAvatar = getUserAvatar(video.username);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6" dir="rtl">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-zinc-800 shadow-2xl">
          {videoBlobUrl ? (
            <video src={videoBlobUrl} controls autoPlay playsInline className="w-full h-full object-contain" />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
              سەرچاوەی ئەم ڤیدیۆیە بەردەست نییە یان شێواوە.
            </div>
          )}
        </div>

        <div className="space-y-4 border-b border-zinc-800 pb-6">
          <h1 className="text-xl md:text-2xl font-bold text-white">{video.title}</h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${video.username}`} className="w-12 h-12 rounded-full overflow-hidden bg-brand text-black font-bold text-lg flex items-center justify-center shrink-0 shadow">
                {uploaderAvatar ? (
                  <img src={uploaderAvatar} alt={video.username} className="w-full h-full object-cover" />
                ) : (
                  video.username.charAt(0).toUpperCase()
                )}
              </Link>
              <div>
                <Link href={`/profile/${video.username}`} className="font-bold text-white hover:text-brand transition">
                  @{video.username}
                </Link>
                <p className="text-xs text-zinc-400">{followersCount} فۆڵۆوەرز</p>
              </div>

              <button
                onClick={handleFollowToggle}
                className={`mr-4 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isFollowing ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-brand text-black hover:bg-brand-hover"
                }`}
              >
                {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                <span>{isFollowing ? "فۆڵۆوەرو کراوە" : "فۆڵۆکردن"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  hasLiked ? "bg-brand/10 border-brand text-brand" : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <ThumbsUp size={16} />
                <span>{likes}</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold transition hover:bg-zinc-800 cursor-pointer"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                <span>{copied ? "کۆپی کرا" : "بڵاوکردنەوە"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <Eye size={14} />
            <span>{video.views || 0} بینین</span>
            <span>•</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {video.description || "هیچ وەسفێک بۆ ئەم ڤیدیۆیە نەکراوە."}
          </p>
        </div>

        {/* Comments Section */}
        <div className="space-y-6 pt-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-brand" />
            <span>کۆمێنتەکان ({comments.length})</span>
          </h3>

          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="کۆمێنتێک بنووسە..."
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm outline-none focus:border-brand text-white"
            />
            <div className="flex justify-end">
              <button type="submit" className="px-5 py-2 rounded-xl bg-brand text-black font-bold text-xs transition hover:bg-brand-hover cursor-pointer">
                ناردنی کۆمێنت
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {comments.map((comment) => {
              const commentUserAvatar = getUserAvatar(comment.username);
              return (
                <div key={comment.id} className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-brand text-black font-bold text-xs flex items-center justify-center shrink-0">
                        {commentUserAvatar ? (
                          <img src={commentUserAvatar} alt={comment.username} className="w-full h-full object-cover" />
                        ) : (
                          comment.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="font-bold text-xs text-brand">@{comment.username}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">{comment.createdAt}</span>
                  </div>
                  <p className="text-sm text-zinc-200 pr-9">{comment.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}