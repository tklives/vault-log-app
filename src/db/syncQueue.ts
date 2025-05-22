import { db as firestoreDb } from '../lib/firebase';
import {
    doc,
    setDoc,
    getDocs,
    deleteDoc,
    collection
} from 'firebase/firestore';

type SyncAction =
    | { type: 'add'; model: string; data: any }
    | { type: 'update'; model: string; id: string; data: any }
    | { type: 'delete'; model: string; id: string };

const STORAGE_KEY = 'vaultlog_sync_queue';

function loadQueue(): SyncAction[] {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
}

function saveQueue(queue: SyncAction[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function queueSync(action: SyncAction) {
    // Ensure action.id is a string when it's a delete action
    if (action.type === 'delete' && typeof action.id !== 'string') {
        console.warn('ID in delete action is not a string:', action.id);
        // Fix the ID if it's an object with an id property
        if (typeof action.id === 'object' && action.id !== null && 'id' in action.id) {
            action = {
                ...action,
                id: (action.id as any).id
            };
        }
    }

    const queue = loadQueue();
    queue.push(action);
    saveQueue(queue);

    // Immediately attempt sync if online
    if (navigator.onLine) processQueue();
}

let syncing = false;

export async function processQueue() {
    if (!navigator.onLine || syncing) return;

    const queue = loadQueue();
    if (!queue.length) return;

    syncing = true;
    for (const action of queue) {
        try {
            console.log('Syncing action:', action);
            await syncToFirebase(action);
        } catch (err) {
            console.warn('Failed to sync', action, err);
            syncing = false;
            return;
        }
    }

    saveQueue([]);
    syncing = false;
}

export async function syncToFirebase(action: SyncAction) {
    const col = collection(firestoreDb, action.model);

    if (action.type === 'add') {
        if (!action.data.id) {
            throw new Error('Missing ID in action.data for add sync');
        }

        const ref = doc(col, action.data.id); // Use the same ID
        await setDoc(ref, action.data);
    }


    if (action.type === 'update') {
        const ref = doc(col, action.id);
        await setDoc(ref, action.data, { merge: true });
    }

    if (action.type === 'delete') {
        if (!action.id) {
            throw new Error('Missing ID for delete sync action');
        }

        // Check if action.id is an object with an id property (which indicates data mutation)
        const idToUse = typeof action.id === 'object' && action.id !== null && 'id' in action.id
            ? (action.id as any).id
            : action.id;

        console.log('Using ID for deletion:', idToUse);
        const ref = doc(col, idToUse);
        await deleteDoc(ref);
    }

}

export const addToSyncQueue = queueSync;