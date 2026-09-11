"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopLoader } from "@/components/ui/top-loader";
import { Suspense } from "react";
import { useLocale } from "next-intl";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const locale = useLocale();
    const { collapsed } = useSidebar();
    const isAr = locale === "ar";
    
    // Check if the current route is a public standalone page (landing, login, sos, directories)
    const isPublicPage = 
        !pathname || 
        pathname === "/" || 
        pathname === "/fr" || 
        pathname === "/ar" || 
        pathname === "/en" || 
        pathname.includes("/login") || 
        pathname.includes("/sos-disparus") || 
        pathname.includes("/daaras") || 
        pathname.includes("/oustazs");

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

    // Calcul de la marge pour la Sidebar (Marge à DROITE en Arabe RTL, Marge à GAUCHE en Français LTR)
    const sidebarPaddingClass = isAr
        ? (collapsed ? "md:pr-20 md:pl-0" : "md:pr-64 md:pl-0")
        : (collapsed ? "md:pl-20 md:pr-0" : "md:pl-64 md:pr-0");

    return (
        <div className="flex min-h-screen relative overflow-x-hidden bg-[#FAFAF7] selection:bg-[#0C5A34] selection:text-white">
            <Suspense fallback={null}>
                <TopLoader />
            </Suspense>

            {/* Sidebar Fixe (À Droite en Arabe, à Gauche en Français) */}
            <Sidebar />

            {/* Zone de contenu principal — Ajustement dynamique du rembourrage LTR / RTL */}
            <main className={cn(
                "flex-1 relative flex flex-col pt-3 md:pt-6 w-full min-h-screen transition-all duration-300",
                sidebarPaddingClass
            )}>
                <div className="flex-1 px-3 sm:px-6 md:px-8 pb-10 flex flex-col max-w-7xl w-full mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
