import React, { useState, useMemo } from 'react';
import type { Question, Survey, Block, DisplayLogicCondition, DisplayLogic, LogicSet as ILogicSet, LogicIssue } from '../../../types';
import { ArrowRightAltIcon, PlusIcon, ChevronDownIcon, GridIcon, EditIcon } from '../../icons';
import { QuestionGroupEditor, CopyAndPasteButton, CollapsibleSection, LogicSet, DisplayLogicSet, AdvancedLogicEditor, LogicConditionRow } from '../../logic-editor/shared';
import { generateId, parseDisplayLogicString, parseVoxcoLogic } from '../../../utils';
import { Button } from '../../Button';

interface QuestionBehaviorSectionProps {
    question: Question;
    survey: Survey;
    previousQuestions?: Question[];
    onUpdate: (updates: Partial<Question>) => void;
    onSelectBlock: (block: Block | null, options?: { tab: string; focusOn: string; }) => void;
    onAddLogic: () => void;
    issues?: LogicIssue[];
    onRequestGeminiHelp: (topic: string) => void;
    focusedLogicSource: string | null;
}

// Extended type to include Logic Sets
type ExtendedConditionItem =
    | (DisplayLogicCondition & { logicType: 'display' | 'hide'; itemType: 'condition' })
    | (ILogicSet & { logicType: 'display' | 'hide'; itemType: 'set' });


const QuestionBehaviorSection: React.FC<QuestionBehaviorSectionProps> = ({ question, survey, previousQuestions = [], onUpdate, onSelectBlock, onAddLogic, issues = [], onRequestGeminiHelp, focusedLogicSource }) => {
    const [isPasting, setIsPasting] = useState(false);

    React.useEffect(() => {
        if (focusedLogicSource) {
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

    const displayLogic = question.draftDisplayLogic ?? question.displayLogic;
    const hideLogic = question.draftHideLogic ?? question.hideLogic;

    // Merge conditions and sets for unified UI
    const items = useMemo(() => {
        const list: ExtendedConditionItem[] = [];

        if (displayLogic) {
            // displayLogic.conditions.forEach(c => list.push({ ...c, logicType: 'display', itemType: 'condition' }));
            if (displayLogic.logicSets) {
                displayLogic.logicSets.forEach(s => list.push({ ...s, logicType: 'display', itemType: 'set' }));
            }
        }

        if (hideLogic) {
            // hideLogic.conditions.forEach(c => list.push({ ...c, logicType: 'hide', itemType: 'condition' }));
            if (hideLogic.logicSets) {
                hideLogic.logicSets.forEach(s => list.push({ ...s, logicType: 'hide', itemType: 'set' }));
            }
        }
        // Sort: Conditions first (if any were added), then Sets
        return list.sort((a, b) => {
            if (a.itemType === 'condition' && b.itemType === 'set') return -1;
            if (a.itemType === 'set' && b.itemType === 'condition') return 1;
            return 0;
        });
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
        if (displayLogic) updates.displayLogic = { ...displayLogic, operator: op };
        if (hideLogic) updates.hideLogic = { ...hideLogic, operator: op };
        if (Object.keys(updates).length > 0) handleUpdateLogics(updates);
    };

    // handleAddCondition is technically unused if button is hidden, but kept for safety/completeness
    const handleAddCondition = () => {
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

    const handleAddLogicSet = () => {
        const newSet: ILogicSet = {
            id: generateId('set'),
            operator: 'AND',
            conditions: [{
                id: generateId('cond'),
                questionId: '',
                operator: '',
                value: '',
                isConfirmed: false
            }],
            isConfirmed: false
        };

        const currentDisplayLogic = displayLogic || { operator: currentOperator, conditions: [] };
        handleUpdateLogics({
            displayLogic: {
                ...currentDisplayLogic,
                logicSets: [...(currentDisplayLogic.logicSets || []), newSet]
            }
        });
        onAddLogic();
    };

    // ... (Paste logic preserved) ...
    const handlePasteLogic = (text: string): { success: boolean; error?: string } => {
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length === 0) return { success: false, error: "No logic to paste." };

        const displayConditions: DisplayLogicCondition[] = [];
        const hideConditions: DisplayLogicCondition[] = [];

        // Build maps for validation
        const allQuestions = survey.blocks.flatMap(b => b.questions);
        const qidToQuestion = new Map(allQuestions.filter(q => q.qid).map(q => [q.qid, q]));
        const questionIndexMap = new Map(allQuestions.map((q, i) => [q.id, i]));
        const currentQuestionIndex = questionIndexMap.get(question.id) ?? -1;

        for (const line of lines) {
            let rawLogic = line.trim();
            let isHide = false;

            if (rawLogic.toUpperCase().startsWith('HIDE IF ')) {
                isHide = true;
                rawLogic = 'SHOW IF ' + rawLogic.substring(8);
            } else if (!rawLogic.toUpperCase().startsWith('SHOW IF ')) {
                rawLogic = 'SHOW IF ' + rawLogic;
            }

            const parsed = parseVoxcoLogic(rawLogic, qidToQuestion);
            if (!parsed || !parsed.conditions || parsed.conditions.length === 0) {
                return { success: false, error: `Syntax error in line: "${line}". Expected format: "Q1.A1 = 1" or "Q1 = 1"` };
            }

            for (const cond of parsed.conditions) {
                const refQ = qidToQuestion.get(cond.questionId);
                if (!refQ) {
                    return { success: false, error: `Question "${cond.questionId}" not found in survey.` };
                }

                const refIndex = questionIndexMap.get(refQ.id) ?? -1;
                if (refIndex >= currentQuestionIndex) {
                    return { success: false, error: `Invalid reference: "${cond.questionId}" must appear before the current question.` };
                }
            }

            const newConditions = parsed.conditions.map(c => ({
                ...c,
                id: generateId('cond'),
                isConfirmed: true
            }));

            if (isHide) {
                hideConditions.push(...newConditions);
            } else {
                displayConditions.push(...newConditions);
            }
        }

        if (displayConditions.length > 0) {
            const currentLogic = displayLogic || { operator: 'AND', conditions: [], logicSets: [] };
            handleUpdateLogics({
                displayLogic: {
                    ...currentLogic,
                    conditions: [...currentLogic.conditions, ...displayConditions]
                }
            });
        }

        if (hideConditions.length > 0) {
            const currentLogic = hideLogic || { operator: 'AND', conditions: [], logicSets: [] };
            handleUpdateLogics({
                hideLogic: {
                    ...currentLogic,
                    conditions: [...currentLogic.conditions, ...hideConditions]
                }
            });
        }

        return { success: true };
    };

    const handleUpdateCondition = (conditionId: string, logicType: 'display' | 'hide', field: keyof DisplayLogicCondition, value: any) => {
        const targetLogic = logicType === 'display' ? displayLogic : hideLogic;
        if (!targetLogic) return;

        const newConditions = targetLogic.conditions.map(c => {
            if (c.id === conditionId) {
                const updated = { ...c, [field]: value, isConfirmed: false };
                if (field === 'questionId') { updated.value = ''; updated.operator = ''; }
                return updated;
            }
            return c;
        });

        handleUpdateLogics({ [logicType === 'display' ? 'displayLogic' : 'hideLogic']: { ...targetLogic, conditions: newConditions } });
    };

    const handleUpdateLogicSet = (setId: string, logicType: 'display' | 'hide', updates: Partial<ILogicSet>) => {
        const targetLogic = logicType === 'display' ? displayLogic : hideLogic;
        if (!targetLogic || !targetLogic.logicSets) return;

        const newSets = targetLogic.logicSets.map(s => s.id === setId ? { ...s, ...updates } : s);
        handleUpdateLogics({ [logicType === 'display' ? 'displayLogic' : 'hideLogic']: { ...targetLogic, logicSets: newSets } });
    };

    const handleTypeChange = (itemId: string, itemType: 'condition' | 'set', currentType: 'display' | 'hide', newType: 'display' | 'hide') => {
        if (currentType === newType) return;
        const sourceLogic = currentType === 'display' ? displayLogic : hideLogic;
        const targetLogic = newType === 'display' ? displayLogic : hideLogic;
        const targetOperator = targetLogic?.operator || currentOperator;

        const updates: { displayLogic?: DisplayLogic, hideLogic?: DisplayLogic } = {};

        if (itemType === 'condition') {
            const item = sourceLogic?.conditions.find(c => c.id === itemId);
            if (!item) return;

            // Update Source
            const newSourceConditions = sourceLogic!.conditions.filter(c => c.id !== itemId);
            updates[currentType === 'display' ? 'displayLogic' : 'hideLogic'] = newSourceConditions.length > 0 || (sourceLogic?.logicSets?.length ?? 0) > 0 ? { ...sourceLogic!, conditions: newSourceConditions } : undefined;

            // Update Target
            const newTargetConditions = [...(targetLogic?.conditions || []), { ...item, isConfirmed: false }];
            updates[newType === 'display' ? 'displayLogic' : 'hideLogic'] = { ...targetLogic, operator: targetOperator, conditions: newTargetConditions };

        } else {
            const item = sourceLogic?.logicSets?.find(s => s.id === itemId);
            if (!item) return;

            // Update Source
            const newSourceSets = sourceLogic!.logicSets!.filter(s => s.id !== itemId);
            updates[currentType === 'display' ? 'displayLogic' : 'hideLogic'] = (sourceLogic?.conditions.length ?? 0) > 0 || newSourceSets.length > 0 ? { ...sourceLogic!, logicSets: newSourceSets } : undefined;

            // Update Target
            const newTargetSets = [...(targetLogic?.logicSets || []), item];
            updates[newType === 'display' ? 'displayLogic' : 'hideLogic'] = { ...targetLogic, operator: targetOperator, conditions: targetLogic?.conditions || [], logicSets: newTargetSets };
        }

        handleUpdateLogics(updates);
    };

    const handleRemoveItem = (itemId: string, itemType: 'condition' | 'set', logicType: 'display' | 'hide') => {
        const targetLogic = logicType === 'display' ? displayLogic : hideLogic;
        if (!targetLogic) return;

        if (itemType === 'condition') {
            const newConditions = targetLogic.conditions.filter(c => c.id !== itemId);
            handleUpdateLogics({ [logicType === 'display' ? 'displayLogic' : 'hideLogic']: { ...targetLogic, conditions: newConditions } });
        } else {
            const newSets = targetLogic.logicSets?.filter(s => s.id !== itemId);
            handleUpdateLogics({ [logicType === 'display' ? 'displayLogic' : 'hideLogic']: { ...targetLogic, logicSets: newSets } });
        }
    };

    const handleConfirmCondition = (conditionId: string, logicType: 'display' | 'hide') => {
        const targetLogic = logicType === 'display' ? displayLogic : hideLogic;
        if (!targetLogic) return;
        const newConditions = targetLogic.conditions.map(c => c.id === conditionId ? { ...c, isConfirmed: true } : c);
        handleUpdateLogics({ [logicType === 'display' ? 'displayLogic' : 'hideLogic']: { ...targetLogic, conditions: newConditions } });
    };

    return (
        <div className="space-y-4">
            <QuestionGroupEditor question={question} survey={survey} onUpdate={onUpdate} />

            <Button
                variant="secondary"
                size="large"
                onClick={handleSetRandomization}
            >
                <span>Set question randomization</span>
                <ArrowRightAltIcon className="text-base ml-1" />
            </Button>

            <div className="border-t border-outline-variant pt-4">
                <h3 className="text-sm font-medium text-on-surface mb-0.5">Question display logic</h3>
                <p className="text-xs text-on-surface-variant mb-3">Conditionally show or hide this question to respondents.</p>

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                        {/* Add condition button hidden as per previous request */}
                        {!isPasting && (
                            <Button variant="tertiary-primary" size="large" onClick={handleAddLogicSet}>
                                <PlusIcon className="text-xl mr-2" /> Add logic set
                            </Button>
                        )}
                        {!isPasting && items.length === 0 && (
                            <Button variant="tertiary-primary" size="large" onClick={() => setIsPasting(true)} disabled={isPasting}>
                                <EditIcon className="text-xl mr-2" /> Write expression
                            </Button>
                        )}
                    </div>

                    {/* AND/OR toggle removed */}
                </div>

                {isPasting && (
                    <div className="mb-4">
                        <AdvancedLogicEditor
                            onSave={handlePasteLogic}
                            onCancel={() => setIsPasting(false)}
                            placeholder={"Q1 equals Yes\nHIDE IF Q2 equals No"}
                            primaryActionLabel="Apply"
                            disclosureText="Enter one condition per line. Use 'HIDE IF' or 'SHOW IF'."
                            transparentBackground={true}
                            onRequestGeminiHelp={onRequestGeminiHelp}
                            helpTopic="Advanced Logic Syntax"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    {items.map((item) => (
                        <React.Fragment key={item.id}>
                            {item.itemType === 'condition' ? (
                                // Condition rendering logic
                                <div className="w-full">
                                    <LogicConditionRow
                                        condition={item}
                                        onUpdateCondition={(field, value) => handleUpdateCondition(item.id, item.logicType, field, value)}
                                        onRemoveCondition={() => handleRemoveItem(item.id, 'condition', item.logicType)}
                                        onConfirm={() => handleConfirmCondition(item.id, item.logicType)}
                                        availableQuestions={previousQuestions}
                                        isConfirmed={item.isConfirmed === true}
                                    />
                                </div>
                            ) : (
                                <DisplayLogicSet
                                    logicSet={item}
                                    availableQuestions={previousQuestions}
                                    onUpdate={(updates) => handleUpdateLogicSet(item.id, item.logicType, updates)}
                                    onRemove={() => handleRemoveItem(item.id, 'set', item.logicType)}
                                    questionWidth="w-[28%]"
                                    operatorWidth="w-[28%]"
                                    valueWidth="w-[28%]"
                                    actionValue={item.logicType === 'display' ? 'show' : 'hide'}
                                    onActionChange={(val) => handleTypeChange(item.id, item.itemType, item.logicType, val === 'show' ? 'display' : 'hide')}
                                    label={question.qid}
                                    issues={issues.filter(i => i.sourceId === item.id)}
                                    transparentBackground={true}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionBehaviorSection;