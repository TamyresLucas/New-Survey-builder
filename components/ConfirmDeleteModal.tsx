import React, { useEffect, useRef } from 'react';
import { XIcon, WarningIcon } from './icons';
import { Button } from './Button';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Delete Question',
    message = 'Are you sure you want to delete this question? This action is irreversible.'
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
            if (event.key === 'Enter') {
                onConfirm();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, onConfirm]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center backdrop-blur-sm"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="bg-surface-container rounded-xl shadow-2xl w-full max-w-md m-4 flex flex-col border border-outline-variant overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                    <div className="flex items-center gap-2 text-error">
                        <WarningIcon className="text-xl" />
                        <h2 className="text-lg font-bold text-on-surface">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors"
                        aria-label="Close"
                    >
                        <XIcon className="text-xl" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-on-surface leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="p-4 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-low">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="px-5"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        className="px-5 shadow-sm"
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
};
