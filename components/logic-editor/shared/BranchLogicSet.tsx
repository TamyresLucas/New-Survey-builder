import React, { useRef, useEffect } from 'react';
import type { BranchingLogicBranch, BranchingLogicCondition, LogicIssue, Question, Survey } from '../../../types';
import { Button } from '@/components/Button';
import { XIcon, PlusIcon } from '../../icons';
import { LogicConditionRow, DestinationRow } from './';
import { generateId } from '../../../utils';

export interface BranchLogicSetProps {
    branch: BranchingLogicBranch;
    onUpdate: (updates: Partial<BranchingLogicBranch>) => void;
    onRemove: () => void;
    availableQuestions: Question[];
    followingQuestions: Question[];
    survey: Survey;
    currentBlockId: string | null;
    issues: LogicIssue[];
    currentQuestion: Question;
}

export const BranchLogicSet: React.FC<BranchLogicSetProps> = ({
    branch,
    onUpdate,
    onRemove,
    availableQuestions,
    followingQuestions,
    survey,
    currentBlockId,
    issues,
    currentQuestion
}) => {
    const originalBranchRef = useRef<BranchingLogicBranch | null>(null);

    const isBranchConfirmed = branch.conditions.every(c => c.isConfirmed) && branch.thenSkipToIsConfirmed;

    useEffect(() => {
        if (isBranchConfirmed) {
            originalBranchRef.current = JSON.parse(JSON.stringify(branch));
        }
    }, [isBranchConfirmed, branch]);

    const handleCancel = () => {
        if (originalBranchRef.current) {
            onUpdate({ ...originalBranchRef.current });
        } else {
            onRemove();
        }
    };

    const handleUpdateCondition = (conditionId: string, field: keyof BranchingLogicCondition, value: any) => {
        const newConditions = branch.conditions.map(c =>
            c.id === conditionId ? { ...c, [field]: value, isConfirmed: false } : c
        );
        onUpdate({ conditions: newConditions });
    };

    const handleAddCondition = () => {
        const newCondition: BranchingLogicCondition = {
            id: generateId('cond'),
            questionId: '',
            operator: '',
            value: '',
            isConfirmed: false
        };
        onUpdate({ conditions: [...branch.conditions, newCondition] });
    };

    const handleAddConditionAtIndex = (index: number) => {
        const newCondition: BranchingLogicCondition = {
            id: generateId('cond'),
            questionId: '',
            operator: '',
            value: '',
            isConfirmed: false
        };
        const newConditions = [...branch.conditions];
        newConditions.splice(index + 1, 0, newCondition);
        onUpdate({ conditions: newConditions });
    };

    const handleRemoveCondition = (conditionId: string) => {
        if (branch.conditions.length <= 1) return;
        const newConditions = branch.conditions.filter(c => c.id !== conditionId);
        onUpdate({ conditions: newConditions });
    };

    const handleConfirm = () => {
        const newConditions = branch.conditions.map(c => ({ ...c, isConfirmed: true }));
        onUpdate({ conditions: newConditions, thenSkipToIsConfirmed: true });
    };

    return (
        <div
            id={branch.id}
            className="p-3 border border-outline-variant rounded-md bg-surface-container"
        >
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-on-surface">IF</span>
                {branch.conditions.length > 1 && (
                    <div className="flex gap-1">
                        <button
                            onClick={() => onUpdate({ operator: 'AND' })}
                            className={`px-2 py-0.5 text-[10px] font-button-operator rounded-full transition-colors ${branch.operator === 'AND' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline text-on-surface-variant'}`}
                        >
                            AND
                        </button>
                        <button
                            onClick={() => onUpdate({ operator: 'OR' })}
                            className={`px-2 py-0.5 text-[10px] font-button-operator rounded-full transition-colors ${branch.operator === 'OR' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline text-on-surface-variant'}`}
                        >
                            OR
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-2 mb-3">
                {branch.conditions && branch.conditions.map((condition, index) => (
                    <LogicConditionRow
                        key={condition.id}
                        condition={condition}
                        onUpdateCondition={(field, value) =>
                            handleUpdateCondition(condition.id, field, value)
                        }
                        onRemoveCondition={
                            branch.conditions.length > 1
                                ? () => handleRemoveCondition(condition.id)
                                : undefined
                        }
                        onAddCondition={() => handleAddConditionAtIndex(index)}
                        availableQuestions={availableQuestions}
                        isConfirmed={condition.isConfirmed || false}
                        issues={issues.filter(i => i.sourceId === condition.id)}
                        isFirstCondition={index === 0}
                        currentQuestion={currentQuestion}
                        usedValues={new Set()}
                        // Responsive Widths
                        questionWidth="flex-[1.5] min-w-[120px]"
                        valueWidth="flex-[1] min-w-[100px]"
                        operatorWidth="flex-[1] min-w-[100px]"
                    />
                ))}
            </div>

            <DestinationRow
                label={<span className="font-bold text-on-surface">Then skip to</span>}
                value={branch.thenSkipTo}
                onChange={(value) => onUpdate({ thenSkipTo: value, thenSkipToIsConfirmed: false })}
                isConfirmed={branch.thenSkipToIsConfirmed}
                followingQuestions={followingQuestions}
                survey={survey}
                currentBlockId={currentBlockId}
            />

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/30">
                <Button
                    variant="tertiary-primary"
                    size="large"
                    onClick={handleAddCondition}
                >
                    <PlusIcon className="text-xl mr-2" /> Add condition
                </Button>

                <div className="flex items-center gap-2">
                    <Button
                        variant={isBranchConfirmed ? "danger" : "tertiary"}
                        size="large"
                        onClick={isBranchConfirmed ? onRemove : handleCancel}
                    >
                        {isBranchConfirmed ? 'Delete' : 'Cancel'}
                    </Button>
                    {!isBranchConfirmed && (
                        <Button
                            variant="primary"
                            size="large"
                            onClick={handleConfirm}
                        >
                            Apply
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
