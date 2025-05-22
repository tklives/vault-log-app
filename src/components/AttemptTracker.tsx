import { useEffect, useState } from 'react';
import { Attempt, db, Pole } from '../db/db';
import { formatFeetInches, feetAndInchesToInches, inchesToFeetAndInches } from '../utils/length';
import FeetInchesInput from './ui/FeetInchesInput';
import Button from './ui/Button';
import EditableAttemptRow from "./EditableAttemptRow";
import ReadOnlyAttemptRow from './ReadOnlyAttemptRow';
import { addToSyncQueue } from '../db/syncQueue';

interface AttemptTrackerProps {
    athleteId: string;
    meetId: string;
    poles: Pole[];
}

export default function AttemptTracker({ athleteId, meetId, poles }: AttemptTrackerProps) {
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [form, setForm] = useState({
        heightFeet: 8,
        heightInches: 0,
        gripFeet: 11,
        gripInches: 0,
        startFeet: 55,
        startInches: 0,
        takeoffFeet: 9,
        takeoffInches: 0,
        poleId: '',
        comment: '',
    });

    const [showCommentModal, setShowCommentModal] = useState(false);
    const [selectedComment, setSelectedComment] = useState<string | null>(null);
    const [editModeId, setEditModeId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);


    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const a = await db.attempts
            .where({ athleteId, meetId })
            .sortBy('createdAt');
        setAttempts(a.reverse());
        if (a.length) {
            const last = a[0];
            const { feet: gripFeet, inches: gripInches } = inchesToFeetAndInches(last.gripHeight);
            const { feet: startFeet, inches: startInches } = inchesToFeetAndInches(last.startDistance);
            const { feet: takeoffFeet, inches: takeoffInches } = inchesToFeetAndInches(last.takeoffDistance);
            const { feet: heightFeet, inches: heightInches } = inchesToFeetAndInches(last.height + 6);
            setForm({
                heightFeet,
                heightInches,
                gripFeet,
                gripInches,
                startFeet,
                startInches,
                takeoffFeet,
                takeoffInches,
                poleId: last.poleId ?? '',
                comment: '',
            });
        }
    };

    const handleSave = async (result: 'make' | 'miss') => {
        const heightInches = feetAndInchesToInches(form.heightFeet, form.heightInches);

        const currentAttemptsAtHeight = attempts.filter(
            (a) => a.height === heightInches
        );
        const attemptNumber = currentAttemptsAtHeight.length + 1;

        const newAttempt: Attempt = {
            id: crypto.randomUUID(),
            meetId,
            athleteId,
            height: heightInches,
            gripHeight: feetAndInchesToInches(form.gripFeet, form.gripInches),
            startDistance: feetAndInchesToInches(form.startFeet, form.startInches),
            takeoffDistance: feetAndInchesToInches(form.takeoffFeet, form.takeoffInches),
            poleId: form.poleId || undefined,
            comment: form.comment || undefined,
            result,
            attemptNumber,
            createdAt: new Date().toISOString(),
        };

        await db.attempts.add(newAttempt);

        await addToSyncQueue({
            type: 'add',
            model: 'attempts',
            data: newAttempt,
        });

        // ⬇️ Prefill next form based on result
        const nextHeight = result === 'make' ? heightInches + 6 : heightInches;
        const { feet: heightFeet, inches: heightInchesFinal } = inchesToFeetAndInches(nextHeight);

        setForm({
            heightFeet,
            heightInches: heightInchesFinal,
            gripFeet: form.gripFeet,
            gripInches: form.gripInches,
            startFeet: form.startFeet,
            startInches: form.startInches,
            takeoffFeet: form.takeoffFeet,
            takeoffInches: form.takeoffInches,
            poleId: form.poleId,
            comment: '',
        });

        setAttempts((prev) => [newAttempt, ...prev]);
    };

    const [editBuffer, setEditBuffer] = useState<Record<string, Partial<Attempt>>>({});

    const updateEdit = <T extends keyof Attempt>(id: string, field: T, value: Attempt[T]) => {
        setEditBuffer((prev) => {
            const current = prev[id] ?? {};
            return {
                ...prev,
                [id]: {
                    ...current,
                    [field]: value,
                },
            };
        });
    };

    const saveEdit = async (id: string) => {
        const updates = editBuffer[id];
        await db.attempts.update(id, updates);
        await addToSyncQueue({
            type: 'update',
            model: 'attempts',
            id,
            data: updates,
        });


        setAttempts((prev) =>
            prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
        );
        setEditId(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this attempt?')) {
            await db.attempts.delete(id);
            await addToSyncQueue({
                type: 'delete',
                model: 'attempts',
                id,
            });
            setAttempts((prev) => prev.filter((a) => a.id !== id));
        }
    };

    const bucketed = groupByHeight(attempts);

    return (
        <div className="mt-4 border-t pt-4 space-y-4">
            <div className="flex flex-wrap gap-2 items-end text-sm">
                <div>
                    <label className="block text-xs font-medium">Height</label>
                    <FeetInchesInput
                        valueInches={feetAndInchesToInches(form.heightFeet, form.heightInches)}
                        onChange={(val: number) => {
                            const { feet, inches } = inchesToFeetAndInches(val);
                            setForm({ ...form, heightFeet: feet, heightInches: inches });
                        }}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium">Grip</label>
                    <FeetInchesInput
                        valueInches={feetAndInchesToInches(form.gripFeet, form.gripInches)}
                        onChange={(val: number) => {
                            const { feet, inches } = inchesToFeetAndInches(val);
                            setForm({ ...form, gripFeet: feet, gripInches: inches });
                        }}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium">Start Dist</label>
                    <FeetInchesInput
                        valueInches={feetAndInchesToInches(form.startFeet, form.startInches)}
                        onChange={(val: number) => {
                            const { feet, inches } = inchesToFeetAndInches(val);
                            setForm({ ...form, startFeet: feet, startInches: inches });
                        }}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium">Takeoff</label>
                    <FeetInchesInput
                        valueInches={feetAndInchesToInches(form.takeoffFeet, form.takeoffInches)}
                        onChange={(val: number) => {
                            const { feet, inches } = inchesToFeetAndInches(val);
                            setForm({ ...form, takeoffFeet: feet, takeoffInches: inches });
                        }}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium">Pole</label>
                    <select
                        value={form.poleId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setForm({ ...form, poleId: e.target.value })
                        }
                        className="border px-2 py-1 rounded text-sm"
                    >
                        <option value="">Select</option>
                        {poles.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.brand} {formatFeetInches(p.length)} {p.weightRating} lbs
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex gap-1">
                <Button variant="primary" onClick={() => handleSave('make')}>Make</Button>
                <Button variant="danger" onClick={() => handleSave('miss')}>Miss</Button>
            </div>


            {/* Buckets */}
            {
                Object.keys(bucketed)
                    .sort((a, b) => parseInt(b) - parseInt(a))
                    .map((height) => (
                        <ul key={height} className="border rounded mb-2">
                            <li className="bg-zinc-100 px-2 py-1 font-semibold text-xl">
                                {formatFeetInches(Number(height))}
                            </li>
                            {bucketed[height].map((a) =>
                                editId === a.id ? (
                                    // Editable row
                                    <EditableAttemptRow
                                        attempt={a}
                                        buffer={editBuffer[a.id] ?? a}
                                        poles={poles}
                                        onChange={(field, value) => updateEdit(a.id, field, value)}
                                        onSave={() => saveEdit(a.id)}
                                        onCancel={() => setEditId(null)}
                                    />

                                ) : (
                                    // Read-only row
                                    <ReadOnlyAttemptRow
                                        key={a.id}
                                        attempt={a}
                                        poles={poles}
                                        onEdit={(id, data) => {
                                            setEditBuffer((prev) => ({ ...prev, [id]: { ...data } }));
                                            setEditId(id);
                                        }}
                                        onDelete={handleDelete}
                                        onShowComment={(comment) => {
                                            setSelectedComment(comment);
                                            setShowCommentModal(true);
                                        }}
                                    />

                                )
                            )}
                        </ul>
                    ))
            }

            {/* Comment Modal */}
            {
                showCommentModal && selectedComment && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded shadow max-w-md w-full">
                            <h3 className="text-sm font-semibold mb-2">Comment</h3>
                            <p className="text-sm text-zinc-700 whitespace-pre-line">{selectedComment}</p>
                            <div className="text-right pt-4">
                                <Button variant="secondary" onClick={() => setShowCommentModal(false)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

// Utilities

function groupByHeight(attempts: Attempt[]): Record<string, Attempt[]> {
    return attempts.reduce((acc, a) => {
        const key = a.height.toString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(a);
        return acc;
    }, {} as Record<string, Attempt[]>);
}
