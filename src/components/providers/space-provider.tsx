"use client";

import React, { createContext, useContext, useState } from "react";

export type ActiveSpace = "daara" | "school";

interface SpaceContextType {
    activeSpace: ActiveSpace;
    setActiveSpace: (space: ActiveSpace) => void;
    toggleSpace: () => void;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

const STORAGE_KEY = "musages_active_space";

export function SpaceProvider({ children }: { children: React.ReactNode }) {
    const [activeSpace, setActiveSpaceState] = useState<ActiveSpace>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(STORAGE_KEY) as ActiveSpace;
            if (saved === "daara" || saved === "school") {
                return saved;
            }
        }
        return "daara";
    });

    const setActiveSpace = (space: ActiveSpace) => {
        setActiveSpaceState(space);
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, space);
        }
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
