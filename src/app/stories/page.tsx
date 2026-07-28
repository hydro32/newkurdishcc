"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Story {
  id?: string;
  title: string;
  excerpt: string;
  likes: number;
  comments: number;
  username: string;
  [key: string]: any;
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [likedStories, setLikedStories] = useState<string[]>([]);
  const [processingLikes, setProcessingLikes] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const savedLikes = localStorage.getItem("chirok_liked_titles");
    if (savedLikes) {
      setLikedStories(JSON.parse(savedLikes));
    }

    fetchStories();
    return () => subscription.unsubscribe();
  }, []);

  const fetchStories = async () => {
    const { data, error } = await supabase.from("chirokakan").select("*");
    if (error) {
      console.error("Error fetching stories:", error.message);
    } else if (data) {
      setStories(data);
    }
  };

  const handleToggleLike = async (story: Story) => {
    const storyKey = story.title.trim();
    
    if (processingLikes[storyKey]) return;
    setProcessingLikes((prev) => ({ ...prev, [storyKey]: true }));

    const savedLikesStr = localStorage.getItem("chirok_liked_titles") || "[]";
    const currentLikedList: string[] = JSON.parse(savedLikesStr);
    const isAlreadyLiked = currentLikedList.includes(storyKey);
    
    const currentLikes = Number(story.likes) || 0;
    const updatedLikes = isAlreadyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    let newLikedList: string[];
    if (isAlreadyLiked) {
      newLikedList = currentLikedList.filter((t) => t !== storyKey);
    } else {
      newLikedList = [...currentLikedList, storyKey];
    }

    localStorage.setItem("chirok_liked_titles", JSON.stringify(newLikedList));
    setLikedStories(newLikedList);

    setStories((prev) =>
      prev.map((s) => (s.title.trim() === storyKey ? { ...s, likes: updatedLikes } : s))
    );

    const { error } = await supabase
      .from("chirokakan")
      .update({ likes: updatedLikes })
      .eq("title", story.title);

    if (error) {
      console.error("Failed to update database likes:", error.message);
    }

    setProcessingLikes((prev) => ({ ...prev, [storyKey]: false }));
  };

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (!user) {
      alert("ببوورە! پێویستە سەرەتا بچیتە ژوورەوە بۆ نووسینی چیرۆک.");
      return;
    }

    setIsSubmitting(true);
    const fallbackName = user.email?.split("@")[0] || "بەکارهێنەر";
    const username = user.user_metadata?.username || fallbackName;

    const newStoryData = {
      title: title.trim(),
      excerpt: content.trim(),
      username: username,
      likes: 0,
      comments: 0,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from("chirokakan")
      .insert([newStoryData])
      .select();

    setIsSubmitting(false);

    if (error) {
      alert("کێشەیەک ڕوویدا: " + error.message);
    } else {
      setTitle("");
      setContent("");
      setShowModal(false);
      
      if (data && data.length > 0) {
        setStories((prev) => [data[0], ...prev]);
      } else {
        fetchStories();
      }
    }
  };

  return (
    <AppShell>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold">📖 چیرۆکەکان</h1>

        {user ? (
          <button 
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto rounded-lg bg-brand px-6 py-3 font-bold text-black transition hover:bg-brand-hover text-center cursor-pointer"
          >
            + چیرۆکی نوێ
          </button>
        ) : (
          <span className="text-xs sm:text-sm text-zinc-400 bg-zinc-900 px-4 py-2 rounded-lg text-center w-full sm:w-auto">
            سەرەتا بچۆ ژوورەوە بۆ بڵاوکردنەوەی چیرۆک
          </span>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-right" dir="rtl">
            <h2 className="text-2xl font-bold text-white mb-4">بڵاوکردنەوەی چیرۆکی نوێ</h2>
            
            <form onSubmit={handleSubmitStory} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">ناونیشانی چیرۆک</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ناونیشانێک بنووسە..."
                  required
                  className="w-full rounded-lg border border-zinc-800 bg-black p-3 text-white outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">ناوەڕۆکی چیرۆک</label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="چیرۆکەکەت لێرەدا بنووسە..."
                  required
                  className="w-full rounded-lg border border-zinc-800 bg-black p-3 text-white outline-none focus:border-brand resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-brand px-5 py-2 font-bold text-black hover:bg-brand-hover disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "خەریکە دەنێردرێت..." : "بڵاوکردنەوە"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {stories.length === 0 ? (
          <p className="text-center text-zinc-500 py-12">هیچ چیرۆکێک لێرەدا نییە. ببە بە یەکەم کەس و چیرۆکێک بنووسە!</p>
        ) : (
          stories.map((story, index) => {
            const storyKey = story.title.trim();
            const isLiked = likedStories.includes(storyKey);
            const detailRoute = story.id ? `/stories/${story.id}` : `/stories/index-${index}`;

            return (
              <article key={story.id || index} className="rounded-xl bg-zinc-900 p-6 text-right" dir="rtl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-800 pb-2 mb-3 gap-2">
                  <h2 className="text-xl font-bold text-white">{story.title}</h2>
                  <span className="text-xs text-brand bg-brand/10 px-2 py-1 rounded">
                    نووسەر: {story.username || "بەکارهێنەر"}
                  </span>
                </div>

                <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">{story.excerpt}</p>

                <div className="mt-5 flex gap-6 text-sm text-zinc-400 justify-start items-center">
                  <button
                    onClick={() => handleToggleLike(story)}
                    className={`transition flex items-center gap-1 px-3 py-1.5 rounded-lg border cursor-pointer select-none touch-manipulation ${
                      isLiked
                        ? "border-brand text-brand bg-brand/10 font-bold"
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                    }`}
                  >
                    {isLiked ? "❤️ دڵخوازکراوە" : "🤍 لایک"} ({story.likes || 0})
                  </button>

                  <Link
                    href={detailRoute}
                    className="transition hover:text-brand flex items-center gap-1 text-zinc-400 underline cursor-pointer"
                  >
                    💬 کۆمێنتەکان (Comentakan)
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </div>
    </AppShell>
  );
}