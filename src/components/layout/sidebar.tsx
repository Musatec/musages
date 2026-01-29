"use client";

import Image from "next/image";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/nav";
import { Settings2, Zap, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useTranslations } from "next-intl";

export function Sidebar() {
    const { isAdmin } = useSupabase();
    const pathname = usePathname();
    const t = useTranslations("Sidebar");

    // pathname doesn't include locale with usePathname from next-intl (usually)
    if (pathname === "/login") return null;

    // Redesigned Sections Structure
    const SECTIONS = [
        {
            label: 'section_main', // Pilotage
            items: ['dashboard', 'pilote', 'capital']
        },
        {
            label: 'section_creative', // Ateliers
            items: ['labo', 'studio', 'books']
        },
        {
            label: 'section_growth', // Expansion
            items: ['social']
        }
    ];

    return (
        <div className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r border-border bg-background/80 backdrop-blur-2xl z-50">
            {/* Logo Area */}
            <div className="flex h-20 items-center px-6 border-b border-border/10 mb-4">
                <Link href="/dashboard" className="transition-opacity hover:opacity-80">
                    <img
                        src="/logo.svg?v=6"
                        alt="MINDOS Logo"
                        className="h-8 w-auto"
                    />
                </Link>
            </div>

            <nav className="flex-1 px-3 space-y-8 pt-2 overflow-y-auto custom-scrollbar">
                {SECTIONS.map((section) => (
                    <div key={section.label} className="space-y-2">
                        {/* Section Label Removed */}

                        <div className="space-y-1">
                            {NAV_ITEMS.filter(i => section.items.includes(i.key)).map((item) => {
                                const Icon = item.icon;
                                // Handle subpaths for active state compatibility
                                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href as any}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-2.5 mx-1 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                            isActive ? "text-white shadow-md shadow-black/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute inset-0 rounded-xl transition-all duration-300 opacity-0",
                                            isActive && "opacity-100 bg-gradient-to-r from-primary to-orange-600"
                                        )} />

                                        {/* Hover Glow Effect */}
                                        <div className={cn(
                                            "absolute inset-0 rounded-xl transition-all duration-500 opacity-0 group-hover:opacity-10 pointer-events-none",
                                            !isActive && "bg-primary"
                                        )} />

                                        <Icon className={cn(
                                            "h-4 w-4 relative z-10 transition-all duration-300",
                                            isActive ? "text-white scale-110" : "group-hover:text-primary group-hover:scale-110"
                                        )} />

                                        <span className={cn(
                                            "font-bold text-[13px] tracking-tight relative z-10 transition-all",
                                            isActive ? "text-white translate-x-1" : "group-hover:translate-x-1"
                                        )}>
                                            {t(item.key as any)}
                                        </span>

                                        {isActive && (
                                            <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow shadow-white/50 animate-pulse z-10" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* LIEN ADMIN EXCLUSIF */}
                {isAdmin && (
                    <div className="space-y-2 pt-4 border-t border-border/20">
                        <Link
                            href="/admin"
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 mx-1 rounded-xl transition-all duration-300 group relative border border-dashed border-border/50 hover:border-primary/50",
                                pathname === "/admin" ? "bg-accent/50 text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ShieldCheck className={cn(
                                "h-4 w-4 relative z-10 transition-all",
                                pathname === "/admin" ? "text-primary" : "group-hover:text-primary"
                            )} />
                            <span className="font-bold text-[12px] tracking-tight relative z-10 uppercase">{t('admin')}</span>
                        </Link>
                    </div>
                )}
            </nav>

            {/* Footer / Settings */}
            <div className="p-4 border-t border-border bg-muted/5 backdrop-blur-sm flex flex-col gap-3 pb-6 mt-auto">
                <div className="grid grid-cols-2 gap-2">
                    <Link
                        href="/settings"
                        className={cn(
                            "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all border border-border/50 bg-background/50 hover:bg-accent hover:border-border hover:shadow-lg group",
                            pathname === "/settings" ? "bg-accent border-primary/20" : ""
                        )}
                        title={t('settings')}
                    >
                        <Settings2 className={cn("h-4 w-4 transition-colors", pathname === "/settings" ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground scale-90">{t('settings')}</span>
                    </Link>

                    <Link
                        href="/pricing"
                        className={cn(
                            "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all border border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/20 group hover:shadow-lg",
                            pathname === "/pricing" ? "bg-primary/10 border-primary/40" : ""
                        )}
                        title={t('pricing')}
                    >
                        <Zap className={cn("h-4 w-4 transition-colors", pathname === "/pricing" ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary scale-90">{t('pricing')}</span>
                    </Link>
                </div>

                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = "/";
                    }}
                    className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl transition-all border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/20 group shadow-sm hover:shadow-red-500/5 mt-1"
                >
                    <LogOut className="h-4 w-4 text-red-500/60 group-hover:text-red-500 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 group-hover:text-red-500 transition-all">{t('logout')}</span>
                </button>
            </div>
        </div>
    );
}
