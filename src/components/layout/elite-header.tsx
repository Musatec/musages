"use client";

import { Search, Bell, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function EliteHeader() {
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    return (
        <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md border-b border-border px-8 py-3 hidden md:block transition-all duration-300">
            <div className="flex items-center justify-between gap-10 h-full">
                
                {/* --- BUSINESS SEARCH --- */}
                <div className="flex-1 max-w-xl relative">
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 bg-muted/30 border rounded-lg transition-all",
                        isSearchFocused ? "border-primary ring-1 ring-primary/20 bg-background" : "border-border/50 hover:bg-muted/50"
                    )}>
                        <Search className={cn("w-4 h-4 transition-colors", isSearchFocused ? "text-primary" : "text-muted-foreground")} />
                        <input 
                            placeholder="Rechercher (Clients, Factures, Produits)..."
                            className="w-full bg-transparent border-none outline-none text-sm font-medium placeholder:text-muted-foreground/50"
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                        <div className="flex items-center gap-1 opacity-50">
                            <span className="px-1.5 py-0.5 border border-border rounded text-[10px] font-medium bg-muted">⌘</span>
                            <span className="px-1.5 py-0.5 border border-border rounded text-[10px] font-medium bg-muted">K</span>
                        </div>
                    </div>
                </div>

                {/* --- QUICK ACTIONS & PROFILE --- */}
                <div className="flex items-center gap-4">
                    <button className="relative p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
                    </button>
                    
                    <div className="w-[1px] h-6 bg-border mx-2"></div>

                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="text-right hidden lg:block">
                            <p className="text-sm font-bold leading-none mb-1">Espace de travail</p>
                            <p className="text-xs text-muted-foreground">Admin</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                            <User className="w-4 h-4" />
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
}
