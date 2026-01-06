import React, { memo } from 'react';
import type { Question, ToolboxItemData, Survey, LogicIssue, Block, PageInfo } from '../types';
import { useQuestionCardLogic } from '../hooks/useQuestionCardLogic';
import { PageIndicator } from './question-card/PageIndicator';
import { QuestionCardHeader } from './question-card/QuestionCardHeader';
import { QuestionCardBody } from './question-card/QuestionCardBody';
import { PasteChoicesModal } from './PasteChoicesModal';
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
}> = memo(({
    question, survey, parentBlock, currentBlockId, logicIssues, isSelected, isChecked, onSelect, onToggleCheck, id,
    onUpdateQuestion, onUpdateBlock, onDeleteQuestion, onCopyQuestion, onMoveQuestionToNewBlock, onMoveQuestionToExistingBlock, toolboxItems,
    isDragging, onDragStart, onDragEnd, onAddChoice, onAddPageBreakAfterQuestion, pageInfo, focusedLogicSource,
    printMode = false, isHovered, onHover, totalPages = 1
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
            <PasteChoicesModal
                isOpen={logic.isPasteModalOpen}
                onClose={() => logic.setIsPasteModalOpen(false)}
                onSave={logic.handlePasteChoices}
                initialChoicesText={(question.choices || []).map(c => parseChoice(c.text).label).join('\n')}
                primaryActionLabel="Add Choices"
            />
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
                draggable={true}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onClick={(e) => { e.stopPropagation(); onSelect(question); }}
                onMouseEnter={() => onHover?.(question.id)}
                onMouseLeave={() => onHover?.(null)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelect(question);
                    }
                }}
                className={`p-4 rounded-lg border transition-all group relative grid grid-cols-[auto_1fr] items-start gap-x-3 bg-surface-container ${!printMode ? 'cursor-grab' : ''} ${isSelected
                    ? (hasLogicIssues ? 'border-error shadow-md' : 'border-primary shadow-md')
                    : isHovered
                        ? 'border-input-border shadow-md'
                        : question.isHidden
                            ? 'border-outline bg-surface-container opacity-60'
                            : 'border-outline hover:border-input-border hover:shadow-md'
                    } ${isDragging ? 'opacity-50' : ''} ${logic.isAnyMenuOpen ? 'z-10' : ''} ${hasDisplayLogic ? 'border-dashed' : ''} outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                tabIndex={0}
                aria-selected={isSelected}
            >
                <QuestionCardHeader
                    question={question}
                    isChecked={isChecked}
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
                    onMoveQuestionToNewBlock={onMoveQuestionToNewBlock}
                    handlePreview={logic.handlePreview}
                    handleActivate={logic.handleActivate}
                    handleDeactivate={logic.handleDeactivate}
                />

                <QuestionCardBody
                    question={question}
                    survey={survey}
                    printMode={printMode}
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