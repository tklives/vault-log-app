import { useState, useEffect } from 'react';
import { db, Athlete } from '../db/db';

export function useAthletes() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);

  const load = async () => {
    const all = await db.athletes.orderBy('createdAt').reverse().toArray();
    setAthletes(all);
  };

  const add = async (data: Omit<Athlete, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAthlete: Athlete = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.athletes.add(newAthlete);
    load();
  };

  const update = async (id: string, data: Partial<Athlete>) => {
    await db.athletes.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    load();
  };

  const remove = async (id: string) => {
    await db.athletes.delete(id);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return { athletes, add, update, remove, reload: load };
}
