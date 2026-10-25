"use client";

import { useState, useEffect, useCallback } from "react";
import { getPendingOfflineCount } from "./db";
import { syncPendingOfflineActions, SyncResult } from "./sync-service";
import { toast } from "sonner";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Refresh pending count
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingOfflineCount();
      setPendingCount(count);
    } catch {
      setPendingCount(0);
    }
  }, []);

  // Trigger synchronization
  const syncNow = useCallback(async (): Promise<SyncResult | null> => {
    if (!navigator.onLine) {
      toast.error("Impossible de synchroniser : vous êtes toujours hors-ligne.");
      return null;
    }

    setIsSyncing(true);
    try {
      const result = await syncPendingOfflineActions();
      await refreshPendingCount();

      if (result.synced > 0) {
        toast.success(
          `⚡ Synchronisation réussie : ${result.synced} fiche(s) mise(s) à jour sur le serveur !`
        );
      }
      if (result.failed > 0) {
        toast.error(
          `Certaines fiches n'ont pas pu être synchronisées (${result.failed}).`
        );
      }
      return result;
    } catch {
      toast.error("Erreur lors de la synchronisation avec le serveur.");
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      toast.info("Connexion Internet rétablie. Vérification des synchronisations...", {
        icon: "📡",
      });
      // Auto-sync on reconnection
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning(
        "Mode Hors-Ligne activé : vos saisies sont enregistrées localement sur la tablette.",
        { duration: 4000 }
      );
    };

    const handleSyncEvent = () => {
      refreshPendingCount();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("daara-offline-sync", handleSyncEvent);

    // Periodic check for pending count
    const interval = setInterval(refreshPendingCount, 15000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("daara-offline-sync", handleSyncEvent);
      clearInterval(interval);
    };
  }, [refreshPendingCount, syncNow]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    syncNow,
    refreshPendingCount,
  };
}
