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
    currentQuestion?: Question;
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
        // Only set originalBranchRef ONCE on mount if it's confirmed, or when it becomes confirmed.
        // If it's already set, we don't overwrite it with work-in-progress changes.
        if (isBranchConfirmed && !originalBranchRef.current) {
            originalBranchRef.current = JSON.parse(JSON.stringify(branch));
        } else if (!originalBranchRef.current && branch.thenSkipToIsConfirmed) {
            // Fallback: If passed in as confirmed (e.g. from parent state), copy it.
            originalBranchRef.current = JSON.parse(JSON.stringify(branch));
        }
    }, [isBranchConfirmed, branch]); // This dependency array might be too eager.

    // A better approach for 'Cancel' is to capture the initial state on MOUNT.
    useEffect(() => {
        if (branch.thenSkipToIsConfirmed) { // Assuming a saved branch has this confirmed
            originalBranchRef.current = JSON.parse(JSON.stringify(branch));
        }
    }, []); // Run once on mount

    const handleCancel = () => {
        if (originalBranchRef.current) {
            onUpdate({ ...originalBranchRef.current });
        } else {
            // Check if it was ever confirmed by checking if all initial conditions are valid.
            // But a better approach is: if we don't have an originalBranchRef, it means it was just created (empty).
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
            <div className="flex justify-between items-center mb-3 gap-2 px-2">
                <div className="flex items-center gap-3">
                    <DestinationRow
                        label={<span className="text-sm font-medium text-on-surface whitespace-nowrap">Branch to</span>}
                        value={branch.thenSkipTo}
                        onChange={(value) => onUpdate({ thenSkipTo: value, thenSkipToIsConfirmed: false })}
                        isConfirmed={branch.thenSkipToIsConfirmed}
                        followingQuestions={[]}
                        survey={survey}
                        currentBlockId={currentBlockId}
                        hideNextQuestion={true}
                        className="flex-1"
                    />
                    <span className="text-sm font-medium text-on-surface">if</span>
                </div>
            </div>
            {branch.conditions.length > 1 && (
                <div className="flex gap-1 flex-shrink-0 mb-3 px-2">
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

            <div className="space-y-2 mb-3">
                {branch.conditions && branch.conditions.map((condition, index) => (
                    <div key={condition.id} className="flex items-start gap-2 w-full">
                        {branch.conditions.length > 1 && (
                            <span className="text-sm font-normal text-on-surface-variant w-5 flex-shrink-0 text-center mt-2 h-[36px] flex items-center justify-center">
                                {index + 1}
                            </span>
                        )}
                        <div className="flex-1 min-w-0">
                            <LogicConditionRow
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
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-outline-variant/30 px-2 flex items-center gap-2">
                <span className="text-sm font-medium text-on-surface whitespace-nowrap">Create path</span>
                <input
                    type="text"
                    value={branch.pathName || ''}
                    onChange={(e) => onUpdate({ pathName: e.target.value, thenSkipToIsConfirmed: false })}
                    placeholder="Write path name"
                    className="flex-1 bg-[var(--input-bg)] border border-input-border rounded-md px-2 py-1.5 text-sm text-[var(--input-field-input-txt)] focus:outline-2 focus:outline-primary focus:outline-offset-1 transition-all"
                    aria-label="Branch path name"
                />
            </div>

            <div className="flex items-center justify-between mt-3">
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
