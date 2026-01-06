import React, { useState, useEffect } from 'react';
import { Question, QuestionRandomizationRule, LogicIssue } from '../types';
import { RandomizationRow } from './RandomizationRow';
import { PlusIcon, WarningIcon } from './icons';
import { Button } from './Button';
import { generateId } from '../utils';

interface RandomizationSetProps {
    rules: QuestionRandomizationRule[];
    availableQuestions: Question[];
    onUpdate: (rules: QuestionRandomizationRule[]) => void;
    availableGroups?: string[];
    transparentBackground?: boolean;
}

export const RandomizationSet: React.FC<RandomizationSetProps> = ({
    rules,
    availableQuestions,
    onUpdate,
    availableGroups = [],
    transparentBackground = false
}) => {
    // Local state for transactional editing
    const [localRules, setLocalRules] = useState<QuestionRandomizationRule[]>(rules);
    const [isModified, setIsModified] = useState(false);
    const [validationIssues, setValidationIssues] = useState<LogicIssue[]>([]);
    const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

    // Sync local rules when props change (only if not modified)
    useEffect(() => {
        if (!isModified) {
            setLocalRules(rules);
        }
    }, [rules, isModified]);

    const validateRules = (currentRules: QuestionRandomizationRule[]): LogicIssue[] => {
        const issues: LogicIssue[] = [];

        // Check required fields for all rules
        currentRules.forEach(rule => {
            if (!rule.startQuestionId) {
                issues.push({
                    questionId: rule.startQuestionId || 'unknown',
                    type: 'randomization',
                    sourceId: rule.id,
                    message: 'Start question is required.',
                    field: 'startQuestionId'
                });
            }
            if (!rule.endQuestionId) {
                issues.push({
                    questionId: rule.startQuestionId || 'unknown',
                    type: 'randomization',
                    sourceId: rule.id,
                    message: 'End question is required.',
                    field: 'endQuestionId'
                });
            }
            if (!rule.pattern) {
                issues.push({
                    questionId: rule.startQuestionId || 'unknown',
                    type: 'randomization',
                    sourceId: rule.id,
                    message: 'Randomization pattern is required.',
                    field: 'pattern'
                });
            }
            if (rule.pattern === 'synchronized' && !rule.questionGroupId) {
                issues.push({
                    questionId: rule.startQuestionId || 'unknown',
                    type: 'randomization',
                    sourceId: rule.id,
                    message: 'Synchronization target is required.',
                    field: 'questionGroupId'
                });
            }
        });

        const activeRules = currentRules.filter(r => r.startQuestionId && r.endQuestionId);

        for (let i = 0; i < activeRules.length; i++) {
            const r1 = activeRules[i];
            const idx1_start = availableQuestions.findIndex(q => q.qid === r1.startQuestionId);
            const idx1_end = availableQuestions.findIndex(q => q.qid === r1.endQuestionId);

            if (idx1_start === -1 || idx1_end === -1) continue;

            if (idx1_start > idx1_end) {
                issues.push({
                    questionId: r1.startQuestionId,
                    type: 'randomization',
                    sourceId: r1.id,
                    message: `Randomization range is invalid (Start is after End).`,
                    field: 'questionId'
                } as LogicIssue);
            }

            for (let j = i + 1; j < activeRules.length; j++) {
                const r2 = activeRules[j];
                const idx2_start = availableQuestions.findIndex(q => q.qid === r2.startQuestionId);
                const idx2_end = availableQuestions.findIndex(q => q.qid === r2.endQuestionId);

                if (idx2_start === -1 || idx2_end === -1) continue;

                const min1 = Math.min(idx1_start, idx1_end);
                const max1 = Math.max(idx1_start, idx1_end);
                const min2 = Math.min(idx2_start, idx2_end);
                const max2 = Math.max(idx2_start, idx2_end);

                if (min1 <= max2 && min2 <= max1) {
                    issues.push({
                        questionId: r1.startQuestionId,
                        type: 'randomization',
                        sourceId: r1.id,
                        message: `Randomization range overlaps with another rule.`,
                        field: 'questionId'
                    } as LogicIssue);
                }
            }
        }
        return issues;
    };

    const handleUpdateRule = (index: number, updates: Partial<QuestionRandomizationRule>) => {
        const newRules = [...localRules];
        newRules[index] = { ...newRules[index], ...updates };
        setLocalRules(newRules);
        setIsModified(true);
        if (hasAttemptedSave) {
            setValidationIssues(validateRules(newRules));
        }
    };

    const handleRemoveRule = (index: number) => {
        const newRules = localRules.filter((_, i) => i !== index);
        setLocalRules(newRules);
        setIsModified(true);
        if (newRules.length === 0) {
            onUpdate([]);
        } else if (hasAttemptedSave) {
            setValidationIssues(validateRules(newRules));
        }
    };

    const handleAddRule = () => {
        const newRule: QuestionRandomizationRule = {
            id: generateId('rnd'),
            startQuestionId: '',
            endQuestionId: '',
            pattern: 'permutation'
        };
        setLocalRules([...localRules, newRule]);
        setIsModified(true);
    };

    const handleApply = () => {
        setHasAttemptedSave(true);
        const issues = validateRules(localRules);
        setValidationIssues(issues);

        if (issues.length === 0) {
            // Apply rules
            onUpdate(localRules);
            setLocalRules(localRules);
            setIsModified(false);
            setHasAttemptedSave(false);
        }
    };

    const handleCancel = () => {
        // If we are cancelling and the ONLY rule is the initial empty one (no start/end/pattern),
        // we should treat this as "turning off" randomization.
        const isInitialEmpty = rules.length === 1 &&
            !rules[0].startQuestionId &&
            !rules[0].endQuestionId &&
            (!rules[0].pattern || rules[0].pattern === 'permutation'); // Default is permutation

        if (isInitialEmpty) {
            onUpdate([]);
            setLocalRules([]);
            setIsModified(false);
            setValidationIssues([]);
            setHasAttemptedSave(false);
        } else {
            setLocalRules(rules);
            setIsModified(false);
            setValidationIssues([]);
            setHasAttemptedSave(false);
        }
    };

    const handleRemoveAll = () => {
        onUpdate([]);
        setLocalRules([]);
        setIsModified(false);
    };

    const hasIncompleteRules = rules.some(r => !r.startQuestionId || !r.endQuestionId || !r.pattern);
    const isConfirmedState = !isModified && localRules.length > 0 && !hasIncompleteRules;

    // Styling matches LogicSet logic
    const containerClasses = validationIssues.length > 0
        ? 'border-error bg-error-container/5'
        : transparentBackground
            ? 'border-outline-variant bg-transparent'
            : isConfirmedState
                ? 'border-outline-variant bg-surface-container'
                : 'border-primary bg-surface-container-high shadow-sm';

    if (localRules.length === 0 && !isModified) {
        return (
            <div className="w-full">
                <Button variant="tertiary-primary" size="large" onClick={handleAddRule}>
                    <PlusIcon className="text-xl mr-2" /> Add randomization
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className={`p-3 border rounded-md relative transition-colors ${containerClasses}`}>



                <div className="flex items-center justify-between mb-3 px-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Randomization Rules</span>
                        {validationIssues.length > 0 && (
                            <div className="relative text-error z-10 group/issues">
                                <WarningIcon className="text-xl" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-surface-container-highest text-on-surface text-xs rounded-md p-2 shadow-lg opacity-0 group-hover/issues:opacity-100 transition-opacity pointer-events-none border border-error z-20">
                                    <ul className="list-disc list-inside">
                                        {Array.from(new Set(validationIssues.map(i => i.message))).map((msg, idx) => (
                                            <li key={idx}>{msg}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-0">
                    {localRules.map((rule, index) => {
                        const ruleIssues = validationIssues.filter(i => i.sourceId === rule.id);
                        const invalidFields = new Set(ruleIssues.map(i => i.field).filter((f) => !!f) as string[]);

                        return (
                            <RandomizationRow
                                key={rule.id || index}
                                index={index}
                                totalRules={localRules.length}
                                rule={rule}
                                questions={availableQuestions}
                                onUpdate={(updates) => handleUpdateRule(index, updates)}
                                onRemove={() => handleRemoveRule(index)}
                                availableGroups={availableGroups}
                                disabled={false}
                                invalidFields={invalidFields}
                            />
                        );
                    })}
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <Button variant="tertiary-primary" size="large" onClick={handleAddRule}>
                        <PlusIcon className="text-xl mr-2" /> Add randomization
                    </Button>

                    <div className="flex items-center gap-2">
                        {isConfirmedState ? (
                            <Button
                                variant="danger"
                                size="large"
                                onClick={handleRemoveAll}
                            >
                                Delete
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="tertiary"
                                    size="large"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    size="large"
                                    onClick={handleApply}
                                >
                                    Apply
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
