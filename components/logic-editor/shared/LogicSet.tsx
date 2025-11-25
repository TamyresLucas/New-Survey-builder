import React from 'react';
import type { LogicSet as ILogicSet, Question, DisplayLogicCondition } from '../../../types';
import { LogicConditionRow } from './LogicConditionRow';
import { PlusIcon, XIcon, CheckmarkIcon } from '../../icons';
import { generateId } from '../../../utils';

interface LogicSetProps {
    logicSet: ILogicSet;
    availableQuestions: Question[];
    onUpdate: (updates: Partial<ILogicSet>) => void;
    onRemove: () => void;
    questionWidth?: string;
    operatorWidth?: string;
    valueWidth?: string;
    headerContent?: React.ReactNode; // New prop for custom header content
}

export const LogicSet: React.FC<LogicSetProps> = ({
    logicSet,
    availableQuestions,
    onUpdate,
    onRemove,
    questionWidth = "flex-1 min-w-0", // Default to flexible width
    operatorWidth = "flex-1 min-w-0",
    valueWidth = "flex-1 min-w-0",
    headerContent
}) => {
    
    const handleUpdateCondition = (index: number, field: keyof DisplayLogicCondition, value: any) => {
        const newConditions = [...logicSet.conditions];
        newConditions[index] = { ...newConditions[index], [field]: value, isConfirmed: false };
        
        if (field === 'questionId') {
            newConditions[index].operator = '';
            newConditions[index].value = '';
        }
        
        // Updating a condition un-confirms the set
        onUpdate({ conditions: newConditions, isConfirmed: false });
    };

    const handleRemoveCondition = (index: number) => {
        const newConditions = logicSet.conditions.filter((_, i) => i !== index);
        onUpdate({ conditions: newConditions, isConfirmed: false });
    };
    
    const handleAddCondition = () => {
        const newCondition: DisplayLogicCondition = {
            id: generateId('cond'),
            questionId: '',
            operator: '',
            value: '',
            isConfirmed: false
        };
        onUpdate({ conditions: [...logicSet.conditions, newCondition], isConfirmed: false });
    };

    // New handler to add at specific index
    const handleAddConditionAtIndex = (index: number) => {
        const newCondition: DisplayLogicCondition = {
            id: generateId('cond'),
            questionId: '',
            operator: '',
            value: '',
            isConfirmed: false
        };
        const newConditions = [...logicSet.conditions];
        newConditions.splice(index + 1, 0, newCondition);
        onUpdate({ conditions: newConditions, isConfirmed: false });
    };

    const handleSetOperator = (op: 'AND' | 'OR') => {
        onUpdate({ operator: op, isConfirmed: false });
    };

    const handleConfirmSet = () => {
        // Validation Logic
        let isValid = true;
        const validatedConditions = logicSet.conditions.map(condition => {
            const missingQuestion = !condition.questionId;
            const missingOperator = !condition.operator;
            const requiresValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
            const missingValue = requiresValue && !condition.value;

            if (missingQuestion || missingOperator || missingValue) {
                isValid = false;
                return { ...condition, isConfirmed: false }; // Keep as unconfirmed
            }
            return { ...condition, isConfirmed: true };
        });

        if (isValid) {
            onUpdate({ conditions: validatedConditions, isConfirmed: true });
        } else {
             // Update conditions to potentially show error states if implemented, or just keep current state
             // For now, we just don't confirm the set.
             // Optionally we could pass an error state down, but blocking the confirm is the primary request.
             console.warn("Logic set validation failed: missing required fields.");
        }
    };

    const hasMultipleConditions = logicSet.conditions.length > 1;

    return (
        <div className={`p-3 border rounded-md relative ${logicSet.isConfirmed ? 'border-outline-variant bg-surface-container' : 'border-primary bg-surface-container-high shadow-sm'}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 w-full">
                    {headerContent ? (
                         // Render custom header content if provided (replaces standard label + IF)
                         <div className="flex-grow">{headerContent}</div>
                    ) : (
                        <>
                            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Logic Set</span>
                            
                            {/* IF Label for single condition */}
                            {!hasMultipleConditions && (
                                <span className="text-sm font-bold text-primary flex-shrink-0 ml-2">IF</span>
                            )}
                        </>
                    )}

                    {hasMultipleConditions && (
                        <div className="flex items-center gap-2 ml-auto">
                            <div className="flex gap-1">
                                <button onClick={() => handleSetOperator('AND')} className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors ${logicSet.operator === 'AND' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline text-on-surface-variant'}`}>AND</button>
                                <button onClick={() => handleSetOperator('OR')} className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors ${logicSet.operator === 'OR' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline text-on-surface-variant'}`}>OR</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                {logicSet.conditions.map((condition, index) => (
                    <div key={condition.id} className="flex items-center gap-2">
                        {hasMultipleConditions && (
                            <span className="text-xs font-medium text-on-surface-variant w-4 text-center">{index + 1}.</span>
                        )}
                        <div className="flex-grow w-full min-w-0">
                            <LogicConditionRow
                                condition={condition}
                                onUpdateCondition={(field, value) => handleUpdateCondition(index, field as keyof DisplayLogicCondition, value)}
                                onRemoveCondition={() => handleRemoveCondition(index)}
                                onAddCondition={() => handleAddConditionAtIndex(index)} // Pass the add handler
                                availableQuestions={availableQuestions}
                                isConfirmed={true} 
                                questionWidth={questionWidth}
                                operatorWidth={operatorWidth}
                                valueWidth={valueWidth}
                            />
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-3 flex items-center justify-between">
                <button onClick={handleAddCondition} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors">
                    <PlusIcon className="text-base" />
                    Add condition
                </button>
                
                <div className="flex items-center gap-2">
                    <button onClick={onRemove} className="px-3 py-1.5 text-xs font-bold text-error hover:bg-error-container rounded-md transition-colors">
                        Cancel
                    </button>
                     {!logicSet.isConfirmed && (
                        <button onClick={handleConfirmSet} className="px-3 py-1.5 text-xs font-bold text-on-primary bg-primary rounded-md hover:opacity-90 transition-opacity">
                            Apply Logic
                        </button>
                     )}
                </div>
            </div>
        </div>
    );
};