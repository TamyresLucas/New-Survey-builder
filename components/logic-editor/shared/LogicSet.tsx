import React, { useState, useRef, useEffect } from 'react';
import type { LogicSet as ILogicSet, Question, DisplayLogicCondition, LogicIssue } from '../../../types';
import { LogicConditionRow } from './LogicConditionRow';
import { PlusIcon, XIcon, CheckmarkIcon, ChevronDownIcon, WarningIcon } from '../../icons';
import { generateId } from '../../../utils';
import { Button } from '../../Button';

export interface LogicSetProps {
    logicSet: ILogicSet;
    availableQuestions: Question[];
    onUpdate: (updates: Partial<ILogicSet>) => void;
    onRemove: () => void;
    questionWidth?: string;
    operatorWidth?: string;
    valueWidth?: string;
    headerContent?: React.ReactNode;
    actionValue?: 'show' | 'hide';
    onActionChange?: (value: 'show' | 'hide') => void;
    extraActionContent?: React.ReactNode;
    issues?: LogicIssue[];
    showRowIfLabel?: boolean;
    transparentBackground?: boolean;
}

export const LogicSet: React.FC<LogicSetProps> = ({
    logicSet,
    availableQuestions,
    onUpdate,
    onRemove,
    questionWidth = "flex-1 min-w-0",
    operatorWidth = "flex-1 min-w-0",
    valueWidth = "flex-1 min-w-0",
    headerContent,
    actionValue,
    onActionChange,
    extraActionContent,
    issues = [],
    showRowIfLabel = false,
    transparentBackground = false
}) => {

    const [validationErrors, setValidationErrors] = useState<Map<string, Set<keyof DisplayLogicCondition>>>(new Map());

    const originalLogicSetRef = useRef<ILogicSet | null>(null);

    useEffect(() => {
        if (logicSet.isConfirmed) {
            originalLogicSetRef.current = JSON.parse(JSON.stringify(logicSet));
        }
    }, [logicSet.isConfirmed, logicSet]);

    const handleUpdateCondition = (index: number, field: keyof DisplayLogicCondition, value: any) => {
        const newConditions = [...logicSet.conditions];
        const updatedCondition = { ...newConditions[index], [field]: value };

        if (field === 'questionId') {
            updatedCondition.operator = '';
            updatedCondition.value = '';
        }

        // Handle value updates for choice-based questions to set stable ID
        if (field === 'value') {
            const questionId = updatedCondition.questionId;
            const question = availableQuestions.find(q => q.qid === questionId);
            if (question && question.choices) {
                const choice = question.choices.find(c => c.text === value);
                if (choice) {
                    (updatedCondition as any).choiceId = choice.id;
                }
            }
        }

        newConditions[index] = updatedCondition;

        if (validationErrors.has(newConditions[index].id)) {
            const newErrors = new Map(validationErrors);
            newErrors.delete(newConditions[index].id);
            setValidationErrors(newErrors);
        }

        onUpdate({ conditions: newConditions, isConfirmed: false });
    };

    const handleRemoveCondition = (index: number) => {
        const newConditions = logicSet.conditions.filter((_, i) => i !== index);

        if (newConditions.length === 0) {
            // If no conditions left, remove the entire set
            onRemove();
        } else {
            onUpdate({ conditions: newConditions, isConfirmed: false });
        }
    };

    const handleAddCondition = () => {
        const newCondition: DisplayLogicCondition = {
            id: generateId('cond'),
            questionId: '',
            operator: '',
            value: '',
        };
        onUpdate({ conditions: [...logicSet.conditions, newCondition], isConfirmed: false });
    };

    const handleAddConditionAtIndex = (index: number) => {
        const newCondition: DisplayLogicCondition = {
            id: generateId('cond'),
            questionId: '',
            operator: '',
            value: '',
        };
        const newConditions = [...logicSet.conditions];
        newConditions.splice(index + 1, 0, newCondition);
        onUpdate({ conditions: newConditions, isConfirmed: false });
    };

    const handleSetOperator = (op: 'AND' | 'OR') => {
        onUpdate({ operator: op, isConfirmed: false });
    };

    const handleConfirmSet = () => {
        let isValid = true;
        const newValidationErrors = new Map<string, Set<keyof DisplayLogicCondition>>();
        const validatedConditions = logicSet.conditions.map(condition => {
            const errors = new Set<keyof DisplayLogicCondition>();
            const missingQuestion = !condition.questionId;
            const missingOperator = !condition.operator;
            const requiresValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
            const missingValue = requiresValue && !condition.value;

            if (missingQuestion) errors.add('questionId');
            if (missingOperator) errors.add('operator');
            if (missingValue) errors.add('value');

            if (errors.size > 0) {
                isValid = false;
                newValidationErrors.set(condition.id, errors);
                return { ...condition };
            }
            return { ...condition };
        });

        setValidationErrors(newValidationErrors);

        if (isValid) {
            onUpdate({ conditions: validatedConditions, isConfirmed: true });
        }
    };

    const handleCancel = () => {
        if (originalLogicSetRef.current) {
            onUpdate({ ...originalLogicSetRef.current, isConfirmed: true });
            setValidationErrors(new Map());
        } else {
            onRemove();
        }
    };

    const hasMultipleConditions = logicSet.conditions.length > 1;
    const setIssues = issues.filter(i => i.sourceId === logicSet.id);

    return (
        <div id={logicSet.id} className="w-full">
            {(onActionChange || extraActionContent) && (
                <div className="flex items-center gap-2 mb-2 w-full">
                    {onActionChange && actionValue && (
                        <div className="relative w-24 flex-shrink-0">
                            <select
                                value={actionValue === 'show' ? 'Show' : 'Hide'}
                                onChange={e => onActionChange(e.target.value === 'Show' ? 'show' : 'hide')}
                                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md pl-2 pr-6 py-1.5 text-sm text-[var(--input-field-input-txt)] font-normal focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                aria-label="Logic Action"
                            >
                                <option value="Show">Show</option>
                                <option value="Hide">Hide</option>
                            </select>
                            <ChevronDownIcon className="absolute right-1.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base" />
                        </div>
                    )}
                    {extraActionContent}
                </div>
            )}

            <div
                style={transparentBackground ? { backgroundColor: 'transparent' } : undefined}
                className={`p-3 border rounded-md relative transition-colors ${setIssues.length > 0 ? 'border-error bg-error-container/5' :
                    transparentBackground ? 'border-outline-variant bg-transparent' :
                        logicSet.isConfirmed ? 'border-outline-variant bg-surface-container' : 'border-primary bg-surface-container-high shadow-sm'
                    }`}>

                {setIssues.length > 0 && (
                    <div className="absolute -top-2 -right-2 text-error z-10 group/issues">
                        <WarningIcon className="text-xl bg-surface rounded-full" />
                        <div className="absolute bottom-full right-0 mb-2 w-64 bg-surface-container-highest text-on-surface text-xs rounded-md p-2 shadow-lg opacity-0 group-hover/issues:opacity-100 transition-opacity pointer-events-none border border-error z-20">
                            <ul className="list-disc list-inside">
                                {Array.from(new Set(setIssues.map(i => i.message))).map((msg, idx) => (
                                    <li key={idx}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 w-full">
                        {headerContent ? (
                            <div className="flex-grow">{headerContent}</div>
                        ) : (
                            <>
                                <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Logic Set</span>
                                {!hasMultipleConditions && !showRowIfLabel && (
                                    <span className="text-sm font-medium text-on-surface flex-shrink-0 ml-2">if</span>
                                )}
                            </>
                        )}

                    </div>
                </div>

                {hasMultipleConditions && (
                    <div className="flex items-center gap-2 mb-3 px-2">
                        <div className="flex gap-1">
                            <button onClick={() => handleSetOperator('AND')} className={`px-2 py-0.5 text-[10px] font-button-operator rounded-full transition-colors ${logicSet.operator === 'AND' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline text-on-surface-variant'}`}>AND</button>
                            <button onClick={() => handleSetOperator('OR')} className={`px-2 py-0.5 text-[10px] font-button-operator rounded-full transition-colors ${logicSet.operator === 'OR' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline text-on-surface-variant'}`}>OR</button>
                        </div>
                    </div>
                )}


                <div className="space-y-2">
                    {logicSet.conditions.map((condition, index) => (
                        <div key={condition.id} className="flex items-center gap-2">
                            {hasMultipleConditions && (
                                <span className="text-xs font-medium text-on-surface-variant w-4 text-center">{index + 1}.</span>
                            )}
                            {showRowIfLabel && (
                                <span className="text-sm font-medium text-on-surface flex-shrink-0 w-6 text-center">if</span>
                            )}
                            <div className="flex-grow w-full min-w-0">
                                <LogicConditionRow
                                    condition={condition}
                                    onUpdateCondition={(field, value) => handleUpdateCondition(index, field as keyof DisplayLogicCondition, value)}
                                    onRemoveCondition={hasMultipleConditions ? () => handleRemoveCondition(index) : undefined}
                                    onAddCondition={() => handleAddConditionAtIndex(index)}
                                    availableQuestions={availableQuestions}
                                    questionWidth={questionWidth}
                                    operatorWidth={operatorWidth}
                                    valueWidth={valueWidth}
                                    invalidFields={validationErrors.get(condition.id)}
                                    issues={issues.filter(i => i.sourceId === condition.id)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <Button variant="tertiary-primary" size="large" onClick={handleAddCondition}>
                        <PlusIcon className="text-xl mr-2" /> Add condition
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={logicSet.isConfirmed ? 'danger' : 'tertiary'}
                            size="large"
                            onClick={logicSet.isConfirmed ? onRemove : handleCancel}
                        >
                            {logicSet.isConfirmed ? 'Delete' : 'Cancel'}
                        </Button>
                        {!logicSet.isConfirmed && (
                            <Button
                                variant="primary"
                                size="large"
                                onClick={handleConfirmSet}
                            >
                                Apply
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};