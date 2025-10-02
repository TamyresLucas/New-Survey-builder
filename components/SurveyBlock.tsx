import React, { useEffect, useState, useRef, memo, useCallback } from 'react';
import type { Block, Question, ToolboxItemData, QuestionType, Choice } from '../types';
import QuestionCard from './QuestionCard';
import { ChevronDownIcon, DotsHorizontalIcon, DragIndicatorIcon } from './icons';

const DropIndicator = () => (
    <div className="relative h-px w-full bg-primary my-2">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
    </div>
);

const BlockActionsMenu: React.FC<{
  onCopy: () => void;
  onAddQuestion: () => void;
  onAddBlockAbove: () => void;
  onAddBlockBelow: () => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  onDelete: () => void;
}> = ({ onCopy, onAddQuestion, onAddBlockAbove, onAddBlockBelow, onSelectAll, onUnselectAll, onExpand, onCollapse, onDelete }) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container border border-outline-variant rounded-md shadow-lg z-20" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <div className="py-1">
        <button onClick={onAddQuestion} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Add question</button>
        <button onClick={onAddBlockAbove} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Add block above</button>
        <button onClick={onAddBlockBelow} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Add block below</button>
      </div>
      <div className="border-t border-dotted border-outline-variant mx-2" />
      <div className="py-1">
        <button onClick={onCopy} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Duplicate</button>
      </div>
       <div className="border-t border-dotted border-outline-variant mx-2" />
      <div className="py-1">
        <button onClick={onSelectAll} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Select All</button>
        <button onClick={onUnselectAll} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Unselect All</button>
      </div>
      <div className="border-t border-dotted border-outline-variant mx-2" />
      <div className="py-1">
        <button onClick={onExpand} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Expand block</button>
        <button onClick={onCollapse} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Collapse block</button>
      </div>
      <div className="border-t border-dotted border-outline-variant mx-2" />
      <div className="py-1">
        <button onClick={onDelete} className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container">Delete</button>
      </div>
    </div>
  );
};

interface SurveyBlockProps {
    block: Block;
    selectedQuestion: Question | null;
    checkedQuestions: Set<string>;
    onSelectQuestion: (question: Question | null, tab?: string) => void;
    onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
    onDeleteQuestion: (questionId: string) => void;
    onCopyQuestion: (questionId: string) => void;
    onDeleteBlock: (blockId: string) => void;
    onReorderQuestion: (draggedQuestionId: string, targetQuestionId: string | null, targetBlockId: string) => void;
    onAddQuestion: (questionType: QuestionType, targetQuestionId: string | null, targetBlockId: string) => void;
    onAddBlock: (blockId: string, position: 'above' | 'below') => void;
    onAddQuestionToBlock: (blockId: string) => void;
    onToggleQuestionCheck: (questionId: string) => void;
    onSelectAllInBlock: (blockId: string) => void;
    onUnselectAllInBlock: (blockId: string) => void;
    toolboxItems: ToolboxItemData[];
    draggedQuestionId: string | null;
    setDraggedQuestionId: (id: string | null) => void;
    isBlockDragging: boolean;
    onBlockDragStart: () => void;
    onBlockDragEnd: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onCopyBlock: (blockId: string) => void;
    onExpandBlock: (blockId: string) => void;
    onCollapseBlock: (blockId: string) => void;
    onAddChoice: (questionId: string) => void;
    onAddPageBreakAfterQuestion: (questionId: string) => void;
    onUpdateBlockTitle: (blockId: string, title: string) => void;
}

