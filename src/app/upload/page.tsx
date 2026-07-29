"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { UploadCloud, Film, Trash2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

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

const saveVideoToIDB = async (id: string, file: File): Promise<string> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("videos", "readwrite");
    const store = transaction.objectStore("videos");
    const request = store.put(file, id);
    request.onsuccess = () => resolve(URL.createObjectURL(file));
    request.onerror = () => reject(request.error);
  });
};

export default function UploadPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);

  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    async function verifyAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    }
    verifyAuth();
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      
      if (file.size > 1024 * 1024 * 1024) {
        alert("ڤیدیۆکە زۆر گەورەیە. تکایە ڤیدیۆیەک هەڵبژێرە کە لە ١ گیگابایت کەمتر بێت.");
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);
      
      const previewUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(previewUrl);
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
    setSelectedFile(null);
    setFileName(null);
    setVideoPreviewUrl(null);
    setThumbnailUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      setIsAuthenticated(false);
      return;
    }

    if (!selectedFile || !title.trim()) {
      alert("تکایە ڤیدیۆ و ناونیشانێک دابین بکە.");
      return;
    }

    setUploading(true);
    setUploadProgress("خەریکە ڤیدیۆکە لە بیرگەی گەورەدا پاشەکەوت دەکرێت...");

    try {
      const videoId = Date.now().toString();
      await saveVideoToIDB(videoId, selectedFile);

      const user = session.user;
      
      // Prioritize local session storage so the newly updated/renamed username is used instantly
      const sessionUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("kurdishtube_session") || "{}") : null;
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      const fallbackName = user.email?.split("@")[0] || "بەکارهێنەر";
      const username = sessionUser?.username || profileData?.username || user.user_metadata?.username || fallbackName;

      const newVideo = {
        id: videoId,
        title: title.trim(),
        description: description.trim(),
        thumbnailUrl: thumbnailUrl || "",
        username,
        userId: user.id, // Explicitly saved so you can always access/delete it securely
        duration: "0:00",
        views: 0,
        createdAt: new Date().toISOString()
      };

      const existingVideosStr = localStorage.getItem("user_uploaded_videos") || "[]";
      const existingVideos = JSON.parse(existingVideosStr);
      const updatedVideos = [newVideo, ...existingVideos];
      
      localStorage.setItem("user_uploaded_videos", JSON.stringify(updatedVideos));
      
      setUploading(false);
      setSuccessMessage(true);

      setTimeout(() => {
        router.push("/");
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setUploading(false);
      alert("هەڵە ڕوویدا لە پاشەکەوتکردنی ڤیدیۆکە.");
    }
  };

  if (isAuthenticated === null) {
    return (
      <AppShell>
        <div dir="rtl" className="max-w-2xl mx-auto flex items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-brand" size={32} />
        </div>
      </AppShell>
    );
  }

  if (isAuthenticated === false) {
    return (
      <AppShell>
        <div dir="rtl" className="max-w-md mx-auto mt-16 p-8 rounded-2xl border border-zinc-800 bg-zinc-950 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">پێویستە چوونەژوورەوە ئەنجام بدەیت</h1>
            <p className="text-zinc-400 text-sm">
              بۆ ئەوەی بتوانیت ڤیدیۆ بڵاوبکەیتەوە و ببیتە خاوەنی کەناڵی خۆت، تکایە سەرەتا هه‌ژمارەکەت بەکاربهێنە.
            </p>
          </div>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand font-bold text-black hover:bg-brand-hover transition cursor-pointer"
          >
            گەڕانەوە بۆ پەڕەی سەرەکی
          </Link>
        </div>
      </AppShell>
    );
  }

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
          {!videoPreviewUrl ? (
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
              <p className="text-sm text-zinc-500">MP4, MOV — تا ١ گیگابایت (پاڵپشتی فایلی گەورە)</p>
              
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
                  disabled={uploading}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition cursor-pointer bg-red-500/10 px-2.5 py-1.5 rounded-lg"
                >
                  <Trash2 size={14} />
                  سڕینەوە
                </button>
              </div>
              
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black border border-zinc-900 flex items-center justify-center">
                <video 
                  ref={previewVideoRef}
                  src={videoPreviewUrl} 
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
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand py-3 font-bold text-black transition hover:bg-brand-hover cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>{uploadProgress}</span>
              </>
            ) : (
              "بڵاوکردنەوە"
            )}
          </button>
        </form>
      </div>
    </AppShell>
  );
}