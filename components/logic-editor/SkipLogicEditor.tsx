import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Survey, Question, SkipLogic, SkipLogicRule, LogicIssue, Block } from '../../types';
import { QuestionType } from '../../types';
import { generateId, parseChoice, truncate } from '../../utils';
import { PlusIcon, XIcon, InfoIcon, ChevronDownIcon } from '../icons';
import { DestinationRow, SkipLogicSet } from './shared';
import { Button } from '../Button';

export const SkipLogicEditor: React.FC<{
    question: Question;
    survey: Survey;
    followingQuestions: Question[];
    issues: LogicIssue[];
    onUpdate: (updates: Partial<Question>) => void;
    isChoiceBased: boolean;
    onAddLogic: () => void;
    onRequestGeminiHelp: (topic: string) => void;
    focusedLogicSource: string | null;
    currentBlockId: string | null;
}> = ({
    question,
    survey,
    followingQuestions,
    issues,
    onUpdate,
    isChoiceBased,
    onAddLogic,
    onRequestGeminiHelp,
    focusedLogicSource,
    currentBlockId,
}) => {
        const skipLogic = question.draftSkipLogic ?? question.skipLogic;


        const validFollowingQuestions = useMemo(() => {
            if (!currentBlockId) return followingQuestions;
            const block = survey.blocks.find(b => b.id === currentBlockId);
            if (!block) return followingQuestions;
            const blockQuestionIds = new Set(block.questions.map(q => q.id));
            return followingQuestions.filter(q => blockQuestionIds.has(q.id));
        }, [followingQuestions, currentBlockId, survey]);

        const choiceRowRefs = useRef<Record<string, HTMLDivElement>>({});

        useEffect(() => {
            if (focusedLogicSource && choiceRowRefs.current[focusedLogicSource]) {
                const element = choiceRowRefs.current[focusedLogicSource];
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('logic-highlight');
                setTimeout(() => element.classList.remove('logic-highlight'), 2500);
            }
        }, [focusedLogicSource]);


        const handleUpdateLogic = (newLogic: SkipLogic | undefined) => {
            onUpdate({ skipLogic: newLogic });
        };

        const handleEnable = () => {
            if (isChoiceBased && question.choices) {
                // Start with empty choice ID so user must select one
                handleUpdateLogic({
                    type: 'per_choice',
                    rules: [{ id: generateId('slr'), choiceId: '', skipTo: '', isConfirmed: false }],
                });
            } else {
                handleUpdateLogic({ type: 'simple', skipTo: '', isConfirmed: false });
            }
            onAddLogic();
        };

        const handleRemove = () => {
            handleUpdateLogic(undefined);
        };



        if (!skipLogic) {
            return (
                <div>
                    <h3 className="text-sm font-medium text-on-surface mb-1">Skip Logic</h3>
                    <p className="text-xs text-on-surface-variant mb-3">Send respondents to a question within the same block.</p>
                    <div className="flex items-center gap-4">
                        <Button variant="tertiary-primary" size="large" onClick={handleEnable}>
                            <PlusIcon className="text-xl mr-2" /> Add logic set
                        </Button>
                    </div>
                </div>
            );
        }

        if (skipLogic.type === 'simple') {
            const issue = issues.find(i => i.sourceId === 'simple');
            return (
                <div>
                    <h3 className="text-sm font-medium text-on-surface mb-1">Skip Logic</h3>
                    <p className="text-xs text-on-surface-variant mb-3">Send respondents to a question within the same block.</p>
                    <SkipLogicSet
                        label="If answered, skip to"
                        value={skipLogic.skipTo}
                        onChange={(value) => handleUpdateLogic({ ...skipLogic, skipTo: value, isConfirmed: false })}
                        onConfirm={() => handleUpdateLogic({ ...skipLogic, isConfirmed: true })}
                        onRemove={handleRemove}
                        isConfirmed={skipLogic.isConfirmed}
                        issues={issue ? [issue] : []}
                        followingQuestions={validFollowingQuestions}
                        survey={survey}
                        currentBlockId={currentBlockId}
                    />
                </div>
            );
        }

        // per_choice logic
        const handleRuleChange = (choiceId: string, updates: Partial<SkipLogicRule>) => {
            const rules = skipLogic.rules || [];
            const existingRuleIndex = rules.findIndex(r => r.choiceId === choiceId);
            let newRules;
            if (existingRuleIndex > -1) {
                newRules = rules.map((r, i) => i === existingRuleIndex ? { ...r, ...updates, isConfirmed: false } : r);
            } else {
                newRules = [...rules, { id: generateId('slr'), choiceId, skipTo: '', ...updates, isConfirmed: false }];
            }
            handleUpdateLogic({ type: 'per_choice', rules: newRules });
        };

        const handleRuleChoiceIdChange = (ruleId: string, newChoiceId: string) => {
            const rules = skipLogic.rules || [];
            // Check if choice is already used
            if (rules.some(r => r.choiceId === newChoiceId && r.id !== ruleId)) {
                // Choice already has logic, don't allow duplicate
                return;
            }

            const newRules = rules.map(r => r.id === ruleId ? { ...r, choiceId: newChoiceId, isConfirmed: false } : r);
            handleUpdateLogic({ type: 'per_choice', rules: newRules });
        }

        const handleConfirmRule = (choiceId: string) => {
            const rules = skipLogic.rules || [];
            const newRules = rules.map(r => r.choiceId === choiceId ? { ...r, isConfirmed: true } : r);
            handleUpdateLogic({ type: 'per_choice', rules: newRules });
        };

        const handleRuleRemoveByRuleId = (ruleId: string) => {
            const rules = skipLogic.rules || [];
            const newRules = rules.filter(r => r.id !== ruleId);
            if (newRules.length === 0 && !question.choices) {
                // If all rules removed, maybe go back to simple or undefined? 
                // BUT user wants to keep the button, so simpler to just have empty list.
                handleUpdateLogic({ type: 'per_choice', rules: [] });
            } else {
                handleUpdateLogic({ type: 'per_choice', rules: newRules });
            }
        };

        const handleAddLogicSet = () => {
            // If not yet per_choice, switch to it
            if (!skipLogic || skipLogic.type !== 'per_choice') {
                // Start with empty choice ID so user must select one
                handleUpdateLogic({ type: 'per_choice', rules: [{ id: generateId('slr'), choiceId: '', skipTo: '', isConfirmed: false }] });
            } else {
                // Find a choice that doesn't have a rule yet
                const usedChoiceIds = new Set(skipLogic.rules.map(r => r.choiceId));
                const availableChoice = question.choices?.find(c => !usedChoiceIds.has(c.id));

                const newChoiceId = availableChoice ? availableChoice.id : ''; // If no choice available, maybe empty? Or don't add?

                // If all choices taken, maybe assume they want to edit one? 
                // But assuming usually we add one.
                const rules = skipLogic.rules || [];
                // Start with empty choice ID
                handleUpdateLogic({ type: 'per_choice', rules: [...rules, { id: generateId('slr'), choiceId: '', skipTo: '', isConfirmed: false }] });
            }
        };

        return (
            <div>
                <h3 className="text-sm font-medium text-on-surface mb-1">Skip Logic</h3>
                <p className="text-xs text-on-surface-variant mb-3">Send respondents to a question within the same block.</p>
                <div className="space-y-4 mb-4">
                    {(skipLogic.rules || []).map(rule => {
                        const choice = question.choices?.find(c => c.id === rule.choiceId);
                        const issue = issues.find(i => i.sourceId === (choice?.id || rule.id));

                        const ChoiceSelector = (
                            <div className="relative w-full">
                                <select
                                    value={rule.choiceId}
                                    onChange={(e) => handleRuleChoiceIdChange(rule.id, e.target.value)}
                                    className="appearance-none w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2 py-1.5 pr-8 text-sm font-normal text-[var(--input-field-input-txt)] focus:outline-primary"
                                >
                                    <option value="" disabled>Select Choice</option>
                                    {question.choices?.map(c => (
                                        <option
                                            key={c.id}
                                            value={c.id}
                                            disabled={skipLogic.rules.some(r => r.choiceId === c.id && r.id !== rule.id)}
                                        >
                                            "{truncate(parseChoice(c.text).label, 20)}"
                                        </option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
                            </div>
                        );

                        return (
                            <div key={rule.id} ref={el => { if (el && choice) choiceRowRefs.current[choice.id] = el; }}>
                                <SkipLogicSet
                                    label={""} /* Deprecated, use children */
                                    value={rule.skipTo || ''}
                                    onChange={(value) => handleRuleChange(rule.choiceId, { skipTo: value })}
                                    onConfirm={() => handleConfirmRule(rule.choiceId)}
                                    onRemove={() => handleRuleRemoveByRuleId(rule.id)}
                                    isConfirmed={rule.isConfirmed}
                                    issues={issue ? [issue] : []}
                                    followingQuestions={validFollowingQuestions}
                                    survey={survey}
                                    currentBlockId={currentBlockId}
                                >
                                    {ChoiceSelector}
                                </SkipLogicSet>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="tertiary-primary" size="large" onClick={handleAddLogicSet}>
                        <PlusIcon className="text-xl mr-2" /> Add logic set
                    </Button>
                </div>
            </div>
        );
    };
