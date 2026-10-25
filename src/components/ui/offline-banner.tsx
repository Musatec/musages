"use client";

import { useOfflineSync } from "@/lib/offline/use-offline-sync";
import { WifiOff, CloudUpload, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineBanner() {
  const { isOnline, pendingCount, isSyncing, syncNow } = useOfflineSync();

  // If online and nothing pending, don't show intrusive banner
  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl"
      >
        {!isOnline ? (
          <div className="bg-amber-950/90 text-amber-200 border border-amber-500/40 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <WifiOff className="w-4 h-4 animate-pulse" />
              </span>
              <div className="truncate">
                <span className="font-bold text-amber-300">Mode Hors-Ligne Actif</span>
                <span className="hidden sm:inline text-amber-200/80"> — Enregistrement local sécurisé sur la tablette.</span>
              </div>
            </div>
            {pendingCount > 0 && (
              <span className="bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-300 shrink-0">
                {pendingCount} en attente
              </span>
            )}
          </div>
        ) : (
          <div className="bg-emerald-950/90 text-emerald-200 border border-emerald-500/40 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <CloudUpload className="w-4 h-4" />
              </span>
              <div className="truncate">
                <span className="font-bold text-emerald-300">Connexion rétablie</span>
                <span className="text-emerald-200/80"> — {pendingCount} fiche(s) prête(s) à synchroniser.</span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => syncNow()}
              disabled={isSyncing}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-7 sm:h-8 px-3 rounded-xl text-xs flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Synchroniser</span>
                </>
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
