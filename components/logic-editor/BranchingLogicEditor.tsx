

import React, { memo, useMemo } from 'react';
import type { Survey, Question, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition, LogicIssue, Block } from '../../types';
import { generateId, isBranchingLogicExhaustive } from '../../utils';
import {
    XIcon, PlusIcon,
    InfoIcon
} from '../icons';
import {
    LogicConditionRow,
    DestinationRow
} from './shared';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';


export const BranchingLogicEditor: React.FC<{
    question: Question;
    survey: Survey;
    previousQuestions: Question[];
    followingQuestions: Question[];
    issues: LogicIssue[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
    onRequestGeminiHelp: (topic: string) => void;
    focusedLogicSource: string | null;
}> = ({
    question,
    survey,
    previousQuestions,
    followingQuestions,
    issues,
    onUpdate,
    onAddLogic,
    onRequestGeminiHelp,
    focusedLogicSource
}) => {
        const branchingLogic = question.draftBranchingLogic ?? question.branchingLogic;

        const currentBlockId = useMemo(() => {
            return survey.blocks.find(b => b.questions.some(q => q.id === question.id))?.id || null;
        }, [survey.blocks, question.id]);

        React.useEffect(() => {
            if (focusedLogicSource) {
                // Small timeout to ensure DOM is ready
                setTimeout(() => {
                    const element = document.getElementById(focusedLogicSource);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add('ring-2', 'ring-primary');
                        setTimeout(() => element.classList.remove('ring-2', 'ring-primary'), 2000);
                    }
                }, 100);
            }
        }, [focusedLogicSource]);

        const handleUpdate = (updates: Partial<Question>) => {
            onUpdate(updates);
        };

        const handleAddBranchingLogic = () => {
            const newBranch: BranchingLogicBranch = {
                id: generateId('branch'),
                operator: 'AND',
                conditions: [{ id: generateId('cond'), questionId: '', operator: '', value: '', isConfirmed: false }],
                thenSkipTo: '',
                thenSkipToIsConfirmed: false,
            };
            const newLogic: BranchingLogic = {
                branches: [newBranch],
                otherwiseSkipTo: 'next',
                otherwiseIsConfirmed: true,
            };
            onUpdate({ branchingLogic: newLogic });
            onAddLogic();
        };

        if (!branchingLogic) {
            return (
                <div className="py-6 first:pt-0">
                    <h3 className="text-sm font-medium text-on-surface mb-1">Branching Logic</h3>
                    <p className="text-xs text-on-surface-variant mb-3">Create complex paths through the survey based on multiple conditions.</p>
                    <Button variant="tertiary-primary" size="large" onClick={handleAddBranchingLogic}>
                        <PlusIcon className="text-xl mr-2" /> Add branch
                    </Button>
                </div>
            );
        }

        const handleUpdateBranch = (branchId: string, updates: Partial<BranchingLogicBranch>) => {
            const newBranches = branchingLogic.branches.map(b =>
                b.id === branchId ? { ...b, ...updates, thenSkipToIsConfirmed: false } : b
            );
            handleUpdate({ branchingLogic: { ...branchingLogic, branches: newBranches } });
        };

        const handleUpdateCondition = (
            branchId: string,
            conditionId: string,
            field: keyof BranchingLogicCondition,
            value: any
        ) => {
            const branch = branchingLogic.branches.find(b => b.id === branchId);
            if (!branch) return;
            const newConditions = branch.conditions.map(c =>
                c.id === conditionId ? { ...c, [field]: value, isConfirmed: false } : c
            );
            handleUpdateBranch(branchId, { conditions: newConditions });
        };

        const handleAddCondition = (branchId: string) => {
            const branch = branchingLogic.branches.find(b => b.id === branchId);
            if (!branch) return;
            const newCondition: BranchingLogicCondition = {
                id: generateId('cond'),
                questionId: '',
                operator: '',
                value: '',
                isConfirmed: false
            };
            handleUpdateBranch(branchId, { conditions: [...branch.conditions, newCondition] });
        };

        const handleRemoveCondition = (branchId: string, conditionId: string) => {
            const branch = branchingLogic.branches.find(b => b.id === branchId);
            if (!branch || branch.conditions.length <= 1) return;
            const newConditions = branch.conditions.filter(c => c.id !== conditionId);
            handleUpdateBranch(branchId, { conditions: newConditions });
        };

        const handleConfirmBranch = (branchId: string) => {
            const branch = branchingLogic.branches.find(b => b.id === branchId);
            if (!branch) return;
            const newConditions = branch.conditions.map(c => ({ ...c, isConfirmed: true }));
            handleUpdateBranch(branchId, { conditions: newConditions, thenSkipToIsConfirmed: true });
        };

        const handleAddBranch = () => {
            const newBranch: BranchingLogicBranch = {
                id: generateId('branch'),
                operator: 'AND',
                conditions: [{
                    id: generateId('cond'),
                    questionId: '',
                    operator: '',
                    value: '',
                    isConfirmed: false
                }],
                thenSkipTo: '',
                thenSkipToIsConfirmed: false
            };
            handleUpdate({
                branchingLogic: {
                    ...branchingLogic,
                    branches: [...branchingLogic.branches, newBranch]
                }
            });
        };

        const handleRemoveBranch = (branchId: string) => {
            const newBranches = branchingLogic.branches.filter(b => b.id !== branchId);
            if (newBranches.length === 0 && !branchingLogic.otherwiseSkipTo) {
                handleUpdate({ branchingLogic: undefined });
            } else {
                handleUpdate({ branchingLogic: { ...branchingLogic, branches: newBranches } });
            }
        };

        const isOtherwiseExhaustive = isBranchingLogicExhaustive(question);

        return (
            <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                    <div>
                        <p className="text-xs text-on-surface-variant">
                            Create complex paths through the survey based on multiple conditions.
                        </p>
                    </div>
                    <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleUpdate({
                            branchingLogic: undefined,
                            draftBranchingLogic: undefined
                        })}
                    >
                        Remove
                    </Button>
                </div>

                <div className="space-y-4">
                    {branchingLogic.branches.map((branch) => (
                        <div
                            key={branch.id}
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
                                                onChange={e => handleUpdateBranch(
                                                    branch.id,
                                                    { operator: e.target.value as 'AND' | 'OR' }
                                                )}
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
                                    onClick={() => handleRemoveBranch(branch.id)}
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
                                            handleUpdateCondition(branch.id, condition.id, field, value)
                                        }
                                        onRemoveCondition={
                                            branch.conditions.length > 1
                                                ? () => handleRemoveCondition(branch.id, condition.id)
                                                : undefined
                                        }
                                        onConfirm={() => handleConfirmBranch(branch.id)}
                                        availableQuestions={previousQuestions}
                                        isConfirmed={condition.isConfirmed || false}
                                        issues={issues.filter(i => i.sourceId === condition.id)}
                                        isFirstCondition={index === 0}
                                        currentQuestion={question}
                                        usedValues={new Set()}
                                    />
                                ))}
                                <Button
                                    variant="tertiary-primary"
                                    size="small"
                                    onClick={() => handleAddCondition(branch.id)}
                                >
                                    + Add condition
                                </Button>
                            </div>

                            <DestinationRow
                                label={<span className="font-bold text-on-surface">THEN SKIP TO</span>}
                                value={branch.thenSkipTo}
                                onChange={(value) => handleUpdateBranch(
                                    branch.id,
                                    { thenSkipTo: value, thenSkipToIsConfirmed: false }
                                )}
                                onConfirm={() => handleConfirmBranch(branch.id)}
                                isConfirmed={branch.thenSkipToIsConfirmed}
                                followingQuestions={followingQuestions}
                                survey={survey}
                                currentBlockId={currentBlockId}
                            />
                        </div>
                    ))}
                </div>

                <Button
                    variant="tertiary-primary"
                    size="large"
                    onClick={handleAddBranch}
                >
                    <PlusIcon className="text-xl mr-2" /> Add branch
                </Button>

                <div className="mt-4 pt-4 border-t border-outline-variant">
                    {!isOtherwiseExhaustive && (
                        <DestinationRow
                            label={<span className="font-bold text-on-surface-variant">OTHERWISE SKIP TO</span>}
                            value={branchingLogic.otherwiseSkipTo}
                            onChange={(value) => handleUpdate({
                                branchingLogic: {
                                    ...branchingLogic,
                                    otherwiseSkipTo: value,
                                    otherwiseIsConfirmed: false
                                }
                            })}
                            onConfirm={() => handleUpdate({
                                branchingLogic: {
                                    ...branchingLogic,
                                    otherwiseIsConfirmed: true
                                }
                            })}
                            isConfirmed={branchingLogic.otherwiseIsConfirmed}
                            followingQuestions={followingQuestions}
                            survey={survey}
                            currentBlockId={currentBlockId}
                            hideNextQuestion={isOtherwiseExhaustive}
                        />
                    )}
                    {isOtherwiseExhaustive && (
                        <Alert variant="info" className="mt-2">
                            The 'Otherwise' path is disabled because all choices are covered by a branch rule above.
                        </Alert>
                    )}
                </div>
            </div>
        );
    };