import type { Equipment, Attachment } from '../types/equipment';

const DB_NAME = 'EquipmentPlannerDB';
const EQUIPMENT_STORE = 'equipment';
const SYNC_QUEUE_STORE = 'syncQueue';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export async function initializeDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(EQUIPMENT_STORE)) {
        database.createObjectStore(EQUIPMENT_STORE, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        database.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export async function saveEquipmentToIndexedDB(equipment: Equipment[]): Promise<void> {
  if (!db) await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([EQUIPMENT_STORE], 'readwrite');
    const store = transaction.objectStore(EQUIPMENT_STORE);

    // Clear existing data
    store.clear();

    // Add all equipment
    equipment.forEach(item => {
      store.add(item);
    });

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

export async function loadEquipmentFromIndexedDB(): Promise<Equipment[]> {
  if (!db) await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([EQUIPMENT_STORE], 'readonly');
    const store = transaction.objectStore(EQUIPMENT_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as Equipment[]);
  });
}

export async function addToSyncQueue(action: 'add' | 'update' | 'delete', equipment: Equipment): Promise<void> {
  if (!db) await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.add({
      action,
      equipment,
      timestamp: Date.now(),
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getSyncQueue(): Promise<Array<{ id: number; action: string; equipment: Equipment; timestamp: number }>> {
  if (!db) await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([SYNC_QUEUE_STORE], 'readonly');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as Array<{ id: number; action: string; equipment: Equipment; timestamp: number }>);
  });
}

export async function clearSyncQueue(): Promise<void> {
  if (!db) await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  if (!db) await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
