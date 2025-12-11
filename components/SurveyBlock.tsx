import React, { useEffect, useState, useRef, memo, useCallback, useMemo } from 'react';
import type { Block, Question, ToolboxItemData, QuestionType, Choice, Survey, LogicIssue, SkipLogic } from '../types';
import QuestionCard from './QuestionCard';
import { ChevronDownIcon, DotsHorizontalIcon, DragIndicatorIcon } from './icons';
import { BlockActionsMenu, QuestionTypeSelectionMenuContent } from './ActionMenus';
import { QuestionType as QTEnum } from '../types';
import type { PageInfo } from './SurveyCanvas';
import { SurveyFlowDisplay } from './LogicDisplays';
import { EditableText } from './EditableText';

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
  selectedBlock: Block | null;
  checkedQuestions: Set<string>;
  logicIssues: LogicIssue[];
  hasBranchingLogicInSurvey: boolean;
  branchedToBlockIds: Set<string>;
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
  focusedLogicSource: string | null;
  printMode?: boolean;
}

const SurveyBlock: React.FC<SurveyBlockProps> = memo(({
  block, survey, selectedQuestion, selectedBlock, checkedQuestions, logicIssues, hasBranchingLogicInSurvey, branchedToBlockIds, onSelectQuestion, onSelectBlock, onUpdateQuestion, onUpdateBlock, onDeleteQuestion, onCopyQuestion, onMoveQuestionToNewBlock, onMoveQuestionToExistingBlock, onDeleteBlock, onReorderQuestion, onAddQuestion, onAddBlock, onAddQuestionToBlock, onToggleQuestionCheck, onSelectAllInBlock, onUnselectAllInBlock, toolboxItems, draggedQuestionId, setDraggedQuestionId,
  isBlockDragging, onBlockDragStart, onBlockDragEnd, isCollapsed, onToggleCollapse,
  onCopyBlock, onExpandBlock, onCollapseBlock, onAddChoice, onAddPageBreakAfterQuestion, onUpdateBlockTitle, onAddFromLibrary,
  pageInfoMap, focusedLogicSource,
  printMode = false
}) => {
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isToolboxDragOver, setIsToolboxDragOver] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);



  const [isAddQuestionMenuOpen, setIsAddQuestionMenuOpen] = useState(false);
  const addQuestionMenuRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedBlock?.id === block.id;



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

  const isPathTargetBlock = branchedToBlockIds.has(block.id);
  const lastContentQuestion = useMemo(() =>
    [...block.questions].reverse().find(q => q.type !== QTEnum.PageBreak),
    [block.questions]
  );

  const { surveyFlowLogic, logicSource } = useMemo(() => {
    let surveyFlowDestination: string | null = null;
    let source: 'branching' | 'skip' | 'block' | 'fallthrough' = 'fallthrough';

    const lastQ = lastContentQuestion;
    if (lastQ) {
      const branching = lastQ.draftBranchingLogic ?? lastQ.branchingLogic;
      // Check for unconditional branching first (otherwise logic with no branches)
      if (branching && branching.otherwiseIsConfirmed && (!branching.branches || branching.branches.length === 0)) {
        surveyFlowDestination = branching.otherwiseSkipTo;
        source = 'branching';
      } else {
        const skip = lastQ.skipLogic;
        if (skip?.type === 'simple' && skip.isConfirmed) {
          surveyFlowDestination = skip.skipTo;
          source = 'skip';
        }
      }
    }

    if (!surveyFlowDestination && block.continueTo && block.continueTo !== 'next') {
      surveyFlowDestination = block.continueTo;
      source = 'block';
    }

    // Fallback if no explicit logic was found on the last question
    if (!surveyFlowDestination || surveyFlowDestination === 'next') {
      const currentBlockIndex = survey.blocks.findIndex(b => b.id === block.id);
      if (currentBlockIndex !== -1 && currentBlockIndex < survey.blocks.length - 1) {
        const nextBlock = survey.blocks[currentBlockIndex + 1];
        surveyFlowDestination = `block:${nextBlock.id}`;
      } else {
        surveyFlowDestination = 'end';
      }
      source = 'fallthrough';
    }

    const logic = surveyFlowDestination ? {
      type: 'simple' as const,
      skipTo: surveyFlowDestination,
      isConfirmed: true,
    } : null;

    return { surveyFlowLogic: logic, logicSource: source };
  }, [block.id, block.continueTo, lastContentQuestion, survey.blocks]);

  const showSurveyFlow = hasBranchingLogicInSurvey && isPathTargetBlock && surveyFlowLogic;


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

  const questionCount = useMemo(() =>
    block.questions.filter(q => q.type !== QTEnum.Description && q.type !== QTEnum.PageBreak).length,
    [block.questions]
  );

  return (
    <div
      className={`${printMode ? 'bg-surface' : 'bg-surface-container'} border rounded-lg mb-8 transition-all ${isBlockDragging ? 'opacity-50' : ''
        } ${isSelected ? 'border-2 border-primary shadow-md' : 'border-outline-variant'}`}
      data-block-id={block.id}
    >
      <div
        className={`flex items-center justify-between p-4 rounded-t-lg ${!isCollapsed ? 'border-b border-outline-variant' : ''}`}
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
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button, input')) {
            return;
          }
          onSelectBlock(block);
        }}
      >
        <div className={`flex items-center ${!printMode ? 'cursor-grab' : ''} flex-grow min-w-0 mr-2`}>
          {!printMode && <DragIndicatorIcon className="text-xl text-on-surface-variant mr-2 flex-shrink-0" />}
          <div className="flex items-center cursor-pointer collapse-toggle-area w-full" onClick={(e) => { e.stopPropagation(); if (!printMode) onToggleCollapse(); }}>
            {!printMode && <ChevronDownIcon className={`text-xl mr-2 text-on-surface transition-transform duration-200 flex-shrink-0 ${isCollapsed ? '-rotate-90' : ''}`} />}
            <div className="truncate flex items-center w-full">
              <span className="font-bold text-base text-on-surface mr-2">{block.bid}</span>
              <EditableText
                html={block.title}
                onChange={(newTitle) => {
                  if (newTitle.trim() && newTitle.trim() !== block.title) {
                    onUpdateBlockTitle(block.id, newTitle.trim());
                  }
                }}
                className="font-semibold text-base text-on-surface min-w-[50px]"
                style={{ fontFamily: "'Open Sans', sans-serif" }}
              />
              <span className="text-sm font-normal text-on-surface-variant ml-2">({questionCount} question{questionCount !== 1 ? 's' : ''})</span>
              {block.autoAdvance && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-container text-on-primary-container rounded-full flex-shrink-0">
                  Autoadvance
                </span>
              )}
            </div>
          </div>
        </div>
        {!printMode && (
          <div className="relative actions-menu-area flex-shrink-0" ref={actionsMenuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setIsActionsMenuOpen(prev => !prev); }}
              className={`w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-lowest rounded-md transition-colors ${isActionsMenuOpen ? '!bg-surface-container-lowest' : ''}`}
              aria-haspopup="true"
              aria-expanded={isActionsMenuOpen}
              aria-label="Block actions"
            >
              <DotsHorizontalIcon className="text-xl" />
            </button>
            {isActionsMenuOpen && (
              <BlockActionsMenu
                onEdit={() => { onSelectBlock(block); setIsActionsMenuOpen(false); }}
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
        )}
      </div>
      {!isCollapsed && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
          className="p-4 cursor-pointer"
          onClick={() => onSelectBlock(block)}
        >
          {block.isSurveySection && (
            <div className="pb-4 mb-4 border-b-2 border-primary">
              <h3 className="text-xl font-bold text-on-surface">
                {block.sectionName || block.title}
              </h3>
            </div>
          )}
          {block.questions.length > 0 ? (
            <>
              {block.questions.map((question, index) => (
                <React.Fragment key={question.id}>
                  {dropTargetId === question.id && <DropIndicator />}
                  <div className={index > 0 || pageInfoMap.has(question.id) || (index === 0 && block.isSurveySection) ? "mt-4" : ""}>
                    <QuestionCard
                      question={question}
                      survey={survey}
                      parentBlock={block}
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
                      focusedLogicSource={focusedLogicSource}
                      printMode={printMode}
                    />
                  </div>
                </React.Fragment>
              ))}
              {dropTargetId === null && (draggedQuestionId || isToolboxDragOver) && <DropIndicator />}
              {showSurveyFlow && surveyFlowLogic && lastContentQuestion && (
                <div className="mt-4">
                  <SurveyFlowDisplay
                    logic={surveyFlowLogic as SkipLogic}
                    survey={survey}
                    onClick={() => onSelectBlock(block, { tab: 'Behavior', focusOn: 'continueTo' })}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              {!printMode && (
                <div className="flex justify-center space-x-4">
                  <div className="relative" ref={addQuestionMenuRef}>
                    <button
                      onClick={() => setIsAddQuestionMenuOpen(prev => !prev)}
                      className={`flex items-center gap-2 px-4 py-1.5 text-sm font-button-primary text-on-primary bg-primary rounded-md hover:opacity-90 transition-opacity ${isAddQuestionMenuOpen ? '!opacity-90' : ''}`}
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
                    className="px-4 py-1.5 text-sm font-semibold text-on-surface bg-surface-container-high border border-outline rounded-md hover:bg-surface-container-lowestest transition-colors"
                  >
                    Add from library
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default SurveyBlock;