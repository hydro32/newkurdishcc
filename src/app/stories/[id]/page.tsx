"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SingleStoryPage() {
  const params = useParams();
  const id = params?.id as string;

  const [story, setStory] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [comentakan, setComentakan] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyInput, setReplyInput] = useState<{ [key: string]: string }>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [likedCommentKeys, setLikedCommentKeys] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    if (id) {
      fetchStoryAndComments();
    }

    const savedCommentLikes = localStorage.getItem(`liked_comment_keys_${id}`);
    if (savedCommentLikes) {
      setLikedCommentKeys(JSON.parse(savedCommentLikes));
    }
  }, [id]);

  const fetchStoryAndComments = async () => {
    setLoading(true);
    
    let query = supabase.from("chirokakan").select("*");
    if (id.startsWith("index-")) {
      const idx = parseInt(id.replace("index-", ""));
      const { data } = await query;
      if (data && data[idx]) setStory(data[idx]);
    } else {
      const { data } = await query.eq("id", id).single();
      if (data) setStory(data);
    }

    const savedComments = localStorage.getItem(`comentakan_${id}`);
    if (savedComments) {
      setComentakan(JSON.parse(savedComments));
    }

    setLoading(false);
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

    const commentObj = {
      id: Date.now().toString(),
      username,
      content: newComment.trim(),
      likes: 0,
      dislikes: 0,
      replies: []
    };

    const updated = [commentObj, ...comentakan];
    setComentakan(updated);
    localStorage.setItem(`comentakan_${id}`, JSON.stringify(updated));
    setNewComment("");
  };

  const handleLikeComment = (commentId: string, type: 'likes' | 'dislikes') => {
    const actionKey = `${commentId}-${type}`;
    const oppositeType = type === 'likes' ? 'dislikes' : 'likes';
    const oppositeKey = `${commentId}-${oppositeType}`;

    const isAlreadyLiked = likedCommentKeys.includes(actionKey);
    const hasOpposite = likedCommentKeys.includes(oppositeKey);

    let updatedLikedKeys = [...likedCommentKeys];

    const updated = comentakan.map(c => {
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

    setComentakan(updated);
    setLikedCommentKeys(updatedLikedKeys);
    localStorage.setItem(`comentakan_${id}`, JSON.stringify(updated));
    localStorage.setItem(`liked_comment_keys_${id}`, JSON.stringify(updatedLikedKeys));
  };

  const handleAddReply = (commentId: string) => {
    const text = replyInput[commentId];
    if (!text || !text.trim()) return;
    if (!user) {
      alert("تکایە سەرەتا بچۆ ژوورەوە بۆ وەڵامدانەوە.");
      return;
    }

    const fallbackName = user.email?.split("@")[0] || "بەکارهێنەر";
    const username = user.user_metadata?.username || fallbackName;

    const updated = comentakan.map(c => {
      if (c.id === commentId) {
        const replies = c.replies || [];
        return {
          ...c,
          replies: [...replies, { id: Date.now().toString(), username, content: text.trim(), likes: 0 }]
        };
      }
      return c;
    });

    setComentakan(updated);
    localStorage.setItem(`comentakan_${id}`, JSON.stringify(updated));
    setReplyInput({ ...replyInput, [commentId]: "" });
    setActiveReplyBox(null);
  };

  const handleLikeReply = (commentId: string, replyId: string) => {
    const actionKey = `reply-${replyId}-likes`;
    const isAlreadyLiked = likedCommentKeys.includes(actionKey);

    let updatedLikedKeys = [...likedCommentKeys];

    const updated = comentakan.map(c => {
      if (c.id === commentId) {
        const replies = (c.replies || []).map((r: any) => {
          if (r.id === replyId) {
            let currentLikes = r.likes || 0;
            if (isAlreadyLiked) {
              currentLikes = Math.max(0, currentLikes - 1);
              updatedLikedKeys = updatedLikedKeys.filter(k => k !== actionKey);
            } else {
              currentLikes += 1;
              updatedLikedKeys.push(actionKey);
            }
            return { ...r, likes: currentLikes };
          }
          return r;
        });
        return { ...c, replies };
      }
      return c;
    });

    setComentakan(updated);
    setLikedCommentKeys(updatedLikedKeys);
    localStorage.setItem(`comentakan_${id}`, JSON.stringify(updated));
    localStorage.setItem(`liked_comment_keys_${id}`, JSON.stringify(updatedLikedKeys));
  };

  const openReplyBoxWithMention = (commentId: string, targetUsername: string) => {
    setActiveReplyBox(activeReplyBox === commentId ? null : commentId);
    setReplyInput(prev => ({
      ...prev,
      [commentId]: prev[commentId] ? prev[commentId] : `@${targetUsername} `
    }));
  };

  if (loading) {
    return (
      <AppShell>
        <p className="text-center text-zinc-500 py-20">خەریکە بار دەکرێت...</p>
      </AppShell>
    );
  }

  if (!story) {
    return (
      <AppShell>
        <div className="text-center py-20" dir="rtl">
          <p className="text-zinc-400 mb-4">چیرۆکەکە نەدۆزرایەوە.</p>
          <Link href="/stories" className="text-brand underline">گەڕانەوە بۆ پەڕەی چیرۆکەکان</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8" dir="rtl">
        <Link href="/stories" className="text-xs text-zinc-400 hover:text-white transition inline-block">
          ← گەڕانەوە بۆ هەموو چیرۆکەکان
        </Link>

        <article className="rounded-xl bg-zinc-900 p-8 border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{story.title}</h1>
            <span className="text-xs text-brand bg-brand/10 px-3 py-1.5 rounded-lg">
              نووسەر: {story.username || "بەکارهێنەر"}
            </span>
          </div>
          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-base sm:text-lg">{story.excerpt}</p>
        </article>

        <div className="space-y-6 pt-4">
          <h3 className="text-xl font-bold text-white">💬 کۆمێنتەکان ({comentakan.length})</h3>

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
            {comentakan.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-6">هیچ کۆمێنتێک لەم چیرۆکەدا نییە. یەکەم کەس بە!</p>
            ) : (
              comentakan.map((comment) => {
                const isLiked = likedCommentKeys.includes(`${comment.id}-likes`);
                const isDisliked = likedCommentKeys.includes(`${comment.id}-dislikes`);

                return (
                  <div key={comment.id} className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand text-sm">{comment.username}</span>
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
                        {comment.replies.map((reply: any) => {
                          const isReplyLiked = likedCommentKeys.includes(`reply-${reply.id}-likes`);

                          return (
                            <div key={reply.id} className="bg-black/30 p-2.5 rounded-lg text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-brand">{reply.username}</span>
                                <button 
                                  onClick={() => openReplyBoxWithMention(comment.id, reply.username)}
                                  className="text-zinc-400 hover:text-white underline cursor-pointer"
                                >
                                  وەڵامدانەوە
                                </button>
                              </div>
                              <p className="text-zinc-300">{reply.content}</p>
                              <div className="flex items-center gap-3 pt-1">
                                <button 
                                  onClick={() => handleLikeReply(comment.id, reply.id)}
                                  className={`flex items-center gap-1 cursor-pointer transition ${isReplyLiked ? "text-brand font-bold" : "text-zinc-400 hover:text-brand"}`}
                                >
                                  👍 {reply.likes || 0}
                                </button>
                              </div>
                            </div>
                          );
                        })}
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
                          onClick={() => handleAddReply(comment.id)}
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