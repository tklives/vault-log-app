import Dexie, { Table } from 'dexie';

export interface Athlete {
  id: string;
  name: string;
  grade: number;
  gender: 'male' | 'female';
  createdAt: string;
  updatedAt: string;
}

export interface Pole {
  id: string;
  brand: string;
  length: number; // stored in inches
  flex: string;
  weightRating?: number;
  notes?: string;
  createdAt: string;
}

export interface Meet {
  id: string;
  name: string;
  date: string; // ISO string
  genderGrouping: 'combined' | 'separate';
  athleteIds: string[]; // linked athletes
  createdAt: string;
}

export interface Attempt {
  id: string;
  meetId: string;
  athleteId: string;
  poleId?: string;
  height: number; // inches
  gripHeight: number; // inches
  startDistance: number; // inches
  takeoffDistance: number; // inches
  result: 'make' | 'miss';
  comment?: string;
  attemptNumber: number; // 1, 2, 3
  createdAt: string;
}

class VaultDB extends Dexie {
  athletes!: Table<Athlete, string>;
  poles!: Table<Pole, string>;
  meets!: Table<Meet, string>;
  attempts!: Table<Attempt, string>;

  constructor() {
    super('VaultLog');

    this.version(5).stores({
      athletes: 'id, name, grade, gender, createdAt',
      poles: 'id, brand, length, createdAt',
      meets: 'id, name, date, type, createdAt',
      attempts: 'id, athleteId, meetId, height, attemptNumber, createdAt, [athleteId+meetId]',
      syncQueue: '++id, table, operation, timestamp',
    });



  }
}


export const db = new VaultDB();
