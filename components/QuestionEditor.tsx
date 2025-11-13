import React, { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
// FIX: Import 'BranchingLogicBranch' type.
import type { Survey, Question, ToolboxItemData, Choice, LogicIssue, RandomizationMethod, BranchingLogicBranch } from '../types';
import { QuestionType } from '../types';
import { generateId, parseChoice, CHOICE_BASED_QUESTION_TYPES, truncate } from '../utils';
import { PasteChoicesModal } from './PasteChoicesModal';
import { 
    XIcon, PlusIcon, ChevronDownIcon, DragIndicatorIcon,
    MoreVertIcon,
    SignalIcon, BatteryIcon, RadioButtonUncheckedIcon, CheckboxOutlineIcon,
    RadioIcon as RadioButtonCheckedIcon, CheckboxFilledIcon as CheckboxCheckedIcon,
    InfoIcon, EyeIcon
} from './icons';
import { QuestionTypeSelectionMenuContent } from './ActionMenus';
// FIX: Import 'CopyAndPasteButton' component.
import { 
    ConditionalLogicEditor, 
    SkipLogicEditor, 
    ChoiceDisplayLogicEditor, 
    BranchingLogicEditor,
    ActionEditor,
    WorkflowSectionEditor,
    QuestionGroupEditor,
    RandomizeChoicesEditor,
    ChoiceEliminationEditor,
    ForceResponseSection,
    ActivateQuestionSection,
    CollapsibleSection,
    CopyAndPasteButton
} from './LogicEditors';


// ====================================================================================
// MAIN EDITOR COMPONENT
// ====================================================================================

export interface QuestionEditorProps {
    question: Question;
    survey: Survey;
    logicIssues: LogicIssue[];
    activeTab: string;
    focusedLogicSource: string | null;
    onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
    onAddChoice: (questionId: string) => void;
    onDeleteChoice: (questionId: string, choiceId: string) => void;
    isExpanded: boolean;
    onExpandSidebar: () => void;
    toolboxItems: ToolboxItemData[];
    onRequestGeminiHelp: (topic: string) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = memo(({
    question, survey, logicIssues, activeTab, focusedLogicSource, onUpdateQuestion, onAddChoice, onDeleteChoice,
    isExpanded, onExpandSidebar, toolboxItems, onRequestGeminiHelp
}) => {
    const [questionText, setQuestionText] = useState(question.text);
    const [expandedChoiceId, setExpandedChoiceId] = useState<string | null>(null);
    const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
    const typeMenuRef = useRef<HTMLDivElement>(null);
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
    const [isPasteColumnsModalOpen, setIsPasteColumnsModalOpen] = useState(false);
    const [draggedChoiceId, setDraggedChoiceId] = useState<string | null>(null);
    const [dropTargetChoiceId, setDropTargetChoiceId] = useState<string | null>(null);
    const [draggedScalePointId, setDraggedScalePointId] = useState<string | null>(null);
    const [dropTargetScalePointId, setDropTargetScalePointId] = useState<string | null>(null);
    const [selectedPreviewChoices, setSelectedPreviewChoices] = useState<Set<string>>(new Set());
    const [selectedGridChoices, setSelectedGridChoices] = useState<Map<string, string>>(new Map());
    const [expandedMobileRowId, setExpandedMobileRowId] = useState<string | null>(null);

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
        // Using requestAnimationFrame to ensure the cursor is set after the re-render.
        requestAnimationFrame(() => {
            if (document.activeElement === target) {
                target.selectionStart = newCursorPos;
                target.selectionEnd = newCursorPos;
            }
        });
    }, []);

    const allSurveyQuestions = useMemo(() => survey.blocks.flatMap(b => b.questions), [survey]);
    const currentQuestionIndex = useMemo(() => allSurveyQuestions.findIndex(q => q.id === question.id), [allSurveyQuestions, question.id]);
    
    const currentBlockId = useMemo(() => {
        return survey.blocks.find(b => b.questions.some(q => q.id === question.id))?.id || null;
    }, [survey.blocks, question.id]);

    const previousQuestions = useMemo(() =>
        allSurveyQuestions
            .slice(0, currentQuestionIndex)
            .filter(q =>
                q.id !== question.id &&
                q.type !== QuestionType.PageBreak &&
                q.type !== QuestionType.Description &&
                !q.isHidden
            ),
        [allSurveyQuestions, currentQuestionIndex, question.id]
    );

    const followingQuestions = useMemo(() =>
        allSurveyQuestions
            .slice(currentQuestionIndex + 1)
            .filter(q =>
                q.id !== question.id &&
                q.type !== QuestionType.PageBreak &&
                q.type !== QuestionType.Description &&
                !q.isHidden
            ),
        [allSurveyQuestions, currentQuestionIndex, question.id]
    );

    const isChoiceBased = useMemo(() => CHOICE_BASED_QUESTION_TYPES.has(question.type), [question.type]);
    
    const isFirstInteractiveQuestion = useMemo(() => {
        const allQuestions = survey.blocks.flatMap(b => b.questions);
        const firstInteractive = allQuestions.find(q => 
            q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak
        );
        return firstInteractive?.id === question.id;
    }, [survey, question.id]);

    useEffect(() => {
        setQuestionText(question.text);
        setExpandedChoiceId(null);
        setIsTypeMenuOpen(false);
        setSelectedPreviewChoices(new Set());
        setSelectedGridChoices(new Map());
        
        // Default to first row expanded in mobile choice grid preview
        if (question.type === QuestionType.ChoiceGrid && question.choices && question.choices.length > 0) {
            setExpandedMobileRowId(question.choices[0].id);
        } else {
            setExpandedMobileRowId(null);
        }
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
        const finalUpdates = { ...updates };

        if (updates.answerFormat === 'grid' && (question.type === QuestionType.Radio || question.type === QuestionType.Checkbox)) {
            finalUpdates.type = QuestionType.ChoiceGrid;
        } else if (updates.answerFormat && updates.answerFormat !== 'grid' && question.type === QuestionType.ChoiceGrid) {
            finalUpdates.type = QuestionType.Radio; // Default to Radio
        }
        
        onUpdateQuestion(question.id, finalUpdates);
    }, [question.id, question.type, onUpdateQuestion]);
    
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

        const newChoices: Choice[] = lines.map(line => ({
        id: generateId('c'),
        text: line.trim(),
        }));

        handleUpdate({ choices: newChoices });
    };
    
    // --- Scale Point (Column) Handlers ---
    
    const handleAddScalePoint = useCallback(() => {
        const currentScalePoints = question.scalePoints || [];
        const newScalePoint: Choice = {
            id: generateId('s'),
            text: `Column ${currentScalePoints.length + 1}`
        };
        handleUpdate({ scalePoints: [...currentScalePoints, newScalePoint] });
    }, [question.scalePoints, handleUpdate]);
    
    const handleDeleteScalePoint = useCallback((scalePointId: string) => {
        const newScalePoints = (question.scalePoints || []).filter(sp => sp.id !== scalePointId);
        handleUpdate({ scalePoints: newScalePoints });
    }, [question.scalePoints, handleUpdate]);
    
    const handleScalePointTextChange = (scalePointId: string, newText: string) => {
        const newScalePoints = (question.scalePoints || []).map(sp =>
            sp.id === scalePointId ? { ...sp, text: newText } : sp
        );
        handleUpdate({ scalePoints: newScalePoints });
    };
    
    const handlePasteScalePoints = (pastedText: string) => {
        const lines = pastedText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return;
        const newScalePoints: Choice[] = lines.map(line => ({
            id: generateId('s'),
            text: line.trim(),
        }));
        handleUpdate({ scalePoints: newScalePoints });
    };

    const handleScalePointDragStart = useCallback((e: React.DragEvent, scalePointId: string) => {
        setDraggedScalePointId(scalePointId);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleScalePointDragOver = useCallback((e: React.DragEvent, scalePointId: string) => {
        e.preventDefault();
        if (draggedScalePointId !== scalePointId) {
            setDropTargetScalePointId(scalePointId);
        }
    }, [draggedScalePointId]);

    const handleScalePointDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedScalePointId || !question.scalePoints) return;
        
        const scalePoints = [...question.scalePoints];
        const draggedIndex = scalePoints.findIndex(c => c.id === draggedScalePointId);
        if (draggedIndex === -1) return;
        
        const [draggedItem] = scalePoints.splice(draggedIndex, 1);
        
        if (dropTargetScalePointId === null) {
            scalePoints.push(draggedItem);
        } else {
            const dropIndex = scalePoints.findIndex(c => c.id === dropTargetScalePointId);
            if (dropIndex !== -1) {
                scalePoints.splice(dropIndex, 0, draggedItem);
            } else {
                scalePoints.push(draggedItem); // Fallback
            }
        }
        
        handleUpdate({ scalePoints });
        setDraggedScalePointId(null);
        setDropTargetScalePointId(null);
    }, [draggedScalePointId, dropTargetScalePointId, question.scalePoints, handleUpdate]);
    
    const handleScalePointDragEnd = useCallback(() => {
        setDraggedScalePointId(null);
        setDropTargetScalePointId(null);
    }, []);


    const handlePreviewChoiceClick = useCallback((choiceId: string) => {
        if (question.type === QuestionType.Radio) {
            setSelectedPreviewChoices(new Set([choiceId]));
        } else if (question.type === QuestionType.Checkbox) {
            setSelectedPreviewChoices((prev: Set<string>) => {
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

    const handlePreviewGridClick = useCallback((rowId: string, columnId: string) => {
        setSelectedGridChoices(prev => {
            const newMap = new Map(prev);
            newMap.set(rowId, columnId);
            return newMap;
        });

        // "Select and advance" logic for mobile accordion view
        const choices = question.choices || [];
        const currentIndex = choices.findIndex(c => c.id === rowId);
        
        if (currentIndex !== -1 && currentIndex < choices.length - 1) {
            const nextChoice = choices[currentIndex + 1];
            setExpandedMobileRowId(nextChoice.id);
        } else {
            // Last item was selected, so just collapse.
            setExpandedMobileRowId(null);
        }
    }, [question.choices]);

    const CurrentQuestionTypeInfo = toolboxItems.find(item => item.name === question.type);
    const initialChoicesText = (question.choices || []).map(c => parseChoice(c.text).label).join('\n');
    const isAutoadvanceable = useMemo(() => [QuestionType.Radio, QuestionType.ChoiceGrid].includes(question.type), [question.type]);

    // ... All render functions and sub-components from RightSidebar.tsx go here ...
    const renderChoiceBasedSettingsTab = () => {
    const isLinked = !!question.linkedChoicesSource;
    const sourceQuestion = isLinked ? allSurveyQuestions.find(q => q.id === question.linkedChoicesSource) : null;
    const sourceQid = sourceQuestion ? sourceQuestion.qid : '...';

    const ChoiceDropIndicator = () => <div className="h-px bg-primary w-full my-1" />;

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
            
            <ActivateQuestionSection question={question} handleUpdate={handleUpdate} />
            <ForceResponseSection question={question} handleUpdate={handleUpdate} />
            
            {(question.type === QuestionType.Radio || question.type === QuestionType.Checkbox) && (
                <div>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <label htmlFor="multiple-selection" className="text-sm font-medium text-on-surface block">
                                Multiple selection
                            </label>
                            <p className="text-xs text-on-surface-variant mt-0.5">Allow respondent to select more than one answer.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="multiple-selection"
                                checked={question.type === QuestionType.Checkbox}
                                onChange={(e) => handleUpdate({ type: e.target.checked ? QuestionType.Checkbox : QuestionType.Radio })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="answer-format" className="block text-sm font-medium text-on-surface-variant mb-1">Answer Format</label>
                <div className="relative">
                    <select id="answer-format" value={question.answerFormat || 'list'} onChange={e => handleUpdate({ answerFormat: e.target.value as any })} className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none">
                        <option value="list">List (Vertical)</option>
                        <option value="grid">Grid</option>
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
                onPaste={createPasteHandler(setQuestionText)}
                rows={4}
                className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                placeholder="Enter your question here..."
                />
                <p className="text-xs text-on-surface-variant mt-1">Maximum 5000 characters</p>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <label htmlFor="link-choices" className="text-sm font-medium text-on-surface block">
                            Link choices to question
                        </label>
                        <p className="text-xs text-on-surface-variant mt-0.5">Use the same choices as another question.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            id="link-choices" 
                            checked={question.linkedChoicesSource !== undefined} 
                            onChange={(e) => {
                                const isEnabling = e.target.checked;
                                handleUpdate({ linkedChoicesSource: isEnabling ? '' : undefined });
                            }} 
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {question.linkedChoicesSource !== undefined && (
                    <div className="mt-4 pl-4 border-l-2 border-outline-variant">
                        <label htmlFor="linked-choices-source" className="block text-sm font-medium text-on-surface-variant mb-1">Source question</label>
                        <div className="relative">
                            <select
                                id="linked-choices-source"
                                value={question.linkedChoicesSource || ''}
                                onChange={(e) => handleUpdate({ linkedChoicesSource: e.target.value || undefined })}
                                className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                            >
                                <option value="">Select a source question...</option>
                                {previousQuestions.filter(q => q.id !== question.id && CHOICE_BASED_QUESTION_TYPES.has(q.type)).map(q => (
                                    <option key={q.id} value={q.id}>{q.qid}: {truncate(q.text, 50)}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                        </div>
                    </div>
                )}
            </div>
    
            <div className={isLinked ? 'opacity-50' : ''}>
                <fieldset disabled={isLinked}>
                    <div>
                        <h3 className="text-sm font-medium text-on-surface-variant mb-2">
                            {question.type === QuestionType.ChoiceGrid ? 'Rows' : 'Choices'}
                        </h3>
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
                                onDragEnd={handleChoiceDrop}
                            >
                                <div className={`flex items-center gap-2 transition-opacity ${draggedChoiceId === choice.id ? 'opacity-30' : ''}`}>
                                    <span className="text-on-surface-variant hover:text-on-surface cursor-grab active:cursor-grabbing" aria-label="Reorder choice">
                                        <DragIndicatorIcon className="text-lg" />
                                    </span>
                                    <div className="flex-grow flex items-stretch bg-surface border border-outline rounded-md focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary">
                                        <input
                                            type="text"
                                            value={parseChoice(choice.text).label}
                                            onChange={(e) => handleChoiceTextChange(choice.id, e.target.value)}
                                            onPaste={createPasteHandler((newValue) => handleChoiceTextChange(choice.id, newValue))}
                                            className="w-full bg-transparent p-2 text-sm text-on-surface focus:outline-none"
                                            placeholder="Enter choice text"
                                        />
                                    </div>
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
                            <button onClick={() => onAddChoice(question.id)} className="flex items-center text-sm font-medium text-primary hover:underline"><PlusIcon className="text-base mr-1" /> {question.type === QuestionType.ChoiceGrid ? 'Row' : 'Choice'}</button>
                           <CopyAndPasteButton onClick={() => setIsPasteModalOpen(true)} />
                        </div>
                    </div>
                </fieldset>
            </div>
            {isLinked && (
                <div className="-mt-4 p-3 bg-primary-container/30 text-on-primary-container text-xs rounded-md border border-primary-container/50 flex items-start gap-2">
                    <InfoIcon className="text-base flex-shrink-0 mt-0.5" />
                    <span>Choices are linked from question {sourceQid}. To edit, change the source question or unlink choices.</span>
                </div>
            )}
            
            {question.type === QuestionType.ChoiceGrid && (
                <div className={`mt-6 ${isLinked ? 'opacity-50' : ''}`}>
                    <fieldset disabled={isLinked}>
                        <div>
                            <h3 className="text-sm font-medium text-on-surface-variant mb-2">Columns</h3>
                            <div 
                                className="space-y-2"
                                onDrop={handleScalePointDrop}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDropTargetScalePointId(null);
                                }}
                            >
                            {(question.scalePoints || []).map((scalePoint) => (
                                <React.Fragment key={scalePoint.id}>
                                {dropTargetScalePointId === scalePoint.id && <ChoiceDropIndicator />}
                                <div 
                                    className="group"
                                    draggable
                                    onDragStart={(e) => handleScalePointDragStart(e, scalePoint.id)}
                                    onDragOver={(e) => {
                                        e.stopPropagation();
                                        handleScalePointDragOver(e, scalePoint.id);
                                    }}
                                    onDragEnd={handleScalePointDragEnd}
                                >
                                    <div className={`flex items-center gap-2 transition-opacity ${draggedScalePointId === scalePoint.id ? 'opacity-30' : ''}`}>
                                        <span className="text-on-surface-variant hover:text-on-surface cursor-grab active:cursor-grabbing" aria-label="Reorder column">
                                            <DragIndicatorIcon className="text-lg" />
                                        </span>
                                        <div className="flex-grow flex items-stretch bg-surface border border-outline rounded-md focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary">
                                            <input
                                                type="text"
                                                value={scalePoint.text}
                                                onChange={(e) => handleScalePointTextChange(scalePoint.id, e.target.value)}
                                                onPaste={createPasteHandler((newValue) => handleScalePointTextChange(scalePoint.id, newValue))}
                                                className="w-full bg-transparent p-2 text-sm text-on-surface focus:outline-none"
                                                placeholder="Enter column text"
                                            />
                                        </div>
                                        {/* Per screenshot, no "more" icon for columns */}
                                        <div className="w-10 h-10"></div>
                                        <button onClick={() => handleDeleteScalePoint(scalePoint.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full" aria-label="Delete column">
                                            <XIcon className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                                </React.Fragment>
                            ))}
                            {dropTargetScalePointId === null && draggedScalePointId && <ChoiceDropIndicator />}
                            </div>
                            <div className="mt-3 flex items-center gap-4">
                                <button onClick={handleAddScalePoint} className="flex items-center text-sm font-medium text-primary hover:underline"><PlusIcon className="text-base mr-1" /> Column</button>
                                <CopyAndPasteButton onClick={() => setIsPasteColumnsModalOpen(true)} />
                            </div>
                        </div>
                    </fieldset>
                </div>
            )}
        </div>
    );
  };
  
  const renderChoiceBasedAdvancedTab = () => {
    const isChoiceGrid = question.type === QuestionType.ChoiceGrid;
    return (
        <div className="space-y-6">
            {!isChoiceGrid && (
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
            )}
            <div className={!isChoiceGrid ? 'border-t border-outline-variant pt-6' : ''}>
                <h3 className="text-sm font-medium text-on-surface mb-2">Mobile Layout</h3>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <label htmlFor="enable-mobile-layout" className="text-sm font-medium text-on-surface block">
                            {isChoiceGrid ? 'Mobile-optimized layout' : 'Enable mobile-specific layout'}
                        </label>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                            {isChoiceGrid ? 'Display as an interactive accordion on mobile.' : 'Override display settings for mobile devices.'}
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            id="enable-mobile-layout" 
                            checked={question.advancedSettings?.enableMobileLayout || false} 
                            onChange={(e) => handleUpdate({ advancedSettings: { ...question.advancedSettings, enableMobileLayout: e.target.checked } })} 
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {question.advancedSettings?.enableMobileLayout && !isChoiceGrid && (
                    <div className="mt-4 pl-4 border-l-2 border-outline-variant space-y-4">
                        <div>
                            <label htmlFor="mobile-choice-orientation" className="block text-sm font-medium text-on-surface-variant mb-1">Choice Orientation (Mobile)</label>
                            <div className="relative">
                                <select 
                                id="mobile-choice-orientation" 
                                value={question.advancedSettings?.mobile?.choiceOrientation || 'vertical'} 
                                onChange={e => handleUpdate({ advancedSettings: { ...question.advancedSettings, mobile: { ...question.advancedSettings?.mobile, choiceOrientation: e.target.value as any } } })} 
                                className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                >
                                    <option value="vertical">Vertical</option>
                                    <option value="horizontal">Horizontal</option>
                                    <option value="grid">Grid</option>
                                </select>
                                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="mobile-choice-width" className="block text-sm font-medium text-on-surface-variant mb-1">Choice Width (Mobile)</label>
                            <div className="relative">
                                <select 
                                id="mobile-choice-width" 
                                value={question.advancedSettings?.mobile?.choiceWidth || 'auto'} 
                                onChange={e => handleUpdate({ advancedSettings: { ...question.advancedSettings, mobile: { ...question.advancedSettings?.mobile, choiceWidth: e.target.value as any } } })} 
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
                )}
            </div>
        </div>
    );
  };

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
                            {question.type === QuestionType.ChoiceGrid ? (
                                question.advancedSettings?.enableMobileLayout ? (
                                    <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant overflow-hidden">
                                        {(question.choices || []).filter(c => c.visible !== false).map(choice => {
                                            const { label } = parseChoice(choice.text);
                                            const isAccordionExpanded = expandedMobileRowId === choice.id;
                                            const selectedScalePointId = selectedGridChoices.get(choice.id);
                                            const selectedScalePoint = question.scalePoints?.find(sp => sp.id === selectedScalePointId);

                                            return (
                                                <div key={choice.id}>
                                                    <button 
                                                        onClick={() => setExpandedMobileRowId(isAccordionExpanded ? null : choice.id)}
                                                        className="w-full flex justify-between items-center p-3 text-left bg-surface-container-high"
                                                        aria-expanded={isAccordionExpanded}
                                                    >
                                                        <div className="flex-1 pr-2">
                                                            <p className="text-sm text-on-surface">{label}</p>
                                                            {selectedScalePoint && !isAccordionExpanded && (
                                                                <p className="text-xs text-primary mt-1 font-medium">{selectedScalePoint.text}</p>
                                                            )}
                                                        </div>
                                                        <ChevronDownIcon className={`text-xl text-on-surface-variant transition-transform flex-shrink-0 ${isAccordionExpanded ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {isAccordionExpanded && (
                                                        <div className="p-3 bg-surface">
                                                            <div className="space-y-3">
                                                                {(question.scalePoints || []).map(sp => {
                                                                    const isSelected = selectedScalePointId === sp.id;
                                                                    return (
                                                                        <div 
                                                                            key={sp.id}
                                                                            onClick={() => handlePreviewGridClick(choice.id, sp.id)}
                                                                            className="flex items-center gap-3 cursor-pointer"
                                                                        >
                                                                            {isSelected ? 
                                                                                <RadioButtonCheckedIcon className="text-2xl text-primary flex-shrink-0" /> : 
                                                                                <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                                                                            }
                                                                            <span className={`text-sm ${isSelected ? 'text-primary font-medium' : 'text-on-surface'}`}>
                                                                                {sp.text}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto border border-outline-variant rounded-lg">
                                        <table className="w-full border-collapse text-sm">
                                            <thead>
                                                <tr className="border-b border-outline-variant bg-surface-container-high">
                                                    <th className="p-2 text-left"></th>
                                                    {(question.scalePoints || []).map(sp => (
                                                        <th key={sp.id} className="p-2 text-center text-xs font-medium text-on-surface-variant align-bottom">
                                                            <span>{sp.text}</span>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(question.choices || []).filter(c => c.visible !== false).map((choice) => {
                                                    const { label } = parseChoice(choice.text);
                                                    return (
                                                        <tr key={choice.id} className="border-b border-outline-variant last:border-b-0">
                                                            <td className="p-2 text-on-surface pr-2 align-middle font-medium">
                                                                {label}
                                                            </td>
                                                            {(question.scalePoints || []).map(sp => {
                                                                const isSelected = selectedGridChoices.get(choice.id) === sp.id;
                                                                return (
                                                                <td key={sp.id} className="p-1 text-center align-middle">
                                                                    <button onClick={() => handlePreviewGridClick(choice.id, sp.id)} className="p-1 rounded-full cursor-pointer">
                                                                        {isSelected ? <RadioButtonCheckedIcon className="text-xl text-primary" /> : <RadioButtonUncheckedIcon className="text-xl text-on-surface-variant" />}
                                                                    </button>
                                                                </td>
                                                                )
                                                            })}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : (
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
                                                        <RadioButtonCheckedIcon className="text-2xl text-primary flex-shrink-0" /> : 
                                                        <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                                                ) : (
                                                    isSelected ?
                                                        <CheckboxCheckedIcon className="text-2xl text-primary flex-shrink-0" /> :
                                                        <CheckboxOutlineIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                                                )}
                                                <span className={`text-sm ${isSelected ? 'text-on-primary-container font-medium' : 'text-on-surface'}`} dangerouslySetInnerHTML={{ __html: parseChoice(choice.text).label }} />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
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
                {question.type === QuestionType.ChoiceGrid ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-outline-variant">
                                    <th className="p-3 text-left w-1/3"></th>
                                    {(question.scalePoints || []).map(sp => (
                                        <th key={sp.id} className="p-3 text-center text-sm font-medium text-on-surface-variant align-bottom">
                                            <span>{sp.text}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(question.choices || []).filter(c => c.visible !== false).map((choice) => {
                                    const { label } = parseChoice(choice.text);
                                    return (
                                        <tr key={choice.id} className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high">
                                            <td className="p-3 text-base text-on-surface pr-4 align-middle">
                                                {label}
                                            </td>
                                            {(question.scalePoints || []).map(sp => {
                                                const isSelected = selectedGridChoices.get(choice.id) === sp.id;
                                                return (
                                                <td key={sp.id} className="p-2 text-center align-middle">
                                                    <button onClick={() => handlePreviewGridClick(choice.id, sp.id)} className="p-1 rounded-full cursor-pointer">
                                                        {isSelected ? <RadioButtonCheckedIcon className="text-2xl text-primary" /> : <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant" />}
                                                    </button>
                                                </td>
                                                )
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-3">
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
                                        <RadioButtonCheckedIcon className="text-2xl text-primary flex-shrink-0" /> :
                                        <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                                ) : (
                                    isSelected ?
                                        <CheckboxCheckedIcon className="text-2xl text-primary flex-shrink-0" /> :
                                        <CheckboxOutlineIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                                )}
                                <span className={`text-base ${isSelected ? 'text-on-primary-container font-medium' : 'text-on-surface'}`} dangerouslySetInnerHTML={{ __html: parseChoice(choice.text).label }} />
                                </div>
                            );
                        })}
                    </div>
                )}
              </div>
            </div>
          )}
        </div>
    );
  }

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
            
            <ActivateQuestionSection question={question} handleUpdate={handleUpdate} />
            <ForceResponseSection question={question} handleUpdate={handleUpdate} />

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
                onPaste={createPasteHandler(setQuestionText)}
                rows={4}
                className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary resize-y"
                placeholder="Enter your question here..."
                />
                <p className="text-xs text-on-surface-variant mt-1">Maximum 5000 characters</p>
            </div>
            {(validation.contentType === 'none' || !validation.contentType) && (
                <div>
                    <label htmlFor="answer-length" className="block text-sm font-medium text-on-surface-variant mb-1">Answer Length</label>
                    <div className="relative">
                    <select
                        id="answer-length"
                        value={textEntrySettings.answerLength || 'long'}
                        onChange={e => handleUpdateSettings({ answerLength: e.target.value as any })}
                        className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                    >
                        <option value="short">Short Answer</option>
                        <option value="long">Long Answer (8+ lines)</option>
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    </div>
                </div>
            )}
            <div>
                <label htmlFor="placeholder" className="block text-sm font-medium text-on-surface-variant mb-1">Placeholder Text</label>
                <input
                    type="text"
                    id="placeholder"
                    value={textEntrySettings.placeholder || ''}
                    onChange={(e) => handleUpdateSettings({ placeholder: e.target.value })}
                    onPaste={createPasteHandler((newValue) => handleUpdateSettings({ placeholder: newValue }))}
                    className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                    placeholder="e.g., Enter your answer here..."
                />
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
                {textEntrySettings.answerLength === 'long' && (
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
                <textarea placeholder={placeholder || 'Enter your answer...'} rows={8} className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface resize-none" disabled />
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
                    <InfoIcon className="text-base text-primary" />
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

  const renderGenericSettingsTab = () => (
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

      <ActivateQuestionSection question={question} handleUpdate={handleUpdate} />
      <ForceResponseSection question={question} handleUpdate={handleUpdate} />
      
      <div>
        <label htmlFor="question-text" className="block text-sm font-medium text-on-surface-variant mb-1">
          Question Text
        </label>
        <textarea
          id="question-text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          onBlur={handleTextBlur}
          onPaste={createPasteHandler(setQuestionText)}
          rows={4}
          className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
          placeholder="Enter your question here..."
        />
        <p className="text-xs text-on-surface-variant mt-1">Maximum 5000 characters</p>
      </div>
    </div>
  );

  const renderBehaviorTab = () => {
    return (
        <div className="space-y-8">
            <CollapsibleSection title="Navigation" defaultExpanded={true}>
                <div className="divide-y divide-outline-variant">
                    <div className="py-6 first:pt-0 space-y-6">
                        {isAutoadvanceable && (
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 pr-4">
                                        <label htmlFor="question-auto-advance" className="text-sm font-medium text-on-surface block">
                                            Autoadvance
                                        </label>
                                        <p className="text-xs text-on-surface-variant mt-0.5">Automatically move to the next page when this question is answered.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="question-auto-advance"
                                            checked={question.autoAdvance ?? false}
                                            onChange={(e) => handleUpdate({ autoAdvance: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        )}
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="flex-1 pr-4">
                                    <label htmlFor="hide-back-button" className="text-sm font-medium text-on-surface block">
                                        Hide back button
                                    </label>
                                    <p className="text-xs text-on-surface-variant mt-0.5">Prevent respondent from going back from this question.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="hide-back-button"
                                        checked={!!question.hideBackButton}
                                        onChange={(e) => handleUpdate({ hideBackButton: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="py-6">
                        <SkipLogicEditor
                            question={question}
                            followingQuestions={followingQuestions}
                            issues={logicIssues.filter(i => i.type === 'skip')}
                            onUpdate={handleUpdate}
                            isChoiceBased={isChoiceBased}
                            onAddLogic={onExpandSidebar}
                            onRequestGeminiHelp={onRequestGeminiHelp}
                            focusedLogicSource={focusedLogicSource}
                            survey={survey}
                            currentBlockId={currentBlockId}
                        />
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Question Display Logic" defaultExpanded={true}>
                <div className="divide-y divide-outline-variant">
                    <div className="py-6 first:pt-0">
                        <ConditionalLogicEditor
                            logicType="display"
                            title="Show this question if"
                            description="Control when this question is shown to respondents"
                            logicProp="displayLogic"
                            draftLogicProp="draftDisplayLogic"
                            question={question}
                            previousQuestions={previousQuestions}
                            issues={logicIssues.filter(i => i.type === 'display')}
                            onUpdate={handleUpdate}
                            onAddLogic={onExpandSidebar}
                            onRequestGeminiHelp={onRequestGeminiHelp}
                        />
                    </div>
                    <div className="py-6">
                        <ConditionalLogicEditor
                            logicType="hide"
                            title="Hide this question if"
                            description="Control when this question is hidden from respondents"
                            logicProp="hideLogic"
                            draftLogicProp="draftHideLogic"
                            question={question}
                            previousQuestions={previousQuestions}
                            issues={logicIssues.filter(i => i.type === 'hide')}
                            onUpdate={handleUpdate}
                            onAddLogic={onExpandSidebar}
                            onRequestGeminiHelp={onRequestGeminiHelp}
                        />
                    </div>
                </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Choices" defaultExpanded={true}>
                <div className="divide-y divide-outline-variant">
                    {isChoiceBased && (
                        <div className="py-6 first:pt-0">
                            <RandomizeChoicesEditor 
                                question={question}
                                onUpdate={handleUpdate}
                            />
                        </div>
                    )}
                    {isChoiceBased && !isFirstInteractiveQuestion && previousQuestions.length > 0 && (
                        <div className="py-6 first:pt-0">
                            <ChoiceEliminationEditor
                                question={question}
                                previousQuestions={previousQuestions}
                                onUpdate={handleUpdate}
                                onAddLogic={onExpandSidebar}
                            />
                        </div>
                    )}
                    {isChoiceBased && !isFirstInteractiveQuestion && previousQuestions.length > 0 && (
                        <div className="py-6 first:pt-0">
                            <ChoiceDisplayLogicEditor
                                question={question}
                                previousQuestions={previousQuestions}
                                onUpdate={handleUpdate}
                                onAddLogic={onExpandSidebar}
                            />
                        </div>
                    )}
                </div>
            </CollapsibleSection>
        </div>
    );
  };

  const renderAdvancedTab = () => {
    const branchingLogic = question.draftBranchingLogic ?? question.branchingLogic;
    const beforeWorkflows = question.draftBeforeWorkflows ?? question.beforeWorkflows ?? [];
    const afterWorkflows = question.draftAfterWorkflows ?? question.afterWorkflows ?? [];

    const handleEnableBranching = () => {
        const remainingChoices = (question.choices || []).filter(c => {
            return !(question.branchingLogic?.branches.some(b => b.conditions.some(cond => cond.value === c.text)) ?? false);
        });

        const newBranch: BranchingLogicBranch = {
            id: generateId('branch'),
            operator: 'AND',
            conditions: [{ 
                id: generateId('cond'), 
                questionId: question.qid, 
                operator: 'equals', 
                // Auto-select the first available choice if it exists
                value: remainingChoices.length === 1 ? remainingChoices[0].text : '', 
                isConfirmed: false 
            }],
            thenSkipTo: '',
            thenSkipToIsConfirmed: false,
        };

        const existingLogic = question.draftBranchingLogic ?? question.branchingLogic;
        
        handleUpdate({
            branchingLogic: {
                branches: [...(existingLogic?.branches || []), newBranch],
                otherwiseSkipTo: existingLogic?.otherwiseSkipTo || 'next',
                otherwiseIsConfirmed: existingLogic?.otherwiseIsConfirmed || true,
            }
        });
        onExpandSidebar();
    };


    return (
      <div className="space-y-8">
        <QuestionGroupEditor question={question} survey={survey} onUpdateQuestion={onUpdateQuestion} />
        
        <CollapsibleSection title="Branching Logic" defaultExpanded={true}>
            <div className="py-6 first:pt-0">
              {!branchingLogic ? (
                  <div>
                      <p className="text-xs text-on-surface-variant mb-3">Create complex paths through the survey based on multiple conditions.</p>
                      <div className="flex items-center gap-4">
                          <div className="relative group/tooltip inline-block">
                            <button onClick={handleEnableBranching} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors">
                                <PlusIcon className="text-base" />
                                Add branch rule
                            </button>
                            <div className="absolute bottom-full mb-2 left-0 w-64 bg-surface-container-highest text-on-surface text-xs rounded-md p-2 shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20">
                                Send people down different survey paths based on multiple conditions.
                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-surface-container-highest"></div>
                            </div>
                          </div>
                      </div>
                  </div>
              ) : (
                <BranchingLogicEditor
                    question={question}
                    survey={survey}
                    previousQuestions={previousQuestions}
                    followingQuestions={followingQuestions}
                    issues={logicIssues.filter(i => i.type === 'branching')}
                    onUpdate={handleUpdate}
                    onAddLogic={onExpandSidebar}
                    onRequestGeminiHelp={onRequestGeminiHelp}
                />
              )}
            </div>
        </CollapsibleSection>
        
        <CollapsibleSection title="Workflows" defaultExpanded={true}>
            <div className="-mt-2 mb-4">
                <p className="text-xs text-on-surface-variant">Automate tasks, and integrate with other services.</p>
            </div>
            <div className="divide-y divide-outline-variant">
                <WorkflowSectionEditor
                    title="Before Showing This Question"
                    description="Set rules or actions triggered before the question is displayed."
                    questionQid={question.qid}
                    workflows={beforeWorkflows}
                    onUpdateWorkflows={(newWorkflows) => handleUpdate({ beforeWorkflows: newWorkflows })}
                    onAddWorkflow={onExpandSidebar}
                />
                <WorkflowSectionEditor
                    title="After Answering This Question"
                    description="Set rules or actions triggered after the question is answered."
                    questionQid={question.qid}
                    workflows={afterWorkflows}
                    onUpdateWorkflows={(newWorkflows) => handleUpdate({ afterWorkflows: newWorkflows })}
                    onAddWorkflow={onExpandSidebar}
                />
            </div>
        </CollapsibleSection>
        
        {isChoiceBased && (
            <CollapsibleSection title="Display & Layout" defaultExpanded={true}>
                <div className="py-6 first:pt-0">{renderChoiceBasedAdvancedTab()}</div>
            </CollapsibleSection>
        )}
        {question.type === QuestionType.TextEntry && (
             <CollapsibleSection title="Text Box Options" defaultExpanded={true}>
                <div className="py-6 first:pt-0">
                    {renderTextEntryAdvancedTab()}
                </div>
             </CollapsibleSection>
        )}
      </div>
    );
  };
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'Settings':
                if (isChoiceBased) return renderChoiceBasedSettingsTab();
                if (question.type === QuestionType.TextEntry) return renderTextEntrySettingsTab();
                if (question.type !== QuestionType.Description && question.type !== QuestionType.PageBreak) {
                    return renderGenericSettingsTab();
                }
                return <p className="text-sm text-on-surface-variant text-center mt-4">This question type has no editable settings.</p>;
            case 'Behavior':
                return renderBehaviorTab();
            case 'Advanced':
                return renderAdvancedTab();
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
            <PasteChoicesModal
                isOpen={isPasteColumnsModalOpen}
                onClose={() => setIsPasteColumnsModalOpen(false)}
                onSave={handlePasteScalePoints}
                initialChoicesText={(question.scalePoints || []).map(c => c.text).join('\n')}
                primaryActionLabel="Add Columns"
            />
            <div className="p-6">
                {renderTabContent()}
            </div>
        </>
    );
});
