"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { BOTTOM_NAV_ITEMS } from "@/config/nav";
import { useTranslations } from "next-intl";

export function MobileNav() {
    const pathname = usePathname();
    const t = useTranslations("Sidebar");

    if (pathname === "/login") return null;

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-[40]">
            <div className="glass-card px-4 py-3 rounded-[2.5rem] flex items-center justify-around border border-border shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {BOTTOM_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href as typeof item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-2 transition-all duration-500",
                                isActive ? "scale-110" : "text-muted-foreground"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                            )}

                            <Icon className={cn(
                                "h-5 w-5 relative z-10 transition-all duration-300",
                                isActive ? "text-primary drop-shadow-[0_0_8px_hsla(var(--primary)/0.5)]" : "hover:text-foreground"
                            )} />

                            <span className={cn(
                                "text-[7px] font-black uppercase tracking-[0.1em] mt-1 transition-colors duration-300 truncate max-w-[55px] text-center",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                                {t(item.key as Parameters<typeof t>[0])}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
