// src/components/Modal.tsx
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="relative bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 
             rounded-xl p-6 w-full max-w-md shadow-xl border border-zinc-200 dark:border-zinc-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-3 right-3">
                    <Button
                        onClick={onClose}
                        variant="icon"
                        className="absolute top-0 right-0"
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6" />
                    </Button>

                </div>

                {title && (
                    <h2 className="text-xl font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                        {title}
                    </h2>
                )}
                {children}
            </div>

        </div>,
        document.body
    );
}
