import React, { useRef } from 'react';
import { DragIndicatorIcon, DotsHorizontalIcon, RadioIcon, BlockIcon } from './icons';
import { Block, Question, LogicIssue, Survey } from '../types';
import { QuestionType as QTEnum } from '../types';
import { BlockActionsMenu } from './ActionMenus';
import { DropIndicator } from './DropIndicator';
import { SidebarQuestion } from './SidebarQuestion';
import { SidebarCard } from './SidebarCard';

interface SidebarBlockProps {
    block: Block;
    survey: Survey;
    isSearching: boolean;
    draggedBlockId: string | null;
    dropBlockTargetId: string | null;
    selectedBlock: Block | null;
    onSelectBlock: (block: Block) => void;
    openMenuBlockId: string | null;
    onToggleMenu: (blockId: string) => void;
    collapsedBlocks: Set<string>;
    checkedQuestions: Set<string>;
    logicIssues: LogicIssue[];
    handleBlockDragStart: (e: React.DragEvent, blockId: string) => void;
    handleBlockDragEnd: () => void;
    handleContentDragOver: (e: React.DragEvent, blockId: string) => void;
    handleContentDrop: (e: React.DragEvent) => void;
    handleContentDragLeave: (e: React.DragEvent) => void;
    handleContentDragStart: (e: React.DragEvent, questionId: string) => void;
    handleContentDragEnd: () => void;
    draggedContentId: string | null;
    dropContentTarget: { blockId: string; questionId: string | null } | null;
    selectedQuestion: Question | null;
    onSelectQuestion: (question: Question | null, options?: { tab?: string; focusOn?: string }) => void;
    questionTypeIconMap: Map<string, React.ElementType>;
    onDeleteQuestion: (questionId: string) => void;
    onCopyQuestion: (questionId: string) => void;
    onAddPageBreakAfterQuestion: (questionId: string) => void;
    onMoveQuestionToNewBlock: (questionId: string) => void;
    onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
    hoveredQuestionId: string | null;
    onQuestionHover: (id: string | null) => void;
    onMoveBlockUp: (blockId: string) => void;
    onMoveBlockDown: (blockId: string) => void;
    onCopyBlock: (blockId: string) => void;
    onAddQuestionToBlock: (blockId: string, type: QTEnum) => void;
    onAddFromLibrary: () => void;
    onAddBlock: (blockId: string, position: 'above' | 'below') => void;
    onSelectAllInBlock: (blockId: string) => void;
    onUnselectAllInBlock: (blockId: string) => void;
    onExpandBlock: (blockId: string) => void;
    onCollapseBlock: (blockId: string) => void;
    onDeleteBlock: (blockId: string) => void;
    hoveredBlockId?: string | null;
    onBlockHover?: (id: string | null) => void;
}

