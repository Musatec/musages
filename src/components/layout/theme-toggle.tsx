"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex bg-muted/50 p-1 rounded-full border border-border/50 transition-all duration-300">
            <button 
                onClick={() => setTheme("light")}
                className={cn(
                    "p-2 rounded-full transition-all duration-300",
                    theme === "light" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
                title="Mode Clair"
            >
                <Sun className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setTheme("dark")}
                className={cn(
                    "p-2 rounded-full transition-all duration-300",
                    theme === "dark" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
                title="Mode Sombre"
            >
                <Moon className="w-4 h-4" />
            </button>
        </div>
    );
}
