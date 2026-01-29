"use client";

import { usePathname } from "@/i18n/routing";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileFab } from "@/components/layout/mobile-fab";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname?.includes("/login");
    const isLandingPage = pathname === "/";
    const showLayout = !isLoginPage && !isLandingPage;

    return (
        <div className="flex min-h-screen relative overflow-hidden bg-background">
            {/* Premium Atmosphere Elements */}
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                {/* Primary Nebula */}
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-soft opacity-30" />

                {/* Secondary Nebula */}
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-orange-500/10 rounded-full blur-[100px] opacity-20" />

                {/* Bottom Accent */}
                <div className="absolute -bottom-[5%] left-[20%] w-[50%] h-[30%] bg-red-600/10 rounded-full blur-[120px] opacity-20" />

                {/* Grain/Noise Overlay for Texture */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            {/* Navigation - Sidebar (Desktop) */}
            {showLayout && <Sidebar />}
            {showLayout && <MobileHeader />}

            {/* Main Content Area */}
            <main className={`flex-1 ${showLayout ? 'md:ml-64' : ''} min-h-screen relative transition-all duration-300`}>
                {/* Spacer pour le header mobile */}
                {showLayout && <div className="h-16 md:hidden" />}

                {children}

                {/* Spacer pour la nav mobile */}
                {showLayout && <div className="h-32 md:hidden" />}
            </main>

            {/* Navigation - Floating Bar (Mobile) */}
            {showLayout && <MobileNav />}
            {showLayout && <MobileFab />}
        </div>
    );
}
