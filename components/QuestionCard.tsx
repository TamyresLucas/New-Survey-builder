import React, { memo } from 'react';
import type { Question, ToolboxItemData, Survey, LogicIssue, Block, PageInfo } from '../types';
import { QuestionType } from '../types';
import { useQuestionCardLogic } from '../hooks/useQuestionCardLogic';
import { PageIndicator } from './question-card/PageIndicator';
import { QuestionCardHeader } from './question-card/QuestionCardHeader';
import { QuestionCardBody } from './question-card/QuestionCardBody';
import { PasteChoicesModal } from './PasteChoicesModal';
import { PasteGridModal } from './PasteGridModal';
import { parseChoice } from '../utils';

const QuestionCard: React.FC<{
    question: Question,
    survey: Survey,
    parentBlock: Block,
    currentBlockId: string, // Kept for prop compatibility, even if unused directly here
    logicIssues: LogicIssue[],
    isSelected: boolean,
    isChecked: boolean,
    onSelect: (question: Question, options?: { tab?: string; focusOn?: string }) => void,
    onToggleCheck: (questionId: string) => void;
    id: string;
    onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
    onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
    onDeleteQuestion: (questionId: string) => void;
    onCopyQuestion: (questionId: string) => void;
    onMoveQuestionToNewBlock: (questionId: string) => void;
    onMoveQuestionToExistingBlock: (questionId: string, targetBlockId: string) => void;
    onMoveTo?: (questionId: string) => void;
    onAddQuestionAbove: (questionId: string) => void;
    onAddQuestionBelow: (questionId: string) => void;
    onAddToLibrary?: (questionId: string) => void;
    toolboxItems: ToolboxItemData[];
    isDragging: boolean;
    onDragStart: () => void;
    onDragEnd: () => void;
    onAddChoice: (questionId: string) => void;
    onAddPageBreakAfterQuestion: (questionId: string) => void;
    pageInfo?: PageInfo;
    focusedLogicSource: string | null;
    printMode?: boolean;
    isHovered?: boolean;
    onHover?: (id: string | null) => void;
    totalPages?: number;
    showBulkEditCheckbox?: boolean;
}> = memo(({
    question, survey, parentBlock, currentBlockId, logicIssues, isSelected, isChecked, onSelect, onToggleCheck, id,
    onUpdateQuestion, onUpdateBlock, onDeleteQuestion, onCopyQuestion, onMoveQuestionToNewBlock, onMoveQuestionToExistingBlock, onMoveTo,
    onAddQuestionAbove, onAddQuestionBelow, onAddToLibrary,
    toolboxItems,
    isDragging, onDragStart, onDragEnd, onAddChoice, onAddPageBreakAfterQuestion, pageInfo, focusedLogicSource,
    printMode = false, isHovered, onHover, totalPages = 1, showBulkEditCheckbox = false
}) => {

    const logic = useQuestionCardLogic({
        question,
        parentBlock,
        onUpdateQuestion,
        onUpdateBlock,
        onSelect,
        toolboxItems,
        pageInfo,
        survey
    });

    if (question.type === 'Page Break') { // Check string literally as well just in case, though usually enum
        return <PageIndicator
            id={id}
            question={question}
            pageInfo={pageInfo}
            isEditingPageName={logic.isEditingPageName}
            pageNameValue={logic.pageNameValue}
            pageNameInputRef={logic.pageNameInputRef}
            isDragging={isDragging}
            isActionsMenuOpen={logic.isActionsMenuOpen}
            actionsMenuContainerRef={logic.actionsMenuContainerRef}
            printMode={printMode}
            onSelect={onSelect}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            toggleActionsMenu={(e) => { e.stopPropagation(); logic.setIsActionsMenuOpen(v => !v); }}
            setIsEditingPageName={logic.setIsEditingPageName}
            setPageNameValue={logic.setPageNameValue}
            handleSavePageName={logic.handleSavePageName}
            handlePageNameKeyDown={logic.handlePageNameKeyDown}
            onMoveQuestionToNewBlock={onMoveQuestionToNewBlock}
            onDeleteQuestion={onDeleteQuestion}
        />;
    }

    const { hasDisplayLogic } = logic;
    const hasLogicIssues = logicIssues.length > 0;
    const shouldShowPageIndicator = totalPages > 1;

    return (
        <>
            {question.type === QuestionType.ChoiceGrid ? (
                <PasteGridModal
                    isOpen={logic.isPasteModalOpen}
                    onClose={() => logic.setIsPasteModalOpen(false)}
                    onSave={logic.handlePasteGrid}
                    initialRowsText={(question.choices || []).map(c => parseChoice(c.text).label).join('\n')}
                    initialColumnsText={(question.scalePoints || []).map(sp => sp.text).join('\n')}
                />
            ) : (
                <PasteChoicesModal
                    isOpen={logic.isPasteModalOpen}
                    onClose={() => logic.setIsPasteModalOpen(false)}
                    onSave={logic.handlePasteChoices}
                    initialChoicesText={(question.choices || []).map(c => parseChoice(c.text).label).join('\n')}
                    primaryActionLabel="Confirm"
                />
            )}
            {shouldShowPageIndicator && (
                <PageIndicator
                    id={id + '_page_indicator'} // Distinct ID for the implicit page indicator
                    question={question}
                    pageInfo={pageInfo}
                    isEditingPageName={logic.isEditingPageName}
                    pageNameValue={logic.pageNameValue}
                    pageNameInputRef={logic.pageNameInputRef}
                    isDragging={isDragging}
                    isActionsMenuOpen={logic.isActionsMenuOpen}
                    actionsMenuContainerRef={logic.actionsMenuContainerRef}
                    printMode={printMode}
                    onSelect={onSelect}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    toggleActionsMenu={(e) => { e.stopPropagation(); logic.setIsActionsMenuOpen(v => !v); }}
                    setIsEditingPageName={logic.setIsEditingPageName}
                    setPageNameValue={logic.setPageNameValue}
                    handleSavePageName={logic.handleSavePageName}
                    handlePageNameKeyDown={logic.handlePageNameKeyDown}
                    onMoveQuestionToNewBlock={onMoveQuestionToNewBlock}
                    onDeleteQuestion={onDeleteQuestion}
                />
            )}

            <div
                id={id}
                data-question-id={question.id}
                draggable={!logic.draggedChoiceId}
                onDragStart={(e) => {
                    // Check logic.draggedChoiceId first is incorrect if we want to stop Question Drag completely when not on handle.
                    // But actually, if we are editing text (not on handle), we don't want to drag Question.

                    if (!(e.target as HTMLElement).closest('.drag-handle')) {
                        // Allow default behavior for text selection, etc.
                        // But prevent "Question Drag".
                        // However, if draggable=true on container, any drag initiates drag.
                        // If we preventDefault, we stop drag.
                        // Text selection drag is different. text selection doesn't trigger DnD unless selected text is dragged.
                        // But simple text selection mouse down + move usually selects text.
                        // If draggable=true, sometimes browser tries to drag element instead of selecting text.
                        // By preventing default, we might block native text selection drag?
                        // Actually, standard pattern is:
                        if (!(e.target as HTMLElement).closest('.drag-handle')) {
                            e.preventDefault();
                            return;
                        }
                    }

                    // Prevent question drag when choice is being dragged (redundant if choice has its own preventDefault? NO, bubbling)
                    if (logic.draggedChoiceId) {
                        e.preventDefault();
                        return;
                    }
                    onDragStart();
                }}
                onDragEnd={onDragEnd}
                onClick={(e) => { e.stopPropagation(); onSelect(question); }}
                onMouseEnter={() => onHover?.(question.id)}
                onMouseLeave={() => onHover?.(null)}
                onKeyDown={(e) => {
                    // Don't intercept keyboard events when user is editing text
                    const target = e.target as HTMLElement;
                    const isEditingText = target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

                    if ((e.key === 'Enter' || e.key === ' ') && !isEditingText) {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelect(question);
                    }
                }}
                className={`p-4 rounded-lg border transition-all group relative grid items-start gap-x-4 bg-surface-container ${!printMode ? 'cursor-grab' : ''} ${isSelected
                    ? (hasLogicIssues ? 'border-error shadow-md' : 'border-primary shadow-md')
                    : isHovered
                        ? 'border-input-border shadow-md'
                        : question.isHidden
                            ? 'border-outline bg-surface-container opacity-60'
                            : 'border-outline hover:border-input-border hover:shadow-md'
                    } ${isDragging ? 'opacity-50' : ''} ${logic.isAnyMenuOpen ? 'z-10' : ''} ${hasDisplayLogic ? 'border-dashed' : ''} outline-none focus-visible:ring-2 focus-visible:ring-primary grid-cols-[auto_1fr]`}
                tabIndex={0}
                aria-selected={isSelected}
            >
                <QuestionCardHeader
                    question={question}
                    isChecked={isChecked}
                    showBulkEditCheckbox={showBulkEditCheckbox}
                    isHovered={isHovered}
                    isTypeMenuOpen={logic.isTypeMenuOpen}
                    isActionsMenuOpen={logic.isActionsMenuOpen}
                    typeMenuContainerRef={logic.typeMenuContainerRef}
                    actionsMenuContainerRef={logic.actionsMenuContainerRef}
                    questionTypeOptions={logic.questionTypeOptions}
                    toolboxItems={toolboxItems}
                    printMode={printMode}
                    willAutoadvance={logic.willAutoadvance}

                    isEditingLabel={logic.isEditingLabel}
                    labelValue={logic.labelValue}
                    labelError={logic.labelError}

                    onToggleCheck={onToggleCheck}
                    setLabelValue={logic.setLabelValue}
                    setLabelError={logic.setLabelError}
                    saveLabel={logic.saveLabel}
                    handleLabelKeyDown={logic.handleLabelKeyDown}
                    handleLabelEditClick={logic.handleLabelEditClick}
                    setIsTypeMenuOpen={logic.setIsTypeMenuOpen}
                    handleTypeSelect={logic.handleTypeSelect}
                    setIsActionsMenuOpen={logic.setIsActionsMenuOpen}

                    onCopyQuestion={onCopyQuestion}
                    onDeleteQuestion={onDeleteQuestion}
                    onAddPageBreakAfterQuestion={onAddPageBreakAfterQuestion}
                    onAddQuestionAbove={onAddQuestionAbove}
                    onAddQuestionBelow={onAddQuestionBelow}
                    onMoveQuestionToNewBlock={onMoveQuestionToNewBlock}
                    onMoveQuestionToExistingBlock={onMoveQuestionToExistingBlock}
                    onMoveTo={onMoveTo}
                    onAddToLibrary={onAddToLibrary}
                    onBulkEdit={() => {
                        // Automatically select the question if not already checked
                        if (!isChecked) {
                            onToggleCheck(question.id);
                        }
                    }}
                    blocks={survey.blocks}
                    handlePreview={logic.handlePreview}
                    handleActivate={logic.handleActivate}
                    handleDeactivate={logic.handleDeactivate}
                />

                <QuestionCardBody
                    question={question}
                    survey={survey}
                    printMode={printMode}
                    showBulkEditCheckbox={showBulkEditCheckbox}
                    logicIssues={logicIssues}
                    focusedLogicSource={focusedLogicSource}
                    draggedChoiceId={logic.draggedChoiceId}
                    dropTargetChoiceId={logic.dropTargetChoiceId}

                    onUpdateQuestion={onUpdateQuestion}
                    onSelect={onSelect}
                    onAddChoice={onAddChoice}
                    handleChoiceDragStart={logic.handleChoiceDragStart}
                    handleChoiceDragOver={logic.handleChoiceDragOver}
                    handleChoiceDrop={logic.handleChoiceDrop}
                    handleChoiceDragEnd={logic.handleChoiceDragEnd}
                    handleAddColumn={logic.handleAddColumn}
                    handleScalePointTextChange={logic.handleScalePointTextChange}
                    setDropTargetChoiceId={logic.setDropTargetChoiceId}
                    onPaste={() => logic.setIsPasteModalOpen(true)}
                />
            </div>
        </>
    );
});

export default QuestionCard;