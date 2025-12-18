import React from 'react';
import type { Question, PageInfo } from '../../types';
import { QuestionType } from '../../types';
import { DragIndicatorIcon, DotsHorizontalIcon } from '../icons';
import { PageBreakActionsMenu } from '../ActionMenus';

interface PageIndicatorProps {
    id?: string;
    question: Question;
    pageInfo?: PageInfo;
    isEditingPageName: boolean;
    pageNameValue: string;
    pageNameInputRef: React.RefObject<HTMLInputElement>;
    isDragging: boolean;
    isActionsMenuOpen: boolean;
    actionsMenuContainerRef: React.RefObject<HTMLDivElement>;
    printMode?: boolean;

    // Handlers
    onSelect: (question: Question) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    toggleActionsMenu: (e: React.MouseEvent) => void;
    setIsEditingPageName: (isEditing: boolean) => void;
    setPageNameValue: (val: string) => void;
    handleSavePageName: () => void;
    handlePageNameKeyDown: (e: React.KeyboardEvent) => void;
    onMoveQuestionToNewBlock: (id: string, updates?: any) => void; // relaxed type to match usage
    onDeleteQuestion: (id: string) => void;
}

export const PageIndicator: React.FC<PageIndicatorProps> = ({
    id, question, pageInfo, isEditingPageName, pageNameValue, pageNameInputRef,
    isDragging, isActionsMenuOpen, actionsMenuContainerRef, printMode,
    onSelect, onDragStart, onDragEnd, toggleActionsMenu, setIsEditingPageName,
    setPageNameValue, handleSavePageName, handlePageNameKeyDown,
    onMoveQuestionToNewBlock, onDeleteQuestion
}) => {
    if (!pageInfo) return null;

    const content = (
        <div className="flex items-center gap-4 text-on-surface-variant w-full">
            <div className="flex-grow h-px bg-outline"></div>

            <div className="flex-shrink-0 flex items-stretch border border-outline rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ring-offset-surface-container transition-shadow hover:border-outline-hover">
                <span
                    className="bg-surface-container-high px-3 py-1.5 text-sm font-bold text-on-surface border-r border-outline"
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                >
                    P{pageInfo.pageNumber}
                </span>
                {isEditingPageName ? (
                    <input
                        ref={pageNameInputRef}
                        type="text"
                        value={pageNameValue}
                        onChange={(e) => setPageNameValue(e.target.value)}
                        onBlur={handleSavePageName}
                        onKeyDown={handlePageNameKeyDown}
                        onClick={e => e.stopPropagation()}
                        className="font-semibold text-sm text-on-surface bg-surface-container px-3 py-1.5 border border-transparent hover:border-input-border-hover focus:outline-none w-32 rounded-md transition-colors"
                        style={{ fontFamily: "'Open Sans', sans-serif" }}
                    />
                ) : (
                    <span
                        onClick={(e) => { e.stopPropagation(); setIsEditingPageName(true); }}
                        className="font-semibold text-sm text-on-surface cursor-pointer bg-surface-container hover:bg-surface-container-lowest px-3 py-1.5 transition-colors"
                        style={{ fontFamily: "'Open Sans', sans-serif" }}
                    >
                        {pageNameValue}
                    </span>
                )}
            </div>

            <div className="flex-grow h-px bg-outline"></div>
        </div>
    );

    // Render interactive indicator for explicit PageBreak questions
    if (question.type === QuestionType.PageBreak) {
        return (
            <div
                id={id}
                data-question-id={question.id}
                draggable="true"
                onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', question.id);
                    onDragStart();
                }}
                onDragEnd={onDragEnd}
                className={`relative py-4 group cursor-grab ${isDragging ? 'opacity-50' : ''}`}
                onClick={(e) => { e.stopPropagation(); onSelect(question); }}
            >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DragIndicatorIcon className="text-xl text-on-surface-variant" />
                </div>
                {content}
                {!printMode && (
                    <div ref={actionsMenuContainerRef} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={toggleActionsMenu}
                            className={`p-1.5 rounded-md hover:bg-surface-container-lowest ${isActionsMenuOpen ? '!bg-surface-container-high' : ''}`}
                            aria-label="Page break actions"
                        >
                            <DotsHorizontalIcon className="text-xl" />
                        </button>
                        {isActionsMenuOpen && (
                            <PageBreakActionsMenu
                                onMoveToNewBlock={() => { onMoveQuestionToNewBlock(question.id); toggleActionsMenu({ stopPropagation: () => { } } as any); }} // Hacky mock event
                                onDelete={!question.isAutomatic ? () => { onDeleteQuestion(question.id); toggleActionsMenu({ stopPropagation: () => { } } as any); } : undefined}
                            />
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Render non-interactive indicator for implicit page starts
    return (
        <div className="mb-4">
            {content}
        </div>
    );
};
