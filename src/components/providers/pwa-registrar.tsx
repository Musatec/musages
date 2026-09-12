"use client";

import { useEffect } from "react";

export function PwaRegistrar() {
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            process.env.NODE_ENV === "production" &&
            "serviceWorker" in navigator &&
            window.serviceWorkerReady === undefined
        ) {
            window.serviceWorkerReady = true;
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    console.log("Service Worker registered with scope:", registration.scope);
                })
                .catch((error) => {
                    console.error("Service Worker registration failed:", error);
                });
        }
    }, []);

    return null;
}

declare global {
    interface Window {
        serviceWorkerReady?: boolean;
    }
}
