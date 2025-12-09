

import React, { memo, useMemo } from 'react';
import type { Survey, Question, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition, LogicIssue, Block } from '../../types';
import { generateId, isBranchingLogicExhaustive } from '../../utils';
import {
    XIcon, PlusIcon,
    InfoIcon
} from '../icons';
import {
    DestinationRow,
    BranchLogicSet
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

                </div>

                <div className="space-y-4">
                    {branchingLogic.branches.map((branch) => (
                        <BranchLogicSet
                            key={branch.id}
                            branch={branch}
                            onUpdate={(updates) => handleUpdateBranch(branch.id, updates)}
                            onRemove={() => handleRemoveBranch(branch.id)}
                            availableQuestions={previousQuestions}
                            followingQuestions={followingQuestions}
                            survey={survey}
                            currentBlockId={currentBlockId}
                            issues={issues}
                            currentQuestion={question}
                        />
                    ))}
                </div>

                <Button
                    variant="tertiary-primary"
                    size="large"
                    onClick={handleAddBranch}
                    className="mt-4"
                >
                    <PlusIcon className="text-xl mr-2" /> Add branch
                </Button>

                {!isOtherwiseExhaustive && (
                    <div className="mt-4 pt-4 border-t border-outline-variant">
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
                    </div>
                )}
            </div>
        );
    };