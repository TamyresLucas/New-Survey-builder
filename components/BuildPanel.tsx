import React, { useState, useRef, useMemo, useEffect, memo, useCallback } from 'react';
import { SearchIcon, PanelLeftIcon, RadioIcon, WarningIcon, DragIndicatorIcon, ChevronDownIcon, DotsHorizontalIcon, AsteriskIcon } from './icons';
import type { Survey, Question, ToolboxItemData, QuestionType, Block, LogicIssue } from '../types';
import { QuestionType as QTEnum } from '../types';
import { customerFeedbackSurvey } from '../data/test-surveys';
import { BlockActionsMenu, QuestionActionsMenu } from './ActionMenus';
import { DropdownField } from './DropdownField';
import { Button } from './Button';

interface BuildPanelProps {
  onClose: () => void;
  survey: Survey;
  onSelectQuestion: (question: Question | null, options?: { tab?: string; focusOn?: string }) => void;
  selectedQuestion: Question | null;
  selectedBlock: Block | null;
  onSelectBlock: (block: Block) => void;
  checkedQuestions: Set<string>;
  collapsedBlocks: Set<string>;
  toolboxItems: ToolboxItemData[];
  logicIssues: LogicIssue[];
  onReorderToolbox: (items: ToolboxItemData[]) => void;
  onReorderQuestion: (draggedQuestionId: string, targetQuestionId: string | null, targetBlockId: string) => void;
  onReorderBlock: (draggedBlockId: string, targetBlockId: string | null) => void;
  onMoveBlockUp: (blockId: string) => void;
  onMoveBlockDown: (blockId: string) => void;
  onAddBlock: (blockId: string, position: 'above' | 'below') => void;
  onCopyBlock: (blockId: string) => void;
  onAddQuestionToBlock: (blockId: string, questionType: QuestionType) => void;
  onExpandAllBlocks: () => void;
  onCollapseAllBlocks: () => void;
  onExpandBlock: (blockId: string) => void;
  onCollapseBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  onCopyQuestion: (questionId: string) => void;
  onMoveQuestionToNewBlock: (questionId: string) => void;
  onMoveQuestionToExistingBlock: (questionId: string, targetBlockId: string) => void;
  onAddPageBreakAfterQuestion: (questionId: string) => void;
  onSelectAllInBlock: (blockId: string) => void;
  onUnselectAllInBlock: (blockId: string) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  printMode?: boolean;
  onQuestionHover?: (id: string | null) => void;
  hoveredQuestionId?: string | null;
  onBlockHover?: (id: string | null) => void;
  hoveredBlockId?: string | null;
}

const enabledToolboxItems = new Set(['Block', 'Page Break', 'Description', 'Checkbox', 'Radio Button', 'Text Entry', 'Choice Grid']);

import { DropIndicator } from './DropIndicator';
import { SidebarBlock } from './SidebarBlock';
import { SidebarLibrarySurvey } from './SidebarLibrarySurvey';
import { SidebarToolboxItem } from './SidebarToolboxItem';

const BuildPanel: React.FC<BuildPanelProps> = memo(({
  onClose, survey, onSelectQuestion, selectedQuestion, selectedBlock, onSelectBlock, checkedQuestions, collapsedBlocks, toolboxItems, logicIssues, onReorderToolbox, onReorderQuestion, onReorderBlock,
  onMoveBlockUp, onMoveBlockDown, onAddBlock, onCopyBlock, onAddQuestionToBlock, onExpandAllBlocks, onCollapseAllBlocks, onDeleteBlock, onDeleteQuestion, onCopyQuestion, onMoveQuestionToNewBlock,
  onMoveQuestionToExistingBlock, onAddPageBreakAfterQuestion, onExpandBlock, onCollapseBlock, onSelectAllInBlock, onUnselectAllInBlock, onUpdateQuestion,
  printMode = false, onQuestionHover, hoveredQuestionId, onBlockHover, hoveredBlockId
}) => {
  const [activeTab, setActiveTab] = useState('Toolbox');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [questionTypeFilter, setQuestionTypeFilter] = useState('All content');
  const [toolboxFilter, setToolboxFilter] = useState('All');
  const [viewingLibrarySurveyId, setViewingLibrarySurveyId] = useState<string | null>(null);
  const [libraryFilter, setLibraryFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('surveyBuilder_libraryFilter') || 'Question bank';
    }
    return 'Question bank';
  });
  const contentListRef = useRef<HTMLDivElement>(null);

  const [draggedToolboxIndex, setDraggedToolboxIndex] = useState<number | null>(null);
  const [dropToolboxTargetIndex, setDropToolboxTargetIndex] = useState<number | null>(null);
  const toolboxListRef = useRef<HTMLUListElement>(null);

  const [draggedContentId, setDraggedContentId] = useState<string | null>(null);
  const [dropContentTarget, setDropContentTarget] = useState<{ blockId: string, questionId: string | null } | null>(null);

  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dropBlockTargetId, setDropBlockTargetId] = useState<string | null>(null);

  const [draggedLibraryId, setDraggedLibraryId] = useState<string | null>(null);

  const [openMenuBlockId, setOpenMenuBlockId] = useState<string | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const isSearching = !!searchTerm || !['All content', 'All question types'].includes(questionTypeFilter);
  const isTextSearching = !!searchTerm;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setOpenMenuBlockId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem('surveyBuilder_libraryFilter', libraryFilter);
  }, [libraryFilter]);

  const handleTabClick = useCallback((tabName: string) => {
    if (activeTab !== tabName) {
      if (selectedQuestion) {
        onSelectQuestion(null);
      }
      setQuestionTypeFilter('All content');
      setToolboxFilter('All');
    }
    setActiveTab(tabName);
  }, [activeTab, onSelectQuestion, selectedQuestion]);

  const filteredToolboxItems = useMemo(() => {
    let items = toolboxItems;

    if (toolboxFilter === 'Multiple Choice') {
      const allowedNames = new Set(['Radio Button', 'Checkbox', 'Choice Grid']);
      items = items.filter(item => allowedNames.has(item.name));
    } else if (toolboxFilter === 'Text') {
      const allowedNames = new Set(['Text Entry']);
      items = items.filter(item => allowedNames.has(item.name));
    }

    if (!searchTerm) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [toolboxItems, searchTerm, toolboxFilter]);

  const questionTypeFilterOptions = useMemo(() => {
    const types = new Set(toolboxItems
      .filter(item => item.name !== 'Block' && item.name !== 'Page Break')
      .map(item => item.name)
    );
    return ['All content', 'All question types', 'Required questions', 'Issues', ...Array.from(types)];
  }, [toolboxItems]);

  const filteredSurveyBlocks = useMemo(() => {
    let blocks = survey.blocks;

    if (questionTypeFilter === 'Issues') {
      const issueQuestionIds = new Set(logicIssues.map(i => i.questionId));
      blocks = blocks
        .map(block => ({
          ...block,
          questions: block.questions.filter(q => issueQuestionIds.has(q.id)),
        }))
        .filter(block => block.questions.length > 0);
    } else if (questionTypeFilter === 'Required questions') {
      blocks = blocks
        .map(block => ({
          ...block,
          questions: block.questions.filter(q => q.forceResponse),
        }))
        .filter(block => block.questions.length > 0);
    } else if (questionTypeFilter === 'All question types') {
      blocks = blocks
        .map(block => ({
          ...block,
          questions: block.questions.filter(question => question.type !== QTEnum.Description && question.type !== QTEnum.PageBreak),
        }))
        .filter(block => block.questions.length > 0);
    } else if (questionTypeFilter !== 'All content') {
      blocks = blocks
        .map(block => ({
          ...block,
          questions: block.questions.filter(question => question.type === questionTypeFilter),
        }))
        .filter(block => block.questions.length > 0);
    }

    if (searchTerm) {
      blocks = blocks
        .map(block => ({
          ...block,
          questions: block.questions.filter(question =>
            question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (question.label && question.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
            question.qid.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        }))
        .filter(block => block.questions.length > 0);
    }

    return blocks;
  }, [survey.blocks, searchTerm, questionTypeFilter, logicIssues]);


  const questionTypeIconMap = useMemo(() => new Map(toolboxItems.map(item => [item.name, item.icon])), [toolboxItems]);

  const handleToolboxDragStart = (e: React.DragEvent, index: number, item: ToolboxItemData) => {
    e.dataTransfer.setData('text/plain', index.toString());
    if (item.name === 'Block') {
      e.dataTransfer.setData('application/survey-toolbox-block', 'true');
    } else {
      e.dataTransfer.setData('application/survey-toolbox-item', item.name);
    }
    setDraggedToolboxIndex(index);
  };

  const handleToolboxDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedToolboxIndex === null || !toolboxListRef.current) return;

    const draggableElements = [...toolboxListRef.current.querySelectorAll('li[draggable="true"]')] as HTMLLIElement[];
    const closest = draggableElements.reduce(
      (acc, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + box.height / 2);
        if (offset < 0 && offset > acc.offset) {
          return { offset, element: child };
        }
        return acc;
      },
      { offset: Number.NEGATIVE_INFINITY, element: null as HTMLLIElement | null }
    );

    let newDropTargetIndex: number;
    if (closest.element) {
      newDropTargetIndex = draggableElements.indexOf(closest.element);
    } else {
      newDropTargetIndex = draggableElements.length;
    }

    if (newDropTargetIndex !== dropToolboxTargetIndex) {
      setDropToolboxTargetIndex(newDropTargetIndex);
    }
  };

  const handleToolboxDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedToolboxIndex === null || dropToolboxTargetIndex === null) {
      handleToolboxDragEnd();
      return;
    };

    const items = [...toolboxItems];
    const [draggedItem] = items.splice(draggedToolboxIndex, 1);

    const insertionIndex = draggedToolboxIndex < dropToolboxTargetIndex ? dropToolboxTargetIndex - 1 : dropToolboxTargetIndex;

    items.splice(insertionIndex, 0, draggedItem);

    onReorderToolbox(items);
    handleToolboxDragEnd();
  };

  const handleToolboxDragEnd = () => {
    setDraggedToolboxIndex(null);
    setDropToolboxTargetIndex(null);
  };

  const handleContentDragStart = (e: React.DragEvent, questionId: string) => {
    e.dataTransfer.setData('text/plain', questionId);
    setDraggedContentId(questionId);
    const questionToSelect = survey.blocks.flatMap(b => b.questions).find(q => q.id === questionId);
    if (questionToSelect) {
      onSelectQuestion(questionToSelect);
    }
  };

  const handleContentDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedBlockId || !draggedContentId) return;

    const questionElements = [...(e.currentTarget as HTMLUListElement).querySelectorAll('li[data-question-id]')] as HTMLLIElement[];

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

    setDropContentTarget({
      blockId: blockId,
      questionId: closest.element?.dataset.questionId || null
    });
  };

  const handleContentDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedContentId && dropContentTarget) {
      onReorderQuestion(draggedContentId, dropContentTarget.questionId, dropContentTarget.blockId);
    }
    handleContentDragEnd();
  };

  const handleContentDragEnd = () => {
    setDraggedContentId(null);
    setDropContentTarget(null);
  };

  const handleContentDragLeave = (e: React.DragEvent) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDropContentTarget(null);
    }
  };

  const handleBlockDragStart = (e: React.DragEvent, blockId: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/survey-block', blockId);
    setDraggedBlockId(blockId);
  };

  const handleBlockDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedBlockId || !contentListRef.current) return;

    const blockElements = [...contentListRef.current.querySelectorAll('div[data-block-id]')] as HTMLDivElement[];

    const closest = blockElements.reduce(
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

    setDropBlockTargetId(closest.element?.dataset.blockId || null);
  };

  const handleBlockDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedBlockId) {
      onReorderBlock(draggedBlockId, dropBlockTargetId);
    }
    handleBlockDragEnd();
  };

  const handleBlockDragEnd = () => {
    setDraggedBlockId(null);
    setDropBlockTargetId(null);
  };

  const handleLibraryDragStart = (e: React.DragEvent, surveyId: string) => {
    e.dataTransfer.setData('text/plain', surveyId);
    e.dataTransfer.setData('application/survey-library-import', surveyId);
    setDraggedLibraryId(surveyId);
  };

  const handleLibraryDragEnd = () => {
    setDraggedLibraryId(null);
  };

  return (
    <div
      className="w-80 bg-surface-container border-r border-outline flex flex-col flex-shrink-0 h-full"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-outline">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-on-surface" style={{ fontFamily: "'Outfit', sans-serif" }}>Build</h2>
          {!printMode && (
            <Button variant="tertiary" iconOnly onClick={onClose} aria-label="Collapse build panel">
              <PanelLeftIcon className="text-xl" />
            </Button>
          )}
        </div>
      </div>
      {
        !printMode && (
          <div className="px-4 border-b border-outline">
            <nav className="-mb-px flex space-x-6">
              {['Toolbox', 'Content', 'Library'].map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`h-[40px] flex items-center px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-primary'
                    }`}
                  style={{ fontFamily: "'Open Sans', sans-serif" }}
                >
                  {tab}
                </button>
              ))}
              <button
                key="Search"
                onClick={() => {
                  setIsSearchVisible(!isSearchVisible);
                  if (isSearchVisible) setSearchTerm('');
                }}
                className={`h-[40px] flex items-center px-1 border-b-2 font-medium text-sm transition-colors ${isSearchVisible
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-primary'
                  }`}
                aria-label="Toggle Search"
                aria-pressed={isSearchVisible}
              >
                <SearchIcon className="text-xl" />
              </button>
            </nav>
          </div>
        )
      }
      <div className="p-4 border-b border-outline">
        {activeTab === 'Content' && (
          <DropdownField
            value={questionTypeFilter}
            onChange={setQuestionTypeFilter}
            options={questionTypeFilterOptions.map(option => {
              let IconComponent = questionTypeIconMap.get(option);
              if (option === 'Issues') IconComponent = WarningIcon;
              if (option === 'Required questions') IconComponent = AsteriskIcon;

              const isEnabled = option === 'All content' || option === 'All question types' || option === 'Issues' || option === 'Required questions' || enabledToolboxItems.has(option);
              return {
                value: option,
                label: option,
                icon: IconComponent,
                iconColor: (option === 'Issues' || option === 'Required questions') ? 'text-error' : 'text-primary',
                disabled: !isEnabled
              };
            })}
          />
        )}
        {activeTab === 'Toolbox' && (
          <DropdownField
            value={toolboxFilter}
            onChange={setToolboxFilter}
            options={[
              { value: 'All', label: 'All question types' },
              { value: 'Multiple Choice', label: 'Multiple Choice' },
              { value: 'Text', label: 'Text' }
            ]}
          />
        )}
        {activeTab === 'Library' && (
          <DropdownField
            value={libraryFilter}
            onChange={setLibraryFilter}
            options={[
              { value: 'Question bank', label: 'Question bank' },
              { value: 'Multimedia', label: 'Multimedia' },
              { value: 'Templates', label: 'Templates' },
              { value: 'My questionnaires', label: 'My questionnaires' }
            ]}
          />
        )}
        {isSearchVisible && (
          <div className="relative mt-3">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <SearchIcon className="text-xl text-on-surface-variant" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full h-[32px] bg-transparent border border-input-border rounded-md pl-8 pr-2 text-sm text-on-surface hover:border-input-border-hover focus:outline-2 focus:outline-offset-2 focus:outline-primary transition-colors"
              style={{ fontFamily: "'Open Sans', sans-serif" }}
            />
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-visible">
        {activeTab === 'Toolbox' && !printMode && (
          <ul
            ref={toolboxListRef}
            onDragOver={!isTextSearching ? handleToolboxDragOver : undefined}
            onDragLeave={!isTextSearching ? () => setDropToolboxTargetIndex(null) : undefined}
            onDrop={!isTextSearching ? handleToolboxDrop : undefined}
          >
            {filteredToolboxItems.map((item, index) => {
              const isEnabled = enabledToolboxItems.has(item.name);
              return (
                <React.Fragment key={item.name}>
                  {!isTextSearching && dropToolboxTargetIndex === index && <DropIndicator />}
                  <li>
                    <SidebarToolboxItem
                      icon={item.icon}
                      label={item.name}
                      isEnabled={isEnabled}
                      isDraggable={!isTextSearching}
                      isDragged={draggedToolboxIndex === index}
                      onDragStart={(e) => handleToolboxDragStart(e, index, item)}
                      onDragEnd={handleToolboxDragEnd}
                    />
                  </li>
                </React.Fragment>
              )
            })}
            {!isTextSearching && dropToolboxTargetIndex === filteredToolboxItems.length && <DropIndicator />}
          </ul>
        )}
        {(activeTab === 'Content' || printMode) && (
          <div
            ref={contentListRef}
            className="bg-surface min-h-full"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
            onDragOver={!isSearching ? handleBlockDragOver : undefined}
            onDrop={!isSearching ? handleBlockDrop : undefined}
            onDragLeave={!isSearching ? () => setDropBlockTargetId(null) : undefined}
          >
            {filteredSurveyBlocks.map((block, index) => {
              return (
                <SidebarBlock
                  key={block.id}
                  block={block}
                  survey={survey}
                  isSearching={isSearching}
                  draggedBlockId={draggedBlockId}
                  dropBlockTargetId={dropBlockTargetId}
                  selectedBlock={selectedBlock}
                  onSelectBlock={onSelectBlock}
                  openMenuBlockId={openMenuBlockId}
                  onToggleMenu={(blockId) => setOpenMenuBlockId(openMenuBlockId === blockId ? null : blockId)}
                  collapsedBlocks={collapsedBlocks}
                  checkedQuestions={checkedQuestions}
                  logicIssues={logicIssues}
                  handleBlockDragStart={handleBlockDragStart}
                  handleBlockDragEnd={handleBlockDragEnd}
                  handleContentDragOver={handleContentDragOver}
                  handleContentDrop={handleContentDrop}
                  handleContentDragLeave={handleContentDragLeave}
                  handleContentDragStart={handleContentDragStart}
                  handleContentDragEnd={handleContentDragEnd}
                  draggedContentId={draggedContentId}
                  dropContentTarget={dropContentTarget}
                  selectedQuestion={selectedQuestion}
                  onSelectQuestion={onSelectQuestion}
                  questionTypeIconMap={questionTypeIconMap}
                  onDeleteQuestion={onDeleteQuestion}
                  onCopyQuestion={onCopyQuestion}
                  onAddPageBreakAfterQuestion={onAddPageBreakAfterQuestion}
                  onMoveQuestionToNewBlock={onMoveQuestionToNewBlock}
                  onUpdateQuestion={onUpdateQuestion}
                  hoveredQuestionId={hoveredQuestionId}
                  onQuestionHover={onQuestionHover}
                  onMoveBlockUp={onMoveBlockUp}
                  onMoveBlockDown={onMoveBlockDown}
                  onCopyBlock={onCopyBlock}
                  onAddQuestionToBlock={onAddQuestionToBlock}
                  onAddFromLibrary={() => alert('Add from library functionality not implemented.')}
                  onAddBlock={onAddBlock}
                  onSelectAllInBlock={onSelectAllInBlock}
                  onUnselectAllInBlock={onUnselectAllInBlock}
                  onExpandBlock={onExpandBlock}
                  onCollapseBlock={onCollapseBlock}
                  onDeleteBlock={onDeleteBlock}
                  hoveredBlockId={hoveredBlockId}
                  onBlockHover={onBlockHover}
                />
              );

            })}
            {!isSearching && dropBlockTargetId === null && draggedBlockId && <DropIndicator />}
            {isSearching && filteredSurveyBlocks.length === 0 && (
              <div className="p-4 text-center text-on-surface-variant">
                No results found.
              </div>
            )}
          </div>
        )}
        {activeTab === 'Library' && (
          <div className="bg-surface min-h-full">
            {libraryFilter === 'My questionnaires' ? (
              <div>
                <SidebarLibrarySurvey
                  id="customer_feedback"
                  title={customerFeedbackSurvey.title || 'Customer Feedback'}
                  isDragged={draggedLibraryId === 'customer_feedback'}
                  onDragStart={(e) => handleLibraryDragStart(e, 'customer_feedback')}
                  onDragEnd={handleLibraryDragEnd}
                  isExpanded={viewingLibrarySurveyId === 'customer_feedback'}
                  onClick={() => setViewingLibrarySurveyId(viewingLibrarySurveyId === 'customer_feedback' ? null : 'customer_feedback')}
                />
                {viewingLibrarySurveyId === 'customer_feedback' && (
                  <div className="">
                    {/* Render blocks of the library survey */}
                    {customerFeedbackSurvey.blocks.map(block => {
                      return (
                        <SidebarBlock
                          key={block.id}
                          block={block}
                          survey={customerFeedbackSurvey}
                          isSearching={false}
                          draggedBlockId={null}
                          dropBlockTargetId={null}
                          selectedBlock={null}
                          onSelectBlock={() => { }}
                          openMenuBlockId={null}
                          onToggleMenu={() => { }}
                          collapsedBlocks={new Set()}
                          checkedQuestions={new Set()}
                          logicIssues={[]}
                          handleBlockDragStart={() => { }}
                          handleBlockDragEnd={() => { }}
                          handleContentDragOver={() => { }}
                          handleContentDrop={() => { }}
                          handleContentDragLeave={() => { }}
                          handleContentDragStart={() => { }}
                          handleContentDragEnd={() => { }}
                          draggedContentId={null}
                          dropContentTarget={null}
                          selectedQuestion={null}
                          onSelectQuestion={() => { }}
                          questionTypeIconMap={questionTypeIconMap}
                          onDeleteQuestion={() => { }}
                          onCopyQuestion={() => { }}
                          onAddPageBreakAfterQuestion={() => { }}
                          onMoveQuestionToNewBlock={() => { }}
                          onUpdateQuestion={() => { }}
                          hoveredQuestionId={null}
                          onQuestionHover={() => { }}
                          onMoveBlockUp={() => { }}
                          onMoveBlockDown={() => { }}
                          onCopyBlock={() => { }}
                          onAddQuestionToBlock={() => { }}
                          onAddFromLibrary={() => { }}
                          onAddBlock={() => { }}
                          onSelectAllInBlock={() => { }}
                          onUnselectAllInBlock={() => { }}
                          onExpandBlock={() => { }}
                          onCollapseBlock={() => { }}
                          onDeleteBlock={() => { }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-on-surface-variant">
                Library content goes here.
              </div>
            )}
          </div>
        )}
      </div>
    </div >
  );
});

export default BuildPanel;