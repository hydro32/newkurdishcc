"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-white"
          >
            <h1 className="mb-4 text-4xl">🔞</h1>

            <h2 id="age-gate-title" className="mb-4 text-2xl font-bold">
              ئایا تۆ سەرووی ١٨ ساڵیت؟
            </h2>

            <p className="mb-8 text-zinc-400">
              بۆ چوونە ژوورەوەی کوردیش تیوب، پێویستە تەمەنت ١٨ ساڵ یان زیاتر بێت.
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleYes}
                className="flex-1 rounded-lg bg-brand py-3 font-bold text-black transition hover:bg-brand-hover"
              >
                بەڵێ، تەمەنم زیاترە
              </button>

              <button
                onClick={handleNo}
                className="flex-1 rounded-lg bg-zinc-700 py-3 font-bold text-white transition hover:bg-zinc-600"
              >
                نەخێر
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
