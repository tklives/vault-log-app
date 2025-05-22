import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, Meet, Athlete, Pole } from '../db/db';
import { addToSyncQueue } from '../db/syncQueue';
import AttemptTracker from '../components/AttemptTracker';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

export default function MeetDetail() {
    const { id } = useParams();
    const [meet, setMeet] = useState<Meet | null>(null);
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [allAthletes, setAllAthletes] = useState<Athlete[]>([]);
    const [showBoys, setShowBoys] = useState(true);
    const [showGirls, setShowGirls] = useState(true);
    const [poles, setPoles] = useState<Pole[]>([]);
    const [openAthletes, setOpenAthletes] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const load = async () => {
            const m = await db.meets.get(id!);
            if (m) {
                setMeet(m);
                const [allAthletes, allPoles] = await Promise.all([
                    db.athletes.toArray(),
                    db.poles.toArray(),
                ]);

                setAllAthletes(allAthletes);
                setPoles(allPoles);

                const assigned = allAthletes.filter((a) => m.athleteIds.includes(a.id));
                setAthletes(assigned);
            }
        };
        load();
    }, [id]);

    const handleAddAthlete = async (athlete: Athlete) => {
        if (!meet || meet.athleteIds.includes(athlete.id)) return;
        const updated = { ...meet, athleteIds: [...meet.athleteIds, athlete.id] };
        await db.meets.put(updated);
        setMeet(updated);
        setAthletes(prev => [...prev, athlete]);

        await addToSyncQueue({
            type: 'update',
            model: 'meets',
            id: updated.id,
            data: updated,
        });
    };

    const handleRemoveAthlete = async (athleteId: string) => {
        if (!meet) return;
        const updated = { ...meet, athleteIds: meet.athleteIds.filter((id) => id !== athleteId) };
        await db.meets.put(updated);
        setMeet(updated);
        setAthletes(prev => prev.filter(a => a.id !== athleteId));

        await addToSyncQueue({
            type: 'update',
            model: 'meets',
            id: updated.id,
            data: updated,
        }); // ✅ sync
    };

    const toggleAthlete = (id: string) => {
        setOpenAthletes((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    if (!meet) return <div className="text-sm text-zinc-500">Loading...</div>;

    const boys = athletes.filter((a) => a.gender === 'male');
    const girls = athletes.filter((a) => a.gender === 'female');

    const renderAthleteRow = (a: Athlete) => {
        const isOpen = openAthletes[a.id] ?? true;

        return (
            <li key={a.id} className="border rounded bg-white">
                <div
                    className="flex justify-between items-center px-4 py-2 cursor-pointer"
                    onClick={() => toggleAthlete(a.id)}
                >
                    <div className="flex items-center gap-2 text-sm font-medium">
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <span className="text-xl">{a.name}</span>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // prevent toggle on delete
                            handleRemoveAthlete(a.id);
                        }}
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {isOpen && (
                    <div className="px-4 pb-4">
                        <AttemptTracker
                            athleteId={a.id}
                            meetId={meet.id}
                            poles={poles}
                        />
                    </div>
                )}
            </li>
        );
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{meet.name}</h2>
            <p className="text-sm text-zinc-500">
                Date: {new Date(meet.date).toLocaleDateString()} · Grouping: {meet.genderGrouping}
            </p>

            {/* Add Athlete Dropdown */}
            <div className="flex gap-2 items-center">
                <select
                    className="border rounded px-2 py-1 text-sm"
                    onChange={(e) => {
                        const a = allAthletes.find((a) => a.id === e.target.value);
                        if (a) handleAddAthlete(a);
                    }}
                >
                    <option value="">Add Athlete...</option>
                    {allAthletes
                        .filter((a) => !meet.athleteIds.includes(a.id))
                        .map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name} ({a.grade})
                            </option>
                        ))}
                </select>
            </div>

            {meet.genderGrouping === 'separate' ? (
                <div className="space-y-6">
                    {/* Boys Section */}
                    <div>
                        <button
                            onClick={() => setShowBoys((prev) => !prev)}
                            className="flex items-center gap-2 text-lg font-semibold mb-2 cursor-pointer"
                        >
                            {showBoys ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            <span>Boys</span>
                        </button>

                        {showBoys && (
                            <ul className="space-y-2">
                                {athletes.filter((a) => a.gender === 'male').map(renderAthleteRow)}
                            </ul>
                        )}
                    </div>

                    {/* Girls Section */}
                    <div>
                        <button
                            onClick={() => setShowGirls((prev) => !prev)}
                            className="flex items-center gap-2 text-lg font-semibold mb-2 cursor-pointer"
                        >
                            {showGirls ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            <span>Girls</span>
                        </button>

                        {showGirls && (
                            <ul className="space-y-2">
                                {athletes.filter((a) => a.gender === 'female').map(renderAthleteRow)}
                            </ul>
                        )}
                    </div>

                </div>
            ) : (
                // Combined list for "combined" grouping
                <ul className="space-y-2">{athletes.map(renderAthleteRow)}</ul>
            )}

        </div>
    );
}
