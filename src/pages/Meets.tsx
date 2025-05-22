import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, Meet } from '../db/db';
import { addToSyncQueue } from '../db/syncQueue';
import Button from '../components/ui/Button';
import MeetModal from '../components/MeetModal';
import { Plus } from 'lucide-react';

export default function Meets() {
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Meet | null>(null);
  const [meets, setMeets] = useState<Meet[]>([]);
  const [name, setName] = useState('');
  const [genderGrouping, setGenderGrouping] = useState<'combined' | 'separate'>('combined');
  const navigate = useNavigate();

  useEffect(() => {
    db.meets.orderBy('date').reverse().toArray().then(setMeets);
  }, []);

  const handleSave = async (data: Omit<Meet, 'id' | 'createdAt' | 'athleteIds'>, id?: string) => {
    const meetId = id ?? crypto.randomUUID();

    const meet: Meet = {
      ...data,
      id: meetId,
      createdAt: id
        ? meets.find(m => m.id === id)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString(),
      athleteIds: [],
    };

    if (id) {
      await db.meets.put(meet);

      // ✅ always update from latest state
      setMeets(prev =>
        prev.map(m => m.id === id ? { ...m, ...meet } : m)
      );

      await addToSyncQueue({ type: 'update', model: 'meets', id, data: meet });
    } else {
      await db.meets.add(meet);

      setMeets(prev => [meet, ...prev]);
      await addToSyncQueue({ type: 'add', model: 'meets', data: meet });
    }

    return meetId;
  };

  const handleEdit = (meet: Meet) => {
    setEditTarget(meet);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this meet?')) return;

    await db.meets.delete(id);
    await addToSyncQueue({ type: 'delete', model: 'meets', id });
    setMeets(prev => prev.filter(m => m.id !== id));
  };


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Track Meets</h2>

      <div className="flex flex-wrap gap-2 items-start">
        <input
          type="text"
          placeholder="Meet name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 rounded flex-1 min-w-[200px] text-sm"
        />
        <select
          value={genderGrouping}
          onChange={(e) => setGenderGrouping(e.target.value as any)}
          className="border px-2 py-2 rounded text-sm min-w-[140px]"
        >
          <option value="combined">Combined</option>
          <option value="separate">Boys/Girls Separate</option>
        </select>
        <Button onClick={() => setOpen(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 cursor-pointer flex items-center gap-1 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Meet
        </Button>
      </div>


      <ul className="space-y-2">
        {meets.map((meet) => (
          <li key={meet.id} className="border px-4 py-2 rounded cursor-pointer hover:bg-zinc-100 flex justify-between items-center">
            <div onClick={() => navigate(`/meet/${meet.id}`)} className="flex-1">
              <div className="text-sm font-medium">{meet.name}</div>
              <div className="text-xs text-zinc-500">{new Date(meet.date).toLocaleDateString()}</div>
            </div>

            <div className="flex gap-2 ml-4">
              <Button variant="icon" onClick={() => handleEdit(meet)} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                ✏️
              </Button>
              <Button variant="icon" onClick={() => handleDelete(meet.id)} className="text-red-600 hover:text-red-800 cursor-pointer">
                🗑
              </Button>
            </div>
          </li>

        ))}
      </ul>

      <MeetModal
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setEditTarget(null);
        }}
        onSave={handleSave}
        onNavigateToMeet={(id) => navigate(`/meet/${id}`)}
        meet={editTarget ?? undefined}
      />



    </div>

  );
}
