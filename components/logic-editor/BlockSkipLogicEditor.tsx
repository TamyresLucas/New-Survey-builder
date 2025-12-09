import React, { useState, useMemo } from 'react';
import type { Block, Survey, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition } from '../../types';
import { QuestionType } from '../../types';
import { PlusIcon, XIcon } from '../icons';
import { generateId } from '../../utils';
import { LogicConditionRow, DestinationRow } from './shared';

interface BlockSkipLogicEditorProps {
    block: Block;
    survey: Survey;
    onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
    onExpandSidebar: () => void;
}

export const BlockSkipLogicEditor: React.FC<BlockSkipLogicEditorProps> = ({ block, survey, onUpdateBlock, onExpandSidebar }) => {
    const branchingLogic = block.draftBranchingLogic ?? block.branchingLogic;
    const [validationErrors, setValidationErrors] = useState<Map<string, Set<keyof BranchingLogicCondition | 'skipTo'>>>(new Map());


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
                    <button
                        onClick={() => {
                            handleUpdate({
                                branchingLogic: {
                                    branches: [{
                                        id: generateId('branch'), operator: 'AND',
                                        conditions: [{ id: generateId('cond'), questionId: '', operator: '', value: '', isConfirmed: false }],
                                        thenSkipTo: '', thenSkipToIsConfirmed: false,
                                    }],
                                    otherwiseSkipTo: '',
                                    otherwiseIsConfirmed: true,
                                }
                            });
                            onExpandSidebar();
                        }}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary hover:text-on-primary rounded-md px-3 py-1.5"
                    >
                        <PlusIcon className="text-base" /> Add Skip Logic
                    </button>
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
        const newConditions = branch.conditions.map(c => c.id === conditionId ? { ...c, [field]: value, isConfirmed: false } : c);
        handleUpdateBranch(branchId, { conditions: newConditions, thenSkipToIsConfirmed: false });
    };

    const handleAddCondition = (branchId: string) => {
        const branch = branchingLogic.branches.find(b => b.id === branchId);
        if (!branch) return;
        const newCondition: BranchingLogicCondition = { id: generateId('cond'), questionId: '', operator: '', value: '', isConfirmed: false };
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

        const newValidationErrors = new Map(validationErrors);
        let isBranchValid = true;
        branch.conditions.forEach(c => {
            const errors = new Set<keyof BranchingLogicCondition>();
            if (!c.questionId) errors.add('questionId');
            if (!c.operator) errors.add('operator');
            if (!['is_empty', 'is_not_empty'].includes(c.operator) && !c.value) errors.add('value');
            if (errors.size > 0) {
                newValidationErrors.set(c.id, errors);
                isBranchValid = false;
            } else {
                newValidationErrors.delete(c.id);
            }
        });
        if (!branch.thenSkipTo) {
            newValidationErrors.set(branch.id, new Set(['skipTo']));
            isBranchValid = false;
        } else {
            newValidationErrors.delete(branch.id);
        }
        setValidationErrors(newValidationErrors);

        if (isBranchValid) {
            const newConditions = branch.conditions.map(c => ({ ...c, isConfirmed: true }));
            handleUpdateBranch(branchId, { conditions: newConditions, thenSkipToIsConfirmed: true });
        }
    };

    const handleAddBranch = () => {
        const newBranch: BranchingLogicBranch = {
            id: generateId('branch'), operator: 'AND',
            conditions: [{ id: generateId('cond'), questionId: '', operator: '', value: '', isConfirmed: false }],
            thenSkipTo: '', thenSkipToIsConfirmed: false
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
                    <p className="text-xs text-on-surface-variant">Create rules to skip this entire block based on previous answers.</p>
                </div>
                <button onClick={() => handleUpdate({ branchingLogic: undefined, draftBranchingLogic: undefined })} className="text-sm font-semibold text-error hover:underline">Remove</button>
            </div>
            <div className="space-y-4">
                {branchingLogic.branches.map((branch) => (
                    <div key={branch.id} className="p-3 border border-outline-variant rounded-md bg-surface-container">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="font-bold text-primary">IF</span>
                                <div className="pl-4">
                                    {branch.conditions.length > 1 && (
                                        <select value={branch.operator} onChange={e => handleUpdateBranch(branch.id, { operator: e.target.value as 'AND' | 'OR' })} className="text-xs font-semibold p-1 rounded-md bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-field-input-txt)] font-normal mb-2">
                                            <option value="AND">All conditions are met (AND)</option>
                                            <option value="OR">Any condition is met (OR)</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => handleRemoveBranch(branch.id)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full"><XIcon className="text-lg" /></button>
                        </div>
                        <div className="space-y-2 mb-3">
                            {branch.conditions.map((condition, index) => (
                                <LogicConditionRow
                                    key={condition.id}
                                    condition={condition}
                                    onUpdateCondition={(field, value) => handleUpdateCondition(branch.id, condition.id, field, value)}
                                    onRemoveCondition={branch.conditions.length > 1 ? () => handleRemoveCondition(branch.id, condition.id) : undefined}
                                    onConfirm={() => handleConfirmBranch(branch.id)}
                                    availableQuestions={questionsForConditions}
                                    isConfirmed={condition.isConfirmed === true}
                                    invalidFields={validationErrors.get(condition.id)}
                                />
                            ))}
                            <button onClick={() => handleAddCondition(branch.id)} className="text-xs font-semibold text-primary hover:bg-primary hover:text-on-primary rounded-md px-3 py-1.5 transition-colors">+ Add condition</button>
                        </div>
                        <DestinationRow
                            label={<span className="font-bold text-primary">THEN SKIP TO</span>}
                            value={branch.thenSkipTo}
                            onChange={(value) => handleUpdateBranch(branch.id, { thenSkipTo: value, thenSkipToIsConfirmed: false })}
                            onConfirm={() => handleConfirmBranch(branch.id)}
                            isConfirmed={branch.thenSkipToIsConfirmed}
                            invalid={validationErrors.has(branch.id)}
                            followingBlocks={followingBlocks}
                            followingQuestions={followingQuestions}
                        />
                    </div>
                ))}
            </div>
            <button onClick={handleAddBranch} className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary hover:text-on-primary rounded-md px-3 py-1.5 transition-colors"><PlusIcon className="text-base" /> Add branch</button>
        </div>
    );
};
