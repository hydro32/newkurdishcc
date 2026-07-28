"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { UploadCloud, Film, Trash2, CheckCircle2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function UploadPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [videoDataUrl, setVideoDataUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      
      if (file.size > 10 * 1024 * 1024) {
        alert("ڤیدیۆکە گەورەیە. تکایە ڤیدیۆیەک هەڵبژێرە کە لە ١٠ مێگابایت کەمتر بێت.");
        return;
      }

      setFileName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (previewVideoRef.current && canvasRef.current) {
      const video = previewVideoRef.current;
      video.currentTime = Math.min(1, video.duration / 2);
    }
  };

  const handleSeeked = () => {
    if (previewVideoRef.current && canvasRef.current) {
      const video = previewVideoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setThumbnailUrl(dataUrl);
      }
    }
  };

  const removeSelectedFile = () => {
    setFileName(null);
    setVideoDataUrl(null);
    setThumbnailUrl(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoDataUrl || !title.trim()) {
      alert("تکایە ڤیدیۆ و ناونیشانێک دابین بکە.");
      return;
    }

    setUploading(true);

    const fallbackName = user?.email?.split("@")[0] || "بەکارهێنەر";
    const sessionUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("kurdishtube_session") || "null") : null;
    const username = sessionUser?.username || user?.user_metadata?.username || fallbackName;

    const newVideo = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      videoUrl: videoDataUrl,
      thumbnailUrl: thumbnailUrl || "",
      username,
      duration: "0:00",
      views: 0,
      createdAt: new Date().toISOString()
    };

    try {
      const existingVideosStr = localStorage.getItem("user_uploaded_videos") || "[]";
      const existingVideos = JSON.parse(existingVideosStr);
      const updatedVideos = [newVideo, ...existingVideos];
      
      localStorage.setItem("user_uploaded_videos", JSON.stringify(updatedVideos));
      setUploading(false);
      setSuccessMessage(true);

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      setUploading(false);
      alert("قەبارەی ڤیدیۆکە زۆرە و بۆشایی کۆگا تەواو بوو. تکایە ڤیدیۆیەکی کورتر هەڵبژێرە.");
    }
  };

  return (
    <AppShell>
      <div dir="rtl" className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">⬆️ بڵاوکردنەوەی ڤیدیۆ</h1>

        {successMessage && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-400">
            <CheckCircle2 size={24} />
            <div>
              <p className="font-bold">ڤیدیۆکە بە سەرکەوتوویی بڵاوکرایەوە!</p>
              <p className="text-xs text-emerald-400/80">چاوەڕوان بە، دەگوازرێیتەوە بۆ پەڕەی سەرەکی...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!videoDataUrl ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition ${
                dragging ? "border-brand bg-brand/5" : "border-zinc-700 bg-zinc-950 hover:border-zinc-500"
              }`}
            >
              <UploadCloud size={40} className="text-brand" />
              <p className="font-semibold text-white">
                فایلی ڤیدیۆ ڕابکێشە بۆ ئێرە یان کلیک بکە بۆ هەڵبژاردن
              </p>
              <p className="text-sm text-zinc-500">MP4, MOV — تا ١٠ مێگابایت</p>
              
              <input
                type="file"
                accept="video/*"
                required
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-sm text-brand font-medium truncate max-w-[80%]">
                  <Film size={18} />
                  <span className="truncate">{fileName}</span>
                </div>
                <button
                  type="button"
                  onClick={removeSelectedFile}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition cursor-pointer bg-red-500/10 px-2.5 py-1.5 rounded-lg"
                >
                  <Trash2 size={14} />
                  سڕینەوە
                </button>
              </div>
              
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black border border-zinc-900 flex items-center justify-center">
                <video 
                  ref={previewVideoRef}
                  src={videoDataUrl} 
                  controls 
                  preload="metadata"
                  playsInline
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onSeeked={handleSeeked}
                  className="w-full h-full object-contain"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              ناونیشانی ڤیدیۆ
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ناونیشانێکی ڕوون بنووسە"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 outline-none focus:border-brand text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              وەسف
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="دەربارەی ڤیدیۆکەت بنووسە..."
              className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 p-3 outline-none focus:border-brand text-white"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-lg bg-brand py-3 font-bold text-black transition hover:bg-brand-hover cursor-pointer"
          >
            {uploading ? "خەریکە بڵاودەکرێتەوە..." : "بڵاوکردنەوە"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}