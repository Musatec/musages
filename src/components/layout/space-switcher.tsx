"use client";

import { useSpace } from "@/components/providers/space-provider";
import { BookOpen, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export function SpaceSwitcher({ compact = false }: { compact?: boolean }) {
    const { activeSpace, setActiveSpace } = useSpace();
    const isDaara = activeSpace === "daara";

    return (
        <div className="relative flex shrink-0 items-center gap-1 rounded-2xl border-2 border-border bg-card p-1 shadow-sm">
            <button
                type="button"
                onClick={() => setActiveSpace("daara")}
                aria-pressed={isDaara}
                aria-label="Espace Daara Ibnoul Khayim"
                title="Espace Daara Ibnoul Khayim"
                className={`relative flex h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-bold transition-all ${
                    isDaara
                        ? "text-white shadow-sm ring-2 ring-emerald-500/30"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
            >
                {isDaara && (
                    <motion.span
                        layoutId="space-pill"
                        className="absolute inset-0 rounded-xl bg-[#0C5A34] shadow-sm"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                )}
                <span className="relative z-10 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="flex items-center gap-1.5">
                        <span>Espace Daara</span>
                        {isDaara && (
                            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                        )}
                    </span>
                </span>
            </button>
            <button
                type="button"
                onClick={() => setActiveSpace("school")}
                aria-pressed={!isDaara}
                aria-label="École Pathé Pogne"
                title="École Pathé Pogne"
                className={`relative flex h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-bold transition-all ${
                    !isDaara
                        ? "text-white shadow-sm ring-2 ring-amber-500/30"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
            >
                {!isDaara && (
                    <motion.span
                        layoutId="space-pill"
                        className="absolute inset-0 rounded-xl bg-[#D4AF37] text-slate-950 shadow-sm"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                )}
                <span className={`relative z-10 flex items-center gap-2 ${!isDaara ? "text-slate-950 font-black" : ""}`}>
                    <GraduationCap className="h-4 w-4" />
                    <span className="flex items-center gap-1.5">
                        <span>École Pathé Pogne</span>
                        {!isDaara && (
                            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-amber-900 animate-pulse" />
                        )}
                    </span>
                </span>
            </button>
        </div>
    );
}
