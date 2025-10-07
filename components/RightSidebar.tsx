import React, { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Survey, Question, ToolboxItemData, Choice, DisplayLogicCondition, SkipLogicRule, RandomizationMethod, CarryForwardLogic, BranchingLogic, Branch, BranchingCondition, LogicIssue } from '../types';
import { QuestionType } from '../types';
import { generateId, parseChoice, CHOICE_BASED_QUESTION_TYPES, truncate } from '../utils';
import { PasteChoicesModal } from './PasteChoicesModal';
import { 
    XIcon, PlusIcon, ExpandIcon, CollapseIcon, ChevronDownIcon, DragIndicatorIcon,
    MoreVertIcon, ArrowRightAltIcon,
    SignalIcon, BatteryIcon, RadioButtonUncheckedIcon, CheckboxOutlineIcon,
    RadioIcon, CheckboxFilledIcon, ShuffleIcon,
    InfoIcon, EyeIcon, ContentPasteIcon, CarryForwardIcon, CallSplitIcon,
    WarningIcon, CheckmarkIcon
} from './icons';
import { QuestionTypeSelectionMenuContent } from './ActionMenus';

interface RightSidebarProps {
  question: Question;
  survey: Survey;
  logicIssues: LogicIssue[];
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  onAddChoice: (questionId: string) => void;
  onDeleteChoice: (questionId: string, choiceId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  toolboxItems: ToolboxItemData[];
  onRequestGeminiHelp: (topic: string) => void;
}

const ChoiceDropIndicator = () => <div className="h-px bg-primary w-full my-1" />;

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultExpanded?: boolean }> = ({ title, children, defaultExpanded = true }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left group"
                aria-expanded={isExpanded}
            >
                <h3 className="text-base font-semibold text-on-surface">{title}</h3>
                <ChevronDownIcon className={`text-xl text-on-surface-variant transition-transform duration-200 group-hover:text-on-surface ${isExpanded ? '' : '-rotate-90'}`} />
            </button>
            {isExpanded && (
                <div className="mt-4 divide-y divide-outline-variant">
                    {children}
                </div>
            )}
        </div>
    );
};

const PasteInlineForm: React.FC<{
  onSave: (text: string) => { success: boolean; error?: string };
  onCancel: () => void;
  placeholder: string;
  primaryActionLabel: string;
  disclosureText: string;
  helpTopic: string;
  onRequestGeminiHelp: (topic: string) => void;
}> = ({ onSave, onCancel, placeholder, primaryActionLabel, disclosureText, helpTopic, onRequestGeminiHelp }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (!text.trim()) {
      onCancel();
      return;
    }
    const result = onSave(text.trim());
    if (result.success) {
      onCancel(); // Close form after saving
    } else {
      setError(result.error || 'Invalid syntax.');
    }
  };

  return (
    <div className={`p-3 bg-surface-container-high rounded-md border ${error ? 'border-error' : 'border-outline-variant'}`}>
      <div className="text-xs text-on-surface-variant mb-2 flex items-center gap-1 flex-wrap">
        <InfoIcon className="text-sm flex-shrink-0" />
        <span>{disclosureText}</span>
        <button onClick={() => onRequestGeminiHelp(helpTopic)} className="text-primary hover:underline font-medium">learn more</button>
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError(null);
        }}
        rows={4}
        className={`w-full bg-surface border rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary font-mono ${error ? 'border-error' : 'border-outline'}`}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-xs text-error mt-2">{error}</p>
      )}
      <div className="mt-2 flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-xs font-semibold text-primary rounded-full hover:bg-primary-container">Cancel</button>
        <button onClick={handleSave} className="px-4 py-1.5 text-xs font-semibold text-on-primary bg-primary rounded-full hover:opacity-90">{primaryActionLabel}</button>
      </div>
    </div>
  );
};


const CopyAndPasteButton: React.FC<{ onClick: () => void; className?: string }> = ({ onClick, className = 'text-sm' }) => (
    <button 
        onClick={onClick} 
        className={`flex items-center gap-1 ${className} font-medium text-primary hover:underline transition-colors`}
    >
        <ContentPasteIcon className="text-base" />
        <span>Copy and paste</span>
    </button>
);