export const SidebarBlock: React.FC<SidebarBlockProps> = ({
    block,
    survey,
    isSearching,
    draggedBlockId,
    dropBlockTargetId,
    selectedBlock,
    onSelectBlock,
    openMenuBlockId,
    onToggleMenu,
    collapsedBlocks,
    checkedQuestions,
    logicIssues,
    handleBlockDragStart,
    handleBlockDragEnd,
    handleContentDragOver,
    handleContentDrop,
    handleContentDragLeave,
    handleContentDragStart,
    handleContentDragEnd,
    draggedContentId,
    dropContentTarget,
    selectedQuestion,
    onSelectQuestion,
    questionTypeIconMap,
    onDeleteQuestion,
    onCopyQuestion,
    onAddPageBreakAfterQuestion,
    onMoveQuestionToNewBlock,
    onUpdateQuestion,
    hoveredQuestionId,
    onQuestionHover,
    onMoveBlockUp,
    onMoveBlockDown,
    onCopyBlock,
    onAddQuestionToBlock,
    onAddFromLibrary,
    onAddBlock,
    onSelectAllInBlock,
    onUnselectAllInBlock,
    onExpandBlock,
    onCollapseBlock,
    onDeleteBlock,
    hoveredBlockId,
    onBlockHover
}) => {
    const actionsMenuRef = useRef<HTMLDivElement>(null);

    const showBlockDropIndicator = dropBlockTargetId === block.id;
    const isSelected = selectedBlock?.id === block.id;

    // Contextual menu logic
    const originalIndex = survey.blocks.findIndex(b => b.id === block.id);
    const canMoveUp = !isSearching && originalIndex > 0;
    const canMoveDown = !isSearching && originalIndex < survey.blocks.length - 1;

    const isCollapsed = collapsedBlocks.has(block.id);
    const selectableQuestions = block.questions.filter(q => q.type !== QTEnum.PageBreak);
    const selectedQuestionsInBlock = selectableQuestions.filter(q => checkedQuestions.has(q.id));
    const canSelectAll = selectableQuestions.length > 0 && selectedQuestionsInBlock.length < selectableQuestions.length;
    const canUnselectAll = selectedQuestionsInBlock.length > 0;
    const canCollapse = !isCollapsed;
    const canExpand = isCollapsed;
    const questionCount = block.questions.filter(q => q.type !== QTEnum.Description && q.type !== QTEnum.PageBreak).length;

    const actionsMenu = (
        <>
            <button
                onClick={(e) => { e.stopPropagation(); onToggleMenu(block.id); }}
                className={`w-6 h-6 flex items-center justify-center rounded-md ${isSelected ? 'text-on-primary hover:bg-white/20' : 'text-on-surface-variant hover:bg-surface-container-lowestest'} ${openMenuBlockId === block.id ? (isSelected ? '!bg-white/20' : '!bg-surface-container-highest') : ''}`}
            >
                <DotsHorizontalIcon className="text-base" />
            </button>
            {openMenuBlockId === block.id && (
                <BlockActionsMenu
                    onEdit={() => { onSelectBlock(block); onToggleMenu(block.id); }}
                    onMoveUp={() => { onMoveBlockUp(block.id); onToggleMenu(block.id); }}
                    canMoveUp={canMoveUp}
                    onMoveDown={() => { onMoveBlockDown(block.id); onToggleMenu(block.id); }}
                    canMoveDown={canMoveDown}
                    onDuplicate={() => { onCopyBlock(block.id); onToggleMenu(block.id); }}
                    onAddSimpleQuestion={() => { onAddQuestionToBlock(block.id, QTEnum.Checkbox); onToggleMenu(block.id); }}
                    onAddFromLibrary={() => { onAddFromLibrary(); onToggleMenu(block.id); }}
                    onAddBlockAbove={() => { onAddBlock(block.id, 'above'); onToggleMenu(block.id); }}
                    onAddBlockBelow={() => { onAddBlock(block.id, 'below'); onToggleMenu(block.id); }}
                    onSelectAll={() => { onSelectAllInBlock(block.id); onToggleMenu(block.id); }}
                    canSelectAll={canSelectAll}
                    onUnselectAll={() => { onUnselectAllInBlock(block.id); onToggleMenu(block.id); }}
                    canUnselectAll={canUnselectAll}
                    onExpand={() => { onExpandBlock(block.id); onToggleMenu(block.id); }}
                    canExpand={canExpand}
                    onCollapse={() => { onCollapseBlock(block.id); onToggleMenu(block.id); }}
                    canCollapse={canCollapse}
                    onDelete={() => { onDeleteBlock(block.id); onToggleMenu(block.id); }}
                />
            )}
        </>
    );

    return (
        <SidebarCard
            id={block.id}
            title={<><span className="font-bold mr-2">{block.bid}</span>{block.title}</>}
            subtitle={<span className={`font-normal ml-1 ${isSelected ? 'text-on-primary' : 'text-on-surface-variant'}`}>({questionCount})</span>}
            icon={BlockIcon}
            iconColorClass="text-primary"
            isSelected={isSelected}
            isHovered={hoveredBlockId === block.id}
            isDragged={draggedBlockId === block.id}
            onClick={() => onSelectBlock(block)}
            onMouseEnter={() => onBlockHover?.(block.id)}
            onMouseLeave={() => onBlockHover?.(null)}
            onDragStart={!isSearching ? (e) => handleBlockDragStart(e, block.id) : undefined}
            onDragEnd={!isSearching ? handleBlockDragEnd : undefined}
            actionsMenu={actionsMenu}
            actionsMenuRef={openMenuBlockId === block.id ? actionsMenuRef : null}
            dropIndicator={(!isSearching && showBlockDropIndicator) ? <DropIndicator /> : null}
        >
            {!isCollapsed && (
                <ul
                    className="p-2 space-y-1"
                    onDragOver={!isSearching ? (e) => handleContentDragOver(e, block.id) : undefined}
                    onDrop={!isSearching ? handleContentDrop : undefined}
                    onDragLeave={!isSearching ? handleContentDragLeave : undefined}
                >
                    {block.questions.map(question => (
                        <SidebarQuestion
                            key={question.id}
                            question={question}
                            isSelected={selectedQuestion?.id === question.id}
                            isQuestionDragged={draggedContentId === question.id}
                            showDropIndicator={dropContentTarget?.blockId === block.id && dropContentTarget?.questionId === question.id}
                            onSelectQuestion={onSelectQuestion}
                            onDragStart={(e: React.DragEvent) => handleContentDragStart(e, question.id)}
                            onDragEnd={handleContentDragEnd}
                            TypeIcon={questionTypeIconMap.get(question.type) || RadioIcon}
                            onDeleteQuestion={onDeleteQuestion}
                            onCopyQuestion={onCopyQuestion}
                            onAddPageBreakAfterQuestion={onAddPageBreakAfterQuestion}
                            onMoveQuestionToNewBlock={onMoveQuestionToNewBlock}
                            onUpdateQuestion={onUpdateQuestion}
                            hasIssues={logicIssues.some(i => i.questionId === question.id)}
                            onQuestionHover={onQuestionHover}
                            isHovered={hoveredQuestionId === question.id}
                        />
                    ))}
                    {!isSearching && dropContentTarget?.blockId === block.id && dropContentTarget.questionId === null && <DropIndicator small />}
                </ul>
            )}
        </SidebarCard>
    );
};

export default SidebarBlock;
