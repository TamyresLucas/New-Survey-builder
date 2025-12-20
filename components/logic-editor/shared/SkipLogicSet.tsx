import React, { useRef, useEffect } from 'react';
import { DestinationRow } from './DestinationRow';
import { Button } from '../../Button';
import { WarningIcon, ChevronDownIcon, PlusIcon } from '../../icons';
import { LogicIssue, Survey, Block, Question } from '../../../types';
import { truncate } from '../../../utils';

interface SkipLogicSetProps {
    label: React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    onConfirm: () => void;
    onRemove: () => void;
    isConfirmed: boolean;
    issues?: LogicIssue[];
    followingBlocks?: Block[];
    followingQuestions: Question[];
    survey?: Survey;
    currentBlockId?: string | null;
    transparentBackground?: boolean;
    onAddCondition?: () => void;
    invalidDestination?: boolean;
}

export const SkipLogicSet: React.FC<SkipLogicSetProps & { children?: React.ReactNode }> = ({
    label,
    value,
    onChange,
    onConfirm,
    onRemove,
    isConfirmed,
    issues = [],
    followingBlocks = [],
    followingQuestions,
    survey,
    currentBlockId,
    transparentBackground = false,
    onAddCondition,
    invalidDestination = false,
    children
}) => {
    const originalValueRef = useRef<string | null>(null);

    useEffect(() => {
        if (isConfirmed) {
            originalValueRef.current = value;
        }
    }, [isConfirmed, value]);

    const handleCancel = () => {
        if (originalValueRef.current !== null) {
            onChange(originalValueRef.current);
            onConfirm(); // Re-confirm the old value
        } else {
            onRemove();
        }
    };




    const setIssues = issues; // In simple skip logic, issues usually relate directly to the one rule

    return (
        <div className="w-full">
            <div
                style={transparentBackground ? { backgroundColor: 'transparent' } : undefined}
                className={`p-3 border rounded-md relative transition-colors ${setIssues.length > 0 ? 'border-error bg-error-container/5' :
                    transparentBackground ? 'border-outline-variant bg-transparent' :
                        'border-outline bg-transparent'
                    }`}>

                {setIssues.length > 0 && (
                    <div className="absolute -top-2 -right-2 text-error z-10 group/issues">
                        <WarningIcon className="text-xl bg-surface rounded-full" />
                        <div className="absolute bottom-full right-0 mb-2 w-64 bg-surface-container-highest text-on-surface text-xs rounded-md p-2 shadow-lg opacity-0 group-hover/issues:opacity-100 transition-opacity pointer-events-none border border-error z-20">
                            <ul className="list-disc list-inside">
                                {Array.from(new Set(setIssues.map(i => i.message))).map((msg, idx) => (
                                    <li key={idx}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-on-surface whitespace-nowrap">Skip to</span>
                    <div className="relative flex-1 max-w-[170px]">
                        <select
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            className={`w-full bg-[var(--input-bg)] border rounded-md px-2 py-1.5 pr-8 text-sm text-[var(--input-field-input-txt)] font-normal focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none ${invalidDestination ? 'border-error focus:outline-error' : 'border-[var(--input-border)]'}`}
                        >
                            <option value="">Select destination...</option>
                            <option value="end">End of Survey</option>
                            {followingQuestions.length > 0 && (
                                <optgroup label="Questions">
                                    {followingQuestions.map(q => <option key={q.id} value={q.id}>{q.qid}: {truncate(q.text, 50)}</option>)}
                                </optgroup>
                            )}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
                    </div>
                    <span className="text-sm font-medium text-on-surface">if</span>
                </div>

                <div className="space-y-2">
                    {children || label} {/* Support both for compatibility, though children is preferred for the new layout */}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                    <Button
                        variant="tertiary-primary"
                        size="large"
                        onClick={onAddCondition}
                        disabled={!onAddCondition}
                    >
                        <PlusIcon className="text-lg mr-1" /> Add condition
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="tertiary"
                            size="large"
                            onClick={isConfirmed ? onRemove : handleCancel}
                        >
                            {isConfirmed ? 'Delete' : 'Cancel'}
                        </Button>
                        {!isConfirmed && (
                            <Button
                                variant="primary"
                                size="large"
                                onClick={onConfirm}
                            >
                                Apply
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
