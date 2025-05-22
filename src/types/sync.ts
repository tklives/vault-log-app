export interface SyncQueueItem {
  id?: number; // auto-incremented by IndexedDB
  table: 'athletes' | 'poles' | 'meets' | 'attempts'; // must match your db tables
  operation: 'add' | 'update' | 'delete';
  payload: any; // the object you're syncing
  timestamp: number;
}
