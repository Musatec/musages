"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Loader2, BookOpen, GraduationCap } from "lucide-react";

export type ActiveSpace = "daara" | "school";

interface SpaceContextType {
    activeSpace: ActiveSpace;
    setActiveSpace: (space: ActiveSpace) => void;
    toggleSpace: () => void;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

const STORAGE_KEY = "musages_active_space";

function writeSpaceCookie(space: ActiveSpace) {
    if (typeof document !== "undefined") {
        document.cookie = `${STORAGE_KEY}=${space}; path=/; max-age=31536000; SameSite=Lax`;
    }
}

export function SpaceProvider({ 
    children,
    initialSpace = "daara",
}: { 
    children: React.ReactNode;
    initialSpace?: ActiveSpace;
}) {
    const router = useRouter();
    const locale = useLocale();
    const [activeSpace, setActiveSpaceState] = useState<ActiveSpace>(initialSpace);
    const [switchingTo, setSwitchingTo] = useState<ActiveSpace | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(STORAGE_KEY) as ActiveSpace;
            if ((saved === "daara" || saved === "school") && saved !== activeSpace) {
                setActiveSpaceState(saved);
                writeSpaceCookie(saved);
                router.refresh();
            }
        }
    }, []);

    useEffect(() => {
        if (typeof document !== "undefined") {
            const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${STORAGE_KEY}=([^;]*)`));
            const cookieVal = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
            if (cookieVal !== activeSpace) {
                writeSpaceCookie(activeSpace);
                router.refresh();
            }
        }
    }, [activeSpace, router]);

    const setActiveSpace = (space: ActiveSpace) => {
        if (space === activeSpace) return;
        setSwitchingTo(space);
        setActiveSpaceState(space);
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, space);
        }
        writeSpaceCookie(space);
        if (typeof window !== "undefined") {
            window.location.href = `/${locale}/dashboard`;
        }
    };

    const toggleSpace = () => {
        const next = activeSpace === "daara" ? "school" : "daara";
        setActiveSpace(next);
    };

    return (
        <SpaceContext.Provider value={{ activeSpace, setActiveSpace, toggleSpace }}>
            {children}

            {switchingTo && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="flex flex-col items-center gap-4 p-8 rounded-3xl border-2 border-border bg-card shadow-2xl max-w-sm w-[90%] text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                            switchingTo === "school"
                                ? "bg-amber-400 text-slate-950"
                                : "bg-[#0C5A34] text-white"
                        }`}>
                            {switchingTo === "school" ? (
                                <GraduationCap className="w-8 h-8" />
                            ) : (
                                <BookOpen className="w-8 h-8" />
                            )}
                        </div>

                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                Changement d&apos;espace
                            </p>
                            <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
                                {switchingTo === "school"
                                    ? "École Franco-Arabe Pathé Pogne"
                                    : "Espace Daara Ibnoul Khayim"}
                            </h3>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Chargement de l&apos;espace en cours...</span>
                        </div>
                    </div>
                </div>
            )}
        </SpaceContext.Provider>
    );
}

export function useSpace() {
    const context = useContext(SpaceContext);
    if (!context) {
        throw new Error("useSpace must be used within a SpaceProvider");
    }
    return context;
}
