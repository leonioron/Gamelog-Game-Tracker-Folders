/**
 * Persistência 100% offline/local-first:
 * - IndexedDB como banco principal (alta capacidade para catálogo + logs + listas)
 * - Sincronização automática e fallback transparente em localStorage
 */

const DB_NAME = 'gamelog_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';

export const STORAGE_KEYS = {
  GAMES: 'backloggd_games_v1',
  FOLDERS: 'backloggd_folders_v1',
  LISTS: 'backloggd_lists_v1',
  STATUSES: 'backloggd_statuses_v1',
  LOGS: 'backloggd_logs_v1',
  PROFILE: 'backloggd_profile_v1',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function readFromLocalStorage<T>(key: string): T | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeToLocalStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignorar erros de quota em WebViews restritos; IndexedDB permanece como principal
  }
}

async function readFromIndexedDB<T>(key: string): Promise<T | null> {
  const db = await openDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result !== undefined ? (req.result as T) : null);
      };
      req.onerror = () => resolve(null);
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    } catch {
      db.close();
      resolve(null);
    }
  });
}

async function writeToIndexedDB<T>(key: string, value: T): Promise<void> {
  const db = await openDatabase();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      db.close();
      resolve();
    }
  });
}

export const storageService = {
  /**
   * Leitura síncrona rápida do fallback localStorage para inicialização instantânea sem flash.
   */
  getSync<T>(key: StorageKey, fallback: T): T {
    const cached = readFromLocalStorage<T>(key);
    return cached !== null ? cached : fallback;
  },

  /**
   * Hidratação assíncrona priorizando IndexedDB, sincronizando de volta para localStorage.
   */
  async load<T>(key: StorageKey, fallback: T): Promise<T> {
    const idbValue = await readFromIndexedDB<T>(key);
    if (idbValue !== null) {
      writeToLocalStorage(key, idbValue);
      return idbValue;
    }

    const lsValue = readFromLocalStorage<T>(key);
    if (lsValue !== null) {
      await writeToIndexedDB(key, lsValue);
      return lsValue;
    }

    return fallback;
  },

  /**
   * Salva simultaneamente no IndexedDB (principal) e no localStorage (fallback/sync).
   */
  async save<T>(key: StorageKey, value: T): Promise<void> {
    writeToLocalStorage(key, value);
    await writeToIndexedDB(key, value);
  },
};
