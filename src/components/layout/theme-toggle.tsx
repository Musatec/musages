"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ collapsed }: { collapsed?: boolean }) {
    const { theme, setTheme } = useTheme();

    return (
        <div 
            className={cn(
                "flex bg-black/5 dark:bg-black/5 p-1 rounded-2xl border border-black/10 dark:border-black/10 transition-all duration-500",
                collapsed ? "w-10 flex-col gap-1" : "w-full"
            )} 
            style={{ backgroundColor: 'hsla(var(--sidebar-foreground) / 0.05)', borderColor: 'hsla(var(--sidebar-foreground) / 0.1)' }}
        >
            <button 
                onClick={() => setTheme("light")}
                className={cn(
                    "flex items-center justify-center py-2 rounded-xl transition-all duration-500 relative",
                    collapsed ? "w-8 h-8" : "flex-1 gap-2",
                    theme === "light" ? "text-primary shadow-lg" : "hover:opacity-80"
                )}
                style={{
                    backgroundColor: theme === "light" ? 'hsla(var(--sidebar-foreground) / 0.1)' : 'transparent',
                    color: theme !== "light" ? 'hsla(var(--sidebar-foreground) / 0.5)' : undefined
                }}
            >
                <Sun className={cn("w-4 h-4", theme === "light" && "animate-spin-slow")} />
                {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">Clair</span>}
            </button>
            <button 
                onClick={() => setTheme("dark")}
                className={cn(
                    "flex items-center justify-center py-2 rounded-xl transition-all duration-500 relative",
                    collapsed ? "w-8 h-8" : "flex-1 gap-2",
                    theme === "dark" ? "text-primary shadow-lg" : "hover:opacity-80"
                )}
                style={{
                    backgroundColor: theme === "dark" ? 'hsla(var(--sidebar-foreground) / 0.1)' : 'transparent',
                    color: theme !== "dark" ? 'hsla(var(--sidebar-foreground) / 0.5)' : undefined
                }}
            >
                <Moon className="w-4 h-4" />
                {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">Sombre</span>}
            </button>
        </div>
    );
}
