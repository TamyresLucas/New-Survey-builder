import React, { useCallback } from 'react';
import type { Choice } from '../../../types';
import { XIcon, DragIndicatorIcon } from '../../icons';

interface ScalePointItemProps {
    scalePoint: Choice;
    onTextChange: (id: string, text: string) => void;
    onDelete: (id: string) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragOver: (e: React.DragEvent, id: string) => void;
    onDragEnd: (e: React.DragEvent) => void;
    isDragged: boolean;
}

const ScalePointItem: React.FC<ScalePointItemProps> = ({
    scalePoint,
    onTextChange,
    onDelete,
    onDragStart,
    onDragOver,
    onDragEnd,
    isDragged
}) => {
    const createPasteHandler = useCallback((onChange: (newValue: string) => void) => (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        const target = e.currentTarget;
        const start = target.selectionStart ?? 0;
        const end = target.selectionEnd ?? 0;
        const newValue = target.value.substring(0, start) + text + target.value.substring(end);
        onChange(newValue);
        const newCursorPos = start + text.length;
        requestAnimationFrame(() => {
            if (document.activeElement === target) {
                target.selectionStart = newCursorPos;
                target.selectionEnd = newCursorPos;
            }
        });
    }, []);

    return (
        <div
            className="group"
            // FIX: The `draggable` attribute should be set to a boolean value.
            draggable={true}
            onDragStart={(e) => onDragStart(e, scalePoint.id)}
            onDragOver={(e) => onDragOver(e, scalePoint.id)}
            onDragEnd={onDragEnd}
        >
            <div className={`flex items-center gap-2 transition-opacity ${isDragged ? 'opacity-30' : ''}`}>
                <span className="text-on-surface-variant hover:text-on-surface cursor-grab active:cursor-grabbing" aria-label="Reorder column">
                    <DragIndicatorIcon className="text-lg" />
                </span>
                <div className="flex-grow flex items-stretch bg-surface border border-outline rounded-md focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary">
                    <input
                        type="text"
                        value={scalePoint.text}
                        onChange={(e) => onTextChange(scalePoint.id, e.target.value)}
                        onPaste={createPasteHandler((newValue) => onTextChange(scalePoint.id, newValue))}
                        className="w-full bg-transparent p-2 text-sm text-on-surface focus:outline-none"
                        placeholder="Enter column text"
                    />
                </div>
                <div className="w-10 h-10"></div>
                <button onClick={() => onDelete(scalePoint.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full" aria-label="Delete column">
                    <XIcon className="text-lg" />
                </button>
            </div>
        </div>
    );
};

export default ScalePointItem;
