import { useEffect, useState } from 'react';
import { db, Pole } from '../db/db';

export function usePoles() {
  const [poles, setPoles] = useState<Pole[]>([]);

  const load = async () => {
    const all = await db.poles.orderBy('createdAt').reverse().toArray();
    setPoles(all);
  };

  const add = async (data: Omit<Pole, 'id' | 'createdAt'>) => {
    const newPole: Pole = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    await db.poles.add(newPole);
    load();
  };

  const update = async (id: string, data: Partial<Pole>) => {
    await db.poles.update(id, {
      ...data,
      createdAt: new Date().toISOString(),
    });
    load();
  };

  const remove = async (id: string) => {
    await db.poles.delete(id);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return { poles, add, update, remove };
}
