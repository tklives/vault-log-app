import { formatFeetInches } from "../utils/length";
import FeetInchesInput from "./ui/FeetInchesInput";
import Button from "./ui/Button";
import type { Attempt, Pole } from "../db/db";

interface Props {
    attempt: Attempt;
    buffer: Partial<Attempt>;
    poles: Pole[];
    onChange: (field: keyof Attempt, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function EditableAttemptRow({
    attempt,
    buffer,
    poles,
    onChange,
    onSave,
    onCancel,
}: Props) {
    return (
        <li
            key={attempt.id}
            className="px-2 py-1 border-b flex justify-between items-center gap-2 text-sm flex-wrap"
        >
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-zinc-400 font-mono">#{attempt.attemptNumber}</span>

                <span className="text-xs text-zinc-500">Grip</span>
                <FeetInchesInput
                    valueInches={buffer.gripHeight ?? 0}
                    onChange={(val) => onChange("gripHeight", val)}
                />

                <span className="text-xs text-zinc-500">Start</span>
                <FeetInchesInput
                    valueInches={buffer.startDistance ?? 0}
                    onChange={(val) => onChange("startDistance", val)}
                />

                <span className="text-xs text-zinc-500">TO</span>
                <FeetInchesInput
                    valueInches={buffer.takeoffDistance ?? 0}
                    onChange={(val) => onChange("takeoffDistance", val)}
                />

                <select
                    value={buffer.poleId ?? ""}
                    onChange={(e) => onChange("poleId", e.target.value)}
                    className="border px-2 py-1 rounded text-xs"
                >
                    <option value="">No Pole</option>
                    {poles.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.brand} · {formatFeetInches(p.length)} · {p.weightRating} lbs
                        </option>
                    ))}
                </select>

                <select
                    value={buffer.result}
                    onChange={(e) =>
                        onChange("result", e.target.value as "make" | "miss")
                    }
                    className="border px-2 py-1 rounded text-xs"
                >
                    <option value="make">✔ Make</option>
                    <option value="miss">❌ Miss</option>
                </select>
            </div>

            <div className="flex gap-2">
                <Button className="text-xs" onClick={onSave}>
                    Save
                </Button>
                <Button
                    variant="secondary"
                    className="text-xs text-black"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </div>
        </li>
    );
}
