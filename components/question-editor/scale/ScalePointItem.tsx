import React, { useCallback } from 'react';
import type { Choice } from '../../../types';
import { XIcon, DragIndicatorIcon } from '../../icons';
import { TextField } from '../../TextField';
import { Button } from '../../Button';

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
        <div className="group">
            <div
                className={`flex items-center gap-2 transition-opacity ${isDragged ? 'opacity-30' : ''}`}
                onDragOver={(e) => onDragOver(e, scalePoint.id)}
            >
                <span
                    className="text-on-surface-variant hover:text-on-surface cursor-grab active:cursor-grabbing drag-handle"
                    aria-label="Reorder column"
                    draggable={true}
                    onDragStart={(e) => onDragStart(e, scalePoint.id)}
                    onDragEnd={onDragEnd}
                >
                    <DragIndicatorIcon className="text-base" />
                </span>
                <div className="flex-grow" draggable={false} onDragStart={(e) => e.stopPropagation()}>
                    <TextField
                        value={scalePoint.text}
                        onChange={(e) => onTextChange(scalePoint.id, e.target.value)}
                        onPaste={createPasteHandler((newValue) => onTextChange(scalePoint.id, newValue))}
                        placeholder="Enter column text"
                    />
                </div>
                <Button variant="danger" size="small" iconOnly onClick={() => onDelete(scalePoint.id)} aria-label="Delete column">
                    <XIcon className="text-base" />
                </Button>
            </div>
        </div>
    );
};

export default ScalePointItem;
