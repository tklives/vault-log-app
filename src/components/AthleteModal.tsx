import { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

interface AthleteFormData {
    name: string;
    grade: number;
    gender: 'male' | 'female';
}

interface AthleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AthleteFormData) => void;
    initialData?: AthleteFormData; // for editing later
}

export default function AthleteModal({
    isOpen,
    onClose,
    onSave,
    initialData,
}: AthleteModalProps) {
    const [form, setForm] = useState<AthleteFormData>({
        name: '',
        grade: 9,
        gender: 'male',
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setForm(initialData);
            } else {
                setForm({ name: '', grade: 9, gender: 'male' });
            }
        }
    }, [isOpen, initialData]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'grade' ? parseInt(value) : value,
        }));
    };

    const handleSubmit = () => {
        if (!form.name.trim()) return;
        onSave(form);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Athlete">
            <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 mt-1 border rounded text-sm border-zinc-300"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Grade</label>
                    <select
                        name="grade"
                        value={form.grade}
                        onChange={handleChange}
                        className="w-full px-3 py-2 mt-1 border rounded text-sm border-zinc-300"
                    >
                        {[9, 10, 11, 12].map((g) => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium">Gender</label>
                    <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 mt-1 border rounded text-sm border-zinc-300"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose} className='text-black'>Cancel</Button>
                    <Button type="button" variant="primary" onClick={handleSubmit}>Save</Button>
                </div>

            </form>
        </Modal>
    );
}
