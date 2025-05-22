import { useEffect } from 'react';
import { processQueue } from '../db/syncQueue';

export function useSyncEffect() {
  useEffect(() => {
    const handleOnline = () => {
      console.log('Online. Attempting to sync...');
      processQueue();
    };

    window.addEventListener('online', handleOnline);
    handleOnline(); // Attempt on initial mount

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);
}
