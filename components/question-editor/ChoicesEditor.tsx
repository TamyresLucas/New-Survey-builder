import React, { useState, useCallback } from 'react';
import type { Question, Choice } from '../../types';
import { generateId, parseChoice } from '../../utils';
import { PasteChoicesModal } from '../PasteChoicesModal';
import { ChoiceActions, ChoiceList } from './choices';

interface ChoicesEditorProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
    onAddChoice: (questionId: string) => void;
    onDeleteChoice: (questionId: string, choiceId: string) => void;
}

export const ChoicesEditor: React.FC<ChoicesEditorProps> = ({ question, onUpdate, onAddChoice, onDeleteChoice }) => {
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);

    const handleUpdateChoices = (choices: Choice[]) => {
        onUpdate({ choices });
    };

    const handleChoicePropertyChange = (choiceId: string, property: keyof Choice, value: any) => {
        const newChoices = (question.choices || []).map(c => 
            c.id === choiceId ? { ...c, [property]: value } : c
        );
        onUpdate({ choices: newChoices });
    };
    
    const handleChoiceTextChange = (choiceId: string, newLabel: string) => {
        const newChoices = (question.choices || []).map(c => {
            if (c.id === choiceId) {
                const { variable } = parseChoice(c.text);
                const newText = variable ? `${variable} ${newLabel}` : newLabel;
                return { ...c, text: newText };
            }
            return c;
        });
        onUpdate({ choices: newChoices });
    };

    const handlePasteChoices = (pastedText: string) => {
        const lines = pastedText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return;
        const newChoices: Choice[] = lines.map(line => ({ id: generateId('c'), text: line.trim() }));
        onUpdate({ choices: newChoices });
    };

    const initialChoicesText = (question.choices || []).map(c => parseChoice(c.text).label).join('\n');

    return (
        <>
            <PasteChoicesModal
                isOpen={isPasteModalOpen}
                onClose={() => setIsPasteModalOpen(false)}
                onSave={handlePasteChoices}
                initialChoicesText={initialChoicesText}
                primaryActionLabel="Add Choices"
            />
            <div>
                <h3 className="text-sm font-medium text-on-surface-variant mb-2">
                    {question.type === 'Choice Grid' ? 'Rows' : 'Choices'}
                </h3>
                <ChoiceList
                    choices={question.choices || []}
                    onUpdateChoices={handleUpdateChoices}
                    onPropertyChange={handleChoicePropertyChange}
                    onTextChange={handleChoiceTextChange}
                    onDelete={(choiceId) => onDeleteChoice(question.id, choiceId)}
                />
                <ChoiceActions
                    questionType={question.type}
                    onAddChoice={() => onAddChoice(question.id)}
                    onPaste={() => setIsPasteModalOpen(true)}
                />
            </div>
        </>
    );
};

export default ChoicesEditor;