import { useEffect, useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { Meet } from '../db/db';

interface MeetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Meet, 'id' | 'createdAt' | 'athleteIds'>, existingId?: string) => Promise<string>;
    onNavigateToMeet: (id: string) => void;
    meet?: Meet;
}

export default function MeetModal({
    isOpen,
    onClose,
    onSave,
    onNavigateToMeet,
    meet,
}: MeetModalProps) {
    const isEditing = !!meet;

    const [form, setForm] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0], // yyyy-mm-dd
        genderGrouping: 'combined' as 'combined' | 'separate',
    });

    useEffect(() => {
        if (!isOpen) return;

        if (meet) {
            const dateString = new Date(meet.date).toISOString().split('T')[0];

            setForm({
                name: meet.name,
                date: dateString,
                genderGrouping: meet.genderGrouping || 'combined',
            });
        } else {
            // reset to defaults when adding
            setForm({
                name: '',
                date: new Date().toISOString().split('T')[0],
                genderGrouping: 'combined',
            });
        }
    }, [isOpen, meet]);


    const handleSubmit = async () => {
        if (form.name.trim() === '') return;

        const [year, month, day] = form.date.split('-').map(Number);
        const localDate = new Date(year, month - 1, day); // local midnight

        const data = {
            name: form.name.trim(),
            date: localDate.toISOString(), // proper ISO date
            genderGrouping: form.genderGrouping,
        };

        const newId = await onSave(data, meet?.id);
        onClose();
        return newId;
    };



    return (
        <Modal isOpen={isOpen} onClose={onClose} title={meet ? 'Edit Meet' : 'Create New Meet'}>
            <form className="space-y-4 text-sm">
                <div>
                    <label className="block font-medium">Meet Name</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded border-zinc-300"
                    />
                </div>

                <div>
                    <label className="block font-medium">Date</label>
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full px-3 py-2 border rounded border-zinc-300"
                    />
                </div>

                <div>
                    <label className="block font-medium">Gender Grouping</label>
                    <select
                        value={form.genderGrouping}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                genderGrouping: e.target.value as 'combined' | 'separate',
                            })
                        }
                        className="w-full px-3 py-2 border rounded border-zinc-300"
                    >
                        <option value="combined">Combined</option>
                        <option value="separate">Separate (Boys/Girls)</option>
                    </select>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>

                    {isEditing ? (
                        <Button type="button" variant="primary" onClick={handleSubmit}>
                            Update Meet
                        </Button>
                    ) : (
                        <>
                            <Button type="button" variant="primary" onClick={handleSubmit}>
                                Create Meet
                            </Button>

                            <Button
                                variant="primary"
                                onClick={async () => {
                                    if (form.name.trim() === '') return;
                                    const [year, month, day] = form.date.split('-').map(Number);
                                    const localDate = new Date(year, month - 1, day);
                                    const data = {
                                        name: form.name.trim(),
                                        date: localDate.toISOString(),
                                        genderGrouping: form.genderGrouping,
                                    };
                                    const newId = await onSave(data);
                                    if (newId) {
                                        onClose?.();
                                        onNavigateToMeet?.(newId);
                                    }
                                }}
                            >
                                Create & Go
                            </Button>
                        </>
                    )}
                </div>

            </form>
        </Modal>
    );
}
