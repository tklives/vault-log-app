import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { usePoles } from '../hooks/usePoles';
import Button from '../components/ui/Button';
import PoleModal from '../components/PoleModal';
import { formatFeetInches } from '../utils/length';
import { sortPoles } from '../utils/sortPoles';
import type { Pole } from '../db/db';
import { addToSyncQueue } from '../db/syncQueue';

import clsx from 'clsx';

export default function Poles() {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<Omit<Pole, 'id' | 'createdAt'> | null>(null);
  const { poles, add, update, remove } = usePoles();
  const [sortBy, setSortBy] = useState<'brand' | 'length' | 'weight'>('length');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');


  const handleSave = async (data: Omit<Pole, 'id' | 'createdAt'>) => {
    if (editData) {
      const poleToUpdate = poles.find(
        (p) =>
          p.brand === editData.brand &&
          p.length === editData.length &&
          p.flex === editData.flex
      );

      if (poleToUpdate) {
        await update(poleToUpdate.id, data);

        await addToSyncQueue({
          type: 'update',
          model: 'poles',
          id: poleToUpdate.id,
          data,
        }); // ✅ sync
      }
    } else {
      const id = await add(data);

      await addToSyncQueue({
        type: 'add',
        model: 'poles',
        data: { ...data, id },
      }); // ✅ sync
    }

    setOpen(false);
    setEditData(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this pole?')) {
      await remove(id);

      await addToSyncQueue({
        type: 'delete',
        model: 'poles',
        id,
      }); // ✅ sync
    }
  };

  const sortedPoles = sortPoles(poles, sortBy, sortDir);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Poles</h2>
        <Button onClick={() => { setEditData(null); setOpen(true); }}
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 cursor-pointer flex items-center gap-1 text-sm">
          <Plus className="w-4 h-4 mr-1 inline-block" />Add Pole
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span>Sort by:</span>
        {['brand', 'length', 'weight'].map((key) => (
          <button
            key={key}
            onClick={() => setSortBy(key as typeof sortBy)}
            className={clsx(
              'px-2 py-1 rounded hover:bg-zinc-200',
              sortBy === key && 'bg-zinc-300 font-semibold'
            )}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}

        <button
          onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          className="ml-2 px-2 py-1 rounded border border-zinc-300"
        >
          {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>


      <ul className="space-y-2 bg-zinc-50 p-4 rounded-md">
        {sortedPoles.map((pole) => (
          <li
            key={pole.id}
            className="flex items-center justify-between px-3 py-2 border rounded-md text-sm bg-white text-zinc-800"
          >
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <span className="font-mono">{formatFeetInches(pole.length)}</span>
              <span className="font-mono">{pole.weightRating ? `${pole.weightRating} lbs` : '—'}</span>
              <span className="uppercase font-medium">{pole.brand}</span>
              <span className="text-zinc-500">Flex: {pole.flex || '—'}</span>
            </div>

            <div className="flex gap-2 ml-4 shrink-0">
              <button onClick={() => { setEditData(pole); setOpen(true); }} className="text-zinc-500 hover:text-blue-600 cursor-pointer">
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(pole.id)}
                className="text-zinc-500 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

            </div>
          </li>


        ))}
      </ul>

      <PoleModal
        isOpen={open}
        onClose={() => { setOpen(false); setEditData(null); }}
        onSave={handleSave}
        initialData={editData || undefined}
      />
    </div>
  );
}
