import { getPendingOfflineActions, removePendingAction, OfflineAction } from "./db";
import { saveAttendance } from "@/lib/actions/attendance";
import { addHifzRecord } from "@/lib/actions/hifz";

export interface SyncResult {
  total: number;
  synced: number;
  failed: number;
  errors: string[];
}

/**
 * Replays all pending offline actions to the server
 */
export async function syncPendingOfflineActions(): Promise<SyncResult> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { total: 0, synced: 0, failed: 0, errors: ["Appareil toujours hors-ligne."] };
  }

  const actions = await getPendingOfflineActions();
  if (actions.length === 0) {
    return { total: 0, synced: 0, failed: 0, errors: [] };
  }

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const action of actions) {
    if (!action.id) continue;

    try {
      if (action.actionType === "SAVE_ATTENDANCE") {
        const payload = action.payload;
        const res = await saveAttendance({
          studentId: payload.studentId || payload.talibeId,
          status: payload.status,
          date: new Date(payload.date),
          reason: payload.reason,
        });

        if (res.error) {
          failed++;
          errors.push(`Présence Talibé (${payload.studentId}): ${res.error}`);
        } else {
          await removePendingAction(action.id);
          synced++;
        }
      } else if (action.actionType === "SAVE_HIFZ") {
        const payload = action.payload;
        const res = await addHifzRecord({
          talibeId: payload.talibeId,
          hizbNumber: Number(payload.hizbNumber),
          juzNumber: payload.juzNumber ? Number(payload.juzNumber) : undefined,
          surahName: payload.surahName,
          surahNumber: payload.surahNumber ? Number(payload.surahNumber) : undefined,
          ayahStart: payload.ayahStart ? Number(payload.ayahStart) : undefined,
          ayahEnd: payload.ayahEnd ? Number(payload.ayahEnd) : undefined,
          allwaBoard: payload.allwaBoard,
          grade: payload.grade,
          notes: payload.notes,
        });

        if (res.error) {
          failed++;
          errors.push(`Hifz (${payload.talibeId}): ${res.error}`);
        } else {
          await removePendingAction(action.id);
          synced++;
        }
      }
    } catch (err: any) {
      failed++;
      errors.push(err.message || "Erreur de synchronisation réseau.");
    }
  }

  // Notifier les composants d'interface qu'une synchronisation a eu lieu
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("daara-offline-sync", {
        detail: { synced, failed, total: actions.length },
      })
    );
  }

  return {
    total: actions.length,
    synced,
    failed,
    errors,
  };
}
