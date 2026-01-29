"use client";

import { Settings2, Menu, X, Rocket, Zap, LogOut } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/nav";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";
import { supabase } from "@/lib/supabase";

export function MobileHeader() {
    const { isAdmin } = useSupabase();
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("Sidebar");
    const [isOpen, setIsOpen] = useState(false);

    const [prevPathname, setPrevPathname] = useState(pathname);

    // Fermer le menu si la route change
    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        if (isOpen) setIsOpen(false);
    }

    // Bloquer le scroll quand le menu est ouvert
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (pathname === "/login") return null;

    return (
        <>
            <div className="md:hidden flex items-center justify-between px-6 py-4 fixed top-0 left-0 right-0 z-[40] bg-background/60 backdrop-blur-xl border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-2 active:scale-95 transition-transform">
                    <img src="/logo.svg?v=6" alt="MINDOS Logo" className="h-8 w-auto" />
                </Link>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-all active:scale-95"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* SIDE DRAWER MENU (COMES FROM RIGHT) */}
            <div
                className={cn(
                    "fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm transition-opacity duration-500 md:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            <div className={cn(
                "fixed inset-y-0 right-0 z-[70] w-[300px] bg-background border-l border-border shadow-2xl transition-transform duration-500 ease-out md:hidden flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header inside Drawer */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-border bg-card/20">
                    <div className="flex items-center gap-2">
                        <img src="/logo.svg?v=6" alt="MINDOS Logo" className="h-6 w-auto" />
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-xl bg-card border border-border text-muted-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-8 px-6 space-y-8">
                    <div className="px-2">
                        <LanguageSwitcher />
                    </div>

                    <div className="space-y-1">
                        <p className="px-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.3em] mb-4">Cockpit</p>
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <button
                                    key={item.href}
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.push(item.href);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300",
                                        isActive
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "hover:bg-card text-muted-foreground"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", isActive ? "text-primary shadow-[0_0_8px_hsla(var(--primary)/0.5)]" : "text-muted-foreground/60")} />
                                    <span className="text-sm font-bold tracking-tight uppercase">{t(item.key)}</span>
                                    {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_hsla(var(--primary)/0.5)]" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* LIEN ADMIN EXCLUSIF MOBILE */}
                    {isAdmin && (
                        <div className="space-y-1">
                            <p className="px-4 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.3em] mb-4">Administration</p>
                            <Link
                                href="/admin"
                                className={cn(
                                    "flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300",
                                    pathname === "/admin"
                                        ? "bg-primary/20 text-primary border border-primary/30"
                                        : "hover:bg-card text-muted-foreground"
                                )}
                            >
                                <Zap className={cn("w-4 h-4", pathname === "/admin" ? "text-primary" : "text-muted-foreground/60")} />
                                <span className="text-sm font-black tracking-tight uppercase">{t('admin')}</span>
                                {pathname === "/admin" && <div className="ml-auto w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_hsla(var(--primary)/0.5)]" />}
                            </Link>
                        </div>
                    )}

                    <div className="px-2">
                        <div className="bg-card rounded-2xl p-5 border border-border shadow-inner">
                            <div className="flex items-center gap-2 mb-3">
                                <Rocket className="w-3 h-3 text-primary" />
                                <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Système</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground font-medium">v1.2.0-stable</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">On Line</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer inside Drawer */}
                <div className="p-6 border-t border-border bg-card/20 space-y-3">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all uppercase text-[10px] font-black tracking-widest shadow-sm"
                    >
                        <Settings2 className="w-4 h-4" />
                        <span>{t('settings')}</span>
                    </Link>

                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = "/";
                        }}
                        className="flex items-center gap-3 w-full px-6 py-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 text-red-500/60 hover:text-red-500 transition-all uppercase text-[10px] font-black tracking-widest shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </div>
        </>
    );
}
