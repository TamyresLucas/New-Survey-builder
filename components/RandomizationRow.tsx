import React, { useMemo } from 'react';
import { Question, QuestionRandomizationRule, RandomizationPattern } from '../types';
import { truncate } from '../utils';
import { Button } from './Button';
import { XIcon, ChevronDownIcon } from './icons';

interface RandomizationRowProps {
    rule: QuestionRandomizationRule;
    questions: Question[];
    onUpdate: (updates: Partial<QuestionRandomizationRule>) => void;
    onRemove: () => void;
    index: number;
    totalRules: number;
    availableGroups?: string[];
    disabled?: boolean;
    invalidFields?: Set<string>;
}

export const RandomizationRow: React.FC<RandomizationRowProps> = ({
    rule,
    questions,
    onUpdate,
    onRemove,
    index,
    totalRules,
    availableGroups = [],
    disabled = false,
    invalidFields = new Set()
}) => {
    const patternOptions: { value: RandomizationPattern; label: string }[] = useMemo(() => {
        const options: { value: RandomizationPattern; label: string }[] = [
            ...(availableGroups.length > 1 ? [
                { value: 'permutation' as RandomizationPattern, label: 'Permutation' },
                { value: 'rotation' as RandomizationPattern, label: 'Rotation' }
            ] : []),
            // Only show Sync with if there are multiple rules
            ...(totalRules > 1 ? [{ value: 'synchronized' as RandomizationPattern, label: 'Sync with' }] : []),
            { value: 'reverse_order', label: 'Reverse order' },
            { value: 'random_reverse', label: 'Random reverse' },
            { value: 'sort_by_text', label: 'Sort by name' },
        ];
        return options;
    }, [totalRules, availableGroups.length]);

    return (
        <div className="flex items-center gap-2 p-2 w-full flex-wrap">
            {/* Index */}
            <div className="text-sm font-medium text-on-surface-variant w-4 flex-shrink-0">
                {index + 1}
            </div>

            {/* Start Question */}
            <div className="relative flex-1 min-w-[150px]">
                <div className="relative">
                    <select
                        value={rule.startQuestionId}
                        onChange={(e) => onUpdate({ startQuestionId: e.target.value })}
                        disabled={disabled}
                        className={`w-full bg-surface-container border rounded-md p-1.5 pr-8 text-sm text-on-surface appearance-none transition-colors ${invalidFields.has('startQuestionId') ? 'border-error' : 'border-outline hover:border-outline-focus focus:outline-2 focus:outline-offset-1 focus:outline-primary'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Start Question"
                    >
                        <option value="">Select start question</option>
                        {questions.map((q) => (
                            <option key={q.id} value={q.qid}>
                                {q.qid}: {truncate(q.text, 30)}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
                </div>
            </div>

            {/* End Question */}
            <div className="relative flex-1 min-w-[150px]">
                <div className="relative">
                    <select
                        value={rule.endQuestionId}
                        onChange={(e) => onUpdate({ endQuestionId: e.target.value })}
                        disabled={disabled}
                        className={`w-full bg-surface-container border rounded-md p-1.5 pr-8 text-sm text-on-surface appearance-none transition-colors ${invalidFields.has('endQuestionId') ? 'border-error' : 'border-outline hover:border-outline-focus focus:outline-2 focus:outline-offset-1 focus:outline-primary'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="End Question"
                    >
                        <option value="">Select end question</option>
                        {questions.map((q) => (
                            <option key={q.id} value={q.qid}>
                                {q.qid}: {truncate(q.text, 30)}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
                </div>
            </div>

            {/* Pattern */}
            <div className="relative flex-1 min-w-[140px]">
                <div className="relative">
                    <select
                        value={rule.pattern || ''}
                        onChange={(e) => onUpdate({ pattern: e.target.value as RandomizationPattern })}
                        disabled={disabled}
                        className={`w-full bg-surface-container border rounded-md p-1.5 pr-8 text-sm text-on-surface appearance-none transition-colors ${invalidFields.has('pattern') ? 'border-error' : 'border-outline hover:border-outline-focus focus:outline-2 focus:outline-offset-1 focus:outline-primary'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Randomization Pattern"
                    >
                        <option value="" disabled>Select pattern</option>
                        {patternOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
                </div>
            </div>

            {/* Synchronize With */}
            {rule.pattern === 'synchronized' && (
                <div className="relative flex-1 min-w-[150px]">
                    <div className="relative">
                        <input
                            type="text"
                            value={rule.questionGroupId || ''}
                            onChange={(e) => onUpdate({ questionGroupId: e.target.value })}
                            placeholder="Select row"
                            disabled={disabled}
                            className={`w-full bg-surface-container border rounded-md p-1.5 text-sm text-on-surface transition-colors ${invalidFields.has('questionGroupId') ? 'border-error' : 'border-outline hover:border-outline-focus focus:outline-2 focus:outline-offset-1 focus:outline-primary'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label="Synchronize With"
                        />
                    </div>
                </div>
            )}

            {/* Select Group */}
            {(rule.pattern === 'permutation' || rule.pattern === 'rotation') && (
                <div className="relative flex-initial w-[100px]">
                    <select
                        value={rule.questionGroupId || ''}
                        onChange={(e) => onUpdate({ questionGroupId: e.target.value })}
                        disabled={disabled}
                        className={`w-full bg-surface-container border rounded-md p-1.5 text-sm text-on-surface transition-colors appearance-none pr-6 ${invalidFields.has('questionGroupId') ? 'border-error' : 'border-outline hover:border-outline-focus focus:outline-2 focus:outline-offset-1 focus:outline-primary'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Group By"
                    >
                        <option value="">Select group</option>
                        {availableGroups.map((group) => (
                            <option key={group} value={group}>
                                {group}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0 self-center">
                <Button
                    variant="danger"
                    iconOnly
                    size="large"
                    onClick={onRemove}
                    disabled={disabled}
                    aria-label="Remove randomization rule"
                >
                    <XIcon className="text-xl" />
                </Button>
            </div>

        </div>
    );
};
