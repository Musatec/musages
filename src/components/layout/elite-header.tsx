"use client";

import { User, Menu, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { NotificationCenter } from "./notification-center";
import { UserMenu } from "./user-menu";
import { SearchCenter } from "./search-center";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { getStore } from "@/lib/actions/store";
import { SafeImage } from "../ui/safe-image";

export function EliteHeader() {
    const { setMobileOpen } = useSidebar();
    const [storeLogo, setStoreLogo] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogo = async () => {
            const store = await getStore() as any;
            if (store?.config?.logo) {
                setStoreLogo(store.config.logo);
            }
        };
        fetchLogo();
    }, []);
    
    return (
        <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md border-b border-border px-3 md:px-8 py-2 md:py-3 transition-all duration-300">
            <div className="flex items-center justify-between gap-2 md:gap-8 h-full max-w-[1600px] mx-auto">
                
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    {/* --- STORE LOGO --- */}
                    <div className="flex items-center shrink-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shadow-sm">
                            {storeLogo ? (
                                <SafeImage src={storeLogo} alt="Store Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            )}
                        </div>
                    </div>
                </div>

                {/* --- GLOBAL SEARCH (⌘K) --- */}
                <div className="flex-1 min-w-0 max-w-xl">
                    <SearchCenter />
                </div>

                {/* --- QUICK ACTIONS & PROFILE --- */}
                <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
                    <div className="hidden sm:block">
                        <ThemeToggle />
                    </div>
                    
                    <NotificationCenter />
                    
                    <div className="hidden sm:block w-[1px] h-6 bg-border mx-1 md:mx-2"></div>

                    <UserMenu />

                    {/* --- MOBILE MENU TRIGGER (MOVED TO RIGHT) --- */}
                    <button 
                        onClick={() => setMobileOpen(true)}
                        className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-primary transition-all active:scale-95 shrink-0 ml-1"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

            </div>
        </header>
    );
}
