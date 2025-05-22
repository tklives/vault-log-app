import { useEffect, useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { inchesToFeetAndInches, feetAndInchesToInches } from '../utils/length';
import type { Pole } from '../db/db';

interface PoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Pole, 'id' | 'createdAt'>) => void;
    initialData?: Omit<Pole, 'id' | 'createdAt'>;
}

export default function PoleModal({ isOpen, onClose, onSave, initialData }: PoleModalProps) {
    const [form, setForm] = useState<{
        brand: string;
        feet: number;
        inches: number;
        flex: string;
        weightRating: number | undefined;
        notes: string;
    }>({
        brand: '',
        feet: 13,
        inches: 0,
        flex: '',
        weightRating: undefined,
        notes: '',
    });


    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const { feet, inches } = inchesToFeetAndInches(initialData.length);
                setForm({
                    brand: initialData.brand,
                    feet,
                    inches,
                    flex: initialData.flex || '',
                    weightRating: initialData.weightRating,
                    notes: initialData.notes || '',
                });
            } else {
                setForm({ brand: '', feet: 13, inches: 0, flex: '', weightRating: undefined, notes: '' });
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'length' || name === 'weightRating' ? parseInt(value) || undefined : value,
        }));
    };

    const handleSubmit = () => {
        const length = feetAndInchesToInches(form.feet, form.inches);
        if (!form.brand || !length) return;
        onSave({ ...form, length });
        onClose();
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Pole">
            <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Brand</label>
                    <input
                        name="brand"
                        type="text"
                        value={form.brand}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded text-sm border-zinc-300"
                    />
                </div>

                <div className="flex items-end gap-2">
                    <div className="w-1/2">
                        <label className="block text-sm font-medium">Feet</label>
                        <input
                            name="feet"
                            type="number"
                            value={form.feet}
                            onChange={(e) => setForm({ ...form, feet: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border rounded text-sm border-zinc-300"
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-sm font-medium">Inches</label>
                        <input
                            name="inches"
                            type="number"
                            value={form.inches}
                            onChange={(e) => setForm({ ...form, inches: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border rounded text-sm border-zinc-300"
                        />
                    </div>
                </div>


                <div>
                    <label className="block text-sm font-medium">Flex (optional)</label>
                    <input
                        name="flex"
                        type="text"
                        value={form.flex}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded text-sm border-zinc-300"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Weight Rating (lbs, optional)</label>
                    <input
                        name="weightRating"
                        type="number"
                        value={form.weightRating ?? ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded text-sm border-zinc-300"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Notes</label>
                    <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded text-sm border-zinc-300"
                    />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose} className='text-black'>Cancel</Button>
                    <Button type="button" variant="primary" onClick={handleSubmit}>Save</Button>
                </div>
            </form>
        </Modal>
    );
}