const RightSidebar: React.FC<RightSidebarProps> = memo(({
  question,
  survey,
  logicIssues,
  onClose,
  activeTab,
  onTabChange,
  onUpdateQuestion,
  onAddChoice,
  onDeleteChoice,
  isExpanded,
  onToggleExpand,
  toolboxItems,
  onRequestGeminiHelp,
}) => {
  const [questionText, setQuestionText] = useState(question.text);
  const [expandedChoiceId, setExpandedChoiceId] = useState<string | null>(null);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [draggedChoiceId, setDraggedChoiceId] = useState<string | null>(null);
  const [dropTargetChoiceId, setDropTargetChoiceId] = useState<string | null>(null);
  const [selectedPreviewChoices, setSelectedPreviewChoices] = useState<Set<string>>(new Set());
  
  const allSurveyQuestions = useMemo(() => survey.blocks.flatMap(b => b.questions), [survey]);
  const currentQuestionIndex = useMemo(() => allSurveyQuestions.findIndex(q => q.id === question.id), [allSurveyQuestions, question.id]);
  
  const previousQuestions = useMemo(() => 
      allSurveyQuestions
          .slice(0, currentQuestionIndex)
          .filter(q => q.type !== QuestionType.PageBreak && q.type !== QuestionType.Description),
      [allSurveyQuestions, currentQuestionIndex]
  );
  
  const logicSourceQuestions = useMemo(() => 
      allSurveyQuestions
          .filter(q => 
              q.id !== question.id && 
              q.type !== QuestionType.PageBreak && 
              q.type !== QuestionType.Description
          ),
      [allSurveyQuestions, question.id]
  );

  const followingQuestions = useMemo(() => 
      allSurveyQuestions
          .slice(currentQuestionIndex + 1)
          .filter(q => q.type !== QuestionType.PageBreak && q.type !== QuestionType.Description),
      [allSurveyQuestions, currentQuestionIndex]
  );

  const isChoiceBased = useMemo(() => CHOICE_BASED_QUESTION_TYPES.has(question.type), [question.type]);

  const availableTabs = useMemo(() => {
    const tabs = ['Settings', 'Behavior', 'Preview'];
    if (isChoiceBased || question.type === QuestionType.TextEntry) {
      tabs.push('Advanced');
    }
    return tabs;
  }, [isChoiceBased, question.type]);
  
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      onTabChange('Settings');
    }
  }, [availableTabs, activeTab, onTabChange]);

  useEffect(() => {
    setQuestionText(question.text);
    setExpandedChoiceId(null);
    setIsTypeMenuOpen(false);
    setSelectedPreviewChoices(new Set());
  }, [question]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (typeMenuRef.current && !typeMenuRef.current.contains(event.target as Node)) {
            setIsTypeMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdate = useCallback((updates: Partial<Question>) => {
    onUpdateQuestion(question.id, updates);
  }, [question.id, onUpdateQuestion]);

  const ensureSidebarIsExpanded = useCallback(() => {
    if (!isExpanded) {
        onToggleExpand();
    }
  }, [isExpanded, onToggleExpand]);

  const handleTypeSelect = useCallback((newType: QuestionType) => {
    handleUpdate({ type: newType });
    setIsTypeMenuOpen(false);
  }, [handleUpdate]);

  const handleChoiceDragStart = useCallback((e: React.DragEvent, choiceId: string) => {
    setDraggedChoiceId(choiceId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleChoiceDragOver = useCallback((e: React.DragEvent, choiceId: string) => {
      e.preventDefault();
      if (draggedChoiceId !== choiceId) {
          setDropTargetChoiceId(choiceId);
      }
  }, [draggedChoiceId]);

  const handleChoiceDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      
      if (!draggedChoiceId || !question.choices) return;
      
      const choices = [...question.choices];
      const draggedIndex = choices.findIndex(c => c.id === draggedChoiceId);
      if (draggedIndex === -1) return;
      
      const [draggedItem] = choices.splice(draggedIndex, 1);
      
      if (dropTargetChoiceId === null) {
          choices.push(draggedItem);
      } else {
          const dropIndex = choices.findIndex(c => c.id === dropTargetChoiceId);
          if (dropIndex !== -1) {
              choices.splice(dropIndex, 0, draggedItem);
          } else {
              choices.push(draggedItem); // Fallback
          }
      }
      
      handleUpdate({ choices });
      setDraggedChoiceId(null);
      setDropTargetChoiceId(null);
  }, [draggedChoiceId, dropTargetChoiceId, question.choices, handleUpdate]);
  
  const handleChoiceDragEnd = useCallback((e: React.DragEvent) => {
      setDraggedChoiceId(null);
      setDropTargetChoiceId(null);
  }, []);
  
  const handleChoicePropertyChange = (choiceId: string, property: keyof Choice, value: any) => {
    const newChoices = (question.choices || []).map(c => 
        c.id === choiceId ? { ...c, [property]: value } : c
    );
    handleUpdate({ choices: newChoices });
  };
  
  const handleChoiceTextChange = (choiceId: string, newLabel: string) => {
    const newChoices = (question.choices || []).map(c => {
        if (c.id === choiceId) {
            const { variable } = parseChoice(c.text);
            const newText = variable ? `${variable} ${newLabel}` : newLabel;
            return { ...c, text: newText };
        }
        return c;
    });
    handleUpdate({ choices: newChoices });
  };

  const handleTextBlur = () => {
    if (questionText.trim() !== question.text) {
      handleUpdate({ text: questionText.trim() });
    }
  };

  const handlePasteChoices = (pastedText: string) => {
    const lines = pastedText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return;

    // The renumbering logic will handle adding variables automatically
    const newChoices: Choice[] = lines.map(line => ({
      id: generateId('c'),
      text: line.trim(),
    }));

    handleUpdate({ choices: newChoices });
  };

  const handlePreviewChoiceClick = useCallback((choiceId: string) => {
    if (question.type === QuestionType.Radio) {
        setSelectedPreviewChoices(new Set([choiceId]));
    } else if (question.type === QuestionType.Checkbox) {
        setSelectedPreviewChoices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(choiceId)) {
                newSet.delete(choiceId);
            } else {
                newSet.add(choiceId);
            }
            return newSet;
        });
    }
  }, [question.type]);

  const CurrentQuestionTypeInfo = toolboxItems.find(item => item.name === question.type);
  const initialChoicesText = (question.choices || []).map(c => parseChoice(c.text).label).join('\n');

  // =================================================================
  // CHOICE-BASED QUESTION RENDER FUNCTIONS
  // =================================================================

  const renderChoiceBasedSettingsTab = () => {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Question Type
                </label>
                <div className="relative" ref={typeMenuRef}>
                <button
                    onClick={() => setIsTypeMenuOpen(prev => !prev)}
                    className="w-full flex items-center gap-2 text-left bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                    aria-haspopup="true"
                    aria-expanded={isTypeMenuOpen}
                >
                    {CurrentQuestionTypeInfo ? <CurrentQuestionTypeInfo.icon className="text-base text-primary flex-shrink-0" /> : <div className="w-4 h-4 mr-3 flex-shrink-0" />}
                    <span className="flex-grow">{question.type}</span>
                    <ChevronDownIcon className="text-lg text-on-surface-variant flex-shrink-0" />
                </button>
                {isTypeMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-10">
                    <QuestionTypeSelectionMenuContent onSelect={handleTypeSelect} toolboxItems={toolboxItems} />
                    </div>
                )}
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Changing type may reset some settings</p>
            </div>
    
            <div className="flex items-center justify-between">
                <div>
                <label htmlFor="allow-multiple" className="text-sm font-medium text-on-surface">
                    Allow Multiple Answers
                </label>
                <p className="text-xs text-on-surface-variant mt-0.5">Convert to Checkbox question type</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    id="allow-multiple"
                    checked={question.type === QuestionType.Checkbox}
                    onChange={(e) => handleUpdate({ type: e.target.checked ? QuestionType.Checkbox : QuestionType.Radio })}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
            
            <div>
                <label htmlFor="answer-format" className="block text-sm font-medium text-on-surface-variant mb-1">Answer Format</label>
                <div className="relative">
                    <select id="answer-format" value={question.answerFormat || 'list'} onChange={e => handleUpdate({ answerFormat: e.target.value as any })} className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none">
                        <option value="list">List (Vertical)</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="horizontal">Horizontal List</option>
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
            </div>

            <div>
                <label htmlFor="question-text" className="block text-sm font-medium text-on-surface-variant mb-1">
                Question Text
                </label>
                <textarea
                id="question-text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                onBlur={handleTextBlur}
                rows={4}
                className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                placeholder="Enter your question here..."
                />
                <p className="text-xs text-on-surface-variant mt-1">Maximum 5000 characters</p>
            </div>
    
            <div>
                <h3 className="text-sm font-medium text-on-surface-variant mb-2">Choices</h3>
                <div 
                    className="space-y-2"
                    onDrop={handleChoiceDrop}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDropTargetChoiceId(null);
                    }}
                >
                {(question.choices || []).map((choice) => (
                    <React.Fragment key={choice.id}>
                    {dropTargetChoiceId === choice.id && <ChoiceDropIndicator />}
                    <div 
                        className="group"
                        draggable
                        onDragStart={(e) => handleChoiceDragStart(e, choice.id)}
                        onDragOver={(e) => {
                            e.stopPropagation();
                            handleChoiceDragOver(e, choice.id);
                        }}
                        onDragEnd={handleChoiceDragEnd}
                    >
                        <div className={`flex items-center gap-2 transition-opacity ${draggedChoiceId === choice.id ? 'opacity-30' : ''}`}>
                            <span className="text-on-surface-variant hover:text-on-surface cursor-grab active:cursor-grabbing" aria-label="Reorder choice">
                                <DragIndicatorIcon className="text-lg" />
                            </span>
                            <input
                                type="text"
                                value={parseChoice(choice.text).label}
                                onChange={(e) => handleChoiceTextChange(choice.id, e.target.value)}
                                className="flex-grow bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                                placeholder="Enter choice text"
                            />
                            <button onClick={() => setExpandedChoiceId(expandedChoiceId === choice.id ? null : choice.id)} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full" aria-label="More options">
                                <MoreVertIcon className="text-lg" />
                            </button>
                            <button onClick={() => onDeleteChoice(question.id, choice.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full" aria-label="Delete choice">
                                <XIcon className="text-lg" />
                            </button>
                        </div>
                        {expandedChoiceId === choice.id && (
                        <div className="ml-8 mt-2 p-3 bg-surface-container-high rounded-md space-y-3">
                            <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-on-surface-variant">Visible</label>
                            <input type="checkbox" checked={choice.visible ?? true} onChange={e => handleChoicePropertyChange(choice.id, 'visible', e.target.checked)} className="accent-primary" />
                            </div>
                            <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-on-surface-variant">Allow Text Entry</label>
                            <div className="flex items-center justify-end">
                                <input type="checkbox" checked={choice.allowTextEntry ?? false} onChange={e => handleChoicePropertyChange(choice.id, 'allowTextEntry', e.target.checked)} className="accent-primary" />
                            </div>
                            </div>
                        </div>
                        )}
                    </div>
                    </React.Fragment>
                ))}
                {dropTargetChoiceId === null && draggedChoiceId && <ChoiceDropIndicator />}
                </div>
                <div className="mt-3 flex items-center gap-4">
                    <button onClick={() => onAddChoice(question.id)} className="flex items-center text-sm font-medium text-primary hover:underline"><PlusIcon className="text-base mr-1" /> Choice</button>
                    <CopyAndPasteButton onClick={() => setIsPasteModalOpen(true)} />
                </div>
            </div>
        </div>
    );
  };
  
  const renderChoiceBasedAdvancedTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-on-surface mb-2">Display & Layout</h3>
        <p className="text-xs text-on-surface-variant mb-4">Fine-tune the appearance of choices.</p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="choice-orientation" className="block text-sm font-medium text-on-surface-variant mb-1">Choice Orientation</label>
            <div className="relative">
                <select 
                  id="choice-orientation" 
                  value={question.advancedSettings?.choiceOrientation || 'vertical'} 
                  onChange={e => handleUpdate({ advancedSettings: { ...question.advancedSettings, choiceOrientation: e.target.value as any } })} 
                  className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                >
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                    <option value="grid">Grid</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            </div>
          </div>

          {question.advancedSettings?.choiceOrientation === 'grid' && (
            <div>
              <label htmlFor="num-columns" className="block text-sm font-medium text-on-surface-variant mb-1">Number of Columns</label>
              <input
                type="number"
                id="num-columns"
                min="2"
                max="10"
                value={question.advancedSettings?.numColumns || 2}
                onChange={e => handleUpdate({ advancedSettings: { ...question.advancedSettings, numColumns: parseInt(e.target.value, 10) } })}
                className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
              />
            </div>
          )}

          <div>
            <label htmlFor="choice-width" className="block text-sm font-medium text-on-surface-variant mb-1">Choice Width</label>
            <div className="relative">
                <select 
                  id="choice-width" 
                  value={question.advancedSettings?.choiceWidth || 'auto'} 
                  onChange={e => handleUpdate({ advancedSettings: { ...question.advancedSettings, choiceWidth: e.target.value as any } })} 
                  className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                >
                    <option value="auto">Auto</option>
                    <option value="full">Full Width</option>
                    <option value="fixed">Fixed</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChoiceBasedPreviewTab = () => {
    return (
        <div>
          {!isExpanded ? (
            <div className="flex justify-center pt-4">
                <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                    <div className="w-[140px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                    <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                    <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                    <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                    <div className="rounded-[2rem] overflow-hidden w-full h-full bg-surface">
                        <div className="px-4 py-2 flex justify-between items-center text-xs text-on-surface-variant font-sans font-bold">
                            <span>12:29</span>
                            <div className="flex items-center gap-1">
                                <SignalIcon className="text-base" />
                                <BatteryIcon className="text-base" />
                            </div>
                        </div>
                        <div className="p-4 overflow-y-auto h-[calc(100%-32px)]">
                            <header className="mb-4">
                                <h1 className="text-sm font-semibold text-on-surface text-left">{survey.title}</h1>
                            </header>
                            <div className="border-t border-outline-variant my-4"></div>
                            <p className="text-lg text-on-surface mb-6" dangerouslySetInnerHTML={{ __html: questionText || 'Question text will appear here' }}/>
                            <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant overflow-hidden">
                                {(question.choices || []).filter(c => c.visible !== false).map(choice => {
                                    const isSelected = selectedPreviewChoices.has(choice.id);
                                    return (
                                        <div 
                                            key={choice.id} 
                                            className={`flex items-center gap-4 p-3 cursor-pointer transition-colors ${isSelected ? 'bg-primary-container' : 'bg-surface-container-high'}`}
                                            onClick={() => handlePreviewChoiceClick(choice.id)}
                                        >
                                            {question.type === QuestionType.Radio ? (
                                                isSelected ? 
                                                    <RadioIcon className="text-2xl text-primary flex-shrink-0" /> : 
                                                    <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                                            ) : (
                                                isSelected ?
                                                    <CheckboxFilledIcon className="text-2xl text-primary flex-shrink-0" /> :
                                                    <CheckboxOutlineIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                                            )}
                                            <span className={`text-sm ${isSelected ? 'text-on-primary-container font-medium' : 'text-on-surface'}`} dangerouslySetInnerHTML={{ __html: parseChoice(choice.text).label }} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <div>
              <header className="mb-8">
                  <h1 className="text-xl font-bold text-on-surface text-left">{survey.title}</h1>
              </header>
              <div className="space-y-4">
                <p className="text-xl font-medium text-on-surface" dangerouslySetInnerHTML={{ __html: questionText || 'Question text will appear here' }} />
                <div className={`space-y-3 ${question.answerFormat === 'horizontal' ? 'flex flex-wrap gap-4' : 'flex flex-col'}`}>
                  {(question.choices || []).filter(c => c.visible !== false).map(choice => {
                    const isSelected = selectedPreviewChoices.has(choice.id);
                    return (
                        <div
                            key={choice.id}
                            onClick={() => handlePreviewChoiceClick(choice.id)}
                            className={`flex items-center gap-3 p-3 rounded-md cursor-pointer border transition-colors ${isSelected ? 'bg-primary-container border-primary shadow-sm' : 'hover:bg-surface-container-high border-outline-variant'}`}
                        >
                          {question.type === QuestionType.Radio ? (
                              isSelected ?
                                <RadioIcon className="text-2xl text-primary flex-shrink-0" /> :
                                <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                          ) : (
                              isSelected ?
                                <CheckboxFilledIcon className="text-2xl text-primary flex-shrink-0" /> :
                                <CheckboxOutlineIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                          )}
                          <span className={`text-base ${isSelected ? 'text-on-primary-container font-medium' : 'text-on-surface'}`} dangerouslySetInnerHTML={{ __html: parseChoice(choice.text).label }} />
                        </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
    );
  }

  // =================================================================
  // TEXT ENTRY QUESTION RENDER FUNCTIONS
  // =================================================================

  const renderTextEntrySettingsTab = () => {
    const textEntrySettings = question.textEntrySettings || {};
    const validation = textEntrySettings.validation || {};
    
    const handleUpdateSettings = (updates: Partial<typeof textEntrySettings>) => {
        handleUpdate({ textEntrySettings: { ...textEntrySettings, ...updates }});
    };
    
    const handleUpdateValidation = (updates: Partial<typeof validation>) => {
        handleUpdateSettings({ validation: { ...validation, ...updates }});
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Question Type
                </label>
                <div className="relative" ref={typeMenuRef}>
                <button
                    onClick={() => setIsTypeMenuOpen(prev => !prev)}
                    className="w-full flex items-center gap-2 text-left bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                    aria-haspopup="true"
                    aria-expanded={isTypeMenuOpen}
                >
                    {CurrentQuestionTypeInfo ? <CurrentQuestionTypeInfo.icon className="text-base text-primary flex-shrink-0" /> : <div className="w-4 h-4 mr-3 flex-shrink-0" />}
                    <span className="flex-grow">{question.type}</span>
                    <ChevronDownIcon className="text-lg text-on-surface-variant flex-shrink-0" />
                </button>
                {isTypeMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-10">
                    <QuestionTypeSelectionMenuContent onSelect={handleTypeSelect} toolboxItems={toolboxItems} />
                    </div>
                )}
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Changing type may reset some settings</p>
            </div>
            <div>
                <label htmlFor="content-type" className="block text-sm font-medium text-on-surface-variant mb-1">Content Type Validation</label>
                <div className="relative">
                <select
                    id="content-type"
                    value={validation.contentType || 'none'}
                    onChange={e => handleUpdateValidation({ contentType: e.target.value as any })}
                    className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                >
                    <option value="none">None (any text)</option>
                    <option value="email">Email Address</option>
                    <option value="phone">Phone Number</option>
                    <option value="number">Number Only</option>
                    <option value="url">URL/Website</option>
                    <option value="date">Date (YYYY-MM-DD)</option>
                    <option value="postal_code">Postal/Zip Code</option>
                    <option value="custom_regex">Custom Pattern (Regex)</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                </div>
                {validation.contentType === 'custom_regex' && (
                    <div className="mt-2 ml-4 p-3 bg-surface-container-high rounded-md">
                        <label htmlFor="custom-regex" className="block text-sm font-medium text-on-surface-variant mb-1">Custom Regex Pattern</label>
                        <input
                            type="text"
                            id="custom-regex"
                            value={validation.customRegex || ''}
                            onChange={(e) => handleUpdateValidation({ customRegex: e.target.value })}
                            className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary font-mono"
                            placeholder="^[A-Z]{2}[0-9]{4}$"
                        />
                    </div>
                )}
            </div>
            <div>
                <label htmlFor="question-text" className="block text-sm font-medium text-on-surface-variant mb-1">Question Text</label>
                <textarea
                id="question-text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                onBlur={handleTextBlur}
                rows={4}
                className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary resize-y"
                placeholder="Enter your question here..."
                />
                <p className="text-xs text-on-surface-variant mt-1">Maximum 5000 characters</p>
            </div>
            <div>
                <label htmlFor="answer-length" className="block text-sm font-medium text-on-surface-variant mb-1">Answer Length</label>
                <div className="relative">
                <select
                    id="answer-length"
                    value={textEntrySettings.answerLength || 'short'}
                    onChange={e => handleUpdateSettings({ answerLength: e.target.value as any })}
                    className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                >
                    <option value="short">Short Answer (1 line)</option>
                    <option value="paragraph">Paragraph (4 lines)</option>
                    <option value="essay">Essay (8+ lines)</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                </div>
            </div>
            <div>
                <label htmlFor="placeholder" className="block text-sm font-medium text-on-surface-variant mb-1">Placeholder Text</label>
                <input
                    type="text"
                    id="placeholder"
                    value={textEntrySettings.placeholder || ''}
                    onChange={(e) => handleUpdateSettings({ placeholder: e.target.value })}
                    className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                    placeholder="e.g., Enter your answer here..."
                />
            </div>

             <div>
                <h3 className="text-sm font-medium text-on-surface mb-3">Validation</h3>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                    <label htmlFor="require-answer" className="text-sm font-medium text-on-surface block">Require Answer</label>
                    <p className="text-xs text-on-surface-variant mt-0.5">Respondent must answer to continue</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="require-answer" checked={question.forceResponse || false} onChange={(e) => handleUpdate({ forceResponse: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                {question.forceResponse && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Character Length</label>
                        <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="min-length" className="block text-xs font-medium text-on-surface-variant mb-1">Minimum</label>
                            <input
                            type="number"
                            id="min-length"
                            min="0"
                            value={validation.minLength || ''}
                            onChange={(e) => handleUpdateValidation({ minLength: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                            placeholder="0"
                            />
                        </div>
                        <div>
                            <label htmlFor="max-length" className="block text-xs font-medium text-on-surface-variant mb-1">Maximum</label>
                            <input
                            type="number"
                            id="max-length"
                            min="1"
                            value={validation.maxLength || ''}
                            onChange={(e) => handleUpdateValidation({ maxLength: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                            placeholder="5000"
                            />
                        </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderTextEntryAdvancedTab = () => {
    const textEntrySettings = question.textEntrySettings || {};
    const advanced = textEntrySettings.advanced || {};

    const handleUpdateSettings = (updates: Partial<typeof textEntrySettings>) => {
        handleUpdate({ textEntrySettings: { ...textEntrySettings, ...updates }});
    };

    const handleUpdateAdvanced = (updates: Partial<typeof advanced>) => {
        handleUpdateSettings({ advanced: { ...advanced, ...updates }});
    };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-semibold text-on-surface uppercase tracking-wide mb-3">Display Options</h4>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                        <label htmlFor="show-char-counter" className="text-sm font-medium text-on-surface block">Show Character Counter</label>
                        <p className="text-xs text-on-surface-variant mt-0.5">Display character count below text box</p>
                    </div>
                    <input type="checkbox" id="show-char-counter" checked={advanced.showCharCounter || false} onChange={(e) => handleUpdateAdvanced({ showCharCounter: e.target.checked })} className="w-5 h-5 accent-primary cursor-pointer" />
                </div>
                {advanced.showCharCounter && (
                <div className="ml-4 mb-4 p-3 bg-surface-container-high rounded-md">
                    <label htmlFor="counter-type" className="block text-sm font-medium text-on-surface-variant mb-1">Counter Display</label>
                    <div className="relative">
                        <select
                            id="counter-type"
                            value={advanced.counterType || 'remaining'}
                            onChange={(e) => handleUpdateAdvanced({ counterType: e.target.value as any })}
                            className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                        >
                            <option value="remaining">Characters Remaining</option>
                            <option value="used">Characters Used</option>
                            <option value="both">Both (Used / Maximum)</option>
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    </div>
                </div>
                )}
                {(textEntrySettings.answerLength === 'paragraph' || textEntrySettings.answerLength === 'essay') && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                    <label htmlFor="auto-resize" className="text-sm font-medium text-on-surface block">Auto-resize Text Box</label>
                    <p className="text-xs text-on-surface-variant mt-0.5">Expand text box as respondent types</p>
                    </div>
                    <input type="checkbox" id="auto-resize" checked={advanced.autoResize || false} onChange={(e) => handleUpdateAdvanced({ autoResize: e.target.checked })} className="w-5 h-5 accent-primary cursor-pointer" />
                </div>
                )}
                <div className="mb-4">
                    <label htmlFor="text-box-width" className="block text-sm font-medium text-on-surface-variant mb-1">Text Box Width</label>
                    <div className="relative">
                        <select
                        id="text-box-width"
                        value={advanced.textBoxWidth || 'full'}
                        onChange={(e) => handleUpdateAdvanced({ textBoxWidth: e.target.value as any })}
                        className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                        >
                        <option value="full">Full Width (100%)</option>
                        <option value="large">Large (75%)</option>
                        <option value="medium">Medium (50%)</option>
                        <option value="small">Small (25%)</option>
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">Narrower boxes can signal expected answer length</p>
                </div>
            </div>
        </div>
    );
  };

  const renderTextEntryPreviewTab = () => {
    const { textEntrySettings = {} } = question;
    const { answerLength = 'short', placeholder = '', validation = {}, advanced = {} } = textEntrySettings;
    const { contentType = 'none', maxLength = null } = validation;
    const { showCharCounter = false, counterType = 'remaining', textBoxWidth = 'full' } = advanced;

    const widthClass = { full: 'w-full', large: 'w-3/4', medium: 'w-1/2', small: 'w-1/4'}[textBoxWidth];

    const previewContent = (
      <div className="p-4">
        <header className="mb-4">
            <h1 className="text-sm font-semibold text-on-surface text-left">{survey.title}</h1>
        </header>
        <div className="border-t border-outline-variant my-4"></div>
        <div className="space-y-4">
            <div>
                <p className="text-base font-medium text-on-surface" dangerouslySetInnerHTML={{ __html: question.text || 'Question text will appear here' }} />
                {question.forceResponse && <span className="text-xs text-error ml-1">*</span>}
            </div>
            <div className={`${widthClass}`}>
                {answerLength === 'short' ? (
                <input type="text" placeholder={placeholder || 'Enter your answer...'} className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface" disabled />
                ) : (
                <textarea placeholder={placeholder || 'Enter your answer...'} rows={answerLength === 'paragraph' ? 4 : 8} className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface resize-none" disabled />
                )}
                {showCharCounter && maxLength && (
                <p className="text-xs text-on-surface-variant mt-1">
                    {counterType === 'remaining' && `${maxLength} characters remaining`}
                    {counterType === 'used' && `0 / ${maxLength} characters`}
                    {counterType === 'both' && `0 / ${maxLength} characters`}
                </p>
                )}
            </div>
            {contentType !== 'none' && (
                <div className="flex items-start gap-2 p-3 bg-surface-container-high rounded-md">
                    <InfoIcon className="text-primary text-base" />
                    <p className="text-xs text-on-surface-variant">
                        {contentType === 'email' && 'Validates email format (e.g., name@domain.com)'}
                        {contentType === 'phone' && 'Validates phone number format'}
                        {contentType === 'number' && 'Only numeric input allowed'}
                        {contentType === 'url' && 'Validates URL format (e.g., https://...)'}
                        {contentType === 'date' && 'Validates date format (YYYY-MM-DD)'}
                        {contentType === 'postal_code' && 'Validates postal/zip code format'}
                        {contentType === 'custom_regex' && 'Custom format validation applied'}
                    </p>
                </div>
            )}
        </div>
      </div>
    );
  
    return (
      <div>
        {!isExpanded ? (
          <div className="flex justify-center pt-4">
              <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                  <div className="w-[140px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                  <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                  <div className="rounded-[2rem] overflow-hidden w-full h-full bg-surface">
                      <div className="px-4 py-2 flex justify-between items-center text-xs text-on-surface-variant font-sans font-bold">
                          <span>12:29</span>
                          <div className="flex items-center gap-1">
                              <SignalIcon className="text-base" />
                              <BatteryIcon className="text-base" />
                          </div>
                      </div>
                      <div className="overflow-y-auto h-[calc(100%-32px)]">
                          {previewContent}
                      </div>
                  </div>
              </div>
          </div>
        ) : (
          <div>
            {previewContent}
          </div>
        )}
        <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant mt-4">
            <EyeIcon className="text-base" />
            <p>Preview updates in real-time as you change settings</p>
        </div>
      </div>
    );
  }

  // =================================================================
  // NEW BEHAVIOR TAB IMPLEMENTATION
  // =================================================================
  
  const renderBehaviorTab = () => {
    return (
        <div className="space-y-8">
            <CollapsibleSection title="Choices" defaultExpanded={true}>
                {isChoiceBased && (
                    <div className="py-6 first:pt-0">
                        <RandomizeChoicesEditor 
                            question={question}
                            onUpdate={handleUpdate}
                        />
                    </div>
                )}
                <div className="py-6 first:pt-0">
                    <CarryForwardLogicEditor
                        question={question}
                        previousQuestions={previousQuestions}
                        onUpdate={handleUpdate}
                        logicKey="carryForwardStatements"
                        label="Carry forward choices"
                        addButtonLabel="Add choices"
                        description="Use answers from a previous question as choices in this one."
                        onAddLogic={ensureSidebarIsExpanded}
                    />
                </div>
                <div className="py-6 first:pt-0">
                     <CarryForwardLogicEditor
                        question={question}
                        previousQuestions={previousQuestions}
                        onUpdate={handleUpdate}
                        logicKey="carryForwardScalePoints"
                        label="Carry forward scale points"
                        addButtonLabel="Add scale points"
                        description="Use scale points from a previous grid question as choices in this one."
                        onAddLogic={ensureSidebarIsExpanded}
                    />
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Logic" defaultExpanded={true}>
                <div className="py-6 first:pt-0">
                    <DisplayLogicEditor
                        question={question}
                        previousQuestions={logicSourceQuestions}
                        issues={logicIssues.filter(i => i.type === 'display')}
                        onUpdate={handleUpdate}
                        onAddLogic={ensureSidebarIsExpanded}
                        onRequestGeminiHelp={onRequestGeminiHelp}
                    />
                </div>
                <div className="py-6 first:pt-0">
                    <SkipLogicEditor
                        question={question}
                        followingQuestions={followingQuestions}
                        issues={logicIssues.filter(i => i.type === 'skip')}
                        onUpdate={handleUpdate}
                        isChoiceBased={isChoiceBased}
                        onAddLogic={ensureSidebarIsExpanded}
                        onRequestGeminiHelp={onRequestGeminiHelp}
                    />
                </div>
                <div className="py-6 first:pt-0">
                    <BranchingLogicEditor
                        question={question}
                        previousQuestions={logicSourceQuestions}
                        followingQuestions={followingQuestions}
                        issues={logicIssues.filter(i => i.type === 'branching')}
                        onUpdate={handleUpdate}
                        onAddLogic={ensureSidebarIsExpanded}
                        onRequestGeminiHelp={onRequestGeminiHelp}
                    />
                </div>
            </CollapsibleSection>
        </div>
    );
  };


  // =================================================================
  // MAIN RENDER LOGIC
  // =================================================================

  const renderTabContent = () => {
    switch(activeTab) {
        case 'Settings':
            if (isChoiceBased) return renderChoiceBasedSettingsTab();
            if (question.type === QuestionType.TextEntry) return renderTextEntrySettingsTab();
            return null;
        case 'Behavior':
            return renderBehaviorTab();
        case 'Advanced':
            if (isChoiceBased) return renderChoiceBasedAdvancedTab();
            if (question.type === QuestionType.TextEntry) return renderTextEntryAdvancedTab();
            return null;
        case 'Preview':
            if (isChoiceBased) return renderChoiceBasedPreviewTab();
            if (question.type === QuestionType.TextEntry) return renderTextEntryPreviewTab();
            return null;
        default: return <p>Content not available</p>;
    }
  }

  return (
    <>
      <PasteChoicesModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onSave={handlePasteChoices}
        initialChoicesText={initialChoicesText}
        primaryActionLabel="Add Choices"
      />
      <aside className="w-full h-full bg-surface-container border-l border-outline-variant flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
                {CurrentQuestionTypeInfo && <CurrentQuestionTypeInfo.icon className="text-primary text-2xl" />}
                <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    Edit question
                </h2>
            </div>
          <div className="flex items-center">
              <button 
                  onClick={onToggleExpand} 
                  className="text-on-surface-variant hover:text-on-surface p-1 mr-1"
                  aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                  {isExpanded ? <CollapseIcon className="text-2xl" /> : <ExpandIcon className="text-2xl" />}
              </button>
              <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1">
                  <XIcon className="text-2xl" />
              </button>
          </div>
        </div>
        <div className="border-b border-outline-variant">
          <nav className="-mb-px flex space-x-2 px-4">
            {availableTabs.map(tab => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`py-3 px-3 border-b-2 font-medium text-sm transition-colors rounded-t-lg ${
                  activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-on-surface-variant hover:bg-surface-container-high'
                }`}
                style={{ fontFamily: "'Open Sans', sans-serif" }}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div
          className={`flex-1 overflow-y-auto ${activeTab === 'Behavior' ? 'overflow-x-auto' : 'overflow-x-hidden'}`}
          style={{ fontFamily: "'Open Sans', sans-serif" }}
        >
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </aside>
    </>
  );
});

// =================================================================
// SHARED LOGIC ROW COMPONENT
// =================================================================
interface LogicConditionRowProps<T extends DisplayLogicCondition | BranchingCondition> {
    condition: T;
    onUpdateCondition: (field: keyof T, value: any) => void;
    onRemoveCondition: () => void;
    onConfirm: () => void;
    previousQuestions: Question[];
    issues: LogicIssue[];
    invalidFields?: Set<keyof T>;
}

const LogicConditionRow = <T extends DisplayLogicCondition | BranchingCondition>({ condition, onUpdateCondition, onRemoveCondition, onConfirm, previousQuestions, issues, invalidFields = new Set() }: LogicConditionRowProps<T>) => {
    const referencedQuestion = useMemo(() => previousQuestions.find(q => q.qid === condition.questionId), [previousQuestions, condition.questionId]);
    const isNumericInput = referencedQuestion?.type === QuestionType.NumericAnswer;
    const isConfirmed = condition.isConfirmed ?? false; // Default to false if undefined for new rows

    const getFieldIssue = (fieldName: keyof T) => issues.find(i => i.field === fieldName);
    
    const questionIssue = getFieldIssue('questionId' as keyof T);
    const operatorIssue = getFieldIssue('operator' as keyof T);
    const valueIssue = getFieldIssue('value' as keyof T);

    const questionBorderClass = invalidFields.has('questionId' as keyof T) || questionIssue ? 'border-error' : 'border-outline focus:outline-primary';
    const operatorBorderClass = invalidFields.has('operator' as keyof T) || operatorIssue ? 'border-error' : 'border-outline focus:outline-primary';
    const valueBorderClass = invalidFields.has('value' as keyof T) || valueIssue ? 'border-error' : 'border-outline focus:outline-primary';

    const Tooltip: React.FC<{ issue?: LogicIssue }> = ({ issue }) => {
        if (!issue) return null;
        return (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-surface-container-highest text-on-surface text-xs rounded-md p-2 shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20">
                {issue.message}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-surface-container-highest"></div>
            </div>
        );
    };

    return (
        <div className="flex items-center gap-2 p-2 bg-surface-container-high rounded-md min-w-max">
            <div className="relative group/tooltip w-48 flex-shrink-0">
                <select 
                    value={condition.questionId} 
                    onChange={(e) => onUpdateCondition('questionId' as keyof T, e.target.value)} 
                    className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none ${questionBorderClass}`} 
                    aria-label="Select question"
                >
                    <option value="">Select question...</option>
                    {previousQuestions.map(q => <option key={q.id} value={q.qid}>{q.qid}: {truncate(q.text, 50)}</option>)}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                <Tooltip issue={questionIssue} />
            </div>
            <div className="relative group/tooltip w-32 flex-shrink-0">
                <select 
                    value={condition.operator} 
                    onChange={(e) => onUpdateCondition('operator' as keyof T, e.target.value)} 
                    className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none ${operatorBorderClass}`} 
                    aria-label="Select operator"
                >
                    <option value="equals">equals</option>
                    <option value="not_equals">not equals</option>
                    <option value="contains">contains</option>
                    <option value="greater_than">greater than</option>
                    <option value="less_than">less than</option>
                    <option value="is_empty">is empty</option>
                    <option value="is_not_empty">is not empty</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                <Tooltip issue={operatorIssue} />
            </div>
            {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                <div className="relative group/tooltip flex-1">
                    <input 
                        type={isNumericInput ? "number" : "text"} 
                        value={condition.value} 
                        onChange={(e) => onUpdateCondition('value' as keyof T, e.target.value)} 
                        placeholder="Value" 
                        className={`w-full bg-surface border rounded-md px-2 py-1.5 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 ${valueBorderClass}`}
                        aria-label="Condition value" 
                    />
                     <Tooltip issue={valueIssue} />
                </div>
            )}
            <button onClick={onRemoveCondition} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full transition-colors flex-shrink-0" aria-label="Remove condition">
                <XIcon className="text-lg" />
            </button>
            {!isConfirmed && (
                <button onClick={onConfirm} className="p-1.5 bg-primary text-on-primary rounded-full hover:opacity-90 transition-colors flex-shrink-0" aria-label="Confirm condition">
                    <CheckmarkIcon className="text-lg" />
                </button>
            )}
        </div>
    );
};

const DestinationRow: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  onConfirm?: () => void;
  onRemove?: () => void;
  isConfirmed?: boolean;
  issue?: LogicIssue;
  invalid?: boolean;
  followingQuestions: Question[];
  className?: string;
}> = ({ label, value, onChange, onConfirm, onRemove, isConfirmed = true, issue, invalid = false, followingQuestions, className = '' }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="text-sm text-on-surface flex-shrink-0">{label}</span>
            <div className="relative group/tooltip flex-1">
                <select 
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                    className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none ${(issue || invalid) ? 'border-error' : 'border-outline'}`}
                >
                    <option value="">Select destination...</option>
                    <option value="next">Next Question</option>
                    {followingQuestions.map(q => <option key={q.id} value={q.id}>{q.qid}: {truncate(q.text, 50)}</option>)}
                    <option value="end">End of Survey</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                {issue && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-surface-container-highest text-on-surface text-xs rounded-md p-2 shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20">
                        {issue.message}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-surface-container-highest"></div>
                    </div>
                )}
            </div>
            {onRemove && (
                 <button onClick={onRemove} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full transition-colors flex-shrink-0" aria-label="Remove rule">
                    <XIcon className="text-lg" />
                </button>
            )}
            {!isConfirmed && onConfirm && (
                <button onClick={onConfirm} className="p-1.5 bg-primary text-on-primary rounded-full hover:opacity-90 transition-colors flex-shrink-0" aria-label="Confirm skip rule">
                    <CheckmarkIcon className="text-lg" />
                </button>
            )}
        </div>
    );
};

// =================================================================
// BEHAVIOR TAB SUB-COMPONENTS
// =================================================================

const DisplayLogicEditor: React.FC<{ question: Question; previousQuestions: Question[]; issues: LogicIssue[]; onUpdate: (updates: Partial<Question>) => void; onAddLogic: () => void; onRequestGeminiHelp: (topic: string) => void; }> = ({ question, previousQuestions, issues, onUpdate, onAddLogic, onRequestGeminiHelp }) => {
    const [isPasting, setIsPasting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Map<string, Set<keyof DisplayLogicCondition>>>(new Map());
    const displayLogic = question.displayLogic;

    useEffect(() => {
        // Reset paste form when switching questions
        if (isPasting) {
            setIsPasting(false);
        }
    }, [question.id]);

    const handleAddDisplayLogic = () => {
        const newCondition: DisplayLogicCondition = {
            id: generateId('cond'),
            questionId: '',
            operator: 'equals',
            value: '',
            isConfirmed: false,
        };
        onUpdate({
            displayLogic: {
                operator: displayLogic?.operator || 'AND',
                conditions: [...(displayLogic?.conditions || []), newCondition],
            },
        });
        onAddLogic();
    };
    
    const handleConfirmCondition = (conditionId: string) => {
        if (!displayLogic) return;
        const condition = displayLogic.conditions.find(c => c.id === conditionId);
        if (!condition) return;

        // Step 1: Check for temporary validation errors (empty fields)
        const tempErrors = new Set<keyof DisplayLogicCondition>();
        if (!condition.questionId) tempErrors.add('questionId');
        
        const requiresValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
        if (requiresValue && !condition.value.trim()) tempErrors.add('value');

        if (tempErrors.size > 0) {
            setValidationErrors(prev => new Map(prev).set(conditionId, tempErrors));
            return; // Block confirmation
        }

        // Step 2: Check for persistent validation errors from the survey-wide validator
        const persistentIssues = issues.filter(i => i.sourceId === conditionId);
        if (persistentIssues.length > 0) {
            return; // Block confirmation, UI will already show the error
        }
        
        // If we get here, all checks passed.
        const newConditions = displayLogic.conditions.map(c => c.id === conditionId ? { ...c, isConfirmed: true } : c);
        onUpdate({ displayLogic: { ...displayLogic, conditions: newConditions } });
        setValidationErrors(prev => {
            const newErrors = new Map(prev);
            newErrors.delete(conditionId);
            return newErrors;
        });
    };

    const handlePasteLogic = (text: string): { success: boolean; error?: string } => {
        const lines = text.split('\n').filter(line => line.trim());
        const newConditions: DisplayLogicCondition[] = [];
        const validOperators = ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'];
    
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const lineNum = i + 1;
            const lineParts = line.split(/\s+/);
            const [qidCandidate, operator, ...valueParts] = lineParts;
            const value = valueParts.join(' ');
            
            if (!qidCandidate || !operator) {
                return { success: false, error: `Line ${lineNum}: Could not understand your logic. Please write it as "QuestionID operator value" (e.g., Q1 equals Yes).` };
            }
            
            if (!/^Q\d+$/i.test(qidCandidate)) {
                 return { success: false, error: `Line ${lineNum}: Invalid QuestionID "${qidCandidate}". It should look like "Q1", "Q2", etc.` };
            }
            const qid = qidCandidate.toUpperCase();
    
            if (!previousQuestions.some(q => q.qid === qid)) {
                return { success: false, error: `Line ${lineNum}: Question "${qid}" doesn't exist or comes after this question.` };
            }
            
            const operatorCleaned = operator.toLowerCase();
            if (!validOperators.includes(operatorCleaned)) {
                let suggestion = '';
                if (operator.toLowerCase().replace(/\s/g, '_') === 'not_equals') {
                    suggestion = ` Did you mean "not_equals"?`;
                } else if (operator.toLowerCase().replace(/\s/g, '_') === 'greater_than') {
                    suggestion = ` Did you mean "greater_than"?`;
                } else if (operator.toLowerCase().replace(/\s/g, '_') === 'less_than') {
                    suggestion = ` Did you mean "less_than"?`;
                }
                return { success: false, error: `Line ${lineNum}: Operator "${operator}" is not recognized.${suggestion}` };
            }
    
            const requiresValue = !['is_empty', 'is_not_empty'].includes(operatorCleaned);
            if (requiresValue && !value.trim()) {
                return { success: false, error: `Line ${lineNum}: Missing a value after "${operator}". Write as '${qid} ${operator} Yes'.` };
            }
            if (!requiresValue && value.trim()) {
                 return { success: false, error: `Line ${lineNum}: Operator "${operator}" does not need a value.` };
            }
    
            newConditions.push({ id: generateId('cond'), questionId: qid, operator: operatorCleaned as DisplayLogicCondition['operator'], value: value.trim(), isConfirmed: true });
        }
        
        if (newConditions.length > 0) {
            onUpdate({
                displayLogic: {
                    operator: displayLogic?.operator || 'AND',
                    conditions: [...(displayLogic?.conditions || []), ...newConditions],
                },
            });
            onAddLogic();
            return { success: true };
        }
        return { success: false, error: "No valid logic could be parsed." };
    };

    const handleUpdateCondition = (index: number, field: keyof DisplayLogicCondition, value: any) => {
        if (!displayLogic) return;
        const newConditions = [...displayLogic.conditions];
        const conditionId = newConditions[index].id;
        newConditions[index] = { ...newConditions[index], [field]: value };
        
        if (validationErrors.has(conditionId)) {
            setValidationErrors(prev => {
                const newErrors = new Map(prev);
                const conditionErrors = new Set(newErrors.get(conditionId));
                conditionErrors.delete(field);
                if (conditionErrors.size === 0) {
                    newErrors.delete(conditionId);
                } else {
                    newErrors.set(conditionId, conditionErrors);
                }
                return newErrors;
            });
        }
        onUpdate({ displayLogic: { ...displayLogic, conditions: newConditions } });
    };

    const handleRemoveCondition = (index: number) => {
        if (!displayLogic) return;
        const conditionId = displayLogic.conditions[index].id;
        const newConditions = displayLogic.conditions.filter((_, i) => i !== index);
        
        setValidationErrors(prev => {
            const newErrors = new Map(prev);
            newErrors.delete(conditionId);
            return newErrors;
        });

        onUpdate({ displayLogic: newConditions.length > 0 ? { ...displayLogic, conditions: newConditions } : undefined });
    };

    const setLogicOperator = (operator: 'AND' | 'OR') => {
        if (!displayLogic) return;
        onUpdate({ displayLogic: { ...displayLogic, operator } });
    };

    if (!displayLogic || displayLogic.conditions.length === 0) {
        return (
            <div>
                <h3 className="text-sm font-medium text-on-surface mb-1">Display Logic</h3>
                <p className="text-xs text-on-surface-variant mb-3">Control when this question is shown to respondents</p>
                {isPasting ? (
                    <PasteInlineForm
                        onSave={handlePasteLogic}
                        onCancel={() => setIsPasting(false)}
                        placeholder={"Q1 equals Yes\nQ2 not_equals 5"}
                        primaryActionLabel="Add Display Logic"
                        disclosureText="Enter advanced syntax only;"
                        helpTopic="Display Logic"
                        onRequestGeminiHelp={onRequestGeminiHelp}
                    />
                ) : (
                    <div className="flex items-center gap-4">
                        <button onClick={handleAddDisplayLogic} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors">
                            <PlusIcon className="text-base" />
                            Add Display Logic
                        </button>
                        <CopyAndPasteButton onClick={() => setIsPasting(true)} />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-3">
                 <div>
                    <h3 className="text-sm font-medium text-on-surface">Display Logic</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">Control when this question is shown to respondents</p>
                </div>
                <button 
                    onClick={() => onUpdate({ displayLogic: undefined })}
                    className="text-sm font-medium text-error hover:underline px-2 py-1 rounded-md hover:bg-error-container/50"
                >
                    Remove
                </button>
            </div>
            
            <p className="text-xs font-medium text-on-surface mb-2">Show this question if:</p>
            
            <div className="space-y-2 mb-3">
                {displayLogic.conditions.map((condition, index) => (
                    <LogicConditionRow
                        key={condition.id || index}
                        condition={condition}
                        issues={issues.filter(i => i.sourceId === condition.id)}
                        onUpdateCondition={(field, value) => handleUpdateCondition(index, field, value)}
                        onRemoveCondition={() => handleRemoveCondition(index)}
                        onConfirm={() => handleConfirmCondition(condition.id)}
                        previousQuestions={previousQuestions}
                        invalidFields={validationErrors.get(condition.id)}
                    />
                ))}
            </div>

            {displayLogic.conditions.length > 1 && (
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-on-surface-variant">Logic operator:</span>
                    <div className="flex gap-1">
                        <button onClick={() => setLogicOperator('AND')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${displayLogic.operator === 'AND' ? 'bg-primary-container text-on-primary-container' : 'bg-surface border border-outline text-on-surface hover:bg-surface-container-high'}`}>AND</button>
                        <button onClick={() => setLogicOperator('OR')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${displayLogic.operator === 'OR' ? 'bg-primary-container text-on-primary-container' : 'bg-surface border border-outline text-on-surface hover:bg-surface-container-high'}`}>OR</button>
                    </div>
                </div>
            )}
            
            <button onClick={handleAddDisplayLogic} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors"><PlusIcon className="text-base" />Add Another Condition</button>
        </div>
    );
};

const SkipLogicEditor: React.FC<{ question: Question; followingQuestions: Question[]; issues: LogicIssue[]; onUpdate: (updates: Partial<Question>) => void; isChoiceBased: boolean; onAddLogic: () => void; onRequestGeminiHelp: (topic: string) => void; }> = ({ question, followingQuestions, issues, onUpdate, isChoiceBased, onAddLogic, onRequestGeminiHelp }) => {
    const [isPasting, setIsPasting] = useState(false);
    const [tempErrors, setTempErrors] = useState<Set<string>>(new Set());
    const isEnabled = !!question.skipLogic;

    useEffect(() => {
        // Reset paste form when switching questions
        if (isPasting) {
            setIsPasting(false);
        }
    }, [question.id]);

    const handlePasteLogic = (text: string): { success: boolean; error?: string } => {
        const lines = text.split('\n').filter(line => line.trim());
    
        if (isChoiceBased && question.choices) {
            if (lines.length !== question.choices.length) {
                return { success: false, error: `Expected ${question.choices.length} lines, one for each choice, but got ${lines.length}.` };
            }
            const newRules: SkipLogicRule[] = [];
            for (let i = 0; i < lines.length; i++) {
                const dest = lines[i].trim().toLowerCase();
                const choice = question.choices[i];
                const targetQ = followingQuestions.find(q => q.qid.toLowerCase() === dest);
    
                if (!targetQ && dest !== 'next' && dest !== 'end') {
                    return { success: false, error: `Line ${i + 1}: Destination "${lines[i]}" is not valid. Please use a question that comes after this one (like Q5), or the words "next" or "end".` };
                }
                const skipTo = targetQ ? targetQ.id : dest;
                newRules.push({ choiceId: choice.id, skipTo, isConfirmed: true });
            }
            onUpdate({ skipLogic: { type: 'per_choice', rules: newRules } });
        } else {
            if (lines.length !== 1) {
                return { success: false, error: `Expected a single line with the destination QID, 'next', or 'end'.` };
            }
            const dest = lines[0].trim().toLowerCase();
            const targetQ = followingQuestions.find(q => q.qid.toLowerCase() === dest);
            
            if (!targetQ && dest !== 'next' && dest !== 'end') {
                return { success: false, error: `Destination "${lines[0]}" is not valid. Please use a question that comes after this one (like Q5), or the words "next" or "end".` };
            }
            const skipTo = targetQ ? targetQ.id : dest;
            onUpdate({ skipLogic: { type: 'simple', skipTo, isConfirmed: true } });
        }
        
        onAddLogic();
        return { success: true };
    };

    const handleToggle = (enabled: boolean) => {
        if (enabled) {
            const defaultLogic = isChoiceBased
                ? { type: 'per_choice' as const, rules: (question.choices || []).map(c => ({ choiceId: c.id, skipTo: '', isConfirmed: false })) }
                : { type: 'simple' as const, skipTo: '', isConfirmed: false };
            onUpdate({ skipLogic: defaultLogic });
            onAddLogic();
        } else {
            onUpdate({ skipLogic: undefined });
        }
    };
    
    const handleConfirm = (sourceId: string) => {
        if (!question.skipLogic) return;

        let hasTempError = false;
        let hasPersistentError = issues.some(i => i.sourceId === sourceId && i.field === 'skipTo');

        if (question.skipLogic.type === 'simple') {
            if (!question.skipLogic.skipTo) {
                hasTempError = true;
                setTempErrors(prev => new Set(prev).add('simple'));
            }
        } else if (question.skipLogic.type === 'per_choice') {
            const rule = question.skipLogic.rules.find(r => r.choiceId === sourceId);
            if (!rule?.skipTo) {
                hasTempError = true;
                setTempErrors(prev => new Set(prev).add(sourceId));
            }
        }
        
        if (hasTempError || hasPersistentError) {
            return; // Block confirmation
        }

        if (question.skipLogic.type === 'simple') {
            onUpdate({ skipLogic: { ...question.skipLogic, isConfirmed: true } });
        } else if (question.skipLogic.type === 'per_choice') {
            const newRules = question.skipLogic.rules.map(r => 
                r.choiceId === sourceId ? { ...r, isConfirmed: true } : r
            );
            onUpdate({ skipLogic: { ...question.skipLogic, rules: newRules } });
        }
    };

    const handleSimpleSkipChange = (skipTo: string) => {
        if (question.skipLogic?.type === 'simple') {
            onUpdate({ skipLogic: { ...question.skipLogic, skipTo } });
            if (tempErrors.has('simple')) {
                setTempErrors(prev => {
                    const newErrors = new Set(prev);
                    newErrors.delete('simple');
                    return newErrors;
                })
            }
        }
    };

    const handleChoiceSkipChange = (choiceId: string, skipTo: string) => {
        if(question.skipLogic?.type !== 'per_choice') return;

        const newRules = question.skipLogic.rules.map(r => 
            r.choiceId === choiceId ? { ...r, skipTo } : r
        );
        onUpdate({ skipLogic: { type: 'per_choice', rules: newRules } });
        if (tempErrors.has(choiceId)) {
            setTempErrors(prev => {
                const newErrors = new Set(prev);
                newErrors.delete(choiceId);
                return newErrors;
            })
        }
    };

    const getChoiceRule = (choiceId: string) => {
        if (isEnabled && question.skipLogic?.type === 'per_choice') {
            return question.skipLogic.rules.find(r => r.choiceId === choiceId);
        }
        return undefined;
    };

    const description = isChoiceBased ? "Skip to different questions based on the selected answer" : "Skip to a different question if answered";

    if (!isEnabled) {
        return (
            <div>
                <h3 className="text-sm font-medium text-on-surface mb-1">Skip Logic</h3>
                <p className="text-xs text-on-surface-variant mb-3">{description}</p>
                 {isPasting ? (
                    <PasteInlineForm
                        onSave={handlePasteLogic}
                        onCancel={() => setIsPasting(false)}
                        placeholder={isChoiceBased ? "Q5\nEnd\nQ7" : "Q5"}
                        primaryActionLabel="Add Skip Logic"
                        disclosureText="Only advanced skip logic syntax is accepted;"
                        helpTopic="Skip Logic"
                        onRequestGeminiHelp={onRequestGeminiHelp}
                    />
                ) : (
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleToggle(true)} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors">
                            <PlusIcon className="text-base" />
                            Add Skip Logic
                        </button>
                         <CopyAndPasteButton onClick={() => setIsPasting(true)} />
                    </div>
                )}
            </div>
        )
    }
    
    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                    <h3 className="text-sm font-medium text-on-surface">Skip Logic</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
                </div>
                <button 
                    onClick={() => handleToggle(false)} 
                    className="text-sm font-medium text-error hover:underline px-2 py-1 rounded-md hover:bg-error-container/50"
                >
                    Remove
                </button>
            </div>
            
            <div>
                {isChoiceBased ? (
                    <div className="space-y-2">
                        {(question.choices || []).map((choice) => {
                            const rule = getChoiceRule(choice.id);
                            const issue = issues.find(i => i.sourceId === choice.id && i.field === 'skipTo');
                            return (
                                <DestinationRow
                                    key={choice.id}
                                    label={`If "${truncate(parseChoice(choice.text).label, 15)}" → `}
                                    value={rule?.skipTo || ''}
                                    onChange={(value) => handleChoiceSkipChange(choice.id, value)}
                                    onConfirm={() => handleConfirm(choice.id)}
                                    isConfirmed={rule?.isConfirmed}
                                    issue={issue}
                                    invalid={tempErrors.has(choice.id)}
                                    followingQuestions={followingQuestions}
                                />
                            );
                        })}
                    </div>
                ) : ( question.skipLogic?.type === 'simple' &&
                    <>
                         <DestinationRow
                            label="If answered, skip to:"
                            value={question.skipLogic.skipTo}
                            onChange={handleSimpleSkipChange}
                            onConfirm={() => handleConfirm('simple')}
                            isConfirmed={question.skipLogic.isConfirmed}
                            issue={issues.find(i => i.sourceId === 'simple' && i.field === 'skipTo')}
                            invalid={tempErrors.has('simple')}
                            followingQuestions={followingQuestions}
                            className="p-3 bg-surface-container-high rounded-md"
                        />
                        <p className="text-xs text-on-surface-variant mt-2">Note: Skip logic applies when respondent provides any answer</p>
                    </>
                )}
            </div>
        </div>
    );
};


const RandomizeChoicesEditor: React.FC<{ question: Question; onUpdate: (updates: Partial<Question>) => void; }> = ({ question, onUpdate }) => {
    const randomizeChoices = question.answerBehavior?.randomizeChoices || false;
    const randomizationMethod = question.answerBehavior?.randomizationMethod || 'permutation';

    const handleToggleRandomize = (enabled: boolean) => {
        onUpdate({
            answerBehavior: {
                ...(question.answerBehavior || {}),
                randomizeChoices: enabled,
                randomizationMethod: enabled ? (question.answerBehavior?.randomizationMethod || 'permutation') : question.answerBehavior?.randomizationMethod,
            },
        });
    };

    const handleMethodChange = (method: RandomizationMethod) => {
        onUpdate({
            answerBehavior: {
                ...(question.answerBehavior || {}),
                randomizationMethod: method,
            },
        });
    };

    const randomizationOptions: { value: RandomizationMethod; label: string }[] = [
        { value: 'permutation', label: 'Permutation' },
        { value: 'random_reverse', label: 'Random reverse' },
        { value: 'reverse_order', label: 'Reverse order' },
        { value: 'rotation', label: 'Rotation' },
        { value: 'sort_by_code', label: 'Sort by code' },
        { value: 'sort_by_text', label: 'Sort by text' },
        { value: 'synchronized', label: 'Synchronized' },
    ];

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <label htmlFor="randomize-choices-toggle" className="text-sm font-medium text-on-surface">
                        Randomize choices
                    </label>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                        Show choices in a random order
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        id="randomize-choices-toggle"
                        checked={randomizeChoices}
                        onChange={(e) => handleToggleRandomize(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
            {randomizeChoices && (
                <div className="mt-4">
                    <label htmlFor="randomization-method" className="block text-sm font-medium text-on-surface-variant mb-1">Randomization Method</label>
                    <div className="relative">
                        <select 
                            id="randomization-method" 
                            value={randomizationMethod}
                            onChange={e => handleMethodChange(e.target.value as RandomizationMethod)}
                            className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                        >
                            {randomizationOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    </div>
                </div>
            )}
        </div>
    );
};

const CarryForwardLogicEditor: React.FC<{
    question: Question;
    previousQuestions: Question[];
    onUpdate: (updates: Partial<Question>) => void;
    logicKey: 'carryForwardStatements' | 'carryForwardScalePoints';
    label: string;
    description: string;
    addButtonLabel: string;
    onAddLogic: () => void;
}> = ({ question, previousQuestions, onUpdate, logicKey, label, description, addButtonLabel, onAddLogic }) => {
    const logic = question[logicKey];

    const handleEnable = () => {
        onUpdate({
            [logicKey]: {
                sourceQuestionId: '',
                filter: 'all',
            }
        });
        onAddLogic();
    };

    const handleDisable = () => {
        onUpdate({ [logicKey]: undefined });
    };

    const handleUpdateLogic = (field: keyof CarryForwardLogic, value: any) => {
        onUpdate({
            [logicKey]: {
                ...(logic as CarryForwardLogic),
                [field]: value,
            }
        });
    };

    if (!logic) {
        return (
            <div>
                <h3 className="text-sm font-medium text-on-surface mb-1">{label}</h3>
                <p className="text-xs text-on-surface-variant mb-3">{description}</p>
                <div className="flex items-center gap-4">
                    <button onClick={handleEnable} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors">
                        {addButtonLabel}
                    </button>
                </div>
            </div>
        );
    }
    
    const choiceBasedQuestions = previousQuestions.filter(q => CHOICE_BASED_QUESTION_TYPES.has(q.type));

    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                    <h4 className="text-sm font-medium text-on-surface">{label}</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
                </div>
                <button onClick={handleDisable} className="text-sm font-medium text-error hover:underline px-2 py-1 rounded-md hover:bg-error-container/50">
                    Remove
                </button>
            </div>
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Source Question</label>
                    <div className="relative">
                        <select 
                            value={logic.sourceQuestionId || ''} 
                            onChange={e => handleUpdateLogic('sourceQuestionId', e.target.value)}
                            className="w-full bg-surface border border-outline rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                        >
                            <option value="">Select question...</option>
                            {choiceBasedQuestions.map(q => (
                                <option key={q.id} value={q.qid}>{q.qid}: {truncate(q.text, 40)}</option>
                            ))}
                        </select>
                         <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Carry Forward Choices That Were...</label>
                     <div className="relative">
                        <select 
                            value={logic.filter || 'all'}
                            onChange={e => handleUpdateLogic('filter', e.target.value as CarryForwardLogic['filter'])}
                            className="w-full bg-surface border border-outline rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                        >
                            <option value="all">All</option>
                            <option value="selected">Selected</option>
                            <option value="not_selected">Not Selected</option>
                            <option value="displayed">Displayed</option>
                            <option value="not_displayed">Not Displayed</option>
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const BranchingLogicEditor: React.FC<{ 
    question: Question; 
    previousQuestions: Question[]; 
    followingQuestions: Question[]; 
    issues: LogicIssue[];
    onUpdate: (updates: Partial<Question>) => void; 
    onAddLogic: () => void;
    onRequestGeminiHelp: (topic: string) => void;
}> = ({ question, previousQuestions, followingQuestions, issues, onUpdate, onAddLogic, onRequestGeminiHelp }) => {
    const [pastingInlineBranchId, setPastingInlineBranchId] = useState<string | null>(null);
    const [isPasting, setIsPasting] = useState(false);
    const branchingLogic = question.branchingLogic;
    const [collapsedBranches, setCollapsedBranches] = useState<Set<string>>(new Set());
    const [validationErrors, setValidationErrors] = useState<Map<string, Set<keyof BranchingCondition | 'thenSkipTo' | 'otherwiseSkipTo'>>>(new Map());

    useEffect(() => {
        // Reset paste forms when switching questions
        if (isPasting) {
            setIsPasting(false);
        }
        if (pastingInlineBranchId) {
            setPastingInlineBranchId(null);
        }
    }, [question.id]);

    const handleToggleBranchCollapse = (branchId: string) => {
        setCollapsedBranches(prev => {
            const newSet = new Set(prev);
            if (newSet.has(branchId)) {
                newSet.delete(branchId);
            } else {
                newSet.add(branchId);
            }
            return newSet;
        });
    };

    const validateAndParseConditions = (text: string): { success: boolean; error?: string; conditions?: BranchingCondition[] } => {
        const lines = text.split('\n').filter(line => line.trim());
        const newConditions: BranchingCondition[] = [];
        const validOperators = ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'];
    
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const lineNum = i + 1;
            const lineParts = line.split(/\s+/);
            const [qidCandidate, operator, ...valueParts] = lineParts;
            const value = valueParts.join(' ');
            
            if (!qidCandidate || !operator) {
                return { success: false, error: `Line ${lineNum}: Could not understand your logic. Please write it as "QuestionID operator value" (e.g., Q1 equals Yes).` };
            }
            
            if (!/^Q\d+$/i.test(qidCandidate)) {
                 return { success: false, error: `Line ${lineNum}: Invalid QuestionID "${qidCandidate}". It should look like "Q1", "Q2", etc.` };
            }
            const qid = qidCandidate.toUpperCase();
    
            if (!previousQuestions.some(q => q.qid === qid)) {
                return { success: false, error: `Line ${lineNum}: Question "${qid}" doesn't exist or comes after this question.` };
            }
            
            const operatorCleaned = operator.toLowerCase();
            if (!validOperators.includes(operatorCleaned)) {
                let suggestion = '';
                if (operator.toLowerCase().replace(/\s/g, '_') === 'not_equals') {
                    suggestion = ` Did you mean "not_equals"?`;
                } else if (operator.toLowerCase().replace(/\s/g, '_') === 'greater_than') {
                    suggestion = ` Did you mean "greater_than"?`;
                } else if (operator.toLowerCase().replace(/\s/g, '_') === 'less_than') {
                    suggestion = ` Did you mean "less_than"?`;
                }
                return { success: false, error: `Line ${lineNum}: Operator "${operator}" is not recognized.${suggestion}` };
            }
    
            const requiresValue = !['is_empty', 'is_not_empty'].includes(operatorCleaned);
            if (requiresValue && !value.trim()) {
                return { success: false, error: `Line ${lineNum}: Missing a value after "${operator}". Write as '${qid} ${operator} Yes'.` };
            }
            if (!requiresValue && value.trim()) {
                 return { success: false, error: `Line ${lineNum}: Operator "${operator}" does not need a value.` };
            }
    
            newConditions.push({ id: generateId('cond'), questionId: qid, operator: operatorCleaned as BranchingCondition['operator'], value: value.trim(), isConfirmed: true });
        }
        
        if (newConditions.length === 0) {
            return { success: false, error: "No valid logic could be parsed." };
        }
        
        return { success: true, conditions: newConditions };
    };
    

    const handlePasteIntoBranch = (branchId: string, text: string): { success: boolean; error?: string } => {
        if (!branchingLogic) return { success: false, error: 'Branching logic not initialized.' };

        const validationResult = validateAndParseConditions(text);
        if (!validationResult.success || !validationResult.conditions) {
            return validationResult;
        }
        
        const newBranches = branchingLogic.branches.map(b => {
            if (b.id === branchId) {
                return { ...b, conditions: [...b.conditions, ...(validationResult.conditions || [])] };
            }
            return b;
        });
        onUpdate({ branchingLogic: { ...branchingLogic, branches: newBranches } });
        return { success: true };
    };
    
    const handlePasteInitialBranch = (text: string): { success: boolean; error?: string } => {
        const validationResult = validateAndParseConditions(text);
        if (!validationResult.success || !validationResult.conditions) {
            return validationResult;
        }

        const newBranchId = generateId('branch');
        const newBranch: Branch = {
            id: newBranchId,
            operator: 'AND',
            conditions: validationResult.conditions,
            thenSkipTo: 'next',
            thenSkipToIsConfirmed: true,
        };
        onUpdate({
            branchingLogic: {
                branches: [...(branchingLogic?.branches || []), newBranch],
                otherwiseSkipTo: branchingLogic?.otherwiseSkipTo || 'next',
                otherwiseIsConfirmed: branchingLogic?.otherwiseIsConfirmed
            }
        });
        setCollapsedBranches(new Set());
        onAddLogic();
        return { success: true };
    };

    const handleEnable = () => {
        const newBranchId = generateId('branch');
        onUpdate({
            branchingLogic: {
                branches: [
                    {
                        id: newBranchId,
                        operator: 'AND',
                        conditions: [{ id: generateId('cond'), questionId: '', operator: 'equals', value: '', isConfirmed: false }],
                        thenSkipTo: '',
                        thenSkipToIsConfirmed: false,
                    }
                ],
                otherwiseSkipTo: '',
                otherwiseIsConfirmed: false,
            }
        });
        setCollapsedBranches(new Set()); // Start with the new branch expanded
        onAddLogic();
    };

    const handleDisable = () => {
        onUpdate({ branchingLogic: undefined });
    };

    const handleAddBranch = () => {
        if (!branchingLogic) return;
        const newBranch: Branch = {
            id: generateId('branch'),
            operator: 'AND',
            conditions: [{ id: generateId('cond'), questionId: '', operator: 'equals', value: '', isConfirmed: false }],
            thenSkipTo: '',
            thenSkipToIsConfirmed: false,
        };
        onUpdate({
            branchingLogic: {
                ...branchingLogic,
                branches: [...branchingLogic.branches, newBranch]
            }
        });
    };

    const handleRemoveBranch = (branchId: string) => {
        if (!branchingLogic) return;
        const newBranches = branchingLogic.branches.filter(b => b.id !== branchId);
        if (newBranches.length === 0) {
            handleDisable();
        } else {
            onUpdate({
                branchingLogic: {
                    ...branchingLogic,
                    branches: newBranches
                }
            });
        }
    };

    const handleUpdateBranch = (branchId: string, field: keyof Branch, value: any) => {
        if (!branchingLogic) return;
        onUpdate({
            branchingLogic: {
                ...branchingLogic,
                branches: branchingLogic.branches.map(b => b.id === branchId ? { ...b, [field]: value } : b)
            }
        });
        if (field === 'thenSkipTo' && validationErrors.has(branchId)) {
            setValidationErrors(prev => {
                const newErrors = new Map(prev);
                const branchErrors = new Set(newErrors.get(branchId));
                branchErrors.delete('thenSkipTo');
                if (branchErrors.size === 0) newErrors.delete(branchId);
                else newErrors.set(branchId, branchErrors);
                return newErrors;
            });
        }
    };

    const handleAddCondition = (branchId: string) => {
        if (!branchingLogic) return;
        const newCondition: BranchingCondition = { id: generateId('cond'), questionId: '', operator: 'equals', value: '', isConfirmed: false };
        onUpdate({
            branchingLogic: {
                ...branchingLogic,
                branches: branchingLogic.branches.map(b => 
                    b.id === branchId ? { ...b, conditions: [...b.conditions, newCondition] } : b
                )
            }
        });
    };

    const handleConfirmCondition = (branchId: string, conditionId: string) => {
        if (!branchingLogic) return;
        const branch = branchingLogic.branches.find(b => b.id === branchId);
        const condition = branch?.conditions.find(c => c.id === conditionId);
        if (!condition) return;

        const tempErrors = new Set<keyof BranchingCondition>();
        if (!condition.questionId) tempErrors.add('questionId');
        const requiresValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
        if (requiresValue && !condition.value.trim()) tempErrors.add('value');
        if (tempErrors.size > 0) {
            setValidationErrors(prev => new Map(prev).set(conditionId, tempErrors));
            return;
        }

        const persistentIssues = issues.filter(i => i.sourceId === conditionId);
        if (persistentIssues.length > 0) {
            return;
        }

        handleUpdateCondition(branchId, conditionId, 'isConfirmed', true);
        setValidationErrors(prev => {
            const newErrors = new Map(prev);
            newErrors.delete(conditionId);
            return newErrors;
        });
    };

    const handleConfirmDestination = (branchId: string) => {
        const branch = branchingLogic?.branches.find(b => b.id === branchId);
        if (!branch) return;

        let hasTempError = false;
        if (!branch.thenSkipTo) {
            hasTempError = true;
            setValidationErrors(prev => {
                const newErrors = new Map(prev);
                const branchErrors = new Set(newErrors.get(branchId) || []);
                branchErrors.add('thenSkipTo');
                return newErrors.set(branchId, branchErrors);
            });
        }
        
        const hasPersistentError = issues.some(i => i.sourceId === branchId && i.field === 'skipTo');

        if (hasTempError || hasPersistentError) return;

        handleUpdateBranch(branchId, 'thenSkipToIsConfirmed', true);
    };

    const handleConfirmOtherwise = () => {
        if (!branchingLogic) return;
        let hasTempError = false;
        if (!branchingLogic.otherwiseSkipTo) {
            hasTempError = true;
            setValidationErrors(prev => {
                const newErrors = new Map(prev);
                const branchErrors = new Set(newErrors.get('otherwise') || []);
                branchErrors.add('otherwiseSkipTo');
                return newErrors.set('otherwise', branchErrors);
            });
        }
        
        const hasPersistentError = issues.some(i => i.sourceId === 'otherwise' && i.field === 'skipTo');
        
        if (hasTempError || hasPersistentError) return;

        onUpdate({ branchingLogic: { ...branchingLogic, otherwiseIsConfirmed: true } });
    };

    const handleRemoveCondition = (branchId: string, conditionId: string) => {
        if (!branchingLogic) return;
        onUpdate({
            branchingLogic: {
                ...branchingLogic,
                branches: branchingLogic.branches.map(b => {
                    if (b.id !== branchId) return b;
                    const newConditions = b.conditions.filter(c => c.id !== conditionId);
                    return { ...b, conditions: newConditions };
                })
            }
        });
        setValidationErrors(prev => {
            const newErrors = new Map(prev);
            newErrors.delete(conditionId);
            return newErrors;
        });
    };

    const handleUpdateCondition = (branchId: string, conditionId: string, field: keyof BranchingCondition, value: any) => {
        if (!branchingLogic) return;
        onUpdate({
            branchingLogic: {
                ...branchingLogic,
                branches: branchingLogic.branches.map(b => 
                    b.id === branchId 
                        ? { ...b, conditions: b.conditions.map(c => c.id === conditionId ? { ...c, [field]: value } : c) } 
                        : b
                )
            }
        });
        if (validationErrors.has(conditionId)) {
            setValidationErrors(prev => {
                const newErrors = new Map(prev);
                const conditionErrors = new Set(newErrors.get(conditionId));
                conditionErrors.delete(field);
                if (conditionErrors.size === 0) newErrors.delete(conditionId);
                else newErrors.set(conditionId, conditionErrors);
                return newErrors;
            });
        }
    };

    const handleUpdateOtherwise = (skipTo: string) => {
        if (!branchingLogic) return;
        onUpdate({ branchingLogic: { ...branchingLogic, otherwiseSkipTo: skipTo } });
         if (validationErrors.has('otherwise')) {
            setValidationErrors(prev => {
                const newErrors = new Map(prev);
                const branchErrors = new Set(newErrors.get('otherwise'));
                branchErrors.delete('otherwiseSkipTo');
                if (branchErrors.size === 0) newErrors.delete('otherwise');
                else newErrors.set('otherwise', branchErrors);
                return newErrors;
            });
        }
    };

    if (!branchingLogic) {
        return (
            <div>
                <h3 className="text-sm font-medium text-on-surface mb-1">Branching Logic</h3>
                <p className="text-xs text-on-surface-variant mb-3">Create complex paths through the survey based on multiple conditions.</p>
                {isPasting ? (
                     <PasteInlineForm
                        onSave={handlePasteInitialBranch}
                        onCancel={() => setIsPasting(false)}
                        placeholder={"Q1 equals Yes\nQ2 not_equals 5"}
                        primaryActionLabel="Add Branch Logic"
                        disclosureText="Branching logic requires advanced syntax;"
                        helpTopic="Branching Logic"
                        onRequestGeminiHelp={onRequestGeminiHelp}
                    />
                ) : (
                    <div className="flex items-center gap-4">
                        <button onClick={handleEnable} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors">
                            <PlusIcon className="text-base" />
                            Add Branching Logic
                        </button>
                        <CopyAndPasteButton onClick={() => setIsPasting(true)} />
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                     <h3 className="text-sm font-medium text-on-surface">Branching Logic</h3>
                     <p className="text-xs text-on-surface-variant mt-0.5">Create complex paths through the survey based on multiple conditions.</p>
                </div>
                <button onClick={handleDisable} className="text-sm font-medium text-error hover:underline px-2 py-1 rounded-md hover:bg-error-container/50">
                    Remove
                </button>
            </div>
            
            <div className="space-y-4">
                {branchingLogic.branches.map((branch, branchIndex) => {
                    const isCollapsed = collapsedBranches.has(branch.id);
                    return (
                        <div key={branch.id} className="p-3 border border-outline-variant rounded-md bg-surface">
                            <div 
                                onClick={() => handleToggleBranchCollapse(branch.id)} 
                                className="w-full flex justify-between items-center cursor-pointer"
                                aria-expanded={!isCollapsed}
                            >
                                <div className="flex items-center">
                                    <ChevronDownIcon className={`text-xl mr-2 text-on-surface-variant transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                                    <p className="text-xs font-bold text-on-surface uppercase">Branch {branchIndex + 1}</p>
                                </div>
                                {isCollapsed && <span className="text-xs text-on-surface-variant truncate max-w-[200px]">{branch.conditions.map(c => c.questionId).join(', ')}...</span>}
                                <button onClick={(e) => { e.stopPropagation(); handleRemoveBranch(branch.id); }} className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full text-xs">
                                    <XIcon className="text-sm" />
                                </button>
                            </div>
                            
                            {!isCollapsed && (
                                <div className="mt-2 pl-6">
                                    <p className="text-xs font-medium text-on-surface mb-1">If:</p>
                                    
                                    <div className="space-y-2 mb-2">
                                        {branch.conditions.map((condition) => (
                                            <LogicConditionRow
                                                key={condition.id}
                                                condition={condition}
                                                issues={issues.filter(i => i.sourceId === condition.id)}
                                                onUpdateCondition={(field, value) => handleUpdateCondition(branch.id, condition.id, field, value)}
                                                onRemoveCondition={() => handleRemoveCondition(branch.id, condition.id)}
                                                onConfirm={() => handleConfirmCondition(branch.id, condition.id)}
                                                previousQuestions={previousQuestions}
                                                // FIX: Cast validationErrors for this condition to the specific type expected by LogicConditionRow.
                                                // The parent state `validationErrors` has a broader type to accommodate other logic errors.
                                                invalidFields={validationErrors.get(condition.id) as Set<keyof BranchingCondition>}
                                            />
                                        ))}
                                    </div>

                                    {branch.conditions.length > 1 && (
                                        <div className="flex items-center gap-1 mb-2">
                                            <button onClick={() => handleUpdateBranch(branch.id, 'operator', 'AND')} className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${branch.operator === 'AND' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>AND</button>
                                            <button onClick={() => handleUpdateBranch(branch.id, 'operator', 'OR')} className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${branch.operator === 'OR' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>OR</button>
                                        </div>
                                    )}
                                     {pastingInlineBranchId === branch.id ? (
                                        <div className="my-2">
                                            <PasteInlineForm
                                                onSave={(text) => handlePasteIntoBranch(branch.id, text)}
                                                onCancel={() => setPastingInlineBranchId(null)}
                                                placeholder={"Q3 equals A\nQ4 not_equals B"}
                                                primaryActionLabel="Add Conditions"
                                                disclosureText="Branching logic requires advanced syntax;"
                                                helpTopic="Branching Logic"
                                                onRequestGeminiHelp={onRequestGeminiHelp}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 mb-2">
                                            <button onClick={() => handleAddCondition(branch.id)} className="text-xs font-medium text-primary hover:underline">+ Add condition</button>
                                            <CopyAndPasteButton onClick={() => setPastingInlineBranchId(branch.id)} className="text-xs" />
                                        </div>
                                    )}

                                    <DestinationRow
                                        label="Then skip to:"
                                        value={branch.thenSkipTo}
                                        onChange={(value) => handleUpdateBranch(branch.id, 'thenSkipTo', value)}
                                        onConfirm={() => handleConfirmDestination(branch.id)}
                                        isConfirmed={branch.thenSkipToIsConfirmed}
                                        issue={issues.find(i => i.sourceId === branch.id && i.field === 'skipTo')}
                                        invalid={validationErrors.has(branch.id) && validationErrors.get(branch.id)!.has('thenSkipTo')}
                                        followingQuestions={followingQuestions}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="p-3 border border-dashed border-outline-variant rounded-md">
                     <DestinationRow
                        label="Otherwise, skip to:"
                        value={branchingLogic.otherwiseSkipTo}
                        onChange={handleUpdateOtherwise}
                        onConfirm={handleConfirmOtherwise}
                        isConfirmed={branchingLogic.otherwiseIsConfirmed}
                        issue={issues.find(i => i.sourceId === 'otherwise' && i.field === 'skipTo')}
                        invalid={validationErrors.has('otherwise') && validationErrors.get('otherwise')!.has('otherwiseSkipTo')}
                        followingQuestions={followingQuestions}
                    />
                </div>
            </div>

            <button onClick={handleAddBranch} className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors">
                <PlusIcon className="text-base" />
                Add Branch
            </button>
        </div>
    );
};

export default RightSidebar;