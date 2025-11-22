import React, { useState } from 'react';
import type { Question, Survey, DisplayLogicCondition, LogicSet as ILogicSet } from '../../../types';
import { CHOICE_BASED_QUESTION_TYPES, generateId, truncate, parseChoice } from '../../../utils';
import { RandomizeChoicesEditor } from '../../logic-editor/RandomizationEditor';
import { ChoiceEliminationEditor } from '../../logic-editor/ChoiceEliminationEditor';
import { ChoiceDisplayLogicEditor } from '../../logic-editor/ChoiceDisplayLogicEditor';
import { PlusIcon, ChevronDownIcon, GridIcon } from '../../icons';
import { CopyAndPasteButton, LogicConditionRow, LogicSet } from '../../logic-editor/shared';

interface ChoiceBehaviorSectionProps {
    question: Question;
    survey: Survey;
    previousQuestions: Question[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
    isFirstInteractiveQuestion: boolean;
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
    isFirstInteractiveQuestion
}) => {
    // Local state for the logic rows
    const [placeholderItems, setPlaceholderItems] = useState<PlaceholderItem[]>([]);
    const [placeholderOperator, setPlaceholderOperator] = useState<'AND' | 'OR'>('AND');

    const isChoiceBased = CHOICE_BASED_QUESTION_TYPES.has(question.type);

    if (!isChoiceBased) {
        return null;
    }

    const handleAddPlaceholderCondition = () => {
        setPlaceholderItems(prev => [...prev, {
            itemType: 'condition',
            id: generateId('cond'),
            questionId: '',
            operator: '',
            value: '',
            isConfirmed: false,
            action: 'show',
            targetChoiceId: ''
        }]);
        onAddLogic();
    };

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
            const item = newItems[index];
            (item as any)[field] = value;
            
            // Reset dependent fields if question changes for conditions
            if (item.itemType === 'condition' && field === 'questionId') {
                item.operator = '';
                item.value = '';
            }
            return newItems;
        });
    };

    const handleUpdateLogicSet = (index: number, updates: Partial<ILogicSet>) => {
         setPlaceholderItems(prev => {
            const newItems = [...prev];
            const item = newItems[index];
            if (item.itemType === 'set') {
                Object.assign(item, updates);
            }
            return newItems;
        });
    };

    const handleRemoveItem = (index: number) => {
        setPlaceholderItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleConfirmCondition = (index: number) => {
        setPlaceholderItems(prev => {
            const newItems = [...prev];
            const item = newItems[index];
            if(item.itemType === 'condition') {
                 item.isConfirmed = true;
            }
            return newItems;
        });
    };

    // Sort items for display: conditions first, then sets
    const sortedItems = [...placeholderItems].sort((a, b) => {
        if (a.itemType === 'condition' && b.itemType === 'set') return -1;
        if (a.itemType === 'set' && b.itemType === 'condition') return 1;
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
                 <p className="text-xs text-on-surface-variant mb-3">Conditionally show or hide choices based on previous answers.</p>
                 
                 <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                         <button 
                            onClick={handleAddPlaceholderCondition} 
                            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors"
                        >
                            <PlusIcon className="text-base" />
                            Add condition
                        </button>
                         <button onClick={handleAddPlaceholderLogicSet} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors">
                            <GridIcon className="text-base" />
                            Add logic set
                        </button>
                        <CopyAndPasteButton onClick={() => {}} />
                    </div>
                    
                    {placeholderItems.length > 1 && (
                        <div className="flex gap-1">
                            <button onClick={() => setPlaceholderOperator('AND')} className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${placeholderOperator === 'AND' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>AND</button>
                            <button onClick={() => setPlaceholderOperator('OR')} className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${placeholderOperator === 'OR' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>OR</button>
                        </div>
                    )}
                 </div>

                 <div className="space-y-2">
                    {sortedItems.map((item, index) => (
                        <div key={item.id} className="p-3 bg-surface-container-high rounded-md border border-transparent hover:border-outline-variant group flex flex-col gap-3 w-full max-w-full overflow-hidden">
                            {/* Row 1: Action & Target Choice */}
                            <div className="flex items-center gap-2 w-full">
                                <div className="relative w-24 flex-shrink-0">
                                    <select
                                        value={item.action === 'show' ? 'Show' : 'Hide'}
                                        onChange={e => handleUpdateItem(index, 'action', e.target.value === 'Show' ? 'show' : 'hide')}
                                        className="w-full bg-surface border border-outline rounded-md pl-2 pr-6 py-1.5 text-sm text-on-surface font-medium focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                        aria-label="Logic Action"
                                    >
                                        <option value="Show">Show</option>
                                        <option value="Hide">Hide</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-1.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base" />
                                </div>

                                <div className="relative flex-1">
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
                            </div>

                            {/* Row 2: Condition or Logic Set */}
                            <div className="flex items-start gap-1 w-full">
                                {item.itemType === 'condition' && (
                                    <span className="text-sm font-bold text-primary flex-shrink-0 w-8 text-left mt-2.5">IF</span>
                                )}
                                <div className="flex-grow min-w-0 w-full">
                                    {item.itemType === 'condition' ? (
                                        <LogicConditionRow
                                            condition={item}
                                            onUpdateCondition={(field, value) => handleUpdateItem(index, field as string, value)}
                                            onRemoveCondition={() => handleRemoveItem(index)}
                                            onConfirm={() => handleConfirmCondition(index)}
                                            availableQuestions={previousQuestions}
                                            isConfirmed={item.isConfirmed === true}
                                            questionWidth="w-[23%]"
                                            operatorWidth="w-[23%]"
                                            valueWidth="w-[23%]"
                                        />
                                    ) : (
                                        <LogicSet
                                            logicSet={item}
                                            availableQuestions={previousQuestions}
                                            onUpdate={(updates) => handleUpdateLogicSet(index, updates)}
                                            onRemove={() => handleRemoveItem(index)}
                                            questionWidth="w-[23%]"
                                            operatorWidth="w-[23%]"
                                            valueWidth="w-[23%]"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default ChoiceBehaviorSection;