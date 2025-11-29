import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Survey, Question, SkipLogic, SkipLogicRule, LogicIssue, Block } from '../../types';
import { QuestionType } from '../../types';
import { generateId, parseChoice, truncate } from '../../utils';
import { PlusIcon, XIcon, InfoIcon } from '../icons';
import { AdvancedLogicEditor, CopyAndPasteButton, DestinationRow } from './shared';

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
        const [isPasting, setIsPasting] = useState(false);

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
                handleUpdateLogic({
                    type: 'per_choice',
                    rules: [],
                });
            } else {
                handleUpdateLogic({ type: 'simple', skipTo: 'next', isConfirmed: false });
            }
            onAddLogic();
        };

        const handleRemove = () => {
            handleUpdateLogic(undefined);
        };

        const handlePasteLogic = (text: string): { success: boolean; error?: string } => {
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const newRules: SkipLogicRule[] = [];

            const findDestinationId = (destStr: string): string => {
                const upperDest = destStr.toUpperCase();
                if (upperDest === 'NEXT') return 'next';
                if (upperDest === 'END') return 'end';
                const questionByQid = survey.blocks.flatMap(b => b.questions).find(q => q.qid === upperDest);
                if (questionByQid) return questionByQid.id;
                const blockByBid = survey.blocks.find(b => b.bid === upperDest);
                if (blockByBid) return `block:${blockByBid.id}`;
                return '';
            };

            for (const line of lines) {
                const parts = line.split(/ -> | THEN SKIP TO /i);
                if (parts.length !== 2) return { success: false, error: 'Invalid syntax. Use "Choice Text -> Destination" or "IF Choice Text THEN SKIP TO Destination".' };

                let choiceText = parts[0].trim();
                if (choiceText.toLowerCase().startsWith('if ')) {
                    choiceText = choiceText.substring(3).trim();
                }
                choiceText = choiceText.replace(/^"|"$/g, ''); // remove quotes

                const choice = question.choices?.find(c => parseChoice(c.text).label.trim().toLowerCase() === choiceText.toLowerCase());
                if (!choice) return { success: false, error: `Choice "${truncate(choiceText, 20)}" not found.` };

                const destId = findDestinationId(parts[1].trim());
                if (!destId) return { success: false, error: `Destination "${truncate(parts[1].trim(), 20)}" not found.` };

                newRules.push({ id: generateId('slr'), choiceId: choice.id, skipTo: destId, isConfirmed: true });
            }

            if (newRules.length > 0) {
                handleUpdateLogic({ type: 'per_choice', rules: newRules });
                onAddLogic();
                return { success: true };
            }
            return { success: false, error: "No valid rules found." };
        };

        if (!skipLogic) {
            return (
                <div>
                    <h3 className="text-sm font-medium text-on-surface mb-1">Skip Logic</h3>
                    <p className="text-xs text-on-surface-variant mb-3">Send respondents to a future point in the survey based on their answer.</p>
                    {isPasting ? (
                        <AdvancedLogicEditor
                            onSave={handlePasteLogic}
                            onCancel={() => setIsPasting(false)}
                            placeholder={isChoiceBased ? `Yes -> Q3\nNo -> End` : '-> Q5'}
                            primaryActionLabel="Add Skip Logic"
                            disclosureText={isChoiceBased ? 'Enter one rule per line (Choice Text -> Destination).' : 'Enter one rule (-> Destination).'}
                            helpTopic="Skip Logic"
                            onRequestGeminiHelp={onRequestGeminiHelp}
                        />
                    ) : (
                        <div className="flex items-center gap-4">
                            <button onClick={handleEnable} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                                <PlusIcon className="text-base" /> Add skip logic
                            </button>
                            {isChoiceBased && <CopyAndPasteButton onClick={() => setIsPasting(true)} />}
                        </div>
                    )}
                </div>
            );
        }

        if (skipLogic.type === 'simple') {
            const issue = issues.find(i => i.sourceId === 'simple');
            return (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-on-surface">Skip Logic</h3>
                        <button onClick={handleRemove} className="text-sm font-medium text-error hover:underline">Remove</button>
                    </div>
                    <DestinationRow
                        label="If answered, skip to"
                        value={skipLogic.skipTo}
                        onChange={(value) => handleUpdateLogic({ ...skipLogic, skipTo: value, isConfirmed: false })}
                        onConfirm={() => handleUpdateLogic({ ...skipLogic, isConfirmed: true })}
                        isConfirmed={skipLogic.isConfirmed}
                        issue={issue}
                        invalid={!!issue}
                        followingQuestions={followingQuestions}
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

        const handleConfirmRule = (choiceId: string) => {
            const rules = skipLogic.rules || [];
            const newRules = rules.map(r => r.choiceId === choiceId ? { ...r, isConfirmed: true } : r);
            handleUpdateLogic({ type: 'per_choice', rules: newRules });
        };

        return (
            <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-sm font-medium text-on-surface">Skip Logic</h3>
                    <button onClick={handleRemove} className="text-sm font-medium text-error hover:underline px-2 py-1 rounded-md hover:bg-error-container/50">
                        Remove
                    </button>
                </div>
                <div className="space-y-4">
                    {(question.choices || []).map(choice => {
                        const rule = skipLogic.rules.find(r => r.choiceId === choice.id);
                        const issue = issues.find(i => i.sourceId === choice.id);

                        return (
                            <div key={choice.id} ref={el => { if (el) choiceRowRefs.current[choice.id] = el; }}>
                                <DestinationRow
                                    label={<>If "<strong>{truncate(parseChoice(choice.text).label, 20)}</strong>" is selected, skip to</>}
                                    value={rule?.skipTo || 'next'}
                                    onChange={(value) => handleRuleChange(choice.id, { skipTo: value })}
                                    onConfirm={() => handleConfirmRule(choice.id)}
                                    isConfirmed={rule?.isConfirmed}
                                    issue={issue}
                                    invalid={!!issue}
                                    followingQuestions={followingQuestions}
                                    survey={survey}
                                    currentBlockId={currentBlockId}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };
