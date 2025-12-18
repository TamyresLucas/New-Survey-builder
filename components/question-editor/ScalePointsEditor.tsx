import React, { useState, useCallback } from 'react';
import type { Question, Choice } from '../../types';
import { generateId } from '../../utils';
import { PasteChoicesModal } from '../PasteChoicesModal';
import { ScalePointActions, ScalePointList } from './scale';

interface ScalePointsEditorProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
}

export const ScalePointsEditor: React.FC<ScalePointsEditorProps> = ({ question, onUpdate }) => {
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);

    const handleUpdateScalePoints = (scalePoints: Choice[]) => {
        onUpdate({ scalePoints });
    };
    
    const handleAddScalePoint = useCallback(() => {
        const currentScalePoints = question.scalePoints || [];
        const newScalePoint: Choice = { id: generateId('s'), text: `Column ${currentScalePoints.length + 1}` };
        onUpdate({ scalePoints: [...currentScalePoints, newScalePoint] });
    }, [question.scalePoints, onUpdate]);
    
    const handleDeleteScalePoint = useCallback((scalePointId: string) => {
        const newScalePoints = (question.scalePoints || []).filter(sp => sp.id !== scalePointId);
        onUpdate({ scalePoints: newScalePoints });
    }, [question.scalePoints, onUpdate]);
    
    const handleScalePointTextChange = (scalePointId: string, newText: string) => {
        const newScalePoints = (question.scalePoints || []).map(sp =>
            sp.id === scalePointId ? { ...sp, text: newText } : sp
        );
        onUpdate({ scalePoints: newScalePoints });
    };
    
    const handlePasteScalePoints = (pastedText: string) => {
        const lines = pastedText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return;
        const newScalePoints: Choice[] = lines.map(line => ({ id: generateId('s'), text: line.trim() }));
        onUpdate({ scalePoints: newScalePoints });
    };

    const initialScalePointsText = (question.scalePoints || []).map(c => c.text).join('\n');

    return (
        <>
            <PasteChoicesModal
                isOpen={isPasteModalOpen}
                onClose={() => setIsPasteModalOpen(false)}
                onSave={handlePasteScalePoints}
                initialChoicesText={initialScalePointsText}
                primaryActionLabel="Add Columns"
            />
            <div>
                <h3 className="text-sm font-medium text-on-surface-variant mb-2">Columns</h3>
                <ScalePointList
                    scalePoints={question.scalePoints || []}
                    onUpdateScalePoints={handleUpdateScalePoints}
                    onTextChange={handleScalePointTextChange}
                    onDelete={handleDeleteScalePoint}
                />
                <ScalePointActions
                    onAddScalePoint={handleAddScalePoint}
                    onPaste={() => setIsPasteModalOpen(true)}
                />
            </div>
        </>
    );
};

export default ScalePointsEditor;