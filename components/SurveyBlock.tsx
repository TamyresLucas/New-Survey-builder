import React, { useEffect, useState, useRef, memo, useCallback, useMemo } from 'react';
import type { Block, Question, ToolboxItemData, QuestionType, Choice, Survey, LogicIssue } from '../types';
import QuestionCard from './QuestionCard';
import { ChevronDownIcon, DotsHorizontalIcon, DragIndicatorIcon } from './icons';
import { BlockActionsMenu, QuestionTypeSelectionMenuContent } from './ActionMenus';
import { QuestionType as QTEnum } from '../types';
import type { PageInfo } from './SurveyCanvas';

const DropIndicator = () => (
    <div className="relative h-px w-full bg-primary my-2">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
    </div>
);

interface SurveyBlockProps {
    block: Block;
    survey: Survey;
    selectedQuestion: Question | null;
    checkedQuestions: Set<string>;
    logicIssues: LogicIssue[];
    onSelectQuestion: (question: Question | null, tab?: string) => void;
    onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
    onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
    onDeleteQuestion: (questionId: string) => void;
    onCopyQuestion: (questionId: string) => void;
    onMoveQuestionToNewBlock: (questionId: string) => void;
    onMoveQuestionToExistingBlock: (questionId: string, targetBlockId: string) => void;
    onDeleteBlock: (blockId: string) => void;
    onReorderQuestion: (draggedQuestionId: string, targetQuestionId: string | null, targetBlockId: string) => void;
    onAddQuestion: (questionType: QuestionType, targetQuestionId: string | null, targetBlockId: string) => void;
    onAddBlock: (blockId: string, position: 'above' | 'below') => void;
    onAddQuestionToBlock: (blockId: string, questionType: QuestionType) => void;
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
    onAddFromLibrary: () => void;
    pageInfoMap: Map<string, PageInfo>;
}

