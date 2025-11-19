import React, { useState, useMemo } from 'react';
import type { Question, Survey, Block, DisplayLogicCondition, DisplayLogic } from '../../../types';
import { ArrowRightAltIcon, PlusIcon, ChevronDownIcon } from '../../icons';
import { QuestionGroupEditor, PasteInlineForm, CopyAndPasteButton, LogicConditionRow } from '../../logic-editor/shared';
import { generateId } from '../../../utils';

interface QuestionBehaviorSectionProps {
    question: Question;
    survey: Survey;
    previousQuestions?: Question[];
    onUpdate: (updates: Partial<Question>) => void;
    onSelectBlock: (block: Block | null, options?: { tab: string; focusOn: string; }) => void;
    onAddLogic: () => void;
}

const QuestionBehaviorSection: React.FC<QuestionBehaviorSectionProps> = ({ question, survey, previousQuestions = [], onUpdate, onSelectBlock, onAddLogic }) => {
    const [isPasting, setIsPasting] = useState(false);
    
    const displayLogic = question.draftDisplayLogic ?? question.displayLogic;
    const hideLogic = question.draftHideLogic ?? question.hideLogic;

    // Merge conditions for unified UI
    const conditions = useMemo(() => {
        const list: Array<DisplayLogicCondition & { logicType: 'display' | 'hide' }> = [];
        if (displayLogic?.conditions) {
            displayLogic.conditions.forEach(c => list.push({ ...c, logicType: 'display' }));
        }
        if (hideLogic?.conditions) {
            hideLogic.conditions.forEach(c => list.push({ ...c, logicType: 'hide' }));
        }
        return list;
    }, [displayLogic, hideLogic]);
    
    const currentOperator = useMemo(() => {
        return displayLogic?.operator || hideLogic?.operator || 'AND';
    }, [displayLogic, hideLogic]);

    const handleSetRandomization = () => {
        const parentBlock = survey.blocks.find(b => b.questions.some(q => q.id === question.id));
        if (parentBlock) {
            onSelectBlock(parentBlock, { tab: 'Advanced', focusOn: 'questionRandomization' });
        }
    };

    const handleUpdateLogics = (updates: { displayLogic?: DisplayLogic, hideLogic?: DisplayLogic }) => {
        onUpdate(updates);
    };

    const handleSetOperator = (op: 'AND' | 'OR') => {
        const updates: { displayLogic?: DisplayLogic, hideLogic?: DisplayLogic } = {};
        
        // Update operator for any existing logic objects
        if (displayLogic) {
            updates.displayLogic = { ...displayLogic, operator: op };
        }
        if (hideLogic) {
            updates.hideLogic = { ...hideLogic, operator: op };
        }

        if (Object.keys(updates).length > 0) {
            handleUpdateLogics(updates);
        }
    };

    const handleAddCondition = () => {
        // Default to 'display' (Show) logic
        const newCondition: DisplayLogicCondition = {
            id: generateId('cond'),
            questionId: '',
            operator: '',
            value: '',
            isConfirmed: false,
        };
        
        const currentDisplayLogic = displayLogic || { operator: currentOperator, conditions: [] };

        handleUpdateLogics({
            displayLogic: {
                ...currentDisplayLogic,
                conditions: [...currentDisplayLogic.conditions, newCondition],
            }
        });
        onAddLogic();
    };

    const handlePasteLogic = (text: string): { success: boolean; error?: string } => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const newDisplayConditions: DisplayLogicCondition[] = [];
        const newHideConditions: DisplayLogicCondition[] = [];
        
        const validOperators = ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'];
    
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            const lineNum = i + 1;
            
            let isHide = false;

            if (line.toUpperCase().startsWith('HIDE IF ')) {
                isHide = true;
                line = line.substring(8).trim();
            } else if (line.toUpperCase().startsWith('SHOW IF ')) {
                line = line.substring(8).trim();
            } else if (line.toUpperCase().startsWith('IF ')) {
                line = line.substring(3).trim();
            } else if (line.toUpperCase().startsWith('DISPLAY IF ')) {
                line = line.substring(11).trim();
            }

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
            
            const condition: DisplayLogicCondition = { id: generateId('cond'), questionId: qid, operator: operatorCleaned as DisplayLogicCondition['operator'], value: value.trim(), isConfirmed: true };
    
            if (isHide) {
                newHideConditions.push(condition);
            } else {
                newDisplayConditions.push(condition);
            }
        }
        
        if (newDisplayConditions.length > 0 || newHideConditions.length > 0) {
            const updates: { displayLogic?: DisplayLogic, hideLogic?: DisplayLogic } = {};
            
            if (newDisplayConditions.length > 0) {
                const current = displayLogic || { operator: currentOperator, conditions: [] };
                updates.displayLogic = {
                    ...current,
                    conditions: [...current.conditions, ...newDisplayConditions],
                };
            }
            
            if (newHideConditions.length > 0) {
                const current = hideLogic || { operator: currentOperator, conditions: [] };
                updates.hideLogic = {
                    ...current,
                    conditions: [...current.conditions, ...newHideConditions],
                };
            }

            handleUpdateLogics(updates);
            onAddLogic();
            return { success: true };
        }
        return { success: false, error: "No valid logic found." };
    };

    const handleUpdateCondition = (conditionId: string, logicType: 'display' | 'hide', field: keyof DisplayLogicCondition, value: any) => {
        const targetLogic = logicType === 'display' ? displayLogic : hideLogic;
        if (!targetLogic) return;

        const newConditions = targetLogic.conditions.map(c => {
            if (c.id === conditionId) {
                const updated = { ...c, [field]: value, isConfirmed: false };
                if (field === 'questionId') {
                    updated.value = '';
                    updated.operator = '';
                }
                return updated;
            }
            return c;
        });

        handleUpdateLogics({
            [logicType === 'display' ? 'displayLogic' : 'hideLogic']: { ...targetLogic, conditions: newConditions }
        });
    };

    const handleTypeChange = (conditionId: string, currentType: 'display' | 'hide', newType: 'display' | 'hide') => {
        if (currentType === newType) return;

        // 1. Find condition in source
        const sourceLogic = currentType === 'display' ? displayLogic : hideLogic;
        const conditionToMove = sourceLogic?.conditions.find(c => c.id === conditionId);
        
        if (!conditionToMove) return;

        // 2. Remove from source
        const newSourceConditions = sourceLogic!.conditions.filter(c => c.id !== conditionId);
        const updatedSourceLogic = newSourceConditions.length > 0 ? { ...sourceLogic!, conditions: newSourceConditions } : undefined;

        // 3. Add to target
        const targetLogic = newType === 'display' ? displayLogic : hideLogic;
        // Ensure target logic has the correct operator if it's being created or updated
        const targetOperator = targetLogic?.operator || currentOperator;
        const newTargetConditions = [...(targetLogic?.conditions || []), { ...conditionToMove, isConfirmed: false }];
        const updatedTargetLogic = { operator: targetOperator, conditions: newTargetConditions };

        handleUpdateLogics({
            [currentType === 'display' ? 'displayLogic' : 'hideLogic']: updatedSourceLogic,
            [newType === 'display' ? 'displayLogic' : 'hideLogic']: updatedTargetLogic,
        });
    };

    const handleRemoveCondition = (conditionId: string, logicType: 'display' | 'hide') => {
        const targetLogic = logicType === 'display' ? displayLogic : hideLogic;
        if (!targetLogic) return;

        const newConditions = targetLogic.conditions.filter(c => c.id !== conditionId);
        handleUpdateLogics({
            [logicType === 'display' ? 'displayLogic' : 'hideLogic']: newConditions.length > 0 ? { ...targetLogic, conditions: newConditions } : undefined
        });
    };

    const handleConfirmCondition = (conditionId: string, logicType: 'display' | 'hide') => {
        const targetLogic = logicType === 'display' ? displayLogic : hideLogic;
        if (!targetLogic) return;

        const newConditions = targetLogic.conditions.map(c => c.id === conditionId ? { ...c, isConfirmed: true } : c);
        handleUpdateLogics({
            [logicType === 'display' ? 'displayLogic' : 'hideLogic']: { ...targetLogic, conditions: newConditions }
        });
    };

    return (
        <div className="space-y-4">
            <QuestionGroupEditor question={question} survey={survey} onUpdate={onUpdate} />
            
            <button
                onClick={handleSetRandomization}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors"
            >
                <span>Set question randomization</span>
                <ArrowRightAltIcon className="text-base" />
            </button>

            <div className="border-t border-outline-variant pt-4">
                <h3 className="text-sm font-medium text-on-surface mb-0.5">Question display logic</h3>
                <p className="text-xs text-on-surface-variant mb-3">Control when this question is shown to respondents or hidden from them.</p>
                
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                        <button onClick={handleAddCondition} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors">
                            <PlusIcon className="text-base" />
                            Add condition
                        </button>
                        <CopyAndPasteButton onClick={() => setIsPasting(true)} disabled={isPasting} />
                    </div>

                    {conditions.length > 1 && (
                        <div className="flex gap-1">
                            <button onClick={() => handleSetOperator('AND')} className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${currentOperator === 'AND' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>AND</button>
                            <button onClick={() => handleSetOperator('OR')} className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${currentOperator === 'OR' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>OR</button>
                        </div>
                    )}
                </div>

                {isPasting && (
                    <div className="mb-4">
                        <PasteInlineForm
                            onSave={handlePasteLogic}
                            onCancel={() => setIsPasting(false)}
                            placeholder={"Q1 equals Yes\nHIDE IF Q2 equals No"}
                            primaryActionLabel="Add Logic"
                            disclosureText="Enter one condition per line. Use 'HIDE IF' or 'SHOW IF'."
                        />
                    </div>
                )}

                <div className="space-y-2">
                     {conditions.map((condition) => (
                        <div key={condition.id} className="flex items-center gap-2 p-2 bg-surface-container-high rounded-md border border-transparent hover:border-outline-variant group">
                            {/* Action Dropdown */}
                            <div className="relative w-24 flex-shrink-0">
                                <select
                                    value={condition.logicType === 'display' ? 'Show' : 'Hide'}
                                    onChange={e => handleTypeChange(condition.id, condition.logicType, e.target.value === 'Show' ? 'display' : 'hide')}
                                    className="w-full bg-surface border border-outline rounded-md pl-2 pr-6 py-1.5 text-sm text-on-surface font-medium focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                    aria-label="Logic Action"
                                >
                                    <option value="Show">Show</option>
                                    <option value="Hide">Hide</option>
                                </select>
                                <ChevronDownIcon className="absolute right-1.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base" />
                            </div>

                            <span className="text-sm font-bold text-primary flex-shrink-0">IF</span>

                            <div className="flex-grow min-w-0 -m-2">
                                <LogicConditionRow
                                    condition={condition}
                                    onUpdateCondition={(field, value) => handleUpdateCondition(condition.id, condition.logicType, field, value)}
                                    onRemoveCondition={() => handleRemoveCondition(condition.id, condition.logicType)}
                                    onConfirm={() => handleConfirmCondition(condition.id, condition.logicType)}
                                    availableQuestions={previousQuestions}
                                    isConfirmed={condition.isConfirmed === true}
                                    questionWidth="w-32"
                                    operatorWidth="w-28"
                                    valueWidth="flex-1 min-w-[100px]"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionBehaviorSection;