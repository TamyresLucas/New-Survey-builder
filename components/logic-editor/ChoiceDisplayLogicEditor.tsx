


import React from 'react';
import type { Question, ChoiceDisplayLogic, ChoiceDisplayCondition, Survey } from '../../types';
import { generateId, truncate, parseChoice } from '../../utils';
import { PlusIcon, XIcon, ChevronDownIcon } from '../icons';
import { LogicConditionRow } from './shared';

interface ChoiceDisplayLogicEditorProps {
    question: Question;
    survey: Survey;
    previousQuestions: Question[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
}

export const ChoiceDisplayLogicEditor: React.FC<ChoiceDisplayLogicEditorProps> = ({
    question,
    survey,
    previousQuestions,
    onUpdate,
    onAddLogic,
}) => {
    const logic = question.draftChoiceDisplayLogic ?? question.choiceDisplayLogic;

    const [validationErrors, setValidationErrors] = React.useState<Map<string, Set<string>>>(new Map());

    const handleUpdate = (newLogic: ChoiceDisplayLogic | undefined) => {
        onUpdate({ choiceDisplayLogic: newLogic });
    };

    const handleRemoveAllLogic = () => {
        handleUpdate(undefined);
        setValidationErrors(new Map());
    }

    const handleAddCondition = (type: 'show' | 'hide') => {
        const newCondition: ChoiceDisplayCondition = { id: generateId('ccond'), targetChoiceId: '', sourceQuestionId: '', operator: '', value: '', isConfirmed: false };
        const currentLogic = logic || { showOperator: 'AND', showConditions: [], hideOperator: 'AND', hideConditions: [] };

        if (type === 'show') {
            handleUpdate({ ...currentLogic, showConditions: [...currentLogic.showConditions, newCondition] });
        } else {
            handleUpdate({ ...currentLogic, hideConditions: [...currentLogic.hideConditions, newCondition] });
        }
        onAddLogic();
    };

    const renderLogicSection = (type: 'show' | 'hide') => {
        const title = type === 'show' ? "Show choice if..." : "Hide choice if...";
        const conditions = type === 'show' ? logic?.showConditions || [] : logic?.hideConditions || [];
        const operator = type === 'show' ? logic?.showOperator || 'AND' : logic?.hideOperator || 'AND';

        const handleSetOperator = (op: 'AND' | 'OR') => {
            const currentLogic = logic || { showOperator: 'AND', showConditions: [], hideOperator: 'AND', hideConditions: [] };
            if (type === 'show') {
                handleUpdate({ ...currentLogic, showOperator: op });
            } else {
                handleUpdate({ ...currentLogic, hideOperator: op });
            }
        };

        const handleRemoveCondition = (index: number) => {
            const currentLogic = logic!;
            const conditionId = type === 'show' ? currentLogic.showConditions[index].id : currentLogic.hideConditions[index].id;

            // Clean up errors for removed condition
            setValidationErrors(prev => {
                const next = new Map(prev);
                next.delete(conditionId);
                return next;
            });

            let newConditions;
            if (type === 'show') {
                newConditions = currentLogic.showConditions.filter((_, i) => i !== index);
                handleUpdate({ ...currentLogic, showConditions: newConditions });
            } else {
                newConditions = currentLogic.hideConditions.filter((_, i) => i !== index);
                handleUpdate({ ...currentLogic, hideConditions: newConditions });
            }
        };

        const handleUpdateCondition = (index: number, field: keyof ChoiceDisplayCondition | 'questionId', value: any) => {
            const currentLogic = logic!;
            const updateField = (field === 'questionId' ? 'sourceQuestionId' : field) as keyof ChoiceDisplayCondition;

            // Clear specific error field when user updates it
            const condition = type === 'show' ? currentLogic.showConditions[index] : currentLogic.hideConditions[index];
            if (validationErrors.has(condition.id)) {
                setValidationErrors(prev => {
                    const next = new Map(prev);
                    const errors = next.get(condition.id);
                    if (errors) {
                        const nextErrors = new Set(errors);
                        if (field === 'questionId') nextErrors.delete('sourceQuestionId');
                        else nextErrors.delete(String(field));

                        if (nextErrors.size === 0) next.delete(condition.id);
                        else next.set(condition.id, nextErrors);
                    }
                    return next;
                });
            }

            if (type === 'show') {
                const newConditions = [...currentLogic.showConditions];
                newConditions[index] = { ...newConditions[index], [updateField]: value, isConfirmed: false };
                if (field === 'sourceQuestionId' || field === 'questionId') { // Reset operator/value when source changes
                    newConditions[index].operator = '';
                    newConditions[index].value = '';
                }
                handleUpdate({ ...currentLogic, showConditions: newConditions });
            } else {
                const newConditions = [...currentLogic.hideConditions];
                newConditions[index] = { ...newConditions[index], [updateField]: value, isConfirmed: false };
                if (field === 'sourceQuestionId' || field === 'questionId') {
                    newConditions[index].operator = '';
                    newConditions[index].value = '';
                }
                handleUpdate({ ...currentLogic, hideConditions: newConditions });
            }
        };

        const handleConfirmCondition = (index: number) => {
            const currentLogic = logic!;
            const condition = type === 'show' ? currentLogic.showConditions[index] : currentLogic.hideConditions[index];
            const errors = new Set<string>();

            if (!condition.targetChoiceId) errors.add('targetChoiceId');
            if (!condition.sourceQuestionId) errors.add('sourceQuestionId');
            if (!condition.operator) errors.add('operator');

            const requiresValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
            if (requiresValue && !condition.value) errors.add('value');

            if (errors.size > 0) {
                setValidationErrors(prev => new Map(prev).set(condition.id, errors));
                return;
            }

            if (type === 'show') {
                const newConditions = [...currentLogic.showConditions];
                newConditions[index] = { ...newConditions[index], isConfirmed: true };
                handleUpdate({ ...currentLogic, showConditions: newConditions });
            } else {
                const newConditions = [...currentLogic.hideConditions];
                newConditions[index] = { ...newConditions[index], isConfirmed: true };
                handleUpdate({ ...currentLogic, hideConditions: newConditions });
            }

            // Clear errors on success
            setValidationErrors(prev => {
                const next = new Map(prev);
                next.delete(condition.id);
                return next;
            });
        };

        if (conditions.length === 0) {
            return (
                <div className="py-6 first:pt-0">
                    <h4 className="text-sm font-medium text-on-surface mb-1">{title}</h4>
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleAddCondition(type)} className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary hover:text-on-primary rounded-md px-3 py-1.5">
                            <PlusIcon className="text-base" /> Add condition
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="py-6 first:pt-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-on-surface">{title}</h4>
                        {conditions.length > 1 && (
                            <div className="flex gap-1">
                                <button onClick={() => handleSetOperator('AND')} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${operator === 'AND' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>AND</button>
                                <button onClick={() => handleSetOperator('OR')} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${operator === 'OR' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>OR</button>
                            </div>
                        )}
                    </div>
                    <button onClick={() => handleAddCondition(type)} className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary hover:text-on-primary rounded-md px-3 py-1.5">
                        <PlusIcon className="text-base" /> Add
                    </button>
                </div>

                <div className="space-y-2">
                    {conditions.map((condition, index) => {
                        const conditionErrors = validationErrors.get(condition.id);
                        return (
                            <div key={condition.id} className={`p-2 bg-surface rounded-md space-y-2 border ${conditionErrors?.size ? 'border-error' : 'border-outline-variant'}`}>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-full">
                                        <select
                                            value={condition.targetChoiceId}
                                            onChange={e => handleUpdateCondition(index, 'targetChoiceId', e.target.value)}
                                            className={`w-full bg-[var(--input-bg)] border rounded-md px-2 py-1.5 pr-8 text-sm text-[var(--input-field-input-txt)] font-normal focus:outline-2 focus:outline-offset-1 appearance-none ${conditionErrors?.has('targetChoiceId') ? 'border-error focus:outline-error' : 'border-[var(--input-border)] focus:outline-primary'}`}
                                            aria-label={`Target choice for ${type} logic`}
                                        >
                                            <option value="">Select choice to {type}...</option>
                                            {(question.choices || []).map(c => (
                                                <option key={c.id} value={c.id}>{truncate(parseChoice(c.text).label, 30)}</option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
                                    </div>
                                    <span className="text-sm font-bold text-primary">IF</span>
                                </div>
                                <LogicConditionRow
                                    condition={{
                                        ...condition,
                                        questionId: condition.sourceQuestionId,
                                    }}
                                    onUpdateCondition={(field, value) => handleUpdateCondition(index, field as any, value)}
                                    onRemoveCondition={() => handleRemoveCondition(index)}
                                    // onConfirm removed
                                    availableQuestions={previousQuestions}
                                    // isConfirmed removed
                                    invalidFields={conditionErrors as any}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (!logic) {
        return (
            <div>
                <h3 className="text-sm font-medium text-on-surface mb-1">Choice Display Logic</h3>
                <p className="text-xs text-on-surface-variant mb-3">Conditionally show or hide choices based on previous answers.</p>
                <button onClick={() => handleAddCondition('show')} className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary hover:text-on-primary rounded-md px-3 py-1.5">
                    <PlusIcon className="text-base" /> Add display rule
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-sm font-medium text-on-surface">Choice Display Logic</h3>
                <button onClick={handleRemoveAllLogic} className="text-sm font-semibold text-error hover:underline">Remove</button>
            </div>
            <div className="divide-y divide-outline-variant">
                {renderLogicSection('show')}
                {renderLogicSection('hide')}
            </div>
        </div>
    );
};
