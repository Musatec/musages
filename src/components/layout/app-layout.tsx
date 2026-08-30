"use client";

import { usePathname } from "next/navigation";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Sidebar } from "@/components/layout/sidebar";
import { TopLoader } from "@/components/ui/top-loader";
import { Suspense } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
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
            <div className="w-full min-h-screen relative bg-[#F8FAFC] selection:bg-[#2845D6] selection:text-white overflow-x-hidden">
                <Suspense fallback={null}>
                    <TopLoader />
                </Suspense>
                {children}
            </div>
        );
    }

    return (
        <div className="flex min-h-screen relative overflow-x-hidden bg-[#F8FAFC] selection:bg-[#2845D6] selection:text-white">
            <Suspense fallback={null}>
                <TopLoader />
            </Suspense>

            {/* Sidebar Desktop Fixe */}
            <Sidebar />

            {/* Barre de navigation mobile */}
            <MobileHeader />

            {/* Zone de contenu principal avec marge d'espacement Sidebar (md:pl-64) */}
            <main className="flex-1 relative flex flex-col pt-16 md:pt-6 md:pl-64 w-full min-h-screen transition-all">
                <div className="flex-1 px-4 md:px-8 pb-10 flex flex-col max-w-7xl w-full mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
