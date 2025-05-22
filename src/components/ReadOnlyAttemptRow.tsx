import { Pen, Trash2, MessageCircle } from 'lucide-react';
import { formatFeetInches } from '../utils/length';
import { Attempt } from '../db/db';
import { clsx } from 'clsx';

interface ReadOnlyAttemptRowProps {
    attempt: Attempt;
    poles: {
        id: string;
        brand: string;
        weightRating?: number;
        length: number;
    }[];
    onEdit: (id: string, data: Attempt) => void;
    onDelete: (id: string) => void;
    onShowComment: (comment: string) => void;
}


export default function ReadOnlyAttemptRow({
    attempt,
    poles,
    onEdit,
    onDelete,
    onShowComment,
}: ReadOnlyAttemptRowProps) {
    const pole = poles.find((p) => p.id === attempt.poleId);

    return (
        <li
            key={attempt.id}
            className={clsx(
                "px-2 py-1 border-b last:border-none flex justify-between items-center rounded",
                attempt.result === "make"
                    ? "bg-green-100"
                    : attempt.result === "miss"
                        ? "bg-red-100"
                        : ""
            )}
        >

            <div className="font-mono">
                #{attempt.attemptNumber} · Grip {formatFeetInches(attempt.gripHeight)} · Start {formatFeetInches(attempt.startDistance)}  ·{' '} TO {formatFeetInches(attempt.takeoffDistance)} ·{' '}
                <span className="font-bold">{attempt.result === 'make' ? 'O' : 'X'}</span> 
                 {' '}·{' '}
                {pole && (
                    <>
                        {' '}
                        {pole.brand} {formatFeetInches(pole.length)} 
                        {pole.weightRating && ` ${pole.weightRating}lbs`}
                    </>
                )}

            </div>


            <div className="flex items-center gap-2">
                {attempt.comment && (
                    <button
                        onClick={() => onShowComment(attempt.comment!)}
                        className="text-zinc-500 hover:text-blue-600 cursor-pointer"
                    >
                        <MessageCircle className="w-4 h-4" />
                    </button>
                )}

                <button
                    onClick={() => onEdit(attempt.id, attempt)}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                    <Pen className="w-4 h-4" />
                </button>

                <button
                    onClick={() => onDelete(attempt.id)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </li>
    );
}
