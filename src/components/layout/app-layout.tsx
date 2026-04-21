"use client";

import { usePathname } from "@/i18n/routing";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileFab } from "@/components/layout/mobile-fab";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { cn } from "@/lib/utils";
import { TopLoader } from "@/components/ui/top-loader";
import { Suspense } from "react";
import { EliteHeader } from "@/components/layout/elite-header";
import { motion, AnimatePresence } from "framer-motion";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { collapsed } = useSidebar();
    
    const isLoginPage = pathname?.includes("/login");
    const isLandingPage = pathname === "/";
    const showLayout = !isLoginPage && !isLandingPage;

    return (
        <div className="flex min-h-screen relative overflow-x-hidden bg-background selection:bg-primary/20">
            <Suspense fallback={null}>
                <TopLoader />
            </Suspense>

            {/* Premium Atmosphere Elements */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] opacity-20" />
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-orange-500/5 rounded-full blur-[100px] opacity-10" />
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            {/* Navigation - Sidebar (Desktop) */}
            {showLayout && <Sidebar />}
            {showLayout && <MobileHeader />}

            {/* Main Content Area - Synchronized Margin */}
            <main className={`flex-1 min-h-screen relative transition-all ease-in-out duration-500 ${
                showLayout 
                    ? (collapsed ? 'md:ml-20' : 'md:ml-64') 
                    : ''
            }`}>
                {/* Global Command Bar (Fixed) */}
                {showLayout && (
                    <div className={cn(
                        "fixed top-0 right-0 z-[60] transition-all duration-500 left-0",
                        collapsed ? "md:left-20" : "md:left-64"
                    )}>
                        <EliteHeader />
                    </div>
                )}

                <div className={cn("flex flex-col flex-1", showLayout && "pt-[60px] md:pt-[72px]")}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="flex-1"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>


            </main>

            {/* Navigation - Mobile Elements */}
            {showLayout && <MobileNav />}
        </div>
    );
}
