"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { UserMenu } from "./user-menu";
import { SearchCenter } from "./search-center";
import { useSession } from "next-auth/react";

export function EliteHeader() {
    const { setMobileOpen } = useSidebar();
    const { data: session } = useSession();
    
    return (
        <header className="sticky top-0 z-40 w-full bg-black backdrop-blur-md border-b border-white/10 px-3 md:px-8 py-2 md:py-3 transition-all duration-300">
            <div className="flex items-center justify-between gap-2 md:gap-8 h-full max-w-[1600px] mx-auto">
                
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    {/* --- SCHOOL BRANDING WITH HORIZONTAL LOGO --- */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="h-9 md:h-10 flex items-center overflow-hidden">
                            <img src="/logo-taleem.png" alt="TaleemApp" className="h-9 md:h-10 w-auto object-contain mix-blend-screen drop-shadow-md" />
                        </div>
                        <div className="hidden lg:flex flex-col border-l border-white/20 pl-3">
                            <span className="text-xs font-black uppercase tracking-tight text-white italic leading-tight">
                                {session?.user?.name || "Établissement Scolaire"}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-tight">
                                Espace Directeur
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- GLOBAL SEARCH (⌘K) --- */}
                <div className="flex-1 min-w-0 max-w-xl">
                    <SearchCenter />
                </div>

                {/* --- PROFILE & MENU --- */}
                <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
                    <UserMenu />

                    {/* --- MOBILE MENU TRIGGER --- */}
                    <button 
                        onClick={() => setMobileOpen(true)}
                        className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-emerald-400 transition-all active:scale-95 shrink-0 ml-1"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

            </div>
        </header>
    );
}
