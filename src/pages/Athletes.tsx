import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import AthleteModal from '../components/AthleteModal';
import Button from '../components/ui/Button';
import { Athlete } from '../db/db';
import { addToSyncQueue } from '../db/syncQueue';
import { useAthletes } from '../hooks/useAthletes';

export default function Athletes() {
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Athlete | null>(null);

  const { athletes, add, update, remove } = useAthletes();

  const handleSave = async (data: Partial<Athlete>) => {
    if (editTarget) {
      const updatedAthlete = {
        id: editTarget.id,
        name: data.name!,
        grade: data.grade!,
        gender: data.gender!,
      };

      await update(editTarget.id, updatedAthlete);
      await addToSyncQueue({ type: 'update', model: 'athletes', id: editTarget.id, data: updatedAthlete }); // ✅ sync

      setEditTarget(null);
    } else {
      if (data.name && data.grade && data.gender) {
        const newAthlete = {
          id: crypto.randomUUID(), // ✅ ensure we include id
          name: data.name,
          grade: data.grade,
          gender: data.gender,
          createdAt: new Date().toISOString(),
        };

        await add(newAthlete);
        await addToSyncQueue({ type: 'add', model: 'athletes', data: newAthlete }); // ✅ sync
      } else {
        console.error('Missing required fields: name, grade, or gender');
      }
    }

    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this athlete?')) {
      console.log('Deleting athlete with id:', id);
      await remove(id);
      await addToSyncQueue({ type: 'delete', model: 'athletes', id }); // ✅ sync
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Athletes</h2>
        <Button
          onClick={() => {
            setEditTarget(null);
            setOpen(true);
          }}
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 cursor-pointer flex items-center gap-1 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Athlete
        </Button>
      </div>

      <ul className="space-y-2">
        {athletes.map((athlete) => (
          <li
            key={athlete.id}
            className="border px-4 py-2 rounded text-sm bg-zinc-50 flex justify-between items-center"
          >
            <span>
              {athlete.name} — Grade {athlete.grade} — {athlete.gender}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditTarget(athlete);
                  setOpen(true);
                }}
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(athlete.id)}
                className="text-red-600 hover:text-red-800 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <AthleteModal
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setEditTarget(null);
        }}
        onSave={handleSave}
        initialData={editTarget || undefined}
      />
    </div>
  );
}
