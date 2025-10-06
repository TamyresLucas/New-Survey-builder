import React, { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Survey, Question, ToolboxItemData, Choice, DisplayLogicCondition, SkipLogicRule, ChoiceLogic, Piping, CarryForward } from '../types';
import { QuestionType } from '../types';
import { generateId, parseChoice, CHOICE_BASED_QUESTION_TYPES, truncate } from '../utils';
import { PasteChoicesModal } from './PasteChoicesModal';
import { 
    XIcon, PlusIcon, ExpandIcon, CollapseIcon, ChevronDownIcon, DragIndicatorIcon,
    MoreVertIcon, ArrowRightAltIcon,
    SignalIcon, BatteryIcon, RadioButtonUncheckedIcon, CheckboxOutlineIcon,
    RadioIcon, CheckboxFilledIcon, ShuffleIcon,
    InfoIcon, EyeIcon, ContentPasteIcon
} from './icons';
import { QuestionTypeSelectionMenuContent } from './ActionMenus';

interface RightSidebarProps {
  question: Question;
  survey: Survey;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  onAddChoice: (questionId: string) => void;
  onDeleteChoice: (questionId: string, choiceId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  toolboxItems: ToolboxItemData[];
}

const ChoiceDropIndicator = () => <div className="h-px bg-primary w-full my-1" />;

const RightSidebar: React.FC<RightSidebarProps> = memo(({
  question,
  survey,
  onClose,
  activeTab,
  onTabChange,
  onUpdateQuestion,
  onAddChoice,
  onDeleteChoice,
  isExpanded,
  onToggleExpand,
  toolboxItems
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
  
  const previousQuestions = useMemo(() => allSurveyQuestions.slice(0, currentQuestionIndex), [allSurveyQuestions, currentQuestionIndex]);

  const followingQuestions = useMemo(() => allSurveyQuestions.slice(currentQuestionIndex + 1), [allSurveyQuestions, currentQuestionIndex]);

  const previousChoiceQuestions = useMemo(() => 
      previousQuestions.filter(q => q.choices && q.choices.length > 0), 
    [previousQuestions]
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
                <button onClick={() => onAddChoice(question.id)} className="flex items-center text-sm font-medium text-primary hover:underline"><PlusIcon className="text-base mr-1" /> Add Choice</button>
                <button onClick={() => setIsPasteModalOpen(true)} className="flex items-center text-sm font-medium text-primary hover:underline"><ContentPasteIcon className="text-base mr-1" /> Copy and paste</button>
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
        <div className="space-y-6">
            {/* --- SECTION 1: LOGIC --- */}
            <div>
                <h2 className="text-base font-bold text-on-surface mb-4">Logic</h2>

                {/* --- 1.1 Display Logic --- */}
                <DisplayLogicEditor
                    question={question}
                    previousQuestions={previousQuestions}
                    onUpdate={handleUpdate}
                />

                {/* --- 1.2 Skip Logic --- */}
                <SkipLogicEditor
                    question={question}
                    followingQuestions={followingQuestions}
                    onUpdate={handleUpdate}
                    isChoiceBased={isChoiceBased}
                />
            </div>

            {/* --- SECTION 2: ANSWER BEHAVIOR --- */}
            {isChoiceBased && (
                <div className="border-t border-outline-variant pt-6">
                    <h2 className="text-base font-bold text-on-surface mb-4">Answer Behavior</h2>
                    <div className="space-y-6">
                        <RandomizeChoicesEditor 
                            question={question}
                            onUpdate={handleUpdate}
                        />
                        <ChoiceLogicEditor
                            question={question}
                            onUpdate={handleUpdate}
                        />
                        <PipingEditor 
                            question={question}
                            onUpdate={handleUpdate}
                        />
                        <CarryForwardEditor
                            question={question}
                            previousChoiceQuestions={previousChoiceQuestions}
                            onUpdate={handleUpdate}
                        />
                    </div>
                </div>
            )}
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
        <div className="flex-1 p-6 overflow-y-auto" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          {renderTabContent()}
        </div>
      </aside>
    </>
  );
});

// =================================================================
// BEHAVIOR TAB SUB-COMPONENTS
// =================================================================

const DisplayLogicEditor: React.FC<{ question: Question; previousQuestions: Question[]; onUpdate: (updates: Partial<Question>) => void; }> = ({ question, previousQuestions, onUpdate }) => {
    const displayLogic = question.displayLogic;

    const handleAddDisplayLogic = () => {
        const newCondition: DisplayLogicCondition = {
            id: generateId('cond'),
            questionId: '',
            operator: 'equals',
            value: '',
        };
        onUpdate({
            displayLogic: {
                operator: displayLogic?.operator || 'AND',
                conditions: [...(displayLogic?.conditions || []), newCondition],
            },
        });
    };

    const handleUpdateCondition = (index: number, field: keyof DisplayLogicCondition, value: any) => {
        if (!displayLogic) return;
        const newConditions = [...displayLogic.conditions];
        newConditions[index] = { ...newConditions[index], [field]: value };
        onUpdate({ displayLogic: { ...displayLogic, conditions: newConditions } });
    };

    const handleRemoveCondition = (index: number) => {
        if (!displayLogic) return;
        const newConditions = displayLogic.conditions.filter((_, i) => i !== index);
        onUpdate({ displayLogic: newConditions.length > 0 ? { ...displayLogic, conditions: newConditions } : undefined });
    };

    const setLogicOperator = (operator: 'AND' | 'OR') => {
        if (!displayLogic) return;
        onUpdate({ displayLogic: { ...displayLogic, operator } });
    };

    if (!displayLogic || displayLogic.conditions.length === 0) {
        return (
            <div className="mb-6">
                <h3 className="text-sm font-medium text-on-surface mb-1">Display Logic</h3>
                <p className="text-xs text-on-surface-variant mb-3">Control when this question is shown to respondents</p>
                <button onClick={handleAddDisplayLogic} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors">
                    <PlusIcon className="text-base" />
                    Add Display Logic
                </button>
            </div>
        );
    }

    return (
        <div className="mb-6">
            <h3 className="text-sm font-medium text-on-surface mb-1">Display Logic</h3>
            <p className="text-xs text-on-surface-variant mb-3">Control when this question is shown to respondents</p>
            <p className="text-xs font-medium text-on-surface mb-2">Show this question if:</p>
            
            <div className="space-y-2 mb-3">
                {displayLogic.conditions.map((condition, index) => (
                    <div key={condition.id || index} className="flex items-center gap-2 p-2 bg-surface-container-high rounded-md">
                        <select value={condition.questionId} onChange={(e) => handleUpdateCondition(index, 'questionId', e.target.value)} className="flex-1 bg-surface border border-outline rounded-md px-2 py-1.5 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none" aria-label="Select question">
                            <option value="">Select question...</option>
                            {previousQuestions.map(q => <option key={q.id} value={q.qid}>{q.qid}: {truncate(q.text, 50)}</option>)}
                        </select>
                        <select value={condition.operator} onChange={(e) => handleUpdateCondition(index, 'operator', e.target.value)} className="w-28 bg-surface border border-outline rounded-md px-2 py-1.5 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none" aria-label="Select operator">
                            <option value="equals">equals</option>
                            <option value="not_equals">not equals</option>
                            <option value="contains">contains</option>
                            <option value="greater_than">greater than</option>
                            <option value="less_than">less than</option>
                            <option value="is_empty">is empty</option>
                            <option value="is_not_empty">is not empty</option>
                        </select>
                        {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                            <input type="text" value={condition.value} onChange={(e) => handleUpdateCondition(index, 'value', e.target.value)} placeholder="Value" className="flex-1 bg-surface border border-outline rounded-md px-2 py-1.5 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary" aria-label="Condition value" />
                        )}
                        <button onClick={() => handleRemoveCondition(index)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full transition-colors flex-shrink-0" aria-label="Remove condition">
                            <XIcon className="text-lg" />
                        </button>
                    </div>
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

            <div className="mt-3 p-3 bg-surface-container-high rounded-md">
                <p className="text-xs text-on-surface-variant">
                    <strong>💡 How it works:</strong> This question will only be shown to respondents if the conditions above are met.
                    {displayLogic.operator === 'AND' && ' All conditions must be true (AND logic).'}
                    {displayLogic.operator === 'OR' && ' At least one condition must be true (OR logic).'}
                </p>
            </div>
        </div>
    );
};

const SkipLogicEditor: React.FC<{ question: Question; followingQuestions: Question[]; onUpdate: (updates: Partial<Question>) => void; isChoiceBased: boolean; }> = ({ question, followingQuestions, onUpdate, isChoiceBased }) => {
    const isEnabled = !!question.skipLogic;

    const handleToggle = (enabled: boolean) => {
        if (enabled) {
            const defaultLogic = isChoiceBased
                ? { type: 'per_choice' as const, rules: [] }
                : { type: 'simple' as const, skipTo: 'next' };
            onUpdate({ skipLogic: defaultLogic });
        } else {
            onUpdate({ skipLogic: undefined });
        }
    };

    const handleSimpleSkipChange = (skipTo: string) => {
        onUpdate({ skipLogic: { type: 'simple', skipTo } });
    };

    const handleChoiceSkipChange = (choiceId: string, skipTo: string) => {
        const existingRules = isEnabled && question.skipLogic?.type === 'per_choice' ? question.skipLogic.rules : [];
        const ruleIndex = existingRules.findIndex(r => r.choiceId === choiceId);
        let newRules: SkipLogicRule[];

        if (ruleIndex > -1) {
            newRules = [...existingRules];
            newRules[ruleIndex] = { ...newRules[ruleIndex], skipTo };
        } else {
            newRules = [...existingRules, { choiceId, skipTo }];
        }
        onUpdate({ skipLogic: { type: 'per_choice', rules: newRules } });
    };

    const getChoiceSkipTo = (choiceId: string) => {
        if (isEnabled && question.skipLogic?.type === 'per_choice') {
            return question.skipLogic.rules.find(r => r.choiceId === choiceId)?.skipTo || 'next';
        }
        return 'next';
    };

    const description = isChoiceBased ? "Skip to different questions based on the selected answer" : "Skip to a different question if answered";

    return (
        <div>
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h3 className="text-sm font-medium text-on-surface">Skip Logic</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => handleToggle(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
            
            {isEnabled && (
                <div className="mt-4">
                    {isChoiceBased ? (
                        <>
                            <div className="space-y-2">
                                {(question.choices || []).map((choice) => (
                                    <div key={choice.id} className="flex items-center gap-2">
                                        <span className="text-sm text-on-surface w-20 flex-shrink-0 truncate" title={parseChoice(choice.text).label}>{parseChoice(choice.text).label}</span>
                                        <ArrowRightAltIcon className="text-on-surface-variant text-lg flex-shrink-0" />
                                        <div className="relative flex-1">
                                            <select value={getChoiceSkipTo(choice.id)} onChange={(e) => handleChoiceSkipChange(choice.id, e.target.value)} className="w-full bg-surface border border-outline rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none">
                                                <option value="next">Next Question</option>
                                                {followingQuestions.map(q => <option key={q.id} value={q.id}>{q.qid}: {truncate(q.text, 50)}</option>)}
                                                <option value="end">End of Survey</option>
                                            </select>
                                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 p-3 bg-surface-container-high rounded-md">
                                <p className="text-xs text-on-surface-variant"><strong>💡 Tip:</strong> Leave as "Next Question" if no skip is needed for that choice. Different choices can skip to different destinations.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 p-3 bg-surface-container-high rounded-md">
                                <span className="text-sm text-on-surface flex-shrink-0">If answered, skip to:</span>
                                <div className="relative flex-1">
                                    <select value={question.skipLogic?.type === 'simple' ? question.skipLogic.skipTo : 'next'} onChange={(e) => handleSimpleSkipChange(e.target.value)} className="w-full bg-surface border border-outline rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none">
                                        <option value="next">Next Question</option>
                                        {followingQuestions.map(q => <option key={q.id} value={q.id}>{q.qid}: {truncate(q.text, 50)}</option>)}
                                        <option value="end">End of Survey</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                                </div>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-2">Note: Skip logic applies when respondent provides any answer</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};


const RandomizeChoicesEditor: React.FC<{ question: Question; onUpdate: (updates: Partial<Question>) => void; }> = ({ question, onUpdate }) => {
    const randomizeChoices = question.answerBehavior?.randomizeChoices || false;

    const handleToggleRandomize = (enabled: boolean) => {
        onUpdate({ answerBehavior: { ...question.answerBehavior, randomizeChoices: enabled } });
    };

    const handleToggleFixedPosition = (choiceId: string, isFixed: boolean) => {
        const newChoices = question.choices?.map(c => c.id === choiceId ? { ...c, fixedPosition: isFixed } : c);
        onUpdate({ choices: newChoices });
    };

    return (
        <div className="mb-6">
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
                <div className="mt-4 ml-4 p-3 bg-surface-container-high rounded-md">
                    <p className="text-xs font-medium text-on-surface mb-2">Fixed Positions</p>
                    <p className="text-xs text-on-surface-variant mb-3">Keep specific choices in fixed positions (e.g., "Other" always last)</p>
                    <div className="space-y-2">
                        {(question.choices || []).map((choice, index) => (
                            <label key={choice.id || index} className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                                <input type="checkbox" checked={choice.fixedPosition || false} onChange={(e) => handleToggleFixedPosition(choice.id, e.target.checked)} className="w-4 h-4 accent-primary cursor-pointer" />
                                <span>Keep "{truncate(parseChoice(choice.text).label, 30)}" at position {index + 1}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ChoiceLogicEditor: React.FC<{ question: Question; onUpdate: (updates: Partial<Question>) => void; }> = ({ question, onUpdate }) => {
    // This editor is a placeholder as per the spec. A full implementation would require a modal or more complex UI to select the choice to add logic to.
    return (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-on-surface mb-1">Choice Logic</h3>
          <p className="text-xs text-on-surface-variant mb-3">
            Configure individual choice behaviors (e.g., make "None of the above" exclusive)
          </p>
          <button
            onClick={() => alert("Choice Logic UI not fully implemented.")}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors"
          >
            <PlusIcon className="text-base" />
            Add choice behavior
          </button>
        </div>
    );
};

const PipingEditor: React.FC<{ question: Question; onUpdate: (updates: Partial<Question>) => void; }> = ({ question, onUpdate }) => {
    return (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-on-surface mb-1">Piping</h3>
          <p className="text-xs text-on-surface-variant mb-3">
            Insert answers from previous questions into question or choice text
          </p>
          <button
            onClick={() => alert("Piping dialog not implemented.")}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors"
          >
            <PlusIcon className="text-base" />
            Insert Piped Text
          </button>
        </div>
    );
};

const CarryForwardEditor: React.FC<{ question: Question; previousChoiceQuestions: Question[]; onUpdate: (updates: Partial<Question>) => void; }> = ({ question, previousChoiceQuestions, onUpdate }) => {
    const carryForward = question.answerBehavior?.carryForward;
    const isEnabled = !!carryForward;

    const handleToggle = (enabled: boolean) => {
        if (enabled) {
            onUpdate({
                answerBehavior: {
                    ...question.answerBehavior,
                    carryForward: {
                        sourceQuestionId: '',
                        onlySelected: false,
                        onlyNotSelected: false,
                    },
                },
            });
        } else {
            const { carryForward, ...rest } = question.answerBehavior || {};
            const newAnswerBehavior = Object.keys(rest).length > 0 ? rest : undefined;
            onUpdate({ answerBehavior: newAnswerBehavior });
        }
    };

    const setCarryForwardSource = (sourceQuestionId: string) => {
        if (!isEnabled) return;
        onUpdate({
            answerBehavior: {
                ...question.answerBehavior,
                carryForward: {
                    ...(question.answerBehavior!.carryForward!),
                    sourceQuestionId,
                },
            },
        });
    };

    const setCarryForwardFilter = (filters: Partial<CarryForward>) => {
        if (!isEnabled) return;
        onUpdate({ 
            answerBehavior: { 
                ...question.answerBehavior, 
                carryForward: { 
                    ...question.answerBehavior!.carryForward!, 
                    ...filters 
                } 
            } 
        });
    };
    
    const getQuestionText = (questionId: string) => {
        const sourceQuestion = previousChoiceQuestions.find(q => q.id === questionId);
        if (!sourceQuestion) return 'Unknown Question';
        return `${sourceQuestion.qid}: ${truncate(sourceQuestion.text, 50)}`;
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h3 className="text-sm font-medium text-on-surface">Carry Forward</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">Reuse answer choices from a previous question</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => handleToggle(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>

            {isEnabled && (
                <div className="mt-4 space-y-4">
                    {!carryForward.sourceQuestionId ? (
                        <div>
                            <label htmlFor="carry-forward-source" className="block text-xs font-medium text-on-surface-variant mb-1">Source Question</label>
                            <div className="relative">
                                <select id="carry-forward-source" value={''} onChange={(e) => setCarryForwardSource(e.target.value)} className="w-full bg-surface border border-outline rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none">
                                    <option value="">Select a question...</option>
                                    {previousChoiceQuestions.map(q => <option key={q.id} value={q.id}>{q.qid}: {truncate(q.text, 50)}</option>)}
                                </select>
                                <ChevronDownIcon className="material-symbols-rounded absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                            </div>
                            <p className="text-xs text-on-surface-variant mt-1">Only questions with answer choices can be selected</p>
                        </div>
                    ) : (
                        <div className="p-3 bg-surface-container-high rounded-md">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-xs font-medium text-on-surface-variant">Carrying forward from:</p>
                                    <p className="text-sm font-medium text-on-surface">{getQuestionText(carryForward.sourceQuestionId)}</p>
                                </div>
                                <button onClick={() => setCarryForwardSource('')} className="text-xs font-medium text-primary hover:underline">Change</button>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-start gap-2 text-xs text-on-surface cursor-pointer">
                                    <input type="checkbox" checked={carryForward.onlySelected || false} onChange={(e) => setCarryForwardFilter({ onlySelected: e.target.checked, onlyNotSelected: false })} className="w-4 h-4 mt-0.5 accent-primary cursor-pointer" />
                                    <div>
                                        <div className="font-medium">Only carry forward choices that were selected</div>
                                        <div className="text-on-surface-variant">Show only the choices the respondent selected</div>
                                    </div>
                                </label>
                                <label className="flex items-start gap-2 text-xs text-on-surface cursor-pointer">
                                    <input type="checkbox" checked={carryForward.onlyNotSelected || false} onChange={(e) => setCarryForwardFilter({ onlyNotSelected: e.target.checked, onlySelected: false })} className="w-4 h-4 mt-0.5 accent-primary cursor-pointer" />
                                    <div>
                                        <div className="font-medium">Only carry forward choices that were NOT selected</div>
                                        <div className="text-on-surface-variant">Show only the choices the respondent did not select</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                     <div className="p-3 bg-surface-container-high rounded-md">
                        <p className="text-xs font-medium text-on-surface mb-1">💡 Use case:</p>
                        <p className="text-xs text-on-surface-variant mb-1"><strong>Q1:</strong> "Which products have you used?" (Checkbox)</p>
                        <p className="text-xs text-on-surface-variant"><strong>Q2:</strong> "Which of these would you recommend?" (Carry forward from Q1)</p>
                    </div>
                </div>
            )}
        </div>
    );
};


export default RightSidebar;