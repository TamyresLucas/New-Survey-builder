import React, { useEffect, useState, memo, useRef, useMemo } from 'react';
import type { Survey, Question, ToolboxItemData, QuestionType, Choice, LogicIssue } from '../types';
import SurveyBlock from './SurveyBlock';
import { QuestionType as QTEnum } from '../types';

interface SurveyCanvasProps {
  survey: Survey;
  selectedQuestion: Question | null;
  checkedQuestions: Set<string>;
  logicIssues: LogicIssue[];
  onSelectQuestion: (question: Question | null, tab?: string) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
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
}

const DropIndicator = () => (
    <div className="relative h-px w-full bg-primary my-2">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
    </div>
);

const SurveyCanvas: React.FC<SurveyCanvasProps> = memo(({ survey, selectedQuestion, checkedQuestions, logicIssues, onSelectQuestion, onUpdateQuestion, onDeleteQuestion, onCopyQuestion, onMoveQuestionToNewBlock, onMoveQuestionToExistingBlock, onDeleteBlock, onReorderQuestion, onReorderBlock, onAddBlockFromToolbox, onAddQuestion, onAddBlock, onAddQuestionToBlock, onToggleQuestionCheck, onSelectAllInBlock, onUnselectAllInBlock, toolboxItems, collapsedBlocks, onToggleBlockCollapse, onCopyBlock, onExpandAllBlocks, onCollapseAllBlocks, onExpandBlock, onCollapseBlock, onAddChoice, onAddPageBreakAfterQuestion, onUpdateBlockTitle, onUpdateSurveyTitle, onAddFromLibrary }) => {
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dropTargetBlockId, setDropTargetBlockId] = useState<string | null>(null);
  const [isDraggingNewBlock, setIsDraggingNewBlock] = useState(false);

  const { questionToPageMap, pageStartQuestionIds } = useMemo(() => {
    const qToPageMap = new Map<string, number>();
    const pStartIds = new Set<string>();
    let pageCounter = 1;
    let isFirstQuestionOfPage = true;

    survey.blocks.forEach((block, blockIndex) => {
        // If this isn't the first block, check if a new page should start.
        if (blockIndex > 0) {
            const prevBlock = survey.blocks[blockIndex - 1];
            if (prevBlock.questions.length > 0) {
                const lastQuestionInPrevBlock = prevBlock.questions[prevBlock.questions.length - 1];
                // If the previous block didn't end with an explicit page break, this new block starts a new page.
                if (lastQuestionInPrevBlock.type !== QTEnum.PageBreak) {
                    pageCounter++;
                    isFirstQuestionOfPage = true;
                }
            }
        }
        
        block.questions.forEach(question => {
            // If we've determined this is the first question of a page, add it to the set for rendering the indicator.
            if (isFirstQuestionOfPage && question.type !== QTEnum.PageBreak) {
                pStartIds.add(question.id);
                isFirstQuestionOfPage = false;
            }
            
            // Map the question to its calculated page number.
            qToPageMap.set(question.id, pageCounter);

            // If the question is a page break, increment the counter for the next page.
            if (question.type === QTEnum.PageBreak) {
                pageCounter++;
                isFirstQuestionOfPage = true;
            }
        });
    });

    return { questionToPageMap: qToPageMap, pageStartQuestionIds: pStartIds };
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
              checkedQuestions={checkedQuestions}
              logicIssues={logicIssues}
              onSelectQuestion={onSelectQuestion}
              onUpdateQuestion={onUpdateQuestion}
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
              questionToPageMap={questionToPageMap}
              pageStartQuestionIds={pageStartQuestionIds}
          />
        </React.Fragment>
      ))}
      {dropTargetBlockId === null && (draggedBlockId || isDraggingNewBlock) && <DropIndicator />}
    </div>
  );
});

export default SurveyCanvas;