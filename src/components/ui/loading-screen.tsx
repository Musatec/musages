"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Moon, GraduationCap, ShieldCheck } from "lucide-react";

interface DaaraLoadingScreenProps {
  message?: string;
  submessage?: string;
  showQuote?: boolean;
  fullScreen?: boolean;
}

const HADITHS_AND_QUOTES = [
  {
    ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    fr: "« Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne. »",
    ref: "Rapporté par Al-Bukhari"
  },
  {
    ar: "وَقُلْ رَبِّ زِدْنِي عِلْمًا",
    fr: "« Et dis : Ô mon Seigneur, augmente mes connaissances. »",
    ref: "Sourate Taha (20:114)"
  },
  {
    ar: "إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ",
    fr: "« Parmi Ses serviteurs, seuls les savants craignent Allah. »",
    ref: "Sourate Fatir (35:28)"
  },
  {
    ar: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    fr: "« Celui qui emprunte un chemin à la recherche de la science, Allah lui facilite un chemin vers le Paradis. »",
    ref: "Rapporté par Muslim"
  }
];

export function DaaraLoadingScreen({
  message = "Chargement de l'Espace Daara...",
  submessage = "Espace Daara • Ibnoul Khayim Al Diawziya",
  showQuote = true,
  fullScreen = true,
}: DaaraLoadingScreenProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (!showQuote) return;
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % HADITHS_AND_QUOTES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [showQuote]);

  const currentQuote = HADITHS_AND_QUOTES[quoteIndex];

  return (
    <div
      className={`${
        fullScreen
          ? "fixed inset-0 z-[99999]"
          : "relative w-full h-full min-h-[450px]"
      } flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#061e14] via-[#0c3322] to-[#04140d] text-white select-none`}
    >
      {/* Background Decorative Ambient Lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-Right Emerald Glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] animate-pulse" />
        {/* Bottom-Left Golden Amber Glow */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
        {/* Central Radial Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Main Glass Center Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6 py-8 mx-auto text-center">
        
        {/* Core Animated Emblem */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Outer Glowing Rotating Ring */}
          <motion.div
            className="absolute w-28 h-28 rounded-full border-2 border-dashed border-emerald-400/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          />

          {/* Reverse Secondary Ring */}
          <motion.div
            className="absolute w-36 h-36 rounded-full border border-amber-400/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          />

          {/* Soft Blur Glow Behind Badge */}
          <div className="absolute w-24 h-24 bg-emerald-500/30 rounded-3xl blur-xl animate-pulse" />

          {/* Emblem Box */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
            className="relative z-10 w-24 h-24 bg-gradient-to-b from-[#114b32] to-[#072418] border border-emerald-400/40 rounded-3xl shadow-2xl flex flex-col items-center justify-center group overflow-hidden"
          >
            {/* Shimmer effect inside icon box */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
              animate={{ translateX: ["100%", "-100%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <BookOpen className="w-10 h-10 text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)] mb-0.5" />
            <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute top-2 right-2 animate-bounce" />
          </motion.div>
        </div>

        {/* Branding & Titles */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-2 mb-6"
        >
          {/* Calligraphic Arabic Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-emerald-200 to-amber-100 font-arabic tracking-wide drop-shadow-sm">
            دار ابن القيم الجوزية
          </h1>

          <p className="text-xs uppercase font-bold tracking-[0.25em] text-emerald-300/80">
            {submessage}
          </p>
        </motion.div>

        {/* Progress Shimmer Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full max-w-xs space-y-3 mb-8"
        >
          <div className="relative h-1.5 w-full bg-emerald-950/80 border border-emerald-800/40 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-300 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"
              animate={{
                left: ["0%", "100%"],
                width: ["20%", "40%", "20%"],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <p className="text-xs text-emerald-200/70 font-medium flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{message}</span>
          </p>
        </motion.div>

        {/* Spiritual Hadith/Quote Carousel Card */}
        {showQuote && (
          <div className="w-full h-28 relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-white/5 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-center items-center shadow-lg"
              >
                <p className="text-sm font-arabic font-semibold text-amber-200/90 mb-1 line-clamp-1" dir="rtl">
                  {currentQuote.ar}
                </p>
                <p className="text-xs text-emerald-100/90 italic font-sans line-clamp-2 px-2">
                  {currentQuote.fr}
                </p>
                <span className="text-[10px] text-emerald-400/60 font-mono uppercase mt-1">
                  {currentQuote.ref}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer Branding Badge */}
      <div className="absolute bottom-6 flex items-center gap-2 text-[11px] text-emerald-400/40 font-mono tracking-widest uppercase">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
        <span>Espace Daara • Plateforme Sécurisée</span>
      </div>
    </div>
  );
}
