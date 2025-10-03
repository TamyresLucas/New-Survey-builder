import React, { useEffect, useState, memo, useRef } from 'react';
import type { Survey, Question, ToolboxItemData, QuestionType, Choice } from '../types';
import SurveyBlock from './SurveyBlock';

interface SurveyCanvasProps {
  survey: Survey;
  selectedQuestion: Question | null;
  checkedQuestions: Set<string>;
  onSelectQuestion: (question: Question | null, tab?: string) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  onDeleteQuestion: (questionId: string) => void;
  onCopyQuestion: (questionId: string) => void;
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
}

const DropIndicator = () => (
    <div className="relative h-px w-full bg-primary my-2">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
    </div>
);

const SurveyCanvas: React.FC<SurveyCanvasProps> = memo(({ survey, selectedQuestion, checkedQuestions, onSelectQuestion, onUpdateQuestion, onDeleteQuestion, onCopyQuestion, onDeleteBlock, onReorderQuestion, onReorderBlock, onAddBlockFromToolbox, onAddQuestion, onAddBlock, onAddQuestionToBlock, onToggleQuestionCheck, onSelectAllInBlock, onUnselectAllInBlock, toolboxItems, collapsedBlocks, onToggleBlockCollapse, onCopyBlock, onExpandAllBlocks, onCollapseAllBlocks, onExpandBlock, onCollapseBlock, onAddChoice, onAddPageBreakAfterQuestion, onUpdateBlockTitle, onUpdateSurveyTitle }) => {
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dropTargetBlockId, setDropTargetBlockId] = useState<string | null>(null);
  const [isDraggingNewBlock, setIsDraggingNewBlock] = useState(false);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(survey.title);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    setTitleValue(survey.title);
  }, [survey.title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
        const textarea = titleInputRef.current;
        textarea.focus();
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [isEditingTitle]);

  const handleTitleSave = () => {
    if (titleValue.trim() && titleValue.trim() !== survey.title) {
        onUpdateSurveyTitle(titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleTitleSave();
    } else if (e.key === 'Escape') {
        setTitleValue(survey.title);
        setIsEditingTitle(false);
    }
  };

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
    e.preventDefault();
    const isDraggingExistingBlock = !!draggedBlockId;
    const isAddingNewBlock = e.dataTransfer.types.includes('application/survey-toolbox-block');

    if (!isDraggingExistingBlock && !isAddingNewBlock) return;
    
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
    e.preventDefault();
    const isAddingNewBlock = e.dataTransfer.types.includes('application/survey-toolbox-block');

    if (isAddingNewBlock) {
        onAddBlockFromToolbox(dropTargetBlockId);
    } else if (draggedBlockId) {
        onReorderBlock(draggedBlockId, dropTargetBlockId);
    }
    
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
      <div className="mb-4 px-4">
            {isEditingTitle ? (
                <textarea
                    ref={titleInputRef}
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyDown}
                    className="text-lg font-medium bg-transparent border-b-2 border-primary focus:outline-none w-full text-on-surface resize-none overflow-hidden block"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${target.scrollHeight}px`;
                    }}
                />
            ) : (
                <h1 
                    onClick={() => setIsEditingTitle(true)}
                    className="text-lg font-medium text-on-surface cursor-pointer break-words"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                    {survey.title}
                </h1>
            )}
        </div>
      {survey.blocks.map(block => (
        <React.Fragment key={block.id}>
          {dropTargetBlockId === block.id && <DropIndicator />}
          <SurveyBlock 
              key={block.id} 
              block={block} 
              selectedQuestion={selectedQuestion} 
              checkedQuestions={checkedQuestions}
              onSelectQuestion={onSelectQuestion}
              onUpdateQuestion={onUpdateQuestion}
              onDeleteQuestion={onDeleteQuestion}
              onCopyQuestion={onCopyQuestion}
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
          />
        </React.Fragment>
      ))}
      {dropTargetBlockId === null && (draggedBlockId || isDraggingNewBlock) && <DropIndicator />}
    </div>
  );
});

export default SurveyCanvas;
