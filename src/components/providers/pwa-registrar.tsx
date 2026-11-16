"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "musages_pwa_install_dismissed_v1";

export function PwaRegistrar() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Remove the old catch-all cache, which could contain authenticated API responses.
    if (typeof window !== "undefined" && "caches" in window) {
      void caches.delete("https-calls");
    }

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
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  newWorker.postMessage({ type: "SKIP_WAITING" });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    if (typeof window === "undefined") return;

    // Check if already running in standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const wasDismissed = localStorage.getItem(DISMISS_KEY) === "1";
    setDismissed(wasDismissed);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowIosGuide(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Detect iOS Safari (no beforeinstallprompt support)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
    if (isIos && isSafari && !wasDismissed) {
      setShowIosGuide(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowIosGuide(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  if (isInstalled || dismissed) return null;
  if (!deferredPrompt && !showIosGuide) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 print:hidden animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white border border-emerald-500/40 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-black uppercase tracking-wide text-emerald-300">
              Installer l&apos;Application
            </h4>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Fermer"
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {deferredPrompt ? (
            <>
              <p className="text-[11px] text-slate-300 leading-snug">
                Installez Daara & École Pathé Pogne sur votre appareil pour un accès direct et hors-ligne.
              </p>
              <div className="pt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Installer maintenant</span>
                </button>
              </div>
            </>
          ) : (
            <p className="text-[11px] text-slate-300 leading-snug">
              Sur iPhone/iPad : appuyez sur{" "}
              <Share className="w-3.5 h-3.5 inline text-sky-400 mx-0.5" />{" "}
              puis sur <strong>« Sur l&apos;écran d&apos;accueil »</strong>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    serviceWorkerReady?: boolean;
  }
}