const SurveyBlock: React.FC<SurveyBlockProps> = memo(({ 
  block, survey, selectedQuestion, checkedQuestions, logicIssues, onSelectQuestion, onUpdateQuestion, onUpdateBlock, onDeleteQuestion, onCopyQuestion, onMoveQuestionToNewBlock, onMoveQuestionToExistingBlock, onDeleteBlock, onReorderQuestion, onAddQuestion, onAddBlock, onAddQuestionToBlock, onToggleQuestionCheck, onSelectAllInBlock, onUnselectAllInBlock, toolboxItems, draggedQuestionId, setDraggedQuestionId,
  isBlockDragging, onBlockDragStart, onBlockDragEnd, isCollapsed, onToggleCollapse,
  onCopyBlock, onExpandBlock, onCollapseBlock, onAddChoice, onAddPageBreakAfterQuestion, onUpdateBlockTitle, onAddFromLibrary,
  pageInfoMap
}) => {
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isToolboxDragOver, setIsToolboxDragOver] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(block.title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const [isAddQuestionMenuOpen, setIsAddQuestionMenuOpen] = useState(false);
  const addQuestionMenuRef = useRef<HTMLDivElement>(null);

  const createPasteHandler = useCallback(<T extends HTMLInputElement | HTMLTextAreaElement>(
    onChange: (newValue: string) => void
  ) => (e: React.ClipboardEvent<T>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      const target = e.currentTarget;
      const start = target.selectionStart ?? 0;
      const end = target.selectionEnd ?? 0;

      const newValue = target.value.substring(0, start) + text + target.value.substring(end);
      onChange(newValue);

      const newCursorPos = start + text.length;
      requestAnimationFrame(() => {
          if (document.activeElement === target) {
              target.selectionStart = newCursorPos;
              target.selectionEnd = newCursorPos;
          }
      });
  }, []);

  const selectableQuestions = useMemo(() => 
      block.questions.filter(q => q.type !== QTEnum.PageBreak), 
      [block.questions]
  );

  const selectedQuestionsInBlock = useMemo(() => 
      selectableQuestions.filter(q => checkedQuestions.has(q.id)),
      [selectableQuestions, checkedQuestions]
  );

  const canSelectAll = useMemo(() => 
      selectableQuestions.length > 0 && selectedQuestionsInBlock.length < selectableQuestions.length,
      [selectableQuestions.length, selectedQuestionsInBlock.length]
  );

  const canUnselectAll = useMemo(() => 
      selectedQuestionsInBlock.length > 0,
      [selectedQuestionsInBlock.length]
  );

  const canCollapse = !isCollapsed;
  const canExpand = isCollapsed;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
            setIsActionsMenuOpen(false);
        }
        if (addQuestionMenuRef.current && !addQuestionMenuRef.current.contains(event.target as Node)) {
            setIsAddQuestionMenuOpen(false);
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
                    onPaste={createPasteHandler(setTitleValue)}
                    className="font-semibold text-base text-on-surface bg-transparent border-b border-primary focus:outline-none w-full"
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                />
            ) : (
                <div 
                    className="truncate" 
                    onClick={handleTitleClick}
                >
                    <span className="font-bold text-base text-on-surface mr-2">{block.bid}</span>
                    <span 
                        className="font-semibold text-base text-on-surface"
                        style={{ fontFamily: "'Open Sans', sans-serif" }}
                    >
                        {block.title}
                    </span>
                </div>
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
                    onDuplicate={() => { onCopyBlock(block.id); setIsActionsMenuOpen(false); }}
                    onAddSimpleQuestion={() => { onAddQuestionToBlock(block.id, QTEnum.Checkbox); setIsActionsMenuOpen(false); }}
                    onAddFromLibrary={() => { onAddFromLibrary(); setIsActionsMenuOpen(false); }}
                    onAddBlockAbove={() => { onAddBlock(block.id, 'above'); setIsActionsMenuOpen(false); }}
                    onAddBlockBelow={() => { onAddBlock(block.id, 'below'); setIsActionsMenuOpen(false); }}
                    onSelectAll={() => { onSelectAllInBlock(block.id); setIsActionsMenuOpen(false); }}
                    canSelectAll={canSelectAll}
                    onUnselectAll={() => { onUnselectAllInBlock(block.id); setIsActionsMenuOpen(false); }}
                    canUnselectAll={canUnselectAll}
                    onExpand={() => { onExpandBlock(block.id); setIsActionsMenuOpen(false); }}
                    canExpand={canExpand}
                    onCollapse={() => { onCollapseBlock(block.id); setIsActionsMenuOpen(false); }}
                    canCollapse={canCollapse}
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
          {block.questions.length > 0 ? (
            <>
              {block.questions.map((question, index) => (
                    <React.Fragment key={question.id}>
                    {dropTargetId === question.id && <DropIndicator />}
                    <div className={index > 0 || pageInfoMap.has(question.id) ? "mt-4" : ""}>
                        <QuestionCard
                          question={question}
                          survey={survey}
                          currentBlockId={block.id}
                          logicIssues={logicIssues.filter(issue => issue.questionId === question.id)}
                          id={`question-card-${question.id}`}
                          isSelected={selectedQuestion?.id === question.id}
                          isChecked={checkedQuestions.has(question.id)}
                          onSelect={onSelectQuestion}
                          onUpdateQuestion={onUpdateQuestion}
                          onUpdateBlock={onUpdateBlock}
                          onDeleteQuestion={onDeleteQuestion}
                          onCopyQuestion={onCopyQuestion}
                          onMoveQuestionToNewBlock={onMoveQuestionToNewBlock}
                          onMoveQuestionToExistingBlock={onMoveQuestionToExistingBlock}
                          onToggleCheck={onToggleQuestionCheck}
                          toolboxItems={toolboxItems}
                          isDragging={draggedQuestionId === question.id}
                          onDragStart={() => {
                            setDraggedQuestionId(question.id);
                            onSelectQuestion(question);
                          }}
                          onDragEnd={() => setDraggedQuestionId(null)}
                          onAddChoice={onAddChoice}
                          onAddPageBreakAfterQuestion={onAddPageBreakAfterQuestion}
                          pageInfo={pageInfoMap.get(question.id)}
                        />
                    </div>
                    </React.Fragment>
                )
              )}
              {dropTargetId === null && (draggedQuestionId || isToolboxDragOver) && <DropIndicator />}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center space-x-4">
                 <div className="relative" ref={addQuestionMenuRef}>
                    <button
                        onClick={() => setIsAddQuestionMenuOpen(prev => !prev)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-on-primary bg-primary rounded-md hover:opacity-90 transition-opacity"
                        aria-haspopup="true"
                        aria-expanded={isAddQuestionMenuOpen}
                    >
                        <span>Add new question</span>
                        <ChevronDownIcon className="text-base" />
                    </button>
                    {isAddQuestionMenuOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 z-10">
                            <QuestionTypeSelectionMenuContent 
                                toolboxItems={toolboxItems}
                                onSelect={(questionType) => {
                                    onAddQuestionToBlock(block.id, questionType);
                                    setIsAddQuestionMenuOpen(false);
                                }}
                            />
                        </div>
                    )}
                </div>
                <button
                  onClick={() => alert('Add from library functionality not implemented.')}
                  className="px-4 py-2 text-sm font-semibold text-on-surface bg-surface-container-high border border-outline rounded-md hover:bg-surface-container-highest transition-colors"
                >
                  Add from library
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default SurveyBlock;