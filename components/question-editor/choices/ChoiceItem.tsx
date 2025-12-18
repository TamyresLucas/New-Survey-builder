import React, { useState, useCallback } from 'react';
import type { Choice } from '../../../types';
import { parseChoice } from '../../../utils';
import { XIcon, DragIndicatorIcon, MoreVertIcon } from '../../icons';
import { TextField } from '../../TextField';
import { Button } from '../../Button';

interface ChoiceItemProps {
    choice: Choice;
    onTextChange: (choiceId: string, newLabel: string) => void;
    onPropertyChange: (choiceId: string, property: keyof Choice, value: any) => void;
    onDelete: (choiceId: string) => void;
    onDragStart: (e: React.DragEvent, choiceId: string) => void;
    onDragOver: (e: React.DragEvent, choiceId: string) => void;
    onDragEnd: (e: React.DragEvent) => void;
    isDragged: boolean;
}

const ChoiceItem: React.FC<ChoiceItemProps> = ({
    choice,
    onTextChange,
    onPropertyChange,
    onDelete,
    onDragStart,
    onDragOver,
    onDragEnd,
    isDragged
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

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
            draggable
            onDragStart={(e) => onDragStart(e, choice.id)}
            onDragOver={(e) => onDragOver(e, choice.id)}
            onDragEnd={onDragEnd}
        >
            <div className={`flex items-center gap-2 transition-opacity ${isDragged ? 'opacity-30' : ''}`}>
                <span className="text-on-surface-variant hover:text-on-surface cursor-grab active:cursor-grabbing" aria-label="Reorder choice">
                    <DragIndicatorIcon className="text-lg" />
                </span>
                <div className="flex-grow">
                    <TextField
                        value={parseChoice(choice.text).label}
                        onChange={(e) => onTextChange(choice.id, e.target.value)}
                        onPaste={createPasteHandler((newValue) => onTextChange(choice.id, newValue))}
                        placeholder="Enter choice text"
                    />
                </div>
                <Button variant="tertiary" iconOnly onClick={() => setIsExpanded(prev => !prev)} aria-label="More options">
                    <MoreVertIcon className="text-lg" />
                </Button>
                <Button variant="danger" iconOnly onClick={() => onDelete(choice.id)} aria-label="Delete choice">
                    <XIcon className="text-lg" />
                </Button>
            </div>
            {isExpanded && (
                <div className="ml-8 mt-2 p-3 bg-surface-container-high rounded-md space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-on-surface-variant">Visible</label>
                        <input type="checkbox" checked={choice.visible ?? true} onChange={e => onPropertyChange(choice.id, 'visible', e.target.checked)} className="accent-primary" />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-on-surface-variant">Allow Text Entry</label>
                        <input type="checkbox" checked={choice.allowTextEntry ?? false} onChange={e => onPropertyChange(choice.id, 'allowTextEntry', e.target.checked)} className="accent-primary" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChoiceItem;
