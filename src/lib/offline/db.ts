/**
 * IndexedDB Local Storage Manager for Daara Ibnoul Khayim Al Diawziya Offline Support
 * Enables full offline operation on tablets/smartphones for Quranic teachers (Oustazs)
 */

export interface OfflineAction {
  id?: number;
  actionType: "SAVE_ATTENDANCE" | "SAVE_HIFZ";
  payload: any;
  createdAt: number;
  retryCount: number;
}

const DB_NAME = "daara_offline_db";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not available in this environment."));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Queue for unsynced actions
      if (!db.objectStoreNames.contains("offline_queue")) {
        const queueStore = db.createObjectStore("offline_queue", {
          keyPath: "id",
          autoIncrement: true,
        });
        queueStore.createIndex("actionType", "actionType", { unique: false });
        queueStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      // 2. Cache for Talibés (Roster)
      if (!db.objectStoreNames.contains("cached_talibes")) {
        db.createObjectStore("cached_talibes", { keyPath: "id" });
      }

      // 3. Cache for Halqas
      if (!db.objectStoreNames.contains("cached_halqas")) {
        db.createObjectStore("cached_halqas", { keyPath: "id" });
      }

      // 4. Cache for today's attendances
      if (!db.objectStoreNames.contains("cached_attendances")) {
        db.createObjectStore("cached_attendances", { keyPath: "key" });
      }

      // 5. Cache for recent Hifz records
      if (!db.objectStoreNames.contains("cached_hifz")) {
        db.createObjectStore("cached_hifz", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add an action to the offline pending queue
 */
export async function enqueueOfflineAction(
  actionType: "SAVE_ATTENDANCE" | "SAVE_HIFZ",
  payload: any
): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offline_queue", "readwrite");
    const store = tx.objectStore("offline_queue");
    const item: OfflineAction = {
      actionType,
      payload,
      createdAt: Date.now(),
      retryCount: 0,
    };
    const req = store.add(item);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all pending actions from the queue
 */
export async function getPendingOfflineActions(): Promise<OfflineAction[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("offline_queue", "readonly");
      const store = tx.objectStore("offline_queue");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as OfflineAction[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Get count of pending actions
 */
export async function getPendingOfflineCount(): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("offline_queue", "readonly");
      const store = tx.objectStore("offline_queue");
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return 0;
  }
}

/**
 * Remove an action from the queue once successfully synced
 */
export async function removePendingAction(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("offline_queue", "readwrite");
    const store = tx.objectStore("offline_queue");
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Cache Halqas list locally for offline access
 */
export async function cacheHalqas(halqas: any[]): Promise<void> {
  if (!halqas || halqas.length === 0) return;
  try {
    const db = await openDB();
    const tx = db.transaction("cached_halqas", "readwrite");
    const store = tx.objectStore("cached_halqas");
    halqas.forEach(h => store.put(h));
  } catch (err) {
    console.warn("[OFFLINE_DB] Could not cache halqas", err);
  }
}

/**
 * Cache Talibes list locally for offline access
 */
export async function cacheTalibes(talibes: any[]): Promise<void> {
  if (!talibes || talibes.length === 0) return;
  try {
    const db = await openDB();
    const tx = db.transaction("cached_talibes", "readwrite");
    const store = tx.objectStore("cached_talibes");
    talibes.forEach(t => store.put(t));
  } catch (err) {
    console.warn("[OFFLINE_DB] Could not cache talibes", err);
  }
}

/**
 * Cache an attendance item locally
 */
export async function cacheAttendanceRecord(record: {
  talibeId: string;
  status: string;
  date: string;
}): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("cached_attendances", "readwrite");
    const store = tx.objectStore("cached_attendances");
    const key = `${record.talibeId}_${record.date.substring(0, 10)}`;
    store.put({ key, ...record });
  } catch (err) {
    console.warn("[OFFLINE_DB] Could not cache attendance", err);
  }
}
