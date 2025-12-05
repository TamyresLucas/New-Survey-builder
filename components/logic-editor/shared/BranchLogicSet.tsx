import React from 'react';
import type { BranchingLogicBranch, BranchingLogicCondition, LogicIssue, Question, Survey } from '../../../types';
import { Button } from '@/components/Button';
import { XIcon } from '../../icons';
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
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="font-bold text-on-surface">IF</span>
                    <div className="pl-4">
                        {branch.conditions.length > 1 && (
                            <select
                                value={branch.operator}
                                onChange={e => onUpdate({ operator: e.target.value as 'AND' | 'OR' })}
                                className="text-xs font-semibold p-1 rounded-md bg-transparent border border-input-border mb-2"
                            >
                                <option value="AND">All conditions are met (AND)</option>
                                <option value="OR">Any condition is met (OR)</option>
                            </select>
                        )}
                    </div>
                </div>
                <Button
                    variant="danger"
                    iconOnly
                    size="small"
                    onClick={onRemove}
                >
                    <XIcon className="text-lg" />
                </Button>
            </div>

            <div className="space-y-2 mb-3">
                {branch.conditions.map((condition, index) => (
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
                        onConfirm={handleConfirm}
                        availableQuestions={availableQuestions}
                        isConfirmed={condition.isConfirmed || false}
                        issues={issues.filter(i => i.sourceId === condition.id)}
                        isFirstCondition={index === 0}
                        currentQuestion={currentQuestion}
                        usedValues={new Set()}
                    />
                ))}
                <Button
                    variant="tertiary-primary"
                    size="small"
                    onClick={handleAddCondition}
                >
                    + Add condition
                </Button>
            </div>

            <DestinationRow
                label={<span className="font-bold text-on-surface">Then skip to</span>}
                value={branch.thenSkipTo}
                onChange={(value) => onUpdate({ thenSkipTo: value, thenSkipToIsConfirmed: false })}
                onConfirm={handleConfirm}
                isConfirmed={branch.thenSkipToIsConfirmed}
                followingQuestions={followingQuestions}
                survey={survey}
                currentBlockId={currentBlockId}
            />
        </div>
    );
};
