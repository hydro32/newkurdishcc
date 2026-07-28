// src/lib/videoStorage.ts

const DB_NAME = "KurdishTubeDB";
const STORE_NAME = "videos";
const DB_VERSION = 1;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

export async function saveVideoBlob(id: string, fileBlob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, blob: fileBlob });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getVideoBlob(id: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => {
      const result = request.result;
      if (result && result.blob) {
        const objectUrl = URL.createObjectURL(result.blob);
        resolve(objectUrl);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}