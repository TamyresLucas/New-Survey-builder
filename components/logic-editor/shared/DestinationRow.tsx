import React, { useMemo } from 'react';
import { DropdownList, DropdownItem, DropdownDivider } from '../../DropdownList';
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
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const otherBlocks = useMemo(() => {
        if (!survey || !currentBlockId) return followingBlocks;
        return survey.blocks.filter(b => {
            if (b.id === currentBlockId) return false;
            if (usedDestinations?.has(`block:${b.id}`)) return false;
            return true;
        });
    }, [survey, currentBlockId, usedDestinations, followingBlocks]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getLabel = () => {
        if (!value) return "Select destination...";
        if (value === 'end') return "End of Survey";
        if (value === 'next') return "Next Question";

        if (value.startsWith('block:')) {
            const blockId = value.split(':')[1];
            const block = survey?.blocks.find(b => b.id === blockId) || followingBlocks.find(b => b.id === blockId);
            if (block) return `${block.bid}: ${truncate(block.title, 50)}`;
        } else {
            const question = followingQuestions.find(q => q.id === value);
            if (question) return `${question.qid}: ${truncate(question.text, 50)}`;
        }
        return value;
    };

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={`flex items-center gap-2 ${className}`} {...rest}>
            <span className="text-sm text-on-surface flex-shrink-0">{label}</span>
            <div className="relative flex-1 max-w-[170px]" ref={containerRef}>
                <button
                    onClick={() => setIsOpen(prev => !prev)}
                    className={`w-full h-[32px] flex items-center justify-between border rounded-md px-2 text-sm text-left transition-colors bg-[var(--input-bg)] ${invalid ? 'border-error' : 'border-[var(--input-border)]'} text-[var(--input-field-input-txt)] font-normal hover:border-input-border-hover focus:outline-2 focus:outline-offset-1 focus:outline-primary`}
                >
                    <span className="truncate leading-[19px]">{getLabel()}</span>
                    <ChevronDownIcon className="text-base text-on-surface-variant flex-shrink-0" />
                </button>

                {isOpen && (
                    <DropdownList className="absolute top-full left-0 right-0 mt-1 w-full max-h-60 overflow-y-auto">
                        {hideNextQuestion ? (
                            <DropdownItem onClick={() => handleSelect('end')}>End of Survey</DropdownItem>
                        ) : (
                            <>
                                <div className="px-3 py-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider bg-surface-container/50">Default</div>
                                <DropdownItem onClick={() => handleSelect('next')}>Next Question</DropdownItem>
                                <DropdownItem onClick={() => handleSelect('end')}>End of Survey</DropdownItem>
                            </>
                        )}

                        {otherBlocks.length > 0 && (
                            <>
                                <DropdownDivider />
                                <div className="px-3 py-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider bg-surface-container/50 sticky top-0">Blocks</div>
                                {otherBlocks.map(block => (
                                    <DropdownItem key={block.id} onClick={() => handleSelect(`block:${block.id}`)}>
                                        {block.bid}: {truncate(block.title, 50)}
                                    </DropdownItem>
                                ))}
                            </>
                        )}

                        {followingQuestions.length > 0 && (
                            <>
                                <DropdownDivider />
                                <div className="px-3 py-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider bg-surface-container/50 sticky top-0">Questions</div>
                                {followingQuestions.map(q => (
                                    <DropdownItem key={q.id} onClick={() => handleSelect(q.id)}>
                                        {q.qid}: {truncate(q.text, 50)}
                                    </DropdownItem>
                                ))}
                            </>
                        )}
                    </DropdownList>
                )}
            </div>
            {onRemove && <button onClick={onRemove} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-md"><XIcon className="text-lg" /></button>}
            {!isConfirmed && onConfirm && <button onClick={onConfirm} className="p-1.5 bg-primary text-on-primary rounded-md hover:opacity-90"><CheckmarkIcon className="text-lg" /></button>}
        </div>
    );
};
