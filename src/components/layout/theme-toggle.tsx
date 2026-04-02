"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex bg-[#F8F9FA] dark:bg-white/5 p-1.5 rounded-2xl border border-[#E9ECEF] dark:border-white/10 w-full group overflow-hidden">
            <button 
                onClick={() => setTheme("light")}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-500",
                    theme === "light" ? "bg-white text-primary shadow-lg shadow-black/5" : "text-zinc-400 hover:text-zinc-600"
                )}
            >
                <Sun className={cn("w-4 h-4", theme === "light" && "animate-spin-slow")} />
                <span className="text-[10px] font-black uppercase tracking-widest">Clair</span>
            </button>
            <button 
                onClick={() => setTheme("dark")}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-500",
                    theme === "dark" ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                )}
            >
                <Moon className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Sombre</span>
            </button>
        </div>
    );
}