const SurveyBlock: React.FC<SurveyBlockProps> = memo(({ 
  block, selectedQuestion, checkedQuestions, onSelectQuestion, onUpdateQuestion, onDeleteQuestion, onCopyQuestion, onDeleteBlock, onReorderQuestion, onAddQuestion, onAddBlock, onAddQuestionToBlock, onToggleQuestionCheck, onSelectAllInBlock, onUnselectAllInBlock, toolboxItems, draggedQuestionId, setDraggedQuestionId,
  isBlockDragging, onBlockDragStart, onBlockDragEnd, isCollapsed, onToggleCollapse,
  onCopyBlock, onExpandBlock, onCollapseBlock, onAddChoice, onAddPageBreakAfterQuestion, onUpdateBlockTitle
}) => {
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isToolboxDragOver, setIsToolboxDragOver] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(block.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
            setIsActionsMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
        titleInputRef.current.focus();
        titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setTitleValue(block.title);
    setIsEditingTitle(true);
  }, [block.title]);

  const saveTitle = useCallback(() => {
    if (titleValue.trim() && titleValue.trim() !== block.title) {
        onUpdateBlockTitle(block.id, titleValue.trim());
    }
    setIsEditingTitle(false);
  }, [block.id, block.title, onUpdateBlockTitle, titleValue]);

  const handleTitleBlur = useCallback(() => {
    saveTitle();
  }, [saveTitle]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        saveTitle();
    } else if (e.key === 'Escape') {
        setIsEditingTitle(false);
        setTitleValue(block.title);
    }
  }, [saveTitle, block.title]);


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); 
    
    const isAddingFromToolbox = e.dataTransfer.types.includes('application/survey-toolbox-item');
    
    if (!draggedQuestionId && !isAddingFromToolbox) return;

    if (isAddingFromToolbox) {
      setIsToolboxDragOver(true);
    }

    const questionElements = [...(e.currentTarget as HTMLDivElement).querySelectorAll('[data-question-id]')] as HTMLDivElement[];
    
    const closest = questionElements.reduce(
        (acc, child) => {
            const box = child.getBoundingClientRect();
            const offset = e.clientY - (box.top + box.height / 2);
            if (offset < 0 && offset > acc.offset) {
                return { offset, element: child };
            }
            return acc;
        },
        { offset: Number.NEGATIVE_INFINITY, element: null as HTMLElement | null }
    );
    
    setDropTargetId(closest.element?.dataset.questionId || null);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const toolboxItemType = e.dataTransfer.getData('application/survey-toolbox-item') as QuestionType;

    if (toolboxItemType) {
      onAddQuestion(toolboxItemType, dropTargetId, block.id);
    } else if (draggedQuestionId) {
      onReorderQuestion(draggedQuestionId, dropTargetId, block.id);
    }

    setDropTargetId(null);
    setDraggedQuestionId(null);
    setIsToolboxDragOver(false);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Check if the mouse is leaving the container itself, not just moving between children
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setDropTargetId(null);
        setIsToolboxDragOver(false);
    }
  };

  return (
    <div 
      className={`bg-surface-container border border-outline-variant rounded-lg mb-8 transition-opacity ${isBlockDragging ? 'opacity-50' : ''}`}
      data-block-id={block.id}
    >
      <div 
        className="flex items-center justify-between p-4 bg-surface-container-high rounded-t-lg"
        draggable="true"
        onDragStart={(e) => {
            if ((e.target as HTMLElement).closest('.collapse-toggle-area, .actions-menu-area, input')) {
                e.preventDefault();
                return;
            }
            e.stopPropagation(); 
            e.dataTransfer.setData('application/survey-block', block.id);
            onBlockDragStart();
        }}
        onDragEnd={onBlockDragEnd}
      >
        <div className="flex items-center cursor-grab flex-grow min-w-0 mr-2">
          <DragIndicatorIcon className="text-xl text-on-surface-variant mr-2 flex-shrink-0" />
          <div className="flex items-center cursor-pointer collapse-toggle-area w-full" onClick={onToggleCollapse}>
            <ChevronDownIcon className={`text-xl mr-2 text-on-surface transition-transform duration-200 flex-shrink-0 ${isCollapsed ? '-rotate-90' : ''}`} />
            {isEditingTitle ? (
                <input
                    ref={titleInputRef}
                    type="text"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleTitleKeyDown}
                    onClick={e => e.stopPropagation()}
                    className="font-medium text-lg text-on-surface bg-transparent border-b border-primary focus:outline-none w-full"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                />
            ) : (
                <h3 
                    className="font-medium text-lg text-on-surface truncate" 
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    onClick={handleTitleClick}
                >
                    {block.title}
                </h3>
            )}
          </div>
        </div>
        <div className="relative actions-menu-area flex-shrink-0" ref={actionsMenuRef}>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsActionsMenuOpen(prev => !prev); }}
                className="text-on-surface-variant hover:bg-surface-container-highest p-1 rounded-full"
                aria-haspopup="true"
                aria-expanded={isActionsMenuOpen}
                aria-label="Block actions"
            >
              <DotsHorizontalIcon className="text-xl" />
            </button>
            {isActionsMenuOpen && (
                <BlockActionsMenu
                    onCopy={() => { onCopyBlock(block.id); setIsActionsMenuOpen(false); }}
                    onAddQuestion={() => { onAddQuestionToBlock(block.id); setIsActionsMenuOpen(false); }}
                    onAddBlockAbove={() => { onAddBlock(block.id, 'above'); setIsActionsMenuOpen(false); }}
                    onAddBlockBelow={() => { onAddBlock(block.id, 'below'); setIsActionsMenuOpen(false); }}
                    onSelectAll={() => { onSelectAllInBlock(block.id); setIsActionsMenuOpen(false); }}
                    onUnselectAll={() => { onUnselectAllInBlock(block.id); setIsActionsMenuOpen(false); }}
                    onExpand={() => { onExpandBlock(block.id); setIsActionsMenuOpen(false); }}
                    onCollapse={() => { onCollapseBlock(block.id); setIsActionsMenuOpen(false); }}
                    onDelete={() => { onDeleteBlock(block.id); setIsActionsMenuOpen(false); }}
                />
            )}
        </div>
      </div>
      {!isCollapsed && (
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
          className="p-4"
        >
          {block.questions.map((question, index) => (
            <React.Fragment key={question.id}>
              {dropTargetId === question.id && <DropIndicator />}
              <div className={index > 0 ? "mt-4" : ""}>
                <QuestionCard
                  question={question}
                  id={`question-card-${question.id}`}
                  isSelected={selectedQuestion?.id === question.id}
                  isChecked={checkedQuestions.has(question.id)}
                  onSelect={onSelectQuestion}
                  onUpdateQuestion={onUpdateQuestion}
                  onDeleteQuestion={onDeleteQuestion}
                  onCopyQuestion={onCopyQuestion}
                  onToggleCheck={onToggleQuestionCheck}
                  toolboxItems={toolboxItems}
                  isDragging={draggedQuestionId === question.id}
                  onDragStart={() => setDraggedQuestionId(question.id)}
                  onDragEnd={() => setDraggedQuestionId(null)}
                  onAddChoice={onAddChoice}
                  onAddPageBreakAfterQuestion={onAddPageBreakAfterQuestion}
                />
              </div>
            </React.Fragment>
          ))}
          {dropTargetId === null && (draggedQuestionId || isToolboxDragOver) && <DropIndicator />}
        </div>
      )}
    </div>
  );
});

export default SurveyBlock;