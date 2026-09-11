"use client";

import { useSpace } from "@/components/providers/space-provider";
import { BookOpen, GraduationCap, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export function SpaceSwitcher({ compact = false }: { compact?: boolean }) {
    const { activeSpace, setActiveSpace, toggleSpace } = useSpace();

    const isDaara = activeSpace === "daara";

    return (
        <div className="relative flex items-center bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-1 shadow-lg">
            
            {/* TOGGLE BUTTONS */}
            <button
                type="button"
                onClick={() => setActiveSpace("daara")}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    isDaara
                        ? "text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                }`}
            >
                {isDaara && (
                    <motion.div
                        layoutId="space-pill"
                        className="absolute inset-0 bg-emerald-600 rounded-xl"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                    <img 
                        src="/logo-daara-ibnoul-khayim.png" 
                        alt="Daara" 
                        className="h-5 w-5 object-contain rounded-full bg-white/10 p-0.5" 
                    />
                    {!compact && <span>Espace Daara</span>}
                </span>
            </button>

            <button
                type="button"
                onClick={() => setActiveSpace("school")}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    !isDaara
                        ? "text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                }`}
            >
                {!isDaara && (
                    <motion.div
                        layoutId="space-pill"
                        className="absolute inset-0 bg-amber-600 rounded-xl"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                    <img 
                        src="/logo-pathe-pogne.png" 
                        alt="École Pathé Pogne" 
                        className="h-5 w-5 object-contain rounded-full bg-white/10 p-0.5" 
                    />
                    {!compact && <span>École Pathé Pogne</span>}
                </span>
            </button>

        </div>
    );
}
