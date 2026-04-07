"use client";

import { useEffect } from "react";

export function PwaRegistrar() {
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            "serviceWorker" in navigator &&
            window.serivceWorkerReady === undefined
        ) {
            window.serivceWorkerReady = true;
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
        serivceWorkerReady?: boolean;
    }
}
