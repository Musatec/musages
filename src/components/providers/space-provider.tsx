"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
    const [activeSpace, setActiveSpaceState] = useState<ActiveSpace>(initialSpace);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(STORAGE_KEY) as ActiveSpace;
            if ((saved === "daara" || saved === "school") && saved !== activeSpace) {
                setActiveSpaceState(saved);
                writeSpaceCookie(saved);
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
        setActiveSpaceState(space);
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, space);
        }
        writeSpaceCookie(space);
        router.refresh();
    };

    const toggleSpace = () => {
        const next = activeSpace === "daara" ? "school" : "daara";
        setActiveSpace(next);
    };

    return (
        <SpaceContext.Provider value={{ activeSpace, setActiveSpace, toggleSpace }}>
            {children}
        </SpaceContext.Provider>
    );
}

export function useSpace() {
    const context = useContext(SpaceContext);
    if (!context) {
        return {
            activeSpace: "daara" as ActiveSpace,
            setActiveSpace: () => {},
            toggleSpace: () => {}
        };
    }
    return context;
}
