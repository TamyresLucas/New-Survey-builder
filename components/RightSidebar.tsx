

import React, { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Survey, Question, ToolboxItemData, Choice, ChoiceBehaviorRule } from '../types';
import { QuestionType, RandomizationType } from '../types';
import { generateId, parseChoice, CHOICE_BASED_QUESTION_TYPES } from '../utils';
import { PasteChoicesModal } from './PasteChoicesModal';
import { 
    XIcon, PlusIcon, ExpandIcon, CollapseIcon, ChevronDownIcon, DragIndicatorIcon,
    MoreVertIcon, ImageIcon, ArrowRightAltIcon,
    ComputerIcon, TabletIcon, SmartphoneIcon, ContentPasteIcon,
    SignalIcon, BatteryIcon, RadioButtonUncheckedIcon, CheckboxOutlineIcon,
    RadioIcon, CheckboxFilledIcon
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

const placeholderImages = [
    'https://images.unsplash.com/photo-1550305228-a9f34abc7413?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1598816569137-4001192936b4?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1541592106381-b5869c023910?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1551893214-e48a08083c6f?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=200&h=200&fit=crop'
];

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
  
  const allSurveyQuestions = useMemo(() => 
    survey.blocks.flatMap(b => b.questions)
      .filter(q => q.id !== question.id && q.choices && q.choices.length > 0), 
    [survey, question.id]
  );
  
  const isChoiceBased = useMemo(() => CHOICE_BASED_QUESTION_TYPES.has(question.type), [question.type]);

  const availableTabs = useMemo(() => {
    const tabs = ['Settings', 'Behavior', 'Preview'];
    if (isChoiceBased) {
      tabs.push('Advanced');
    }
    return tabs;
  }, [isChoiceBased]);
  
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

  const handleImageSelect = (choiceId: string) => {
      const currentChoice = question.choices?.find(c => c.id === choiceId);
      const currentIndex = currentChoice?.image ? placeholderImages.indexOf(currentChoice.image) : -1;
      const nextIndex = (currentIndex + 1) % placeholderImages.length;
      const newImage = placeholderImages[nextIndex];
      handleChoicePropertyChange(choiceId, 'image', newImage);
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
  
  const isRandomizationEnabled = question.behavior?.randomizationType !== RandomizationType.None && !!question.behavior?.randomizationType;

  const handleToggleRandomization = (e: React.ChangeEvent<HTMLInputElement>) => {
      const isEnabled = e.target.checked;
      handleUpdate({
          behavior: {
              ...question.behavior,
              randomizationType: isEnabled ? RandomizationType.Permutation : RandomizationType.None,
          }
      });
  };

  const handleAddChoiceBehaviorRule = () => {
    const newRule: ChoiceBehaviorRule = {
      id: generateId('cbr'),
      type: 'eliminate',
      targetChoiceId: question.choices?.[0]?.id || '',
      sourceQuestionId: '',
      sourceChoiceId: ''
    };
    const existingRules = question.behavior?.choiceBehaviorRules || [];
    handleUpdate({
      behavior: { ...question.behavior, choiceBehaviorRules: [...existingRules, newRule] }
    });
  };
  
  const handleUpdateChoiceBehaviorRule = (ruleId: string, updates: Partial<ChoiceBehaviorRule>) => {
    const existingRules = question.behavior?.choiceBehaviorRules || [];
    const newRules = existingRules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    // If source question changes, reset source choice
    if (updates.sourceQuestionId !== undefined) {
      const ruleToUpdate = newRules.find(r => r.id === ruleId);
      if (ruleToUpdate) {
        ruleToUpdate.sourceChoiceId = '';
      }
    }
    handleUpdate({
      behavior: { ...question.behavior, choiceBehaviorRules: newRules }
    });
  };
  
  const handleDeleteChoiceBehaviorRule = (ruleId: string) => {
    const existingRules = question.behavior?.choiceBehaviorRules || [];
    const newRules = existingRules.filter(rule => rule.id !== ruleId);
    handleUpdate({
      behavior: { ...question.behavior, choiceBehaviorRules: newRules }
    });
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

  const CurrentQuestionType = toolboxItems.find(item => item.name === question.type);
  const initialChoicesText = (question.choices || []).map(c => parseChoice(c.text).label).join('\n');

  const renderSettingsTab = () => {
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
                    {CurrentQuestionType ? <CurrentQuestionType.icon className="text-base text-primary flex-shrink-0" /> : <div className="w-4 h-4 mr-3 flex-shrink-0" />}
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
    
            {isChoiceBased && (
                <>
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
                                <option value="image">Image</option>
                            </select>
                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                        </div>
                    </div>
                </>
            )}

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
    
            {isChoiceBased && (
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
                            {question.answerFormat === 'image' ? (
                                <div className={`flex items-start gap-2 transition-opacity ${draggedChoiceId === choice.id ? 'opacity-30' : ''}`}>
                                    <button onClick={() => handleImageSelect(choice.id)} className="w-20 h-20 rounded-md border-2 border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors flex-shrink-0 bg-surface-container-high overflow-hidden">
                                        {choice.image ? <img src={choice.image} alt="Choice image" className="w-full h-full object-cover" /> : <ImageIcon className="text-3xl" />}
                                    </button>
                                    <div className="flex-grow space-y-2">
                                        <input
                                            type="text"
                                            value={parseChoice(choice.text).label}
                                            onChange={(e) => handleChoiceTextChange(choice.id, e.target.value)}
                                            className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                                            placeholder="Enter label"
                                        />
                                        {choice.image && <button onClick={() => handleChoicePropertyChange(choice.id, 'image', null)} className="text-xs text-error hover:underline">Remove image</button>}
                                    </div>
                                    <button onClick={() => onDeleteChoice(question.id, choice.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full" aria-label="Delete choice">
                                        <XIcon className="text-lg" />
                                    </button>
                                </div>
                            ) : (
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
                            )}
                            {expandedChoiceId === choice.id && (
                            <div className="ml-8 mt-2 p-3 bg-surface-container-high rounded-md space-y-3">
                                <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-on-surface-variant">Visible</label>
                                <input type="checkbox" checked={choice.visible ?? true} onChange={e => handleChoicePropertyChange(choice.id, 'visible', e.target.checked)} className="accent-primary" />
                                </div>
                                <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-on-surface-variant">Fixed Position</label>
                                <input type="checkbox" checked={choice.fixed ?? false} onChange={e => handleChoicePropertyChange(choice.id, 'fixed', e.target.checked)} className="accent-primary" />
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
                    {question.answerFormat !== 'image' && <button onClick={() => setIsPasteModalOpen(true)} className="flex items-center text-sm font-medium text-primary hover:underline"><ContentPasteIcon className="text-base mr-1" /> Copy and paste</button>}
                    </div>
                </div>
            )}
        </div>
    );
  };

  const renderBehaviorTab = () => {
    const randomizationOptions: { value: RandomizationType; label: string; tooltip: string }[] = [
        { value: RandomizationType.None, label: 'None', tooltip: 'Choices are displayed in the order they are defined.' },
        { value: RandomizationType.Permutation, label: 'Permutation', tooltip: 'Randomly shuffles the order of all choices for each respondent.' },
        { value: RandomizationType.RandomReverse, label: 'Random reverse', tooltip: 'Randomly shows choices in either the original or the reversed order to respondents.' },
        { value: RandomizationType.ReverseOrder, label: 'Reverse order', tooltip: 'Displays all choices in the reverse of their defined order for every respondent.' },
        { value: RandomizationType.Rotation, label: 'Rotation', tooltip: 'Cycles the choice order. For each new respondent, the first choice is moved to the end.' },
        { value: RandomizationType.SortByCode, label: 'Sort by code', tooltip: 'Sorts choices based on their code (e.g., Q1_1, Q1_2) alphabetically/numerically.' },
        { value: RandomizationType.SortByText, label: 'Sort by text', tooltip: 'Sorts choices alphabetically based on their visible text label.' },
        { value: RandomizationType.Synchronized, label: 'Synchronized', tooltip: 'Matches the randomized choice order of another specified question.' },
    ];
    
    const dropdownRandomizationOptions = randomizationOptions.filter(opt => opt.value !== RandomizationType.None);
    const currentRandomizationTooltip = randomizationOptions.find(opt => opt.value === (question.behavior?.randomizationType || RandomizationType.None))?.tooltip;

    return (
     <div className="space-y-6">
        {/* --- LOGIC SECTION --- */}
        <div className="space-y-6">
            <h3 className="text-base font-semibold text-on-surface">Logic</h3>
            
            <div>
                <h4 className="text-sm font-medium text-on-surface mb-2">Display Logic</h4>
                <p className="text-xs text-on-surface-variant mb-3">Control when this question is shown to respondents</p>
                <button onClick={() => alert("Not implemented")} className="flex items-center text-sm font-medium text-primary hover:underline"><PlusIcon className="text-base mr-1" />Add Display Logic</button>
            </div>

            {isChoiceBased && (
                <div>
                    <h4 className="text-sm font-medium text-on-surface mb-2">Skip Logic</h4>
                    <p className="text-xs text-on-surface-variant mb-3">Skip to different questions based on the selected answer</p>
                    <div className="space-y-2">
                        {(question.choices || []).map(choice => (
                            <div key={choice.id} className="flex items-center gap-2">
                                <span className="text-sm text-on-surface flex-shrink-0 w-32 truncate">{parseChoice(choice.text).label}</span>
                                <ArrowRightAltIcon className="text-on-surface-variant flex-shrink-0" />
                                <select className="flex-1 bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary">
                                    <option value="next">Next Question</option>
                                    <option value="end">End of Survey</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {isChoiceBased && (
            <>
                <div className="border-t border-outline-variant" />
                {/* --- ANSWER BEHAVIOR SECTION --- */}
                <div className="space-y-6">
                    <h3 className="text-base font-semibold text-on-surface">Answer Behavior</h3>

                    <div>
                      <div className="flex items-center justify-between">
                          <div>
                              <label htmlFor="randomize-choices-toggle" className="text-sm font-medium text-on-surface">
                                  Randomize choices
                              </label>
                              <p className="text-xs text-on-surface-variant mt-0.5">Show choices in a random order</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                  type="checkbox"
                                  id="randomize-choices-toggle"
                                  checked={isRandomizationEnabled}
                                  onChange={handleToggleRandomization}
                                  className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                      </div>
                      {isRandomizationEnabled && (
                          <div className="mt-4">
                              <label htmlFor="randomize-choices-type" className="block text-sm font-medium text-on-surface-variant mb-1">Randomization type</label>
                              <div className="relative">
                                  <select
                                      id="randomize-choices-type"
                                      value={question.behavior?.randomizationType || RandomizationType.Permutation}
                                      onChange={(e) => handleUpdate({
                                          behavior: {
                                              ...question.behavior,
                                              randomizationType: e.target.value as RandomizationType,
                                          }
                                      })}
                                      className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                  >
                                      {dropdownRandomizationOptions.map(opt => (
                                          <option key={opt.value} value={opt.value} title={opt.tooltip}>
                                              {opt.label}
                                          </option>
                                      ))}
                                  </select>
                                  <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                              </div>
                              {currentRandomizationTooltip && <p className="text-xs text-on-surface-variant mt-1">{currentRandomizationTooltip}</p>}
                          </div>
                      )}
                    </div>
                    
                    <div>
                        <h4 className="text-sm font-medium text-on-surface mb-2">Choice Logic</h4>
                        <div className="space-y-3">
                            {(question.behavior?.choiceBehaviorRules || []).map(rule => {
                                const sourceQuestion = allSurveyQuestions.find(q => q.id === rule.sourceQuestionId);
                                return (
                                    <div key={rule.id} className="p-3 bg-surface-container-high rounded-md border border-outline-variant/50 space-y-4">
                                        <div className="flex items-start gap-2">
                                            <div className="flex-grow space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="relative flex-1">
                                                        <label className="block text-xs font-medium text-on-surface-variant mb-1">Action</label>
                                                        <select value={rule.type} onChange={e => handleUpdateChoiceBehaviorRule(rule.id, { type: e.target.value as 'eliminate' | 'exclude' })} className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none h-9">
                                                            <option value="eliminate">Eliminate</option>
                                                            <option value="exclude">Exclude</option>
                                                        </select>
                                                        <ChevronDownIcon className="absolute right-2 bottom-2 text-on-surface-variant pointer-events-none" />
                                                    </div>
                                                    <div className="relative flex-1">
                                                        <label className="block text-xs font-medium text-on-surface-variant mb-1">On Choice</label>
                                                        <select value={rule.targetChoiceId} onChange={e => handleUpdateChoiceBehaviorRule(rule.id, { targetChoiceId: e.target.value })} className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none h-9" disabled={!question.choices || question.choices.length === 0}>
                                                            {(question.choices || []).map(c => <option key={c.id} value={c.id}>{parseChoice(c.text).label}</option>)}
                                                        </select>
                                                        <ChevronDownIcon className="absolute right-2 bottom-2 text-on-surface-variant pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Condition ("if answered in")</label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <select value={rule.sourceQuestionId} onChange={e => handleUpdateChoiceBehaviorRule(rule.id, { sourceQuestionId: e.target.value })} className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none h-9 truncate">
                                                                <option value="">Select question...</option>
                                                                {allSurveyQuestions.map(q => <option key={q.id} value={q.id} title={`${q.qid}: ${q.text}`}>{q.qid}: {q.text}</option>)}
                                                            </select>
                                                             <ChevronDownIcon className="absolute right-2 bottom-2 text-on-surface-variant pointer-events-none" />
                                                        </div>
                                                        <div className="relative flex-1">
                                                             <select value={rule.sourceChoiceId} onChange={e => handleUpdateChoiceBehaviorRule(rule.id, { sourceChoiceId: e.target.value })} disabled={!sourceQuestion} className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none h-9 truncate">
                                                                <option value="">Select answer...</option>
                                                                {(sourceQuestion?.choices || []).map(c => <option key={c.id} value={c.id}>{parseChoice(c.text).label}</option>)}
                                                            </select>
                                                            <ChevronDownIcon className="absolute right-2 bottom-2 text-on-surface-variant pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteChoiceBehaviorRule(rule.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full" aria-label="Delete rule">
                                                <XIcon className="text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={handleAddChoiceBehaviorRule} className="flex items-center text-sm font-medium text-primary hover:underline mt-4">
                            <PlusIcon className="text-base mr-1" /> Add choice behavior
                        </button>
                    </div>

                </div>
            </>
        )}
     </div>
    );
  };

  const renderPreviewTab = () => {
    if (question.answerFormat === 'image') {
        const renderImageChoices = (isMobile: boolean) => (
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {(question.choices || []).filter(c => c.visible !== false && c.image).map(choice => {
                    const isSelected = selectedPreviewChoices.has(choice.id);
                    return (
                        <div
                            key={choice.id}
                            onClick={() => handlePreviewChoiceClick(choice.id)}
                            className={`relative rounded-lg border-2 overflow-hidden cursor-pointer group transition-all duration-200 ${isSelected ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-surface' : 'border-outline-variant hover:border-primary'}`}
                        >
                            <img src={choice.image} alt={parseChoice(choice.text).label} className="w-full aspect-square object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-bold text-shadow">{parseChoice(choice.text).label}</span>
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                    {question.type === QuestionType.Radio ? 
                                        <div className="w-2 h-2 rounded-full bg-white"></div> :
                                        <CheckboxFilledIcon className="text-sm text-white" style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}} />
                                    }
                                </div>
                            )}
                        </div>
                    );
                })}
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
                            <div className="p-4 overflow-y-auto h-[calc(100%-32px)]">
                                <header className="mb-4">
                                    <h1 className="text-sm font-semibold text-on-surface text-left">{survey.title}</h1>
                                </header>
                                <p className="text-lg text-on-surface mb-6">{questionText || 'Question text will appear here'}</p>
                                {renderImageChoices(true)}
                            </div>
                        </div>
                    </div>
                </div>
              ) : (
                <div>
                  <header className="mb-8">
                      <h1 className="text-xl font-bold text-on-surface text-left">{survey.title}</h1>
                  </header>
                  <p className="text-xl font-medium text-on-surface mb-6">{questionText || 'Question text will appear here'}</p>
                  {renderImageChoices(false)}
                </div>
              )}
            </div>
        );
    }
    
    // Default preview for non-image formats
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
                            <p className="text-lg text-on-surface mb-6">{questionText || 'Question text will appear here'}</p>
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
                                            <span className={`text-sm ${isSelected ? 'text-on-primary-container font-medium' : 'text-on-surface'}`}>{parseChoice(choice.text).label}</span>
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
                <p className="text-xl font-medium text-on-surface">{questionText || 'Question text will appear here'}</p>
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
                          <span className={`text-base ${isSelected ? 'text-on-primary-container font-medium' : 'text-on-surface'}`}>{parseChoice(choice.text).label}</span>
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
  
  const renderAdvancedTab = () => (
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

      <div className="border-t border-outline-variant pt-6">
        <h3 className="text-sm font-medium text-on-surface mb-2">Image Settings</h3>
        <p className="text-xs text-on-surface-variant mb-4">Configure how images are displayed with choices.</p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="image-position" className="block text-sm font-medium text-on-surface-variant mb-1">Image Position</label>
            <div className="relative">
                <select 
                  id="image-position" 
                  value={question.advancedSettings?.imagePosition || 'hidden'} 
                  onChange={e => handleUpdate({ advancedSettings: { ...question.advancedSettings, imagePosition: e.target.value as any } })} 
                  className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                >
                    <option value="hidden">Hidden</option>
                    <option value="above">Above Text</option>
                    <option value="left">Left of Text</option>
                    <option value="right">Right of Text</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="image-size" className="block text-sm font-medium text-on-surface-variant mb-1">Image Size</label>
            <div className="relative">
                <select 
                  id="image-size" 
                  value={question.advancedSettings?.imageSize || 'medium'} 
                  onChange={e => handleUpdate({ advancedSettings: { ...question.advancedSettings, imageSize: e.target.value as any } })} 
                  className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="custom">Custom</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  const renderTabContent = () => {
    switch(activeTab) {
        case 'Settings': return renderSettingsTab();
        case 'Behavior': return renderBehaviorTab();
        case 'Preview': return renderPreviewTab();
        case 'Advanced': return isChoiceBased ? renderAdvancedTab() : null;
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
          <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            Edit question
          </h2>
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

export default RightSidebar;
