"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export default function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = window.localStorage.getItem("ageVerified");
    if (!accepted) setShow(true);
  }, []);

  const handleYes = () => {
    window.localStorage.setItem("ageVerified", "true");
    setShow(false);
  };

  const handleNo = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 text-center text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20 text-brand shadow-inner">
              <ShieldAlert size={32} />
            </div>

            <h2 id="age-gate-title" className="mb-3 text-2xl font-extrabold tracking-tight text-white">
              پشکنینی تەمەن
            </h2>

            <p className="mb-8 text-sm leading-relaxed text-zinc-400">
              بۆ چوونە ژوورەوە بۆ <span className="text-white font-medium">کوردیش تیوب</span>، تکایە دڵنیابکەرەوە کە تەمەنت ١٨ ساڵ یان زیاترە.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleYes}
                className="flex-1 rounded-xl bg-brand py-3.5 px-4 font-bold text-black transition-all duration-200 hover:bg-brand-hover hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand/10 cursor-pointer text-sm"
              >
                بەڵێ، تەمەنم ١٨ ساڵە یان زیاترە
              </button>

              <button
                onClick={handleNo}
                className="flex-1 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 py-3.5 px-4 font-bold text-zinc-300 hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm"
              >
                نەخێر، بچۆ دەرەوە
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}