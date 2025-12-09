import React, { useState } from 'react';
import type { Question, DisplayLogic, DisplayLogicCondition, LogicIssue } from '../../types';
import { generateId } from '../../utils';
import { PlusIcon } from '../icons';
import { LogicExpressionEditor, CopyAndPasteButton, LogicConditionRow } from './shared';

interface ConditionalLogicEditorProps {
    logicType: 'display' | 'hide';
    title: string;
    description: string;
    logicProp: 'displayLogic' | 'hideLogic';
    draftLogicProp: 'draftDisplayLogic' | 'draftHideLogic';
    question: Question;
    previousQuestions: Question[];
    issues: LogicIssue[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
    onRequestGeminiHelp: (topic: string) => void;
}

export const ConditionalLogicEditor: React.FC<ConditionalLogicEditorProps> = ({
    logicType,
    title,
    description,
    logicProp,
    draftLogicProp,
    question,
    previousQuestions,
    issues,
    onUpdate,
    onAddLogic,
    onRequestGeminiHelp,
}) => {
    const logic = question[draftLogicProp] ?? question[logicProp];
    const [validationErrors, setValidationErrors] = useState<Map<string, Set<keyof DisplayLogicCondition>>>(new Map());
    const [isPasting, setIsPasting] = useState(false);

    const handleUpdate = (newLogic: DisplayLogic | undefined) => {
        onUpdate({ [logicProp]: newLogic });
    };

    const handleAddLogic = () => {
        const newCondition: DisplayLogicCondition = {
            id: generateId('cond'),
            questionId: '',
            operator: '',
            value: '',
            isConfirmed: false,
        };
        handleUpdate({
            operator: logic?.operator || 'AND',
            conditions: [...(logic?.conditions || []), newCondition],
        });
        onAddLogic();
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
                operator: logic?.operator || 'AND',
                conditions: [...(logic?.conditions || []), ...newConditions],
            });
            onAddLogic();
            return { success: true };
        }
        return { success: false, error: "No valid logic found." };
    };

    const handleConfirmCondition = (conditionId: string) => {
        if (!logic) return;
        const condition = logic.conditions.find(c => c.id === conditionId);
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

        const newConditions = logic.conditions.map(c => c.id === conditionId ? { ...c, isConfirmed: true } : c);
        handleUpdate({ ...logic, conditions: newConditions });
        setValidationErrors(prev => {
            const newErrors = new Map(prev);
            newErrors.delete(conditionId);
            return newErrors;
        });
    };

    const handleUpdateCondition = (index: number, field: keyof DisplayLogicCondition, value: any) => {
        if (!logic) return;
        const newConditions = [...logic.conditions];
        newConditions[index] = { ...newConditions[index], [field]: value, isConfirmed: false };
        if (field === 'questionId') {
            newConditions[index].value = '';
            newConditions[index].operator = '';
        }
        handleUpdate({ ...logic, conditions: newConditions });
    };

    const handleRemoveCondition = (index: number) => {
        if (!logic) return;
        const newConditions = logic.conditions.filter((_, i) => i !== index);
        handleUpdate(newConditions.length > 0 ? { ...logic, conditions: newConditions } : undefined);
    };

    const setLogicOperator = (operator: 'AND' | 'OR') => {
        if (!logic) return;
        handleUpdate({ ...logic, operator });
    };

    if (!logic || logic.conditions.length === 0) {
        return (
            <div>
                <h3 className="text-sm font-medium text-on-surface mb-1">{title}</h3>
                <p className="text-xs text-on-surface-variant mb-3">{description}.</p>
                {isPasting ? (
                    <LogicExpressionEditor
                        onSave={handlePasteLogic}
                        onCancel={() => setIsPasting(false)}
                        placeholder={"Q1 equals Yes\nQ2 not_equals 5"}
                        primaryActionLabel={`Add ${logicType === 'display' ? 'Display' : 'Hide'} Logic`}
                        disclosureText="Enter one condition per line (e.g., Q1 equals Yes)."
                        helpTopic="Display Logic"
                        onRequestGeminiHelp={onRequestGeminiHelp}
                    />
                ) : (
                    <div className="flex items-center gap-4">
                        <button onClick={handleAddLogic} className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary hover:text-on-primary rounded-md px-3 py-1.5 transition-colors">
                            <PlusIcon className="text-base" />
                            Add condition
                        </button>
                        <CopyAndPasteButton onClick={() => setIsPasting(true)} label="Write expression" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                    <h3 className="text-sm font-medium text-on-surface">{title}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">{description}.</p>
                </div>
                <button
                    onClick={() => handleUpdate(undefined)}
                    className="text-sm font-semibold text-error hover:underline px-2 py-1 rounded-md hover:bg-error-container/50"
                >
                    Remove
                </button>
            </div>

            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {logic.conditions.length > 1 && (
                        <div className="flex gap-1">
                            <button onClick={() => setLogicOperator('AND')} className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors ${logic.operator === 'AND' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>AND</button>
                            <button onClick={() => setLogicOperator('OR')} className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors ${logic.operator === 'OR' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>OR</button>
                        </div>
                    )}
                </div>
                <button onClick={handleAddLogic} className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary hover:text-on-primary rounded-md px-3 py-1.5 transition-colors">
                    <PlusIcon className="text-base" />
                    Add condition
                </button>
            </div>

            <div className="space-y-2 mb-3">
                {logic.conditions.map((condition, index) => (
                    <LogicConditionRow
                        key={condition.id || index}
                        condition={condition}
                        onUpdateCondition={(field, value) => handleUpdateCondition(index, field, value)}
                        onRemoveCondition={() => handleRemoveCondition(index)}
                        onConfirm={() => handleConfirmCondition(condition.id)}
                        availableQuestions={previousQuestions}
                        isConfirmed={condition.isConfirmed === true}
                        issues={issues.filter(i => i.sourceId === condition.id)}
                        invalidFields={validationErrors.get(condition.id)}
                    />
                ))}
            </div>
        </div>
    );
};