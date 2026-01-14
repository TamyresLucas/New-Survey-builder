import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './icons';
import { TextArea } from './TextArea';
import { Button } from './Button';

interface PasteGridModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rowsText: string, columnsText: string) => void;
    initialRowsText: string;
    initialColumnsText: string;
}

export const PasteGridModal: React.FC<PasteGridModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialRowsText,
    initialColumnsText
}) => {
    const [rowsText, setRowsText] = useState('');
    const [columnsText, setColumnsText] = useState('');
    const [rowsError, setRowsError] = useState<string | null>(null);
    const [columnsError, setColumnsError] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const rowsTextareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setRowsText(initialRowsText);
            setColumnsText(initialColumnsText);
            setRowsError(null);
            setColumnsError(null);
            // Timeout to allow the modal to render before focusing
            setTimeout(() => rowsTextareaRef.current?.focus(), 0);
        }
    }, [isOpen, initialRowsText, initialColumnsText]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleSave = () => {
        const rowLines = rowsText.trim().split('\n').filter(line => line.trim() !== '');
        const colLines = columnsText.trim().split('\n').filter(line => line.trim() !== '');

        let hasError = false;

        if (rowLines.length < 1) {
            setRowsError('At least 1 row must be added.');
            hasError = true;
        }

        if (colLines.length < 1) {
            setColumnsError('At least 1 column must be added.');
            hasError = true;
        }

        if (hasError) return;

        onSave(rowsText.trim(), columnsText.trim());
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            <div
                ref={modalRef}
                className="bg-surface-container rounded-lg shadow-xl w-full max-w-2xl m-4 flex flex-col border border-outline-variant"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                    <h2 className="text-lg font-bold text-on-surface">Add Multiple Rows and Columns</h2>
                    <Button
                        variant="tertiary"
                        iconOnly
                        onClick={onClose}
                        className="text-on-surface-variant"
                    >
                        <XIcon className="text-xl" />
                    </Button>
                </div>
                <div className="p-6 flex-grow">
                    <div className="flex flex-col gap-6">
                        {/* Rows Section */}
                        <div>
                            <label htmlFor="paste-rows-area" className="block text-sm font-medium text-on-surface-variant mb-2">
                                Rows (one per line)
                            </label>
                            <TextArea
                                id="paste-rows-area"
                                ref={rowsTextareaRef}
                                value={rowsText}
                                onChange={(e) => {
                                    setRowsText(e.target.value);
                                    if (rowsError) setRowsError(null);
                                }}
                                rows={8}
                                error={!!rowsError}
                                placeholder={"Row 1\nRow 2\nRow 3..."}
                            />
                            {rowsError && (
                                <p className="text-sm text-error mt-2" role="alert">
                                    {rowsError}
                                </p>
                            )}
                        </div>

                        {/* Columns Section */}
                        <div>
                            <label htmlFor="paste-columns-area" className="block text-sm font-medium text-on-surface-variant mb-2">
                                Columns (one per line)
                            </label>
                            <TextArea
                                id="paste-columns-area"
                                value={columnsText}
                                onChange={(e) => {
                                    setColumnsText(e.target.value);
                                    if (columnsError) setColumnsError(null);
                                }}
                                rows={8}
                                error={!!columnsError}
                                placeholder={"Column 1\nColumn 2\nColumn 3..."}
                            />
                            {columnsError && (
                                <p className="text-sm text-error mt-2" role="alert">
                                    {columnsError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-outline-variant flex justify-end gap-3">
                    <Button
                        onClick={onClose}
                        variant="tertiary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="primary"
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
};
