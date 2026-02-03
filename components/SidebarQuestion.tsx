import React, { useState, useRef, useEffect, memo } from 'react';
import { WarningIcon, DotsHorizontalIcon, DragIndicatorIcon } from './icons';
import { Question } from '../types';
import { QuestionType as QTEnum } from '../types';
import { QuestionActionsMenu } from './ActionMenus';
import { DropIndicator } from './DropIndicator';

interface SidebarQuestionProps {
    question: Question;
    isSelected?: boolean;
    isQuestionDragged?: boolean;
    showDropIndicator?: boolean;
    onSelectQuestion: (question: Question | null, options?: { tab?: string; focusOn?: string }) => void;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: () => void;
    TypeIcon: React.ElementType;
    onCopyQuestion: (questionId: string) => void;
    onDeleteQuestion: (questionId: string) => void;
    onAddPageBreakAfterQuestion: (questionId: string) => void;
    onAddQuestionAbove?: (questionId: string) => void;
    onAddQuestionBelow?: (questionId: string) => void;
    onMoveQuestionToNewBlock: (questionId: string) => void;
    onMoveQuestionToExistingBlock?: (questionId: string, targetBlockId: string) => void;
    onMoveTo?: (questionId: string) => void;
    onAddToLibrary?: (questionId: string) => void;
    onBulkEdit?: (questionId: string) => void;
    onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
    hasIssues?: boolean;
    onQuestionHover?: (id: string | null) => void;
    isHovered?: boolean;
    blocks?: any[];
}

export const SidebarQuestion = memo(({
    question,
    isSelected,
    isQuestionDragged,
    showDropIndicator,
    onSelectQuestion,
    onDragStart,
    onDragEnd,
    TypeIcon,
    onCopyQuestion,
    onDeleteQuestion,
    onAddPageBreakAfterQuestion,
    onAddQuestionAbove,
    onAddQuestionBelow,
    onMoveQuestionToNewBlock,
    onMoveQuestionToExistingBlock,
    onMoveTo,
    onAddToLibrary,
    onBulkEdit,
    onUpdateQuestion,
    hasIssues,
    onQuestionHover,
    isHovered,
    blocks
}: SidebarQuestionProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOpenMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(prev => !prev);
    };

    const handleActivate = () => {
        onUpdateQuestion(question.id, { isHidden: false });
        setIsMenuOpen(false);
    };

    const handleDeactivate = () => {
        onUpdateQuestion(question.id, { isHidden: true });
        setIsMenuOpen(false);
    };

    const handlePreview = () => {
        onSelectQuestion(question, { tab: 'Preview' });
        setIsMenuOpen(false);
    };

    const handleMoveToBlock = (target: string | 'new') => {
        setIsMenuOpen(false);
        if (target === 'new') {
            onMoveQuestionToNewBlock(question.id);
        } else if (onMoveQuestionToExistingBlock) {
            onMoveQuestionToExistingBlock(question.id, target);
        }
    };

    const DisplayIcon = hasIssues ? WarningIcon : TypeIcon;

    const containerClasses = `
    box-border flex flex-row items-center px-2 gap-2 h-[32px] rounded text-sm transition-all group relative border cursor-grab
    ${isSelected && hasIssues ? 'bg-error border-error text-on-error' :
            isSelected ? 'bg-primary border-primary text-on-primary' :
                isHovered ? 'bg-surface-container-lowest border-outline-hover' :
                    'bg-surface-container border-outline-variant hover:bg-surface-container-lowest hover:border-outline-hover'
        }
    ${isQuestionDragged ? 'opacity-30' : ''}
  `;

    const iconClasses = `text-base mr-2 ${isSelected ? (hasIssues ? 'text-on-error' : 'text-on-primary') : (hasIssues ? 'text-error' : 'text-primary')}`;
    const textClasses = `font-semibold text-sm ${isSelected ? (hasIssues ? 'text-on-error' : 'text-on-primary') : 'text-on-surface'}`;
    const labelClasses = `font-normal text-sm ${isSelected ? (hasIssues ? 'text-on-error' : 'text-on-primary') : 'text-on-surface-variant'}`;
    const bodyTextClasses = `font-normal truncate flex-grow ${isSelected ? (hasIssues ? 'text-on-error' : 'text-on-primary') : 'text-on-surface'}`;
    const menuButtonClasses = `w-6 h-6 flex items-center justify-center rounded-md transition-opacity ${isSelected ? (hasIssues ? 'text-on-error hover:bg-white/20' : 'text-on-primary hover:bg-white/20') : 'text-on-surface-variant hover:bg-surface-container-lowestest'} ${isSelected || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${isMenuOpen ? (isSelected ? '!bg-white/20' : '!bg-surface-container-highest') : ''}`;

    return (
        <>
            {showDropIndicator && <DropIndicator small />}
            <li
                data-question-id={question.id}
                draggable={true}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onClick={() => onSelectQuestion(question)}
                onMouseEnter={() => onQuestionHover?.(question.id)}
                onMouseLeave={() => onQuestionHover?.(null)}
                className={containerClasses}
            >
                <div className="flex items-center flex-shrink-0">
                    <div className="relative w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center">
                        <DisplayIcon className={`${iconClasses.replace('mr-2', '')} leading-none absolute inset-0 transition-opacity group-hover:opacity-0`} />
                        <DragIndicatorIcon className={`text-base leading-none absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100 ${isSelected ? 'text-on-primary' : 'text-on-surface-variant'}`} />
                    </div>
                    {question.type === QTEnum.Description ? (
                        <span className={labelClasses}>{question.label || 'Description'}</span>
                    ) : (
                        <span className={textClasses}>{question.qid}</span>
                    )}
                </div>
                <span className={bodyTextClasses}>{question.text}</span>

                <div className="relative ml-2 flex-shrink-0" ref={menuRef}>
                    <button
                        onClick={handleOpenMenu}
                        className={menuButtonClasses}
                        aria-haspopup="true"
                        aria-expanded={isMenuOpen}
                        aria-label="Question actions"
                    >
                        <DotsHorizontalIcon className="text-base" />
                    </button>
                    {isMenuOpen && (
                        <QuestionActionsMenu
                            question={question}
                            onDelete={() => { onDeleteQuestion(question.id); setIsMenuOpen(false); }}
                            onDuplicate={() => { onCopyQuestion(question.id); setIsMenuOpen(false); }}
                            onAddPageBreak={() => { onAddPageBreakAfterQuestion(question.id); setIsMenuOpen(false); }}
                            onAddQuestionAbove={onAddQuestionAbove ? () => { onAddQuestionAbove(question.id); setIsMenuOpen(false); } : undefined}
                            onAddQuestionBelow={onAddQuestionBelow ? () => { onAddQuestionBelow(question.id); setIsMenuOpen(false); } : undefined}
                            onMoveToNewBlock={() => { onMoveQuestionToNewBlock(question.id); setIsMenuOpen(false); }}
                            onMoveTo={onMoveTo ? () => { onMoveTo(question.id); setIsMenuOpen(false); } : undefined}
                            onAddToLibrary={onAddToLibrary ? () => { onAddToLibrary(question.id); setIsMenuOpen(false); } : undefined}
                            onBulkEdit={onBulkEdit ? () => { onBulkEdit(question.id); setIsMenuOpen(false); } : undefined}
                            blocks={blocks}
                            onMoveToBlock={handleMoveToBlock}
                            onPreview={handlePreview}
                            onActivate={handleActivate}
                            onDeactivate={handleDeactivate}
                        />
                    )}
                </div>
            </li>
        </>
    );
});

export default SidebarQuestion;
