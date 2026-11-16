"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopLoader } from "@/components/ui/top-loader";
import { Suspense } from "react";
import { useLocale } from "next-intl";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { cn } from "@/lib/utils";

import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { EliteHeader } from "@/components/layout/elite-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const locale = useLocale();
    const { collapsed } = useSidebar();
    
    // Check if the current route is a public standalone page (landing, login, sos, directories)
    const isPublicPage = 
        !pathname || 
        pathname === "/" || 
        pathname === "/fr" || 
        pathname === "/ar" || 
        pathname === "/en" || 
        pathname.includes("/login") || 
        pathname.includes("/sos-disparus") || 
        pathname.includes("/daaras");

    if (isPublicPage) {
        return (
            <div className="w-full min-h-screen relative bg-[#FAFAF7] selection:bg-[#0C5A34] selection:text-white overflow-x-hidden">
                <Suspense fallback={null}>
                    <TopLoader />
                </Suspense>
                {children}
            </div>
        );
    }

    const sidebarPaddingClass = locale === "ar"
        ? (collapsed ? "md:pr-[84px] md:pl-0" : "md:pr-[264px] md:pl-0")
        : (collapsed ? "md:pl-[84px] md:pr-0" : "md:pl-[264px] md:pr-0");

    return (
        <div className="flex min-h-screen flex-col overflow-x-clip bg-background text-foreground selection:bg-primary selection:text-primary-foreground md:flex-row">
            <Suspense fallback={null}>
                <TopLoader />
            </Suspense>

            {/* En-tête mobile collant */}
            <MobileHeader />

            {/* Sidebar Fixe (À Droite en Arabe, à Gauche en Français sur Desktop) */}
            <Suspense fallback={null}>
                <Sidebar />
            </Suspense>

            {/* Barre de navigation mobile inférieure */}
            <MobileNav />

            {/* Zone de contenu principal — Ajustement dynamique du rembourrage LTR / RTL */}
            <main className={cn(
                "relative flex min-h-screen min-w-0 max-w-full flex-1 flex-col overflow-x-clip pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] pt-16 transition-all duration-300 md:pb-10 md:pt-0",
                sidebarPaddingClass
            )}>
                <EliteHeader />
                <div className="app-content mx-auto flex w-full min-w-0 max-w-[1600px] flex-1 flex-col px-4 pb-8 sm:px-6 md:px-8 md:pb-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
