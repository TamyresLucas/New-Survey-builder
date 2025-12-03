import React, { useState, useMemo } from 'react';
import type { Block, Survey, DisplayLogicCondition, DisplayLogic } from '../../types';
import { QuestionType } from '../../types';
import { PlusIcon } from '../icons';
import { generateId } from '../../utils';
import { AdvancedLogicEditor, CopyAndPasteButton, LogicConditionRow } from './shared';

interface BlockDisplayLogicEditorProps {
    block: Block;
    survey: Survey;
    onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
    onExpandSidebar: () => void;
}

export const BlockDisplayLogicEditor: React.FC<BlockDisplayLogicEditorProps> = ({ block, survey, onUpdateBlock, onExpandSidebar }) => {
    const displayLogic = block.draftDisplayLogic ?? block.displayLogic;
    const [validationErrors, setValidationErrors] = useState<Map<string, Set<keyof DisplayLogicCondition>>>(new Map());
    const [isPasting, setIsPasting] = useState(false);

    const previousQuestions = useMemo(() => {
        const allBlocks = survey.blocks;
        const currentBlockIndex = allBlocks.findIndex(b => b.id === block.id);
        if (currentBlockIndex === -1) return [];

        return allBlocks
            .slice(0, currentBlockIndex)
            .flatMap(b => b.questions)
            .filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak);
    }, [survey, block.id]);

    const handleUpdate = (updates: Partial<Block>) => {
        onUpdateBlock(block.id, updates);
    };

    const handleAddDisplayLogic = () => {
        const newCondition: DisplayLogicCondition = {
            id: generateId('cond'),
            questionId: '',
            operator: '',
            value: '',
            isConfirmed: false,
        };
        handleUpdate({
            displayLogic: {
                operator: displayLogic?.operator || 'AND',
                conditions: [...(displayLogic?.conditions || []), newCondition],
            },
        });
        onExpandSidebar();
    };

    const handlePasteLogic = (text: string): { success: boolean; error?: string } => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const newConditions: DisplayLogicCondition[] = [];
        const validOperators = ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const lineNum = i + 1;
            const lineParts = line.split(/\s+/);
            const [qidCandidate, operator, ...valueParts] = lineParts;
            const value = valueParts.join(' ');

            if (!qidCandidate || !operator) {
                return { success: false, error: `Line ${lineNum}: Syntax error. Use "QuestionID operator value".` };
            }

            const qid = qidCandidate.toUpperCase();
            if (!previousQuestions.some(q => q.qid === qid)) {
                return { success: false, error: `Line ${lineNum}: Question "${qid}" is not a valid preceding question.` };
            }

            const operatorCleaned = operator.toLowerCase();
            if (!validOperators.includes(operatorCleaned)) {
                return { success: false, error: `Line ${lineNum}: Operator "${operator}" is not recognized.` };
            }

            const requiresValue = !['is_empty', 'is_not_empty'].includes(operatorCleaned);
            if (requiresValue && !value.trim()) {
                return { success: false, error: `Line ${lineNum}: Missing value for operator "${operator}".` };
            }

            newConditions.push({ id: generateId('cond'), questionId: qid, operator: operatorCleaned as DisplayLogicCondition['operator'], value: value.trim(), isConfirmed: true });
        }

        if (newConditions.length > 0) {
            handleUpdate({
                displayLogic: {
                    operator: displayLogic?.operator || 'AND',
                    conditions: [...(displayLogic?.conditions || []), ...newConditions],
                },
            });
            onExpandSidebar();
            return { success: true };
        }
        return { success: false, error: "No valid logic found." };
    };

    const handleConfirmCondition = (conditionId: string) => {
        if (!displayLogic) return;
        const condition = displayLogic.conditions.find(c => c.id === conditionId);
        if (!condition) return;

        const tempErrors = new Set<keyof DisplayLogicCondition>();
        if (!condition.questionId) tempErrors.add('questionId');
        if (!condition.operator) tempErrors.add('operator');

        const requiresValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
        if (!String(condition.value).trim() && requiresValue) {
            tempErrors.add('value');
        }

        if (tempErrors.size > 0) {
            setValidationErrors(prev => new Map(prev).set(conditionId, tempErrors));
            return;
        }

        const newConditions = displayLogic.conditions.map(c => c.id === conditionId ? { ...c, isConfirmed: true } : c);
        handleUpdate({ displayLogic: { ...displayLogic, conditions: newConditions } });
        setValidationErrors(prev => {
            const newErrors = new Map(prev);
            newErrors.delete(conditionId);
            return newErrors;
        });
    };

    const handleUpdateCondition = (index: number, field: keyof DisplayLogicCondition, value: any) => {
        if (!displayLogic) return;
        const newConditions = [...displayLogic.conditions];
        newConditions[index] = { ...newConditions[index], [field]: value, isConfirmed: false };
        if (field === 'questionId') {
            newConditions[index].value = '';
            newConditions[index].operator = '';
        }
        handleUpdate({ displayLogic: { ...displayLogic, conditions: newConditions } });
    };

    const handleRemoveCondition = (index: number) => {
        if (!displayLogic) return;
        const newConditions = displayLogic.conditions.filter((_, i) => i !== index);
        handleUpdate({ displayLogic: newConditions.length > 0 ? { ...displayLogic, conditions: newConditions } : undefined });
    };

    const setLogicOperator = (operator: 'AND' | 'OR') => {
        if (!displayLogic) return;
        handleUpdate({ displayLogic: { ...displayLogic, operator } });
    };

    if (!displayLogic || displayLogic.conditions.length === 0) {
        return (
            <div>
                <h3 className="text-sm font-medium text-on-surface mb-1">Display Logic</h3>
                <p className="text-xs text-on-surface-variant mb-3">Control when this block is shown to respondents.</p>
                {isPasting ? (
                    <AdvancedLogicEditor
                        onSave={handlePasteLogic}
                        onCancel={() => setIsPasting(false)}
                        placeholder={"Q1 equals Yes\nQ2 not_equals 5"}
                        primaryActionLabel="Add Display Logic"
                        disclosureText="Enter one condition per line (e.g., Q1 equals Yes)."
                    />
                ) : (
                    <div className="flex items-center gap-4">
                        <button onClick={handleAddDisplayLogic} className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary hover:text-on-primary rounded-md px-3 py-1.5 transition-colors">
                            <PlusIcon className="text-base" />
                            Add Display Logic
                        </button>
                        <CopyAndPasteButton onClick={() => setIsPasting(true)} />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                    <h3 className="text-sm font-medium text-on-surface">Display Logic</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">Control when this block is shown to respondents.</p>
                </div>
                <button
                    onClick={() => handleUpdate({ displayLogic: undefined, draftDisplayLogic: undefined })}
                    className="text-sm font-semibold text-error hover:underline px-2 py-1 rounded-md hover:bg-error-container/50"
                >
                    Remove
                </button>
            </div>

            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-on-surface">Show this block if:</p>
                    {displayLogic.conditions.length > 1 && (
                        <div className="flex gap-1">
                            <button onClick={() => setLogicOperator('AND')} className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors ${displayLogic.operator === 'AND' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>AND</button>
                            <button onClick={() => setLogicOperator('OR')} className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors ${displayLogic.operator === 'OR' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>OR</button>
                        </div>
                    )}
                </div>
                <button onClick={handleAddDisplayLogic} className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary hover:text-on-primary rounded-md px-3 py-1.5 transition-colors">
                    <PlusIcon className="text-base" />
                    Add condition
                </button>
            </div>

            <div className="space-y-2 mb-3">
                {displayLogic.conditions.map((condition, index) => (
                    <LogicConditionRow
                        key={condition.id || index}
                        condition={condition}
                        onUpdateCondition={(field, value) => handleUpdateCondition(index, field, value)}
                        onRemoveCondition={() => handleRemoveCondition(index)}
                        onConfirm={() => handleConfirmCondition(condition.id)}
                        availableQuestions={previousQuestions}
                        isConfirmed={condition.isConfirmed === true}
                        invalidFields={validationErrors.get(condition.id)}
                    />
                ))}
            </div>
        </div>
    );
};
