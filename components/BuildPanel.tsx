import React, { useState, useRef, useMemo, useEffect, memo, useCallback } from 'react';
import { SearchIcon, PanelLeftIcon, RadioIcon, WarningIcon, DragIndicatorIcon, ChevronDownIcon, DotsHorizontalIcon } from './icons';
import type { Survey, Question, ToolboxItemData, QuestionType, Block, LogicIssue } from '../types';
import { QuestionType as QTEnum } from '../types';
import { BlockActionsMenu, QuestionActionsMenu } from './ActionMenus';

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
}

const enabledToolboxItems = new Set(['Block', 'Page Break', 'Description', 'Checkbox', 'Radio Button', 'Text Entry', 'Choice Grid']);

const DropIndicator = ({ small = false }: { small?: boolean }) => (
  <div className={`px-4 ${small ? 'my-0' : 'my-1'}`}>
    <div className="relative h-px w-full bg-primary">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
    </div>
  </div>
);

const ContentQuestionItem = memo(({ question, isSelected, isQuestionDragged, showDropIndicator, onSelectQuestion, onDragStart, onDragEnd, TypeIcon, onCopyQuestion, onDeleteQuestion, onAddPageBreakAfterQuestion, onMoveQuestionToNewBlock, onUpdateQuestion }: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  const handleActivate = () => {
    onUpdateQuestion(question.id, { isHidden: false });
    setIsMenuOpen(false);
  };

  const handleDeactivate = () => {
    onUpdateQuestion(question.id, { isHidden: true });
    setIsMenuOpen(false);
  };

  const handlePreview = () => {
    onSelectQuestion(question, { tab: 'Preview' });
    setIsMenuOpen(false);
  };

  return (
    <>
      {showDropIndicator && <DropIndicator small />}
      <li
        data-question-id={question.id}
        draggable={true}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={() => onSelectQuestion(question)}
        className={`box-border flex flex-row items-center p-2 gap-2 h-[35px] rounded text-sm transition-all group relative border cursor-grab ${isSelected ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant hover:bg-surface-container-high'} ${isQuestionDragged ? 'opacity-30' : ''}`}
      >
        <div className="flex items-center flex-shrink-0">
          <TypeIcon className={`text-base mr-2 ${isSelected ? 'text-on-primary' : 'text-primary'}`} />
          {question.type === QTEnum.Description ? (
            <span className={`font-normal text-sm ${isSelected ? 'text-on-primary' : 'text-on-surface-variant'}`}>{question.label || 'Description'}</span>
          ) : (
            <span className={`font-semibold text-sm ${isSelected ? 'text-on-primary' : 'text-on-surface'}`}>{question.qid}</span>
          )}
        </div>
        <span className={`font-normal truncate flex-grow ${isSelected ? 'text-on-primary' : 'text-on-surface'}`}>{question.text}</span>

        <div className="relative ml-2 flex-shrink-0" ref={menuRef}>
          <button
            onClick={handleOpenMenu}
            className={`p-1 rounded-full transition-opacity ${isSelected ? 'text-on-primary hover:bg-white/20' : 'text-on-surface-variant hover:bg-surface-container-highest'} ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
            aria-label="Question actions"
          >
            <DotsHorizontalIcon className="text-base" />
          </button>
          {isMenuOpen && (
            <QuestionActionsMenu
              question={question}
              onDelete={() => { onDeleteQuestion(question.id); setIsMenuOpen(false); }}
              onDuplicate={() => { onCopyQuestion(question.id); setIsMenuOpen(false); }}
              onAddPageBreak={() => { onAddPageBreakAfterQuestion(question.id); setIsMenuOpen(false); }}
              onMoveToNewBlock={() => { onMoveQuestionToNewBlock(question.id); setIsMenuOpen(false); }}
              onPreview={handlePreview}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
            />
          )}
        </div>
      </li>
    </>
  );
});


const BuildPanel: React.FC<BuildPanelProps> = memo(({
  onClose, survey, onSelectQuestion, selectedQuestion, selectedBlock, onSelectBlock, checkedQuestions, collapsedBlocks, toolboxItems, logicIssues, onReorderToolbox, onReorderQuestion, onReorderBlock,
  onMoveBlockUp, onMoveBlockDown, onAddBlock, onCopyBlock, onAddQuestionToBlock, onExpandAllBlocks, onCollapseAllBlocks, onDeleteBlock, onDeleteQuestion, onCopyQuestion, onMoveQuestionToNewBlock,
  onMoveQuestionToExistingBlock, onAddPageBreakAfterQuestion, onExpandBlock, onCollapseBlock, onSelectAllInBlock, onUnselectAllInBlock, onUpdateQuestion
}) => {
  const [activeTab, setActiveTab] = useState('Content');
  const [searchTerm, setSearchTerm] = useState('');
  const [questionTypeFilter, setQuestionTypeFilter] = useState('All content');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const contentListRef = useRef<HTMLDivElement>(null);

  const [draggedToolboxIndex, setDraggedToolboxIndex] = useState<number | null>(null);
  const [dropToolboxTargetIndex, setDropToolboxTargetIndex] = useState<number | null>(null);
  const toolboxListRef = useRef<HTMLUListElement>(null);

  const [draggedContentId, setDraggedContentId] = useState<string | null>(null);
  const [dropContentTarget, setDropContentTarget] = useState<{ blockId: string, questionId: string | null } | null>(null);

  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dropBlockTargetId, setDropBlockTargetId] = useState<string | null>(null);

  const [openMenuBlockId, setOpenMenuBlockId] = useState<string | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const isSearching = !!searchTerm || !['All content', 'All question types'].includes(questionTypeFilter);
  const isTextSearching = !!searchTerm;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setOpenMenuBlockId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = useCallback((tabName: string) => {
    if (activeTab !== tabName) {
      if (selectedQuestion) {
        onSelectQuestion(null);
      }
      setQuestionTypeFilter('All content');
    }
    setActiveTab(tabName);
  }, [activeTab, onSelectQuestion, selectedQuestion]);

  const filteredToolboxItems = useMemo(() => {
    if (!searchTerm) return toolboxItems;
    return toolboxItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [toolboxItems, searchTerm]);

  const questionTypeFilterOptions = useMemo(() => {
    const types = new Set(toolboxItems
      .filter(item => item.name !== 'Block' && item.name !== 'Page Break')
      .map(item => item.name)
    );
    return ['All content', 'All question types', 'Issues', ...Array.from(types)];
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

  return (
    <div className="w-80 bg-surface-container border-r border-outline-variant flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-outline-variant">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: "'Open Sans', sans-serif" }}>Build</h2>
          <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-high" aria-label="Collapse build panel">
            <PanelLeftIcon className="text-xl" />
          </button>
        </div>
      </div>
      <div className="px-4 border-b border-outline-variant">
        <nav className="-mb-px flex space-x-6">
          {['Toolbox', 'Content', 'Library'].map(tab => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
                }`}
              style={{ fontFamily: "'Open Sans', sans-serif" }}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 border-b border-outline-variant">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-xl text-on-surface-variant" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent border border-input-border rounded-md py-2 pl-10 pr-4 text-sm text-on-surface focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          />
        </div>
        {activeTab === 'Content' && (
          <div className="relative mt-3" ref={filterDropdownRef}>
            <button
              onClick={() => setIsFilterDropdownOpen(prev => !prev)}
              className="w-full flex items-center justify-between bg-transparent border border-input-border rounded-md py-2 px-4 text-sm text-left text-on-surface focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            >
              <div className="flex items-center truncate">
                {(() => {
                  if (questionTypeFilter === 'Issues') {
                    return <WarningIcon className="text-base mr-2 text-error flex-shrink-0" />;
                  }
                  const IconComponent = questionTypeIconMap.get(questionTypeFilter);
                  return IconComponent ? (
                    <IconComponent className="text-base mr-2 text-primary flex-shrink-0" />
                  ) : (
                    <div className="w-4 mr-2 flex-shrink-0" />
                  );
                })()}
                <span className="truncate">{questionTypeFilter}</span>
              </div>
              <ChevronDownIcon className="text-base text-on-surface-variant flex-shrink-0" />
            </button>
            {isFilterDropdownOpen && (
              <ul className="absolute top-full left-0 right-0 mt-1 w-full max-h-60 overflow-y-auto bg-surface-container border border-outline-variant rounded-md shadow-lg z-20 py-1">
                {questionTypeFilterOptions.map(option => {
                  const IconComponent = option === 'Issues' ? WarningIcon : questionTypeIconMap.get(option);
                  const isEnabled = option === 'All content' || option === 'All question types' || option === 'Issues' || enabledToolboxItems.has(option);
                  return (
                    <li key={option}>
                      <button
                        onClick={() => {
                          if (!isEnabled) return;
                          setQuestionTypeFilter(option);
                          setIsFilterDropdownOpen(false);
                        }}
                        disabled={!isEnabled}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center ${isEnabled
                          ? 'text-on-surface hover:bg-surface-container-high'
                          : 'text-on-surface-variant opacity-70 cursor-not-allowed'
                          }`}
                      >
                        {IconComponent ? (
                          <IconComponent className={`text-base mr-2 flex-shrink-0 ${isEnabled ? (option === 'Issues' ? 'text-error' : 'text-primary') : 'text-on-surface-variant'}`} />
                        ) : (
                          <div className="w-4 mr-2 flex-shrink-0" />
                        )}
                        <span className="truncate">{option}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-visible">
        {activeTab === 'Toolbox' && (
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
                  <li
                    draggable={isEnabled && !isTextSearching}
                    onDragStart={isEnabled && !isTextSearching ? (e) => handleToolboxDragStart(e, index, item) : undefined}
                    onDragEnd={isEnabled && !isTextSearching ? handleToolboxDragEnd : undefined}
                    className={`flex items-center px-4 py-3 border-b border-outline-variant/50 transition-all ${isEnabled ? 'hover:bg-surface-container-high cursor-grab' : 'opacity-50 cursor-not-allowed'
                      } ${draggedToolboxIndex === index ? 'opacity-30' : ''}`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`text-xl mr-3 ${isEnabled ? 'text-primary' : 'text-on-surface-variant'}`} />
                      <span className={`text-sm ${isEnabled ? 'text-on-surface' : 'text-on-surface-variant'}`} style={{ fontFamily: "'Open Sans', sans-serif" }}>{item.name}</span>
                    </div>
                  </li>
                </React.Fragment>
              )
            })}
            {!isTextSearching && dropToolboxTargetIndex === filteredToolboxItems.length && <DropIndicator />}
          </ul>
        )}
        {activeTab === 'Content' && (
          <div
            ref={contentListRef}
            style={{ fontFamily: "'Open Sans', sans-serif" }}
            onDragOver={!isSearching ? handleBlockDragOver : undefined}
            onDrop={!isSearching ? handleBlockDrop : undefined}
            onDragLeave={!isSearching ? () => setDropBlockTargetId(null) : undefined}
          >
            {filteredSurveyBlocks.map((block, index) => {
              const isBlockDragged = draggedBlockId === block.id;
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

              return (
                <React.Fragment key={block.id}>
                  {!isSearching && showBlockDropIndicator && <DropIndicator />}
                  <div
                    data-block-id={block.id}
                    className={isBlockDragged ? 'opacity-30' : ''}
                  >
                    <div
                      draggable={!isSearching}
                      onDragStart={!isSearching ? (e) => handleBlockDragStart(e, block.id) : undefined}
                      onDragEnd={!isSearching ? handleBlockDragEnd : undefined}
                      onClick={() => onSelectBlock(block)}
                      className={`px-4 py-2 cursor-pointer border-b border-t border-outline-variant flex items-center justify-between ${isSelected ? 'bg-primary-container' : 'bg-surface-container-high'}`}
                    >
                      <div className="flex items-center cursor-grab flex-grow truncate">
                        <DragIndicatorIcon className="text-base mr-2 text-on-surface-variant flex-shrink-0" />
                        <h3 className="text-sm font-semibold text-on-surface truncate">
                          <span className="font-bold mr-2">{block.bid}</span>
                          {block.title}
                          <span className="font-normal text-on-surface-variant ml-1">({questionCount})</span>
                        </h3>
                      </div>
                      <div className="relative flex-shrink-0" ref={openMenuBlockId === block.id ? actionsMenuRef : null}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuBlockId(openMenuBlockId === block.id ? null : block.id); }}
                          className="text-on-surface-variant hover:bg-surface-container-highest p-1 rounded-full"
                        >
                          <DotsHorizontalIcon className="text-base" />
                        </button>
                        {openMenuBlockId === block.id && (
                          <BlockActionsMenu
                            onEdit={() => { onSelectBlock(block); setOpenMenuBlockId(null); }}
                            onMoveUp={() => { onMoveBlockUp(block.id); setOpenMenuBlockId(null); }}
                            canMoveUp={canMoveUp}
                            onMoveDown={() => { onMoveBlockDown(block.id); setOpenMenuBlockId(null); }}
                            canMoveDown={canMoveDown}
                            onDuplicate={() => { onCopyBlock(block.id); setOpenMenuBlockId(null); }}
                            onAddSimpleQuestion={() => { onAddQuestionToBlock(block.id, QTEnum.Checkbox); setOpenMenuBlockId(null); }}
                            onAddFromLibrary={() => { alert('Add from library functionality not implemented.'); setOpenMenuBlockId(null); }}
                            onAddBlockAbove={() => { onAddBlock(block.id, 'above'); setOpenMenuBlockId(null); }}
                            onAddBlockBelow={() => { onAddBlock(block.id, 'below'); setOpenMenuBlockId(null); }}
                            onSelectAll={() => { onSelectAllInBlock(block.id); setOpenMenuBlockId(null); }}
                            canSelectAll={canSelectAll}
                            onUnselectAll={() => { onUnselectAllInBlock(block.id); setOpenMenuBlockId(null); }}
                            canUnselectAll={canUnselectAll}
                            onExpand={() => { onExpandBlock(block.id); setOpenMenuBlockId(null); }}
                            canExpand={canExpand}
                            onCollapse={() => { onCollapseBlock(block.id); setOpenMenuBlockId(null); }}
                            canCollapse={canCollapse}
                            onDelete={() => { onDeleteBlock(block.id); setOpenMenuBlockId(null); }}
                          />
                        )}
                      </div>
                    </div>
                    <ul
                      className="p-2 space-y-1"
                      onDragOver={!isSearching ? (e) => handleContentDragOver(e, block.id) : undefined}
                      onDrop={!isSearching ? handleContentDrop : undefined}
                      onDragLeave={!isSearching ? handleContentDragLeave : undefined}
                    >
                      {block.questions.map(question => (
                        <ContentQuestionItem
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
                        />
                      ))}
                      {!isSearching && dropContentTarget?.blockId === block.id && dropContentTarget.questionId === null && <DropIndicator small />}
                    </ul>
                  </div>
                </React.Fragment>
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
          <div className="p-4 text-center text-on-surface-variant">
            Library content goes here.
          </div>
        )}
      </div>
    </div>
  );
});

export default BuildPanel;