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
}

export const LogicSet: React.FC<LogicSetProps> = ({
    logicSet,
    availableQuestions,
    onUpdate,
    onRemove,
    questionWidth = "flex-1", // Default to flex-1 to fill width
    operatorWidth = "flex-1",
    valueWidth = "flex-1"
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

    const handleSetOperator = (op: 'AND' | 'OR') => {
        onUpdate({ operator: op, isConfirmed: false });
    };

    const handleConfirmSet = () => {
        onUpdate({ isConfirmed: true });
    };

    return (
        <div className={`p-3 border rounded-md relative ${logicSet.isConfirmed ? 'border-outline-variant bg-surface-container' : 'border-primary bg-surface-container-high shadow-sm'}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Logic Set</span>
                    {logicSet.conditions.length > 1 && (
                        <div className="flex gap-1 ml-2">
                            <button onClick={() => handleSetOperator('AND')} className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors ${logicSet.operator === 'AND' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline text-on-surface-variant'}`}>AND</button>
                            <button onClick={() => handleSetOperator('OR')} className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors ${logicSet.operator === 'OR' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline text-on-surface-variant'}`}>OR</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                {logicSet.conditions.map((condition, index) => (
                    <div key={condition.id} className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary flex-shrink-0 w-6 text-center">IF</span>
                        <div className="flex-grow w-full">
                            <LogicConditionRow
                                condition={condition}
                                onUpdateCondition={(field, value) => handleUpdateCondition(index, field as keyof DisplayLogicCondition, value)}
                                onRemoveCondition={() => handleRemoveCondition(index)}
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
                <button onClick={handleAddCondition} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    <PlusIcon className="text-sm" />
                    Add condition
                </button>
                
                <div className="flex items-center gap-1">
                    <button onClick={onRemove} className="text-on-surface-variant hover:text-error p-1 rounded-full hover:bg-error-container/50" aria-label="Remove logic set">
                        <XIcon className="text-base" />
                    </button>
                     {!logicSet.isConfirmed && (
                        <button onClick={handleConfirmSet} className="p-1 bg-primary text-on-primary rounded-full hover:opacity-90" aria-label="Confirm logic set">
                            <CheckmarkIcon className="text-base" />
                        </button>
                     )}
                </div>
            </div>
        </div>
    );
};