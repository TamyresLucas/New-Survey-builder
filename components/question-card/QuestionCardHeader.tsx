import React from 'react';
import type { Question, ToolboxItemData, Block } from '../../types';
import { QuestionType } from '../../types';
import { Button } from '../Button';
import {
    DotsHorizontalIcon, RadioIcon, ChevronDownIcon,
    AsteriskIcon, VisibilityOffIcon
} from '../icons';
import { QuestionActionsMenu, QuestionTypeSelectionMenuContent } from '../ActionMenus';
import { Badge } from '../Badge';
import { Toggle } from '../Toggle'; // Standard Toggle not used here yet (using checkbox for selection), but good to import if needed later. Checkbox is for selection.

interface QuestionCardHeaderProps {
    question: Question;
    isChecked: boolean;
    isTypeMenuOpen: boolean;
    isActionsMenuOpen: boolean;
    typeMenuContainerRef: React.RefObject<HTMLDivElement>;
    actionsMenuContainerRef: React.RefObject<HTMLDivElement>;
    questionTypeOptions: { type: QuestionType; label: string; icon: any }[];
    toolboxItems: ToolboxItemData[];
    printMode?: boolean;
    willAutoadvance: boolean;

    // Editing Props
    isEditingLabel: boolean;
    labelValue: string;
    labelError: string | null;

    // Handlers
    onToggleCheck: (id: string) => void;
    setLabelValue: (val: string) => void;
    setLabelError: (val: string | null) => void;
    saveLabel: () => void;
    handleLabelKeyDown: (e: React.KeyboardEvent) => void;
    handleLabelEditClick: (e: React.MouseEvent) => void;
    setIsTypeMenuOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
    handleTypeSelect: (type: QuestionType) => void;
    setIsActionsMenuOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;

    // Actions
    onCopyQuestion: (id: string) => void;
    onDeleteQuestion: (id: string) => void;
    onAddPageBreakAfterQuestion: (id: string) => void;
    onMoveQuestionToNewBlock: (id: string) => void;
    onMoveQuestionToExistingBlock?: (id: string, targetBlockId: string) => void;
    onMoveTo?: (id: string) => void;
    blocks?: Block[];
    handlePreview: () => void;
    handleActivate: () => void;
    handleDeactivate: () => void;
}

export const QuestionCardHeader: React.FC<QuestionCardHeaderProps> = ({
    question, isChecked, isTypeMenuOpen, isActionsMenuOpen, typeMenuContainerRef, actionsMenuContainerRef,
    questionTypeOptions, toolboxItems, printMode, willAutoadvance,
    isEditingLabel, labelValue, labelError,
    onToggleCheck, setLabelValue, setLabelError, saveLabel, handleLabelKeyDown, handleLabelEditClick,
    setIsTypeMenuOpen, handleTypeSelect, setIsActionsMenuOpen,
    onCopyQuestion, onDeleteQuestion, onAddPageBreakAfterQuestion, onMoveQuestionToNewBlock, onMoveQuestionToExistingBlock,
    onMoveTo, handlePreview, handleActivate, handleDeactivate, blocks
}) => {
    const CurrentQuestionTypeIcon = questionTypeOptions.find(o => o.type === question.type)?.icon || RadioIcon;

    const handleMoveToBlock = (target: string | 'new') => {
        setIsActionsMenuOpen(false);
        if (target === 'new') {
            onMoveQuestionToNewBlock(question.id);
        } else if (onMoveQuestionToExistingBlock) {
            onMoveQuestionToExistingBlock(question.id, target);
        }
    };

    return (
        <>
            {/* Grid Cell 1: Checkbox */}
            <input
                type="checkbox"
                className="h-4 w-4 rounded border-input-border text-primary focus:ring-primary accent-primary self-center dark:border-outline-variant dark:bg-transparent cursor-pointer"
                checked={isChecked}
                onChange={(e) => {
                    e.stopPropagation();
                    onToggleCheck(question.id);
                }}
                onClick={(e) => e.stopPropagation()}
            />

            {/* Grid Cell 2: Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-on-surface-variant">
                    {question.type === QuestionType.Description ? (
                        <div className="relative mr-2">
                            {isEditingLabel ? (
                                <div>
                                    <input
                                        type="text"
                                        value={labelValue}
                                        onChange={(e) => {
                                            setLabelValue(e.target.value);
                                            if (labelError) setLabelError(null);
                                        }}
                                        onBlur={saveLabel}
                                        onKeyDown={handleLabelKeyDown}
                                        onClick={e => e.stopPropagation()}
                                        className={`font-semibold text-on-surface bg-transparent border-b-2 -mb-px focus:outline-none w-32 ${labelError ? 'border-error' : 'border-primary'}`}
                                        autoFocus
                                        placeholder="Description Label"
                                    />
                                </div>
                            ) : (
                                <span
                                    onClick={printMode ? undefined : handleLabelEditClick}
                                    className={`font-semibold text-on-surface-variant ${!printMode ? 'cursor-pointer hover:underline' : ''}`}
                                >
                                    {question.label || 'Description'}
                                </span>
                            )}
                            {labelError && <div className="absolute top-full mt-1 text-xs text-error bg-error-container p-1 rounded shadow-lg z-10">{labelError}</div>}
                        </div>
                    ) : (
                        <div className="flex items-center mr-2">
                            <h4 className="font-bold text-on-surface text-sm m-0">{question.qid}</h4>
                            {question.forceResponse && <AsteriskIcon className="text-sm text-error ml-0.5" />}
                        </div>
                    )}

                    {willAutoadvance && (
                        <div className="ml-2">
                            <Badge variant="periwinkle" active hideDot>
                                Autoadvance
                            </Badge>
                        </div>
                    )}
                    {question.isHidden && (
                        <div className={`relative group / tooltip ${question.forceResponse || willAutoadvance ? 'ml-2' : ''} `}>
                            <VisibilityOffIcon className="text-on-surface-variant text-lg" />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-surface-container-highest text-on-surface text-xs rounded-md p-2 shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20">
                                This question is hidden
                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-surface-container-highest"></div>
                            </div>
                        </div>
                    )}
                </div>

                {!printMode && (
                    <div className="flex items-center gap-2">

                        <div ref={actionsMenuContainerRef} className="relative transition-opacity">
                            <Button
                                variant="ghost"
                                size="large"
                                iconOnly
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsActionsMenuOpen(prev => !prev);
                                }}
                                aria-label="Question actions"
                                active={isActionsMenuOpen}
                            >
                                <DotsHorizontalIcon className="text-xl" />
                            </Button>
                            {isActionsMenuOpen && (
                                <QuestionActionsMenu
                                    question={question}
                                    onDuplicate={() => { onCopyQuestion(question.id); setIsActionsMenuOpen(false); }}
                                    onDelete={() => { onDeleteQuestion(question.id); setIsActionsMenuOpen(false); }}
                                    onAddPageBreak={() => { onAddPageBreakAfterQuestion(question.id); setIsActionsMenuOpen(false); }}
                                    onMoveToNewBlock={() => { onMoveQuestionToNewBlock(question.id); setIsActionsMenuOpen(false); }}
                                    onMoveTo={onMoveTo ? () => { onMoveTo(question.id); setIsActionsMenuOpen(false); } : undefined}
                                    blocks={blocks}
                                    onMoveToBlock={handleMoveToBlock}
                                    onPreview={handlePreview}
                                    onActivate={handleActivate}
                                    onDeactivate={handleDeactivate}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
