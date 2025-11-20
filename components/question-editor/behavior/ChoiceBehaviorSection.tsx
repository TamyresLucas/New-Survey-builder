import React, { useState } from 'react';
import type { Question, Survey, DisplayLogicCondition } from '../../../types';
import { CHOICE_BASED_QUESTION_TYPES, generateId, truncate, parseChoice } from '../../../utils';
import { RandomizeChoicesEditor } from '../../logic-editor/RandomizationEditor';
import { ChoiceEliminationEditor } from '../../logic-editor/ChoiceEliminationEditor';
import { ChoiceDisplayLogicEditor } from '../../logic-editor/ChoiceDisplayLogicEditor';
import { PlusIcon, ChevronDownIcon } from '../../icons';
import { CopyAndPasteButton, LogicConditionRow } from '../../logic-editor/shared';

interface ChoiceBehaviorSectionProps {
    question: Question;
    survey: Survey;
    previousQuestions: Question[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
    isFirstInteractiveQuestion: boolean;
}

// Extended type for local state to include the action (show/hide) and targetChoiceId
type PlaceholderCondition = DisplayLogicCondition & { 
    action: 'show' | 'hide';
    targetChoiceId?: string;
};

const ChoiceBehaviorSection: React.FC<ChoiceBehaviorSectionProps> = ({
    question,
    survey,
    previousQuestions,
    onUpdate,
    onAddLogic,
    isFirstInteractiveQuestion
}) => {
    // Local state for the placeholder section's logic rows
    const [placeholderConditions, setPlaceholderConditions] = useState<PlaceholderCondition[]>([]);
    const [placeholderOperator, setPlaceholderOperator] = useState<'AND' | 'OR'>('AND');

    const isChoiceBased = CHOICE_BASED_QUESTION_TYPES.has(question.type);

    if (!isChoiceBased) {
        return null;
    }

    const handleAddPlaceholderCondition = () => {
        setPlaceholderConditions(prev => [...prev, {
            id: generateId('cond'),
            questionId: '',
            operator: '',
            value: '',
            isConfirmed: false,
            action: 'show', // Default action
            targetChoiceId: '' // Initialize target choice
        }]);
        onAddLogic();
    };

    const handleUpdatePlaceholderCondition = (index: number, field: keyof PlaceholderCondition, value: any) => {
        setPlaceholderConditions(prev => {
            const newConditions = [...prev];
            // Need to cast to any because TS doesn't know for sure that field is a key of PlaceholderCondition when passed dynamically
            (newConditions[index] as any)[field] = value;
            
            // Reset dependent fields if question changes
            if (field === 'questionId') {
                newConditions[index].operator = '';
                newConditions[index].value = '';
            }
            
            return newConditions;
        });
    };

    const handleRemovePlaceholderCondition = (index: number) => {
        setPlaceholderConditions(prev => prev.filter((_, i) => i !== index));
    };

    const handleConfirmPlaceholderCondition = (index: number) => {
        setPlaceholderConditions(prev => {
            const newConditions = [...prev];
            newConditions[index] = { ...newConditions[index], isConfirmed: true };
            return newConditions;
        });
    };

    return (
        <div className="divide-y divide-outline-variant">
            <div className="py-6 first:pt-0">
                <RandomizeChoicesEditor 
                    question={question}
                    onUpdate={onUpdate}
                />
            </div>
            {!isFirstInteractiveQuestion && previousQuestions.length > 0 && (
                <div className="py-6 first:pt-0">
                    <ChoiceEliminationEditor
                        question={question}
                        previousQuestions={previousQuestions}
                        onUpdate={onUpdate}
                        onAddLogic={onAddLogic}
                    />
                </div>
            )}
            <div className="py-6 first:pt-0">
                 <h3 className="text-sm font-medium text-on-surface mb-1">Placeholder</h3>
                 <p className="text-xs text-on-surface-variant mb-3">This is a placeholder section.</p>
                 
                 <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                         <button 
                            onClick={handleAddPlaceholderCondition} 
                            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors"
                        >
                            <PlusIcon className="text-base" />
                            Add condition
                        </button>
                        <CopyAndPasteButton onClick={() => {}} />
                    </div>
                    
                    {placeholderConditions.length > 1 && (
                        <div className="flex gap-1">
                            <button onClick={() => setPlaceholderOperator('AND')} className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${placeholderOperator === 'AND' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>AND</button>
                            <button onClick={() => setPlaceholderOperator('OR')} className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${placeholderOperator === 'OR' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>OR</button>
                        </div>
                    )}
                 </div>

                 <div className="space-y-2">
                    {placeholderConditions.map((condition, index) => (
                        <div key={condition.id} className="p-3 bg-surface-container-high rounded-md border border-transparent hover:border-outline-variant group flex flex-col gap-3 w-full max-w-full overflow-hidden">
                            {/* Row 1: Action & Target Choice */}
                            <div className="flex items-center gap-2 w-full">
                                <div className="relative w-24 flex-shrink-0">
                                    <select
                                        value={condition.action === 'show' ? 'Show' : 'Hide'}
                                        onChange={e => handleUpdatePlaceholderCondition(index, 'action', e.target.value === 'Show' ? 'show' : 'hide')}
                                        className="w-full bg-surface border border-outline rounded-md pl-2 pr-6 py-1.5 text-sm text-on-surface font-medium focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                        aria-label="Logic Action"
                                    >
                                        <option value="Show">Show</option>
                                        <option value="Hide">Hide</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-1.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base" />
                                </div>

                                <div className="relative flex-1">
                                    <select
                                        value={condition.targetChoiceId || ''}
                                        onChange={e => handleUpdatePlaceholderCondition(index, 'targetChoiceId', e.target.value)}
                                        className="w-full bg-surface border border-outline rounded-md pl-2 pr-6 py-1.5 text-sm text-on-surface font-medium focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                        aria-label="Target Choice"
                                    >
                                        <option value="">Select choice...</option>
                                        {question.choices?.map(choice => (
                                            <option key={choice.id} value={choice.id}>
                                                {truncate(parseChoice(choice.text).label, 30)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className="absolute right-1.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base" />
                                </div>
                            </div>

                            {/* Row 2: IF Label & Condition Logic */}
                            <div className="flex items-center gap-1 w-full">
                                <span className="text-sm font-bold text-primary flex-shrink-0 w-8 text-left">IF</span>
                                <div className="flex-grow min-w-0 w-full">
                                    <LogicConditionRow
                                        condition={condition}
                                        onUpdateCondition={(field, value) => handleUpdatePlaceholderCondition(index, field as keyof DisplayLogicCondition, value)}
                                        onRemoveCondition={() => handleRemovePlaceholderCondition(index)}
                                        onConfirm={() => handleConfirmPlaceholderCondition(index)}
                                        availableQuestions={previousQuestions}
                                        isConfirmed={condition.isConfirmed === true}
                                        questionWidth="w-[23%]"
                                        operatorWidth="w-[23%]"
                                        valueWidth="w-[23%]"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
            {!isFirstInteractiveQuestion && previousQuestions.length > 0 && (
                <div className="py-6 first:pt-0">
                    <ChoiceDisplayLogicEditor
                        question={question}
                        survey={survey}
                        previousQuestions={previousQuestions}
                        onUpdate={onUpdate}
                        onAddLogic={onAddLogic}
                    />
                </div>
            )}
        </div>
    );
};

export default ChoiceBehaviorSection;