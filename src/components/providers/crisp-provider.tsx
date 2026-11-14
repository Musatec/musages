"use client";

import { useEffect } from "react";

export const CrispProvider = () => {
    useEffect(() => {
        const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
        if (!websiteId) return;

        let isCancelled = false;

        const initCrisp = async () => {
            try {
                const { Crisp } = await import("crisp-sdk-web");
                if (!isCancelled) {
                    Crisp.configure(websiteId);
                }
            } catch (err) {
                console.warn("[Crisp] Failed to load chat widget:", err);
            }
        };

        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            const handle = (window as any).requestIdleCallback(initCrisp);
            return () => {
                isCancelled = true;
                (window as any).cancelIdleCallback(handle);
            };
        } else {
            const timer = setTimeout(initCrisp, 2500);
            return () => {
                isCancelled = true;
                clearTimeout(timer);
            };
        }
    }, []);

    return null;
};
