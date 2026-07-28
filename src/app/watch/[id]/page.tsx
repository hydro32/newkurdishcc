"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { UserPlus, UserCheck, Eye, Play } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function WatchPage() {
  const params = useParams();
  const id = params?.id as string;

  const [video, setVideo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyInput, setReplyInput] = useState<{ [key: string]: string }>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  const [likedCommentKeys, setLikedCommentKeys] = useState<string[]>([]);
  
  const [videoLikes, setVideoLikes] = useState(0);
  const [videoDislikes, setVideoDislikes] = useState(0);
  const [videoAction, setVideoAction] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    if (id) {
      const savedVideos = localStorage.getItem("user_uploaded_videos");
      if (savedVideos) {
        const list = JSON.parse(savedVideos);
        const found = list.find((v: any) => v.id === id);
        if (found) {
          const viewedKey = `viewed_video_${id}`;
          let currentViews = found.views || 0;
          
          if (!sessionStorage.getItem(viewedKey)) {
            currentViews += 1;
            sessionStorage.setItem(viewedKey, "true");
            
            const updatedList = list.map((v: any) => v.id === id ? { ...v, views: currentViews } : v);
            localStorage.setItem("user_uploaded_videos", JSON.stringify(updatedList));
          }

          setVideo({ ...found, views: currentViews });
          setViewCount(currentViews);

          if (found.username) {
            const allFollows = JSON.parse(localStorage.getItem("user_follows") || "{}");
            const userFollowers = allFollows[found.username] || [];
            setFollowersCount(userFollowers.length);

            const sessionUser = JSON.parse(localStorage.getItem("kurdishtube_session") || "null");
            if (sessionUser?.username && userFollowers.includes(sessionUser.username)) {
              setIsFollowing(true);
            }
          }
        }
      }

      const savedComments = localStorage.getItem(`video_comments_${id}`);
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      }

      const savedLikes = localStorage.getItem(`video_likes_${id}`);
      if (savedLikes) {
        setLikedCommentKeys(JSON.parse(savedLikes));
      }

      const savedRatings = localStorage.getItem(`video_ratings_${id}`);
      if (savedRatings) {
        const parsed = JSON.parse(savedRatings);
        setVideoLikes(parsed.likes || 0);
        setVideoDislikes(parsed.dislikes || 0);
        setVideoAction(parsed.action || null);
      }
    }
  }, [id]);

  const handleLoadedMetadata = () => {
    if (videoRef.current && video) {
      const actualDurationSec = videoRef.current.duration;
      if (!isNaN(actualDurationSec) && isFinite(actualDurationSec) && actualDurationSec > 0) {
        const mins = Math.floor(actualDurationSec / 60);
        const secs = Math.floor(actualDurationSec % 60);
        const formattedDuration = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        if (video.duration !== formattedDuration) {
          const updatedVideo = { ...video, duration: formattedDuration };
          setVideo(updatedVideo);

          const savedVideos = localStorage.getItem("user_uploaded_videos");
          if (savedVideos) {
            const list = JSON.parse(savedVideos);
            const updatedList = list.map((v: any) => v.id === id ? { ...v, duration: formattedDuration } : v);
            localStorage.setItem("user_uploaded_videos", JSON.stringify(updatedList));
          }
        }
      }
    }
  };

  const toggleFollow = () => {
    if (!video?.username) return;

    const fallbackName = user?.email?.split("@")[0] || "";
    const sessionUser = JSON.parse(localStorage.getItem("kurdishtube_session") || "null");
    const myName = sessionUser?.username || user?.user_metadata?.username || fallbackName;

    if (!myName) {
      alert("تکایە سەرەتا چوونەژوورەوە ئەنجام بدە بۆ فۆڵۆکردن.");
      return;
    }

    const allFollows = JSON.parse(localStorage.getItem("user_follows") || "{}");
    let userFollowers = allFollows[video.username] || [];

    if (isFollowing) {
      userFollowers = userFollowers.filter((u: string) => u !== myName);
      setIsFollowing(false);
      setFollowersCount((prev) => Math.max(0, prev - 1));
    } else {
      userFollowers.push(myName);
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
    }

    allFollows[video.username] = userFollowers;
    localStorage.setItem("user_follows", JSON.stringify(allFollows));
  };

  const sendNotification = (targetUsername: string, message: string) => {
    if (!targetUsername) return;
    const existingNotifsStr = localStorage.getItem(`notifications_${targetUsername}`) || "[]";
    const existingNotifs = JSON.parse(existingNotifsStr);
    
    const newNotif = {
      message,
      time: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    localStorage.setItem(`notifications_${targetUsername}`, JSON.stringify([newNotif, ...existingNotifs]));
  };

  const handleVideoRating = (type: 'likes' | 'dislikes') => {
    let newLikes = videoLikes;
    let newDislikes = videoDislikes;
    let newAction = videoAction;

    if (videoAction === type) {
      if (type === 'likes') newLikes = Math.max(0, newLikes - 1);
      if (type === 'dislikes') newDislikes = Math.max(0, newDislikes - 1);
      newAction = null;
    } else {
      if (type === 'likes') {
        newLikes += 1;
        if (videoAction === 'dislikes') newDislikes = Math.max(0, newDislikes - 1);
      } else {
        newDislikes += 1;
        if (videoAction === 'likes') newLikes = Math.max(0, newLikes - 1);
      }
      newAction = type;
    }

    setVideoLikes(newLikes);
    setVideoDislikes(newDislikes);
    setVideoAction(newAction);
    localStorage.setItem(`video_ratings_${id}`, JSON.stringify({ likes: newLikes, dislikes: newDislikes, action: newAction }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      alert("تکایە سەرەتا بچۆ ژوورەوە بۆ نووسینی کۆمێنت.");
      return;
    }

    const fallbackName = user.email?.split("@")[0] || "بەکارهێنەر";
    const username = user.user_metadata?.username || fallbackName;

    if (video && video.username && video.username !== username) {
      sendNotification(video.username, `${username} کۆمێنتێکی لەسەر ڤیدیۆکەت نووسی: "${video.title}"`);
    }

    const commentObj = {
      id: Date.now().toString(),
      username,
      content: newComment.trim(),
      likes: 0,
      dislikes: 0,
      replies: []
    };

    const updated = [commentObj, ...comments];
    setComments(updated);
    localStorage.setItem(`video_comments_${id}`, JSON.stringify(updated));
    setNewComment("");
  };

  const handleLikeComment = (commentId: string, type: 'likes' | 'dislikes') => {
    const actionKey = `${commentId}-${type}`;
    const oppositeType = type === 'likes' ? 'dislikes' : 'likes';
    const oppositeKey = `${commentId}-${oppositeType}`;

    const isAlreadyLiked = likedCommentKeys.includes(actionKey);
    const hasOpposite = likedCommentKeys.includes(oppositeKey);

    let updatedLikedKeys = [...likedCommentKeys];

    const updated = comments.map(c => {
      if (c.id === commentId) {
        let currentLikes = c.likes || 0;
        let currentDislikes = c.dislikes || 0;

        if (isAlreadyLiked) {
          if (type === 'likes') currentLikes = Math.max(0, currentLikes - 1);
          if (type === 'dislikes') currentDislikes = Math.max(0, currentDislikes - 1);
          updatedLikedKeys = updatedLikedKeys.filter(k => k !== actionKey);
        } else {
          if (type === 'likes') currentLikes += 1;
          if (type === 'dislikes') currentDislikes += 1;
          updatedLikedKeys.push(actionKey);

          if (hasOpposite) {
            if (oppositeType === 'likes') currentLikes = Math.max(0, currentLikes - 1);
            if (oppositeType === 'dislikes') currentDislikes = Math.max(0, currentDislikes - 1);
            updatedLikedKeys = updatedLikedKeys.filter(k => k !== oppositeKey);
          }
        }

        return { ...c, likes: currentLikes, dislikes: currentDislikes };
      }
      return c;
    });

    setComments(updated);
    setLikedCommentKeys(updatedLikedKeys);
    localStorage.setItem(`video_comments_${id}`, JSON.stringify(updated));
    localStorage.setItem(`video_likes_${id}`, JSON.stringify(updatedLikedKeys));
  };

  const handleAddReply = (commentId: string, targetUsername: string) => {
    const text = replyInput[commentId];
    if (!text || !text.trim()) return;
    if (!user) {
      alert("تکایە سەرەتا بچۆ ژوورەوە بۆ وەڵامدانەوە.");
      return;
    }

    const fallbackName = user.email?.split("@")[0] || "بەکارهێنەر";
    const username = user.user_metadata?.username || fallbackName;

    if (targetUsername && targetUsername !== username) {
      sendNotification(targetUsername, `${username} وەڵامی کۆمێنتەکەتیدایەوە.`);
    }

    const updated = comments.map(c => {
      if (c.id === commentId) {
        const replies = c.replies || [];
        return {
          ...c,
          replies: [...replies, { id: Date.now().toString(), username, content: text.trim(), likes: 0 }]
        };
      }
      return c;
    });

    setComments(updated);
    localStorage.setItem(`video_comments_${id}`, JSON.stringify(updated));
    setReplyInput({ ...replyInput, [commentId]: "" });
    setActiveReplyBox(null);
  };

  const openReplyBoxWithMention = (commentId: string, targetUsername: string) => {
    setActiveReplyBox(activeReplyBox === commentId ? null : commentId);
    setReplyInput(prev => ({
      ...prev,
      [commentId]: prev[commentId] ? prev[commentId] : `@${targetUsername} `
    }));
  };

  if (!video) {
    return (
      <AppShell>
        <div className="text-center py-20" dir="rtl">
          <p className="text-zinc-400 mb-4">ڤیدیۆکە نەدۆزرایەوە.</p>
          <Link href="/" className="text-brand underline font-bold">گەڕانەوە بۆ پەڕەی سەرەکی</Link>
        </div>
      </AppShell>
    );
  }

  const authorInitial = (video.username || "ب").charAt(0).toUpperCase();
  const sessionUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("kurdishtube_session") || "null") : null;
  const myCurrentUsername = sessionUser?.username || user?.user_metadata?.username;
  const isMyVideo = myCurrentUsername === video.username;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
        <Link href="/" className="text-xs text-zinc-400 hover:text-white transition inline-block">
          ← گەڕانەوە بۆ پەڕەی سەرەکی
        </Link>

        <div className="space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-zinc-800 shadow-2xl flex items-center justify-center">
            {video.videoUrl ? (
              <>
                <video 
                  ref={videoRef}
                  key={video.id}
                  src={video.videoUrl} 
                  controls 
                  preload="metadata"
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onLoadedMetadata={handleLoadedMetadata}
                  className="w-full h-full object-contain"
                >
                  وێبگەڕی تۆ پشتگیری لێدانی ڤیدیۆ ناکات.
                </video>

                {video.thumbnailUrl && !isPlaying && (
                  <div 
                    className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-black"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.play();
                        setIsPlaying(true);
                      }
                    }}
                  >
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute w-16 h-16 rounded-full bg-brand text-black flex items-center justify-center shadow-lg hover:scale-110 transition">
                      <Play size={28} className="fill-black ml-0.5" />
                    </div>
                  </div>
                )}
              </>
            ) : video.thumbnailUrl ? (
              <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
            ) : (
              <p className="text-zinc-500 text-sm">ڤیدیۆکە بەردەست نییە</p>
            )}
          </div>

          <div className="space-y-3 bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{video.title}</h1>
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs bg-black/40 px-3 py-1.5 rounded-lg w-fit border border-zinc-800">
                <Eye size={14} />
                <span>{viewCount} بینین</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-4">
              <div className="flex items-center gap-4">
                <Link 
                  href={`/profile/${encodeURIComponent(video.username)}`}
                  className="flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-brand text-black font-bold text-base flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition">
                    {authorInitial}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-brand transition">@{video.username}</h4>
                    <span className="text-[11px] text-zinc-400">{followersCount} فۆڵۆوەرز</span>
                  </div>
                </Link>

                {!isMyVideo && (
                  <button
                    onClick={toggleFollow}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow ${
                      isFollowing 
                        ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700" 
                        : "bg-brand text-black hover:bg-brand-hover"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={16} />
                        فۆڵۆوەد
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        فۆڵۆ
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center bg-black/40 border border-zinc-800 rounded-xl overflow-hidden text-xs">
                <button 
                  onClick={() => handleVideoRating('likes')} 
                  className={`flex items-center gap-1.5 px-4 py-2 transition cursor-pointer border-l border-zinc-800 ${videoAction === 'likes' ? 'text-brand font-bold bg-brand/10' : 'text-zinc-300 hover:text-white'}`}
                >
                  👍 {videoLikes}
                </button>
                <button 
                  onClick={() => handleVideoRating('dislikes')} 
                  className={`flex items-center gap-1.5 px-4 py-2 transition cursor-pointer ${videoAction === 'dislikes' ? 'text-red-400 font-bold bg-red-500/10' : 'text-zinc-300 hover:text-white'}`}
                >
                  👎 {videoDislikes}
                </button>
              </div>
            </div>

            {video.description && (
              <div className="bg-black/30 p-3.5 rounded-xl text-xs sm:text-sm text-zinc-300 mt-3 whitespace-pre-wrap">
                {video.description}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <h3 className="text-xl font-bold text-white">💬 کۆمێنتەکان ({comments.length})</h3>

          <form onSubmit={handleAddComment} className="space-y-3 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="کۆمێنتەکەت لێرە بنووسە..."
              required
              className="w-full rounded-lg border border-zinc-800 bg-black p-3 text-sm text-white outline-none focus:border-brand resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-brand px-5 py-2 text-sm font-bold text-black hover:bg-brand-hover cursor-pointer"
              >
                ناردنی کۆمێنت
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-6">هیچ کۆمێنتێک لەم ڤیدیۆیەدا نییە. یەکەم کەس بە!</p>
            ) : (
              comments.map((comment) => {
                const isLiked = likedCommentKeys.includes(`${comment.id}-likes`);
                const isDisliked = likedCommentKeys.includes(`${comment.id}-dislikes`);

                return (
                  <div key={comment.id} className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <Link href={`/profile/${encodeURIComponent(comment.username)}`} className="font-bold text-brand text-sm hover:underline">
                        {comment.username}
                      </Link>
                    </div>
                    <p className="text-zinc-300 text-sm">{comment.content}</p>

                    <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
                      <button 
                        onClick={() => handleLikeComment(comment.id, 'likes')} 
                        className={`flex items-center gap-1 cursor-pointer transition ${isLiked ? "text-brand font-bold" : "hover:text-brand"}`}
                      >
                        👍 {comment.likes || 0}
                      </button>
                      <button 
                        onClick={() => handleLikeComment(comment.id, 'dislikes')} 
                        className={`flex items-center gap-1 cursor-pointer transition ${isDisliked ? "text-red-400 font-bold" : "hover:text-red-400"}`}
                      >
                        👎 {comment.dislikes || 0}
                      </button>
                      <button 
                        onClick={() => openReplyBoxWithMention(comment.id, comment.username)} 
                        className="hover:text-white underline cursor-pointer"
                      >
                        وەڵامدانەوە
                      </button>
                    </div>

                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mr-6 mt-3 space-y-2 border-r-2 border-zinc-800 pr-3">
                        {comment.replies.map((reply: any) => (
                          <div key={reply.id} className="bg-black/30 p-2.5 rounded-lg text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Link href={`/profile/${encodeURIComponent(reply.username)}`} className="font-bold text-brand hover:underline">
                                {reply.username}
                              </Link>
                            </div>
                            <p className="text-zinc-300">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeReplyBox === comment.id && (
                      <div className="mr-6 mt-3 flex gap-2">
                        <input
                          type="text"
                          value={replyInput[comment.id] || ""}
                          onChange={(e) => setReplyInput({ ...replyInput, [comment.id]: e.target.value })}
                          placeholder="وەڵامەکەت بنووسە..."
                          className="flex-1 rounded-lg border border-zinc-800 bg-black px-3 py-1.5 text-xs text-white outline-none focus:border-brand"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddReply(comment.id, comment.username)}
                          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-700 cursor-pointer"
                        >
                          ناردن
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}