import React, { useEffect, useState, memo, useRef, useMemo } from 'react';
import type { Survey, Question, ToolboxItemData, QuestionType, Choice, LogicIssue, Block, PageInfo } from '../types';
import SurveyBlock from './SurveyBlock';
import { QuestionType as QTEnum } from '../types';

interface SurveyCanvasProps {
  survey: Survey;
  selectedQuestion: Question | null;
  selectedBlock: Block | null;
  checkedQuestions: Set<string>;
  logicIssues: LogicIssue[];
  onSelectQuestion: (question: Question | null, options?: { tab?: string; focusOn?: string }) => void;
  onSelectBlock: (block: Block | null, options?: { tab: string; focusOn: string }) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  onDeleteQuestion: (questionId: string) => void;
  onCopyQuestion: (questionId: string) => void;
  onMoveQuestionToNewBlock: (questionId: string) => void;
  onMoveQuestionToExistingBlock: (questionId: string, targetBlockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onReorderQuestion: (draggedQuestionId: string, targetQuestionId: string | null, targetBlockId: string) => void;
  onReorderBlock: (draggedBlockId: string, targetBlockId: string | null) => void;
  onAddBlockFromToolbox: (targetBlockId: string | null) => void;
  onAddQuestion: (questionType: QuestionType, targetQuestionId: string | null, targetBlockId: string) => void;
  onAddBlock: (blockId: string, position: 'above' | 'below') => void;
  onAddQuestionToBlock: (blockId: string, questionType: QuestionType) => void;
  onToggleQuestionCheck: (questionId: string) => void;
  onSelectAllInBlock: (blockId: string) => void;
  onUnselectAllInBlock: (blockId: string) => void;
  toolboxItems: ToolboxItemData[];
  collapsedBlocks: Set<string>;
  onToggleBlockCollapse: (blockId: string) => void;
  onCopyBlock: (blockId: string) => void;
  onExpandAllBlocks: () => void;
  onCollapseAllBlocks: () => void;
  onExpandBlock: (blockId: string) => void;
  onCollapseBlock: (blockId: string) => void;
  onAddChoice: (questionId: string) => void;
  onAddPageBreakAfterQuestion: (questionId: string) => void;
  onUpdateBlockTitle: (blockId: string, title: string) => void;
  onUpdateSurveyTitle: (title: string) => void;
  onAddFromLibrary: () => void;
  focusedLogicSource: string | null;
  printMode?: boolean;
}

const DropIndicator = () => (
  <div className="relative h-px w-full bg-primary my-2">
    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
  </div>
);

const SurveyCanvas: React.FC<SurveyCanvasProps> = memo(({ survey, selectedQuestion, selectedBlock, checkedQuestions, logicIssues, onSelectQuestion, onSelectBlock, onUpdateQuestion, onUpdateBlock, onDeleteQuestion, onCopyQuestion, onMoveQuestionToNewBlock, onMoveQuestionToExistingBlock, onDeleteBlock, onReorderQuestion, onReorderBlock, onAddBlockFromToolbox, onAddQuestion, onAddBlock, onAddQuestionToBlock, onToggleQuestionCheck, onSelectAllInBlock, onUnselectAllInBlock, toolboxItems, collapsedBlocks, onToggleBlockCollapse, onCopyBlock, onExpandAllBlocks, onCollapseAllBlocks, onExpandBlock, onCollapseBlock, onAddChoice, onAddPageBreakAfterQuestion, onUpdateBlockTitle, onUpdateSurveyTitle, onAddFromLibrary, focusedLogicSource,
  printMode = false
}) => {
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dropTargetBlockId, setDropTargetBlockId] = useState<string | null>(null);
  const [isDraggingNewBlock, setIsDraggingNewBlock] = useState(false);

  const hasBranchingLogicInSurvey = useMemo(() =>
    survey.blocks.flatMap(b => b.questions).some(q => q.branchingLogic),
    [survey]
  );

  const branchedToBlockIds = useMemo(() => {
    const ids = new Set<string>();
    if (!hasBranchingLogicInSurvey) {
      return ids;
    }

    for (const block of survey.blocks) {
      for (const question of block.questions) {
        const branchingLogic = question.draftBranchingLogic ?? question.branchingLogic;
        if (branchingLogic) {
          for (const branch of branchingLogic.branches) {
            if (branch.thenSkipToIsConfirmed && branch.thenSkipTo.startsWith('block:')) {
              ids.add(branch.thenSkipTo.substring(6));
            }
          }
          if (branchingLogic.otherwiseIsConfirmed && branchingLogic.otherwiseSkipTo.startsWith('block:')) {
            ids.add(branchingLogic.otherwiseSkipTo.substring(6));
          }
        }
      }
    }
    return ids;
  }, [survey, hasBranchingLogicInSurvey]);

  const pageInfoMap = useMemo(() => {
    const map = new Map<string, PageInfo>();
    let pageCounter = 1;

    survey.blocks.forEach((block, blockIndex) => {
      block.questions.forEach((question, questionIndex) => {
        let isStartOfPage = false;
        let pageNameSource: 'block' | 'page_break' | null = null;
        let sourceId: string | null = null;

        // Case 1: First question of the entire survey is P1.
        if (blockIndex === 0 && questionIndex === 0 && question.type !== QTEnum.PageBreak) {
          isStartOfPage = true;
          pageNameSource = 'block';
          sourceId = block.id;
        }
        // Case 2: A PageBreak question itself defines the start of the *next* page.
        else if (question.type === QTEnum.PageBreak) {
          pageCounter++;
          isStartOfPage = true;
          pageNameSource = 'page_break';
          sourceId = question.id;
        }
        // Case 3: The first question of a new block *might* be a new page.
        else if (questionIndex === 0 && blockIndex > 0) {
          const prevBlock = survey.blocks[blockIndex - 1];
          const lastQuestionOfPrevBlock = prevBlock.questions[prevBlock.questions.length - 1];
          // If the previous block didn't end with a page break, this new block starts a new page.
          if (!lastQuestionOfPrevBlock || lastQuestionOfPrevBlock.type !== QTEnum.PageBreak) {
            pageCounter++;
            isStartOfPage = true;
            pageNameSource = 'block';
            sourceId = block.id;
          }
        }

        if (isStartOfPage && pageNameSource && sourceId) {
          let storedPageName: string | undefined;
          if (pageNameSource === 'block') {
            storedPageName = block.pageName;
          } else { // page_break
            storedPageName = question.pageName;
          }

          // A name is considered "default" if it's missing or matches the "Page X" pattern.
          const isDefaultName = !storedPageName || /^Page \d+$/.test(storedPageName);

          // If it's a default name, generate a new one based on the current page number.
          // Otherwise, keep the user-edited custom name.
          const pageName = isDefaultName ? `Page ${pageCounter}` : storedPageName;

          map.set(question.id, {
            pageNumber: pageCounter,
            pageName: pageName as string,
            source: pageNameSource,
            sourceId,
          });
        }
      });
    });
    return map;
  }, [survey]);

  useEffect(() => {
    if (selectedQuestion) {
      const element = document.getElementById(`question-card-${selectedQuestion.id}`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [selectedQuestion]);

  const handleDragEnter = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/survey-toolbox-block')) {
      setIsDraggingNewBlock(true);
    }
  };

  const handleBlockDragOver = (e: React.DragEvent) => {
    const isDraggingExistingBlock = !!draggedBlockId;
    const isAddingNewBlock = e.dataTransfer.types.includes('application/survey-toolbox-block');

    // This handler is only for blocks. If we're not dragging a block, do nothing.
    // This allows the dragOver event to be handled by child SurveyBlock components for question dragging.
    if (!isDraggingExistingBlock && !isAddingNewBlock) return;

    e.preventDefault();

    const blockElements = [...(e.currentTarget as HTMLDivElement).querySelectorAll('div[data-block-id]')] as HTMLDivElement[];

    const closest = blockElements.reduce(
      (acc, child) => {
        if (isDraggingExistingBlock && child.dataset.blockId === draggedBlockId) return acc;

        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + box.height / 2);

        if (offset < 0 && offset > acc.offset) {
          return { offset, element: child };
        }
        return acc;
      },
      { offset: Number.NEGATIVE_INFINITY, element: null as HTMLElement | null }
    );

    setDropTargetBlockId(closest.element?.dataset.blockId || null);
  };

  const handleBlockDrop = (e: React.DragEvent) => {
    const isAddingNewBlock = e.dataTransfer.types.includes('application/survey-toolbox-block');

    // This handler is only for blocks. If we're not dropping a block, do nothing.
    if (isAddingNewBlock || draggedBlockId) {
      e.preventDefault();

      if (isAddingNewBlock) {
        onAddBlockFromToolbox(dropTargetBlockId);
      } else if (draggedBlockId) {
        onReorderBlock(draggedBlockId, dropTargetBlockId);
      }
    }

    // Always reset block-dragging state on drop
    setDraggedBlockId(null);
    setDropTargetBlockId(null);
    setIsDraggingNewBlock(false);
  };

  const handleBlockLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropTargetBlockId(null);
      setIsDraggingNewBlock(false);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleBlockDragOver}
      onDrop={handleBlockDrop}
      onDragLeave={handleBlockLeave}
      className="max-w-4xl mx-auto"
    >
      {survey.blocks.map(block => (
        <React.Fragment key={block.id}>
          {dropTargetBlockId === block.id && <DropIndicator />}
          <SurveyBlock
            key={block.id}
            block={block}
            survey={survey}
            selectedQuestion={selectedQuestion}
            selectedBlock={selectedBlock}
            checkedQuestions={checkedQuestions}
            logicIssues={logicIssues}
            hasBranchingLogicInSurvey={hasBranchingLogicInSurvey}
            branchedToBlockIds={branchedToBlockIds}
            onSelectQuestion={onSelectQuestion}
            onSelectBlock={onSelectBlock}
            onUpdateQuestion={onUpdateQuestion}
            onUpdateBlock={onUpdateBlock}
            onDeleteQuestion={onDeleteQuestion}
            onCopyQuestion={onCopyQuestion}
            onMoveQuestionToNewBlock={onMoveQuestionToNewBlock}
            onMoveQuestionToExistingBlock={onMoveQuestionToExistingBlock}
            onDeleteBlock={onDeleteBlock}
            onReorderQuestion={onReorderQuestion}
            onAddQuestion={onAddQuestion}
            onAddBlock={onAddBlock}
            onAddQuestionToBlock={onAddQuestionToBlock}
            onToggleQuestionCheck={onToggleQuestionCheck}
            onSelectAllInBlock={onSelectAllInBlock}
            onUnselectAllInBlock={onUnselectAllInBlock}
            toolboxItems={toolboxItems}
            draggedQuestionId={draggedQuestionId}
            setDraggedQuestionId={setDraggedQuestionId}
            isBlockDragging={draggedBlockId === block.id}
            onBlockDragStart={() => setDraggedBlockId(block.id)}
            onBlockDragEnd={() => { setDraggedBlockId(null); setDropTargetBlockId(null); }}
            isCollapsed={collapsedBlocks.has(block.id)}
            onToggleCollapse={() => onToggleBlockCollapse(block.id)}
            onCopyBlock={onCopyBlock}
            onExpandBlock={onExpandBlock}
            onCollapseBlock={onCollapseBlock}
            onAddChoice={onAddChoice}
            onAddPageBreakAfterQuestion={onAddPageBreakAfterQuestion}
            onUpdateBlockTitle={onUpdateBlockTitle}
            onAddFromLibrary={onAddFromLibrary}
            pageInfoMap={pageInfoMap}
            focusedLogicSource={focusedLogicSource}
            printMode={printMode}
          />
        </React.Fragment>
      ))}
      {dropTargetBlockId === null && (draggedBlockId || isDraggingNewBlock) && <DropIndicator />}
    </div>
  );
});

export default SurveyCanvas;