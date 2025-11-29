import React, { useState, useMemo } from 'react';
import type { Block, Survey, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition } from '../../types';
import { QuestionType } from '../../types';
import { PlusIcon, XIcon } from '../icons';
import { generateId } from '../../utils';
import { AdvancedLogicEditor, CopyAndPasteButton, LogicConditionRow, DestinationRow } from './shared';

interface BlockSkipLogicEditorProps {
    block: Block;
    survey: Survey;
    onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
    onExpandSidebar: () => void;
}

export const BlockSkipLogicEditor: React.FC<BlockSkipLogicEditorProps> = ({ block, survey, onUpdateBlock, onExpandSidebar }) => {
    const branchingLogic = block.draftBranchingLogic ?? block.branchingLogic;
    const [validationErrors, setValidationErrors] = useState<Map<string, Set<keyof BranchingLogicCondition | 'skipTo'>>>(new Map());
    const [isPasting, setIsPasting] = useState(false);

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

    const handlePasteLogic = (text: string): { success: boolean; error?: string } => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const newBranches: BranchingLogicBranch[] = [];
        const validOperators = ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const lineNum = i + 1;

            const parts = line.split(/ THEN SKIP TO | -> /i);
            if (parts.length !== 2) {
                return { success: false, error: `Line ${lineNum}: Invalid syntax. Use "IF <condition> THEN SKIP TO <destination>" or "<condition> -> <destination>".` };
            }

            let conditionStr = parts[0].trim();
            const destinationStr = parts[1].trim();

            if (conditionStr.toLowerCase().startsWith('if ')) {
                conditionStr = conditionStr.substring(3).trim();
            }

            const condParts = conditionStr.split(/\s+/);
            const [qidCandidate, operator, ...valueParts] = condParts;
            const value = valueParts.join(' ');

            if (!qidCandidate || !operator) { return { success: false, error: `Line ${lineNum}: Invalid condition syntax.` }; }

            const qid = qidCandidate.toUpperCase();
            if (!questionsForConditions.some(q => q.qid === qid)) {
                return { success: false, error: `Line ${lineNum}: Question "${qid}" is not a valid question for logic.` };
            }

            const operatorCleaned = operator.toLowerCase();
            if (!validOperators.includes(operatorCleaned)) { return { success: false, error: `Line ${lineNum}: Operator "${operator}" is not recognized.` }; }

            const requiresValue = !['is_empty', 'is_not_empty'].includes(operatorCleaned);
            if (requiresValue && !value.trim()) { return { success: false, error: `Line ${lineNum}: Missing value for operator "${operator}".` }; }

            const condition: BranchingLogicCondition = {
                id: generateId('cond'), questionId: qid,
                operator: operatorCleaned as BranchingLogicCondition['operator'],
                value: value.trim(), isConfirmed: true,
            };

            let thenSkipTo = '';
            const destUpper = destinationStr.toUpperCase();
            if (destUpper === 'END') { thenSkipTo = 'end'; }
            else if (destUpper.startsWith('BL')) {
                const block = survey.blocks.find(b => b.bid === destUpper);
                if (block) { thenSkipTo = `block:${block.id}`; }
                else { return { success: false, error: `Line ${lineNum}: Destination block "${destinationStr}" not found.` }; }
            } else if (destUpper.startsWith('Q')) {
                const question = survey.blocks.flatMap(b => b.questions).find(q => q.qid === destUpper);
                if (question) { thenSkipTo = question.id; }
                else { return { success: false, error: `Line ${lineNum}: Destination question "${destinationStr}" not found.` }; }
            } else { return { success: false, error: `Line ${lineNum}: Invalid destination "${destinationStr}". Use a Block ID (BL2), Question ID (Q5), or "End".` }; }

            newBranches.push({
                id: generateId('branch'), operator: 'AND', conditions: [condition],
                thenSkipTo, thenSkipToIsConfirmed: true
            });
        }

        if (newBranches.length > 0) {
            handleUpdate({
                branchingLogic: {
                    branches: [...(branchingLogic?.branches || []), ...newBranches],
                    otherwiseSkipTo: 'next', // This is for block logic, so 'next' isn't applicable. Maybe default to nothing.
                    otherwiseIsConfirmed: branchingLogic?.otherwiseIsConfirmed || true,
                },
            });
            onExpandSidebar();
            return { success: true };
        }

        return { success: false, error: "No valid logic found." };
    };

    if (!branchingLogic) {
        return (
            <div>
                <p className="text-xs text-on-surface-variant mb-3">Create rules to skip this entire block based on previous answers.</p>
                {isPasting ? (
                    <AdvancedLogicEditor
                        onSave={handlePasteLogic}
                        onCancel={() => setIsPasting(false)}
                        placeholder={"IF Q1 equals Yes THEN SKIP TO BL4\nQ2 is_empty -> End"}
                        primaryActionLabel="Add Skip Logic"
                        disclosureText="Enter one rule per line."
                    />
                ) : (
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
                            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            <PlusIcon className="text-base" /> Add Skip Logic
                        </button>
                        <CopyAndPasteButton onClick={() => setIsPasting(true)} />
                    </div>
                )}
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
                <button onClick={() => handleUpdate({ branchingLogic: undefined, draftBranchingLogic: undefined })} className="text-sm font-medium text-error hover:underline">Remove</button>
            </div>
            <div className="space-y-4">
                {branchingLogic.branches.map((branch) => (
                    <div key={branch.id} className="p-3 border border-outline-variant rounded-md bg-surface-container">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="font-bold text-primary">IF</span>
                                <div className="pl-4">
                                    {branch.conditions.length > 1 && (
                                        <select value={branch.operator} onChange={e => handleUpdateBranch(branch.id, { operator: e.target.value as 'AND' | 'OR' })} className="text-xs font-semibold p-1 rounded-md bg-transparent border border-input-border mb-2">
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
                            <button onClick={() => handleAddCondition(branch.id)} className="text-xs font-medium text-primary hover:underline">+ Add condition</button>
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
            <button onClick={handleAddBranch} className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"><PlusIcon className="text-base" /> Add branch</button>
        </div>
    );
};
