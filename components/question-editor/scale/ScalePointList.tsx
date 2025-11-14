import React, { useState, useCallback } from 'react';
import type { Choice } from '../../../types';
// FIX: Corrected import to use the default export from ScalePointItem.
import ScalePointItem from './ScalePointItem';

const ScalePointDropIndicator = () => <div className="h-px bg-primary w-full my-1" />;

interface ScalePointListProps {
    scalePoints: Choice[];
    onUpdateScalePoints: (scalePoints: Choice[]) => void;
    onTextChange: (id: string, text: string) => void;
    onDelete: (id: string) => void;
}

const ScalePointList: React.FC<ScalePointListProps> = ({
    scalePoints,
    onUpdateScalePoints,
    onTextChange,
    onDelete
}) => {
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
        e.preventDefault();
        if (draggedId !== id) {
            setDropTargetId(id);
        }
    }, [draggedId]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedId) return;

        const currentItems = [...scalePoints];
        const draggedIndex = currentItems.findIndex(item => item.id === draggedId);
        if (draggedIndex === -1) return;

        const [draggedItem] = currentItems.splice(draggedIndex, 1);

        if (dropTargetId === null) {
            currentItems.push(draggedItem);
        } else {
            const dropIndex = currentItems.findIndex(item => item.id === dropTargetId);
            if (dropIndex !== -1) {
                currentItems.splice(dropIndex, 0, draggedItem);
            } else {
                currentItems.push(draggedItem);
            }
        }
        onUpdateScalePoints(currentItems);
        setDraggedId(null);
        setDropTargetId(null);
    }, [draggedId, dropTargetId, scalePoints, onUpdateScalePoints]);

    const handleDragEnd = useCallback(() => {
        setDraggedId(null);
        setDropTargetId(null);
    }, []);

    return (
        <div
            className="space-y-2"
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDropTargetId(null); }}
        >
            {scalePoints.map((scalePoint) => (
                <React.Fragment key={scalePoint.id}>
                    {dropTargetId === scalePoint.id && <ScalePointDropIndicator />}
                    <ScalePointItem
                        scalePoint={scalePoint}
                        onTextChange={onTextChange}
                        onDelete={onDelete}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        isDragged={draggedId === scalePoint.id}
                    />
                </React.Fragment>
            ))}
            {dropTargetId === null && draggedId && <ScalePointDropIndicator />}
        </div>
    );
};

export default ScalePointList;