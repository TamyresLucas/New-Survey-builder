import React, { useState } from 'react';
import type { Question, Survey, DisplayLogicCondition, LogicSet as ILogicSet, LogicIssue } from '../../../types';
import { CHOICE_BASED_QUESTION_TYPES, generateId, truncate, parseChoice, parseVoxcoLogic } from '../../../utils';
import { RandomizeChoicesEditor } from '../../logic-editor/RandomizationEditor';
import { ChoiceEliminationEditor } from '../../logic-editor/ChoiceEliminationEditor';
import { ChoiceDisplayLogicEditor } from '../../logic-editor/ChoiceDisplayLogicEditor';
import { PlusIcon, ChevronDownIcon, GridIcon, EditIcon } from '../../icons';
import { CopyAndPasteButton, LogicSet, AdvancedLogicEditor, DisplayLogicSet } from '../../logic-editor/shared';
import { Button } from '../../Button';

interface ChoiceBehaviorSectionProps {
    question: Question;
    survey: Survey;
    previousQuestions: Question[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
    isFirstInteractiveQuestion: boolean;
    issues?: LogicIssue[];
}

// Union type for local state
type PlaceholderItem =
    | (DisplayLogicCondition & { itemType: 'condition', action: 'show' | 'hide', targetChoiceId?: string })
    | (ILogicSet & { itemType: 'set', action: 'show' | 'hide', targetChoiceId?: string });

const ChoiceBehaviorSection: React.FC<ChoiceBehaviorSectionProps> = ({
    question,
    survey,
    previousQuestions,
    onUpdate,
    onAddLogic,
    isFirstInteractiveQuestion,
    issues = []
}) => {
    // Local state for the logic rows
    const [placeholderItems, setPlaceholderItems] = useState<PlaceholderItem[]>([]);
    const [placeholderOperator, setPlaceholderOperator] = useState<'AND' | 'OR'>('AND');
    const [isPasting, setIsPasting] = useState(false);

    const isChoiceBased = CHOICE_BASED_QUESTION_TYPES.has(question.type);

    if (!isChoiceBased) {
        return null;
    }

    // Handler for adding a new Logic Set
    const handleAddPlaceholderLogicSet = () => {
        setPlaceholderItems(prev => [...prev, {
            itemType: 'set',
            id: generateId('set'),
            operator: 'AND',
            conditions: [{
                id: generateId('cond'),
                questionId: '',
                operator: '',
                value: '',
                isConfirmed: false
            }],
            action: 'show',
            targetChoiceId: '',
            isConfirmed: false
        }]);
        onAddLogic();
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        setPlaceholderItems(prev => {
            const newItems = [...prev];
            const item = { ...newItems[index] }; // Immutable update
            (item as any)[field] = value;
            newItems[index] = item;
            return newItems;
        });
    };

    const handleUpdateLogicSet = (index: number, updates: Partial<ILogicSet>) => {
        setPlaceholderItems(prev => {
            const newItems = [...prev];
            const item = newItems[index];
            if (item.itemType === 'set') {
                newItems[index] = { ...item, ...updates }; // Immutable update
            }
            return newItems;
        });
    };

    const handleRemoveItem = (index: number) => {
        setPlaceholderItems(prev => prev.filter((_, i) => i !== index));
    };

    const handlePasteLogic = (text: string): { success: boolean; error?: string } => {
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length === 0) return { success: false, error: "No logic to paste." };

        const newItems: PlaceholderItem[] = [];
        const qidToQuestion = new Map(previousQuestions.filter(q => q.qid).map(q => [q.qid, q]));

        for (const line of lines) {
            let rawLogic = line.trim();
            let action: 'show' | 'hide' = 'show';
            let targetChoiceId = '';

            // Try to parse specific Choice Display Logic syntax: SHOW "Choice" IF ...
            const choiceLogicMatch = rawLogic.match(/^(SHOW|HIDE)\s+"([^"]+)"\s+IF\s+(.*)$/i);

            if (choiceLogicMatch) {
                action = choiceLogicMatch[1].toUpperCase() === 'HIDE' ? 'hide' : 'show';
                const choiceLabel = choiceLogicMatch[2].trim();
                rawLogic = choiceLogicMatch[3]; // The condition part

                // Try to find the choice
                const choice = question.choices?.find(c => {
                    const parsed = parseChoice(c.text);
                    return parsed.label.trim().toLowerCase() === choiceLabel.toLowerCase();
                });
                if (choice) {
                    targetChoiceId = choice.id;
                }
            } else {
                // Fallback to standard logic parsing
                if (rawLogic.toUpperCase().startsWith('HIDE IF ')) {
                    action = 'hide';
                    rawLogic = rawLogic.substring(8);
                } else if (rawLogic.toUpperCase().startsWith('SHOW IF ')) {
                    rawLogic = rawLogic.substring(8);
                }
            }

            const parsed = parseVoxcoLogic(rawLogic, qidToQuestion);
            if (!parsed || !parsed.conditions || parsed.conditions.length === 0) {
                return { success: false, error: `Syntax error in line: "${line}". Expected format: "SHOW "Choice" IF Q1 = 1" or "Q1 = 1"` };
            }

            const newSet: PlaceholderItem = {
                itemType: 'set',
                id: generateId('set'),
                operator: parsed.operator || 'AND',
                conditions: parsed.conditions.map(c => ({
                    ...c,
                    id: generateId('cond'),
                    isConfirmed: true
                })),
                action: action,
                targetChoiceId: targetChoiceId,
                isConfirmed: true
            };
            newItems.push(newSet);
        }

        setPlaceholderItems(prev => [...prev, ...newItems]);
        return { success: true };
    };

    // Sort items for display: sets only (as per filtering request)
    const sortedItems = [...placeholderItems]
        .filter(item => item.itemType === 'set')
        .sort((a, b) => {
            // Stability sort or explicit ordering if needed
            return 0;
        });

    return (
        <div className="divide-y divide-outline-variant">
            <div className="py-6 first:pt-0">
                <RandomizeChoicesEditor
                    question={question}
                    onUpdate={onUpdate}
                />
            </div>
            {!isFirstInteractiveQuestion && previousQuestions.length > 0 && (
                <div className="py-6 first:pt-0">
                    <ChoiceEliminationEditor
                        question={question}
                        previousQuestions={previousQuestions}
                        onUpdate={onUpdate}
                        onAddLogic={onAddLogic}
                    />
                </div>
            )}
            <div className="py-6 first:pt-0">
                <h3 className="text-sm font-medium text-on-surface mb-1">Choice Display Logic</h3>
                <p className="text-xs text-on-surface-variant mb-3">Conditionally show or hide choices based to respondents.</p>

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                        {!isPasting && (
                            <Button variant="tertiary-primary" size="large" onClick={handleAddPlaceholderLogicSet}>
                                <PlusIcon className="text-xl mr-2" /> Add logic set
                            </Button>
                        )}
                        {!isPasting && placeholderItems.length === 0 && (
                            <Button variant="tertiary-primary" size="large" onClick={() => setIsPasting(true)} disabled={isPasting}>
                                <EditIcon className="text-xl mr-2" /> Write expression
                            </Button>
                        )}
                    </div>

                    {placeholderItems.length > 1 && (
                        <div className="flex gap-1">
                            <button onClick={() => setPlaceholderOperator('AND')} className={`px-2 py-0.5 text-xs font-button-text rounded-full transition-colors ${placeholderOperator === 'AND' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>AND</button>
                            <button onClick={() => setPlaceholderOperator('OR')} className={`px-2 py-0.5 text-xs font-button-text rounded-full transition-colors ${placeholderOperator === 'OR' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>OR</button>
                        </div>
                    )}
                </div>

                {isPasting && (
                    <div className="mb-4">
                        <AdvancedLogicEditor
                            onSave={handlePasteLogic}
                            onCancel={() => setIsPasting(false)}
                            placeholder={'SHOW "Choice 1" IF Q1 equals Yes\nHIDE "Choice 2" IF Q2 equals No'}
                            primaryActionLabel="Apply"
                            disclosureText="Enter one condition per line. Use 'HIDE IF' or 'SHOW IF'."
                            transparentBackground={true}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    {sortedItems.map((item, index) => (
                        <div key={item.id} className="w-full">
                            {item.itemType === 'set' && (
                                <DisplayLogicSet
                                    logicSet={item}
                                    availableQuestions={previousQuestions}
                                    onUpdate={(updates) => handleUpdateLogicSet(index, updates)}
                                    onRemove={() => handleRemoveItem(index)}
                                    questionWidth="w-[23%]"
                                    operatorWidth="w-[23%]"
                                    valueWidth="w-[23%]"
                                    actionValue={item.action}
                                    onActionChange={(val) => handleUpdateItem(index, 'action', val)}
                                    label={
                                        <div className="relative w-64">
                                            <select
                                                value={item.targetChoiceId || ''}
                                                onChange={e => handleUpdateItem(index, 'targetChoiceId', e.target.value)}
                                                className="w-full bg-surface border border-outline rounded-md pl-2 pr-6 py-1.5 text-sm text-on-surface font-medium focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                                aria-label="Target Choice"
                                            >
                                                <option value="">Select choice...</option>
                                                {question.choices?.map(choice => (
                                                    <option key={choice.id} value={choice.id}>
                                                        {truncate(parseChoice(choice.text).label, 30)}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDownIcon className="absolute right-1.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base" />
                                        </div>
                                    }
                                    issues={issues}
                                    transparentBackground={true}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChoiceBehaviorSection;