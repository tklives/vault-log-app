// src/pages/FirebaseTest.tsx
import { useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function FirebaseTest() {
  useEffect(() => {
    const testFirebase = async () => {
      try {
        // 🔥 1. Write test
        await addDoc(collection(db, 'test'), {
          message: 'Vault Log App connected successfully!',
          timestamp: new Date().toISOString(),
        });

        console.log('✅ Write successful!');

        // 🔎 2. Read test
        const snapshot = await getDocs(collection(db, 'test'));
        snapshot.forEach((doc) => {
          console.log('📄 Firestore Doc:', doc.id, doc.data());
        });
      } catch (err) {
        console.error('❌ Firebase test failed:', err);
      }
    };

    testFirebase();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Firebase Test</h1>
      <p>Check your console and Firestore dashboard for results.</p>
    </div>
  );
}
