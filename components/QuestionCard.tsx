import React, { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react';
import type { Question, ToolboxItemData, Choice } from '../types';
import { QuestionType } from '../types';
import { 
    DotsHorizontalIcon, RadioIcon, ChevronDownIcon, 
    CheckboxOutlineIcon, XIcon, DragIndicatorIcon, PlusIcon,
    RadioButtonUncheckedIcon
} from './icons';
import { QuestionActionsMenu, QuestionTypeSelectionMenuContent } from './ActionMenus';

const QuestionCard: React.FC<{ 
    question: Question, 
    isSelected: boolean,
    isChecked: boolean,
    onSelect: (question: Question, tab?: string) => void,
    onToggleCheck: (questionId: string) => void;
    id: string;
    onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
    onDeleteQuestion: (questionId: string) => void;
    onCopyQuestion: (questionId: string) => void;
    toolboxItems: ToolboxItemData[];
    isDragging: boolean;
    onDragStart: () => void;
    onDragEnd: () => void;
    onAddChoice: (questionId: string) => void;
    onAddPageBreakAfterQuestion: (questionId: string) => void;
}> = memo(({ 
    question, isSelected, isChecked, onSelect, onToggleCheck, id, 
    onUpdateQuestion, onDeleteQuestion, onCopyQuestion, toolboxItems,
    isDragging, onDragStart, onDragEnd, onAddChoice, onAddPageBreakAfterQuestion
}) => {
    
    const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
    const typeMenuContainerRef = useRef<HTMLDivElement>(null);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const actionsMenuContainerRef = useRef<HTMLDivElement>(null);
    
    const [editingElement, setEditingElement] = useState<'question' | string | null>(null); // 'question' or choice.id
    const [editText, setEditText] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);
    const editTextAreaRef = useRef<HTMLTextAreaElement>(null);

    const questionTypeOptions = useMemo(() => toolboxItems
        .filter(item => item.name !== 'Block' && item.name !== 'Page Break')
        .map(item => ({
        type: item.name as QuestionType,
        label: item.name,
        icon: item.icon,
        })), [toolboxItems]);
        
    const parseChoice = (text: string): { variable: string; label: string } => {
        const match = text.match(/(^Q\d+_\d+)\s*/);
        if (match) {
            return {
                variable: match[1],
                label: text.substring(match[0].length)
            };
        }
        return { variable: '', label: text };
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (typeMenuContainerRef.current && !typeMenuContainerRef.current.contains(event.target as Node)) {
                setIsTypeMenuOpen(false);
            }
            if (actionsMenuContainerRef.current && !actionsMenuContainerRef.current.contains(event.target as Node)) {
                setIsActionsMenuOpen(false);
            }
        };

        if (isTypeMenuOpen || isActionsMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isTypeMenuOpen, isActionsMenuOpen]);
    
    useEffect(() => {
        if (editingElement === 'question' && editTextAreaRef.current) {
            const textarea = editTextAreaRef.current;
            textarea.focus();
            // Auto-resize on focus
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        } else if (editingElement && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingElement]);


    const handleTypeSelect = useCallback((newType: QuestionType) => {
        const updates: Partial<Question> = { type: newType };
        
        const typeInfo = questionTypeOptions.find(o => o.type === newType);
        const hasChoices = typeInfo && (typeInfo.label.includes('Radio') || typeInfo.label.includes('Check') || typeInfo.label.includes('Drop-Down'));

        if (hasChoices && !question.choices) {
            updates.choices = [
                { id: `${question.id}c1`, text: `${question.qid}_1 Yes` },
                { id: `${question.id}c2`, text: `${question.qid}_2 No` },
            ];
        } else if (!hasChoices) {
            updates.choices = undefined;
        }

        onUpdateQuestion(question.id, updates);
        setIsTypeMenuOpen(false);
    }, [onUpdateQuestion, question.id, question.choices, question.qid, questionTypeOptions]);
    
    const handleStartEditing = useCallback((element: 'question' | string, currentText: string) => {
        if (editingElement) return;
        setEditingElement(element);
        if (element === 'question') {
            setEditText(currentText);
        } else {
            const { label } = parseChoice(currentText);
            setEditText(label);
        }
    }, [editingElement]);
    
    const handleCancelEditing = useCallback(() => {
        setEditingElement(null);
        setEditText('');
    }, []);
    
    const handleSaveChanges = useCallback(() => {
        if (!editingElement) return;
    
        if (editingElement === 'question') {
            const newText = editText.trim();
            if (question.text !== newText && newText !== '') {
                onUpdateQuestion(question.id, { text: newText });
            }
        } else { // It's a choice
            const originalChoice = question.choices?.find(c => c.id === editingElement);
            if (!originalChoice) {
                handleCancelEditing();
                return;
            }
    
            const { variable } = parseChoice(originalChoice.text);
            const newLabel = editText.trim();
            const newText = variable ? `${variable} ${newLabel}` : newLabel;
    
            if (originalChoice.text !== newText) {
                const newChoices = question.choices?.map(choice =>
                    choice.id === editingElement
                        ? { ...choice, text: newText }
                        : choice
                );
                onUpdateQuestion(question.id, { choices: newChoices });
            }
        }
    
        handleCancelEditing();
    }, [editingElement, editText, question, onUpdateQuestion, handleCancelEditing]);
    
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveChanges();
        } else if (e.key === 'Escape') {
            handleCancelEditing();
        }
    }, [handleSaveChanges, handleCancelEditing]);
    
    const renderChoiceText = (text: string) => {
        const { variable, label } = parseChoice(text);
        if (variable) {
            return (
                <>
                    <span className="font-bold text-on-surface">{variable}</span>
                    <span className="ml-1">{label}</span>
                </>
            );
        }
        return <>{label}</>;
    };

    if (question.type === QuestionType.PageBreak) {
        return (
          <div
            id={id}
            data-question-id={question.id}
            draggable="true"
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', question.id);
              onDragStart();
            }}
            onDragEnd={onDragEnd}
            className={`relative flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-grab group ${
              isSelected ? 'border-primary bg-primary-container/30' : 'border-transparent'
            } ${isDragging ? 'opacity-50' : ''}`}
            onClick={() => onSelect(question)}
          >
            <div className="flex items-center text-on-surface-variant font-semibold text-sm w-full">
              <DragIndicatorIcon className="text-xl mr-2" />
              <span className="flex-grow border-t-2 border-dashed border-outline-variant text-center py-2">
                Page Break
              </span>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteQuestion(question.id);
                }}
                className="p-1.5 rounded-full hover:bg-surface-container-high"
                aria-label="Delete page break"
              >
                <XIcon className="text-lg" />
              </button>
            </div>
          </div>
        );
    }
    
    const CurrentQuestionTypeIcon = questionTypeOptions.find(o => o.type === question.type)?.icon || RadioIcon;

    return (
        <div
            id={id}
            data-question-id={question.id}
            draggable={!editingElement}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={() => onSelect(question)}
            className={`p-4 rounded-lg border-2 transition-all cursor-grab group grid grid-cols-[auto_1fr] items-center gap-x-3 ${
                isSelected ? 'border-primary bg-surface-container-high shadow-md' : 'border-outline-variant hover:border-outline'
            } ${isDragging ? 'opacity-50' : ''}`}
        >
            {/* Grid Cell 1: Checkbox */}
            <input
                type="checkbox"
                className="h-4 w-4 rounded border-outline text-primary focus:ring-primary accent-primary"
                checked={isChecked}
                onChange={(e) => {
                    e.stopPropagation();
                    onToggleCheck(question.id);
                }}
                onClick={(e) => e.stopPropagation()}
            />

            {/* Grid Cell 2: Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-on-surface-variant">
                    <span className="font-bold text-on-surface mr-2">{question.qid}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div ref={typeMenuContainerRef} className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsTypeMenuOpen(prev => !prev);
                            }}
                            className="flex items-center gap-2 rounded-md px-2 py-1 border border-outline-variant hover:bg-surface-container-highest"
                        >
                            <CurrentQuestionTypeIcon className="text-base text-primary" />
                            <span className="font-medium text-sm text-on-surface">{question.type}</span>
                            <ChevronDownIcon className="text-base" />
                        </button>
                        {isTypeMenuOpen && (
                          <div className="absolute top-full right-0 mt-2 w-64" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                            <QuestionTypeSelectionMenuContent onSelect={handleTypeSelect} toolboxItems={toolboxItems} />
                          </div>
                        )}
                    </div>
                    <div ref={actionsMenuContainerRef} className="relative transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsActionsMenuOpen(prev => !prev);
                            }}
                            className="p-1.5 rounded-full hover:bg-surface-container-highest"
                            aria-label="Question actions"
                        >
                            <DotsHorizontalIcon className="text-xl" />
                        </button>
                        {isActionsMenuOpen && (
                            <QuestionActionsMenu
                                onDuplicate={() => { onCopyQuestion(question.id); setIsActionsMenuOpen(false); }}
                                onDelete={() => { onDeleteQuestion(question.id); setIsActionsMenuOpen(false); }}
                                onAddPageBreak={() => { onAddPageBreakAfterQuestion(question.id); setIsActionsMenuOpen(false); }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Grid Cell 3: Body Content (starts in column 2) */}
            <div className="col-start-2 mt-3">
                {editingElement === 'question' ? (
                    <textarea
                        ref={editTextAreaRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={handleSaveChanges}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-surface border-b-2 border-primary focus:outline-none p-1 text-on-surface resize-none"
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                    />
                ) : (
                    <p onClick={(e) => { 
                        e.stopPropagation(); 
                        if (!isSelected) {
                            onSelect(question);
                        }
                        handleStartEditing('question', question.text); 
                    }} className="text-on-surface min-h-[24px]">
                        {question.text}
                    </p>
                )}
                
                {question.choices && (
                    <div className="mt-4 space-y-2">
                        {question.choices.map((choice, index) => (
                            <div key={choice.id} className="flex items-center group/choice">
                                {question.type === QuestionType.Radio ? (
                                    index === 0 ? (
                                        <RadioIcon className="text-xl text-on-surface-variant mr-2" />
                                    ) : (
                                        <RadioButtonUncheckedIcon className="text-xl text-on-surface-variant mr-2" />
                                    )
                                ) : (
                                    <CheckboxOutlineIcon className="text-xl text-on-surface-variant mr-2" />
                                )}
                                {editingElement === choice.id ? (
                                    <input
                                        ref={editInputRef}
                                        type="text"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onBlur={handleSaveChanges}
                                        onKeyDown={handleKeyDown}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full bg-surface border-b border-primary focus:outline-none p-1 text-on-surface"
                                    />
                                ) : (
                                    <span onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if (!isSelected) {
                                            onSelect(question);
                                        }
                                        handleStartEditing(choice.id, choice.text); 
                                    }} className="text-on-surface flex-grow min-h-[24px]">
                                        {renderChoiceText(choice.text)}
                                    </span>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newChoices = question.choices?.filter(c => c.id !== choice.id);
                                        onUpdateQuestion(question.id, { choices: newChoices });
                                    }}
                                    className="ml-2 p-1 rounded-full text-on-surface-variant hover:bg-surface-container-highest opacity-0 group-hover/choice:opacity-100"
                                    aria-label="Remove choice"
                                >
                                    <XIcon className="text-base" />
                                </button>
                            </div>
                        ))}
                         <button
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (!isSelected) {
                                    onSelect(question);
                                }
                                onAddChoice(question.id); 
                            }}
                            className="flex items-center text-sm text-primary font-medium mt-2 hover:underline"
                        >
                            <PlusIcon className="text-base mr-1" /> Add choice
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default QuestionCard;
