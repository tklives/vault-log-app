import { collection, getDocs } from 'firebase/firestore';
import { db as firestoreDb } from '../lib/firebase';
import { db } from '../db/db';

// Define valid model names
type ModelName = 'athletes' | 'poles' | 'meets' | 'attempts';

export async function syncCollectionFromFirebase(model: ModelName) {
  const colRef = collection(firestoreDb, model);
  const snapshot = await getDocs(colRef);

  // Extract full documents (Firestore doc ID + data)
  const items = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Optional: basic runtime validation
  const validItems = items.filter(item =>
    item.id && typeof item.id === 'string'
  );

  // Replace local IndexedDB store with Firestore data
  await db[model].clear();
  await (db[model] as any).bulkAdd(validItems);
}
