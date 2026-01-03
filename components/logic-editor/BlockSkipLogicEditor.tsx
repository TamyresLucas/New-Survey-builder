import React, { useState, useMemo } from 'react';
import type { Block, Survey, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition } from '../../types';
import { QuestionType } from '../../types';
import { PlusIcon } from '../icons';
import { generateId } from '../../utils';
import { LogicConditionRow, DestinationRow } from './shared';
import { Button } from '../Button';

interface BlockSkipLogicEditorProps {
    block: Block;
    survey: Survey;
    onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
    onExpandSidebar: () => void;
}

export const BlockSkipLogicEditor: React.FC<BlockSkipLogicEditorProps> = ({ block, survey, onUpdateBlock, onExpandSidebar }) => {
    const branchingLogic = block.draftBranchingLogic ?? block.branchingLogic;

    const questionsForConditions = useMemo(() =>
        survey.blocks
            .flatMap(b => b.id === block.id ? [] : b.questions)
            .filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak),
        [survey, block.id]
    );

    const currentBlockIndex = useMemo(() => survey.blocks.findIndex(b => b.id === block.id), [survey, block.id]);
    const followingBlocks = useMemo(() => survey.blocks.slice(currentBlockIndex + 1), [survey, currentBlockIndex]);
    const followingQuestions = useMemo(() => followingBlocks.flatMap(b => b.questions).filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak), [followingBlocks]);

    const handleUpdate = (updates: Partial<Block>) => {
        onUpdateBlock(block.id, updates);
    };

    if (!branchingLogic) {
        return (
            <div>
                <p className="text-xs text-on-surface-variant mb-3">Create rules to skip this entire block based on previous answers.</p>
                <div className="flex items-center gap-4">
                    <Button
                        variant="tertiary-primary"
                        size="large"
                        onClick={() => {
                            handleUpdate({
                                branchingLogic: {
                                    branches: [{
                                        id: generateId('branch'), operator: 'AND',
                                        conditions: [{ id: generateId('cond'), questionId: '', operator: '', value: '', isConfirmed: true }],
                                        thenSkipTo: '', thenSkipToIsConfirmed: true,
                                    }],
                                    otherwiseSkipTo: '',
                                    otherwiseIsConfirmed: true,
                                }
                            });
                            onExpandSidebar();
                        }}
                    >
                        <PlusIcon className="text-xl mr-2" /> Add logic set
                    </Button>
                </div>
            </div>
        );
    }

    const handleUpdateBranch = (branchId: string, updates: Partial<BranchingLogicBranch>) => {
        const newBranches = branchingLogic.branches.map(b => b.id === branchId ? { ...b, ...updates } : b);
        handleUpdate({ branchingLogic: { ...branchingLogic, branches: newBranches } });
    };

    const handleUpdateCondition = (branchId: string, conditionId: string, field: keyof BranchingLogicCondition, value: any) => {
        const branch = branchingLogic.branches.find(b => b.id === branchId);
        if (!branch) return;
        const newConditions = branch.conditions.map(c => c.id === conditionId ? { ...c, [field]: value } : c);

        // Clear value if operator involves emptiness
        if (field === 'operator' && (value === 'is_empty' || value === 'is_not_empty')) {
            const cond = newConditions.find(c => c.id === conditionId);
            if (cond) cond.value = '';
        }

        handleUpdateBranch(branchId, { conditions: newConditions });
    };

    const handleAddCondition = (branchId: string) => {
        const branch = branchingLogic.branches.find(b => b.id === branchId);
        if (!branch) return;
        const newCondition: BranchingLogicCondition = { id: generateId('cond'), questionId: '', operator: '', value: '', isConfirmed: true };
        handleUpdateBranch(branchId, { conditions: [...branch.conditions, newCondition] });
    };

    const handleRemoveCondition = (branchId: string, conditionId: string) => {
        const branch = branchingLogic.branches.find(b => b.id === branchId);
        if (!branch || branch.conditions.length <= 1) return;
        const newConditions = branch.conditions.filter(c => c.id !== conditionId);
        handleUpdateBranch(branchId, { conditions: newConditions });
    };

    const handleAddBranch = () => {
        const newBranch: BranchingLogicBranch = {
            id: generateId('branch'), operator: 'AND',
            conditions: [{ id: generateId('cond'), questionId: '', operator: '', value: '', isConfirmed: true }],
            thenSkipTo: '', thenSkipToIsConfirmed: true
        };
        handleUpdate({ branchingLogic: { ...branchingLogic, branches: [...branchingLogic.branches, newBranch] } });
    };

    const handleRemoveBranch = (branchId: string) => {
        const newBranches = branchingLogic.branches.filter(b => b.id !== branchId);
        if (newBranches.length === 0) {
            handleUpdate({ branchingLogic: undefined });
        } else {
            handleUpdate({ branchingLogic: { ...branchingLogic, branches: newBranches } });
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                    <h3 className="text-sm font-medium text-on-surface">Skip Logic</h3>
                    <p className="text-xs text-on-surface-variant">Create rules to skip this entire block based on previous answers.</p>
                </div>
                <button onClick={() => handleUpdate({ branchingLogic: undefined, draftBranchingLogic: undefined })} className="text-sm font-semibold text-error hover:underline px-2 py-1 rounded-md hover:bg-error-container/50">Remove</button>
            </div>

            <div className="space-y-4">
                {branchingLogic.branches.map((branch, index) => (
                    <div key={branch.id} className="p-3 border border-outline-variant rounded-md bg-surface-container min-w-0">
                        <div className="flex justify-between items-center mb-3 px-2">
                            <div className="flex-1">
                                <DestinationRow
                                    label={<span className="text-sm font-medium text-on-surface whitespace-nowrap">Branch to</span>}
                                    value={branch.thenSkipTo}
                                    onChange={(value) => handleUpdateBranch(branch.id, { thenSkipTo: value })}
                                    isConfirmed={true}
                                    followingQuestions={[]}
                                    survey={survey}
                                    currentBlockId={block.id}
                                    hideNextQuestion={true}
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2 px-2">
                            <span className="text-sm font-medium text-on-surface">if</span>
                            {branch.conditions.length > 1 && (
                                <div className="flex gap-1">
                                    <button onClick={() => handleUpdateBranch(branch.id, { operator: 'AND' })} className={`px-2 py-0.5 text-[10px] font-button-operator rounded-full transition-colors ${branch.operator === 'AND' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline text-on-surface-variant'}`}>AND</button>
                                    <button onClick={() => handleUpdateBranch(branch.id, { operator: 'OR' })} className={`px-2 py-0.5 text-[10px] font-button-operator rounded-full transition-colors ${branch.operator === 'OR' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline text-on-surface-variant'}`}>OR</button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 mb-3">
                            {branch.conditions.map((condition, cIndex) => (
                                <div key={condition.id} className="flex items-start gap-2 w-full">
                                    {branch.conditions.length > 1 && (
                                        <span className="text-xs font-medium text-on-surface-variant w-5 text-center mt-2">{cIndex + 1}.</span>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <LogicConditionRow
                                            condition={condition}
                                            onUpdateCondition={(field, value) => handleUpdateCondition(branch.id, condition.id, field, value)}
                                            onRemoveCondition={branch.conditions.length > 1 ? () => handleRemoveCondition(branch.id, condition.id) : undefined}
                                            availableQuestions={questionsForConditions}
                                            isConfirmed={true}
                                            isFirstCondition={cIndex === 0}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-3 px-2">
                            <Button variant="tertiary-primary" size="large" onClick={() => handleAddCondition(branch.id)}>
                                <PlusIcon className="text-xl mr-2" /> Add condition
                            </Button>

                            {branchingLogic.branches.length > 1 && (
                                <Button variant="tertiary" size="large" onClick={() => handleRemoveBranch(branch.id)}>
                                    Delete branch
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <Button onClick={handleAddBranch} variant="tertiary-primary" size="large">
                    <PlusIcon className="text-xl mr-2" /> Add logic set
                </Button>
            </div>
        </div>
    );
};
