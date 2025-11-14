import React, { useState, useCallback } from 'react';
import type { Question, Choice } from '../../../types';
import ChoiceItem from './ChoiceItem';

const ChoiceDropIndicator = () => <div className="h-px bg-primary w-full my-1" />;

interface ChoiceListProps {
    choices: Choice[];
    onUpdateChoices: (choices: Choice[]) => void;
    onPropertyChange: (choiceId: string, property: keyof Choice, value: any) => void;
    onTextChange: (choiceId: string, newLabel: string) => void;
    onDelete: (choiceId: string) => void;
}

const ChoiceList: React.FC<ChoiceListProps> = ({ choices, onUpdateChoices, onPropertyChange, onTextChange, onDelete }) => {
    const [draggedChoiceId, setDraggedChoiceId] = useState<string | null>(null);
    const [dropTargetChoiceId, setDropTargetChoiceId] = useState<string | null>(null);

    const handleChoiceDragStart = useCallback((e: React.DragEvent, choiceId: string) => {
        setDraggedChoiceId(choiceId);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleChoiceDragOver = useCallback((e: React.DragEvent, choiceId: string) => {
        e.preventDefault();
        if (draggedChoiceId !== choiceId) {
            setDropTargetChoiceId(choiceId);
        }
    }, [draggedChoiceId]);

    const handleChoiceDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedChoiceId) return;

        const currentChoices = [...choices];
        const draggedIndex = currentChoices.findIndex(c => c.id === draggedChoiceId);
        if (draggedIndex === -1) return;

        const [draggedItem] = currentChoices.splice(draggedIndex, 1);

        if (dropTargetChoiceId === null) {
            currentChoices.push(draggedItem);
        } else {
            const dropIndex = currentChoices.findIndex(c => c.id === dropTargetChoiceId);
            if (dropIndex !== -1) {
                currentChoices.splice(dropIndex, 0, draggedItem);
            } else {
                currentChoices.push(draggedItem);
            }
        }
        onUpdateChoices(currentChoices);
        setDraggedChoiceId(null);
        setDropTargetChoiceId(null);
    }, [draggedChoiceId, dropTargetChoiceId, choices, onUpdateChoices]);

    const handleChoiceDragEnd = useCallback(() => {
        setDraggedChoiceId(null);
        setDropTargetChoiceId(null);
    }, []);

    return (
        <div
            className="space-y-2"
            onDrop={handleChoiceDrop}
            onDragOver={(e) => { e.preventDefault(); setDropTargetChoiceId(null); }}
        >
            {(choices).map((choice) => (
                <React.Fragment key={choice.id}>
                    {dropTargetChoiceId === choice.id && <ChoiceDropIndicator />}
                    <ChoiceItem
                        choice={choice}
                        onTextChange={onTextChange}
                        onPropertyChange={onPropertyChange}
                        onDelete={onDelete}
                        onDragStart={handleChoiceDragStart}
                        onDragOver={handleChoiceDragOver}
                        onDragEnd={handleChoiceDragEnd}
                        isDragged={draggedChoiceId === choice.id}
                    />
                </React.Fragment>
            ))}
            {dropTargetChoiceId === null && draggedChoiceId && <ChoiceDropIndicator />}
        </div>
    );
};

export default ChoiceList;