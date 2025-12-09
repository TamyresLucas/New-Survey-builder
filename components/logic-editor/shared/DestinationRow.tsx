import React, { useMemo } from 'react';
import type { Survey, Question, Block, LogicIssue } from '../../../types';
import { truncate } from '../../../utils';
import { XIcon, ChevronDownIcon, CheckmarkIcon } from '../../icons';

export const DestinationRow: React.FC<{
    label: string | React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    onConfirm?: () => void;
    onRemove?: () => void;
    isConfirmed?: boolean;
    issue?: LogicIssue;
    invalid?: boolean;
    followingBlocks?: Block[];
    followingQuestions: Question[];
    survey?: Survey;
    currentBlockId?: string | null;
    className?: string;
    hideNextQuestion?: boolean;
    usedDestinations?: Set<string>;
    [key: string]: any;
}> = ({ label, value, onChange, onConfirm, onRemove, isConfirmed = true, issue, invalid = false, followingBlocks = [], followingQuestions, survey, currentBlockId, className = '', hideNextQuestion = false, usedDestinations, ...rest }) => {
    const otherBlocks = useMemo(() => {
        if (!survey || !currentBlockId) return followingBlocks;
        return survey.blocks.filter(b => {
            if (b.id === currentBlockId) return false;
            if (usedDestinations?.has(`block:${b.id}`)) return false;
            return true;
        });
    }, [survey, currentBlockId, usedDestinations, followingBlocks]);

    return (
        <div className={`flex items-center gap-2 ${className}`} {...rest}>
            <span className="text-sm text-on-surface flex-shrink-0">{label}</span>
            <div className="relative flex-1">
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className={`w-full bg-[var(--input-bg)] border rounded-md px-2 py-1.5 pr-8 text-sm text-[var(--input-field-input-txt)] font-normal focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none ${invalid ? 'border-error' : 'border-[var(--input-border)]'}`}
                >
                    <option value="">Select destination...</option>
                    <optgroup label="Default">
                        {!hideNextQuestion && <option value="next">Next Question</option>}
                        <option value="end">End of Survey</option>
                    </optgroup>
                    {otherBlocks.length > 0 && (
                        <optgroup label="Blocks">
                            {otherBlocks.map(block => (
                                <option key={block.id} value={`block:${block.id}`}>{block.bid}: {truncate(block.title, 50)}</option>
                            ))}
                        </optgroup>
                    )}
                    {followingQuestions.length > 0 && (
                        <optgroup label="Questions">
                            {followingQuestions.map(q => <option key={q.id} value={q.id}>{q.qid}: {truncate(q.text, 50)}</option>)}
                        </optgroup>
                    )}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
            </div>
            {onRemove && <button onClick={onRemove} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-md"><XIcon className="text-lg" /></button>}
            {!isConfirmed && onConfirm && <button onClick={onConfirm} className="p-1.5 bg-primary text-on-primary rounded-md hover:opacity-90"><CheckmarkIcon className="text-lg" /></button>}
        </div>
    );
};
