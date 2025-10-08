import React, { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react';
import type { Question, ToolboxItemData, Choice, Survey, LogicIssue } from '../types';
import { QuestionType } from '../types';
import { 
    DotsHorizontalIcon, RadioIcon, ChevronDownIcon, 
    CheckboxOutlineIcon, XIcon, DragIndicatorIcon, PlusIcon,
    RadioButtonUncheckedIcon,
    WarningIcon,
    VisibilityOffIcon
} from './icons';
import { QuestionActionsMenu, QuestionTypeSelectionMenuContent } from './ActionMenus';
import { parseChoice } from '../utils';
import { DisplayLogicDisplay, SkipLogicDisplay, BranchingLogicDisplay } from './LogicDisplays';

// Helper for inline editing with contentEditable
const EditableText: React.FC<{
    html: string;
    onChange: (html: string) => void;
    onFocus: () => void;
    className: string;
}> = ({ html, onChange, onFocus, className }) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const lastHtml = useRef(html);

    useEffect(() => {
        if (elementRef.current && html !== elementRef.current.innerHTML) {
            elementRef.current.innerHTML = html;
        }
        lastHtml.current = html;
    }, [html]);

    const handleBlur = () => {
        const currentHtml = elementRef.current?.innerHTML || '';
        if (lastHtml.current !== currentHtml) {
            onChange(currentHtml);
        }
    };

    const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

    return (
        <div
            ref={elementRef}
            className={`${className} focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-sm cursor-text`}
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: html }}
            onBlur={handleBlur}
            onFocus={onFocus}
            onClick={stopPropagation}
            onMouseDown={stopPropagation} // Also stop mousedown to prevent App.tsx's deselect logic
        />
    );
};


const ChoiceDropIndicator = () => (
    <div className="relative h-px w-full bg-primary my-1 ml-6">
        <div className="absolute left-0 top-1-2 -translate-y-1-2 h-1.5 w-1.5 rounded-full bg-primary" />
    </div>
);

const QuestionCard: React.FC<{ 
    question: Question, 
    survey: Survey,
    logicIssues: LogicIssue[],
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
    question, survey, logicIssues, isSelected, isChecked, onSelect, onToggleCheck, id, 
    onUpdateQuestion, onDeleteQuestion, onCopyQuestion, toolboxItems,
    isDragging, onDragStart, onDragEnd, onAddChoice, onAddPageBreakAfterQuestion
}) => {
    
    const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
    const typeMenuContainerRef = useRef<HTMLDivElement>(null);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const actionsMenuContainerRef = useRef<HTMLDivElement>(null);
    
    const [draggedChoiceId, setDraggedChoiceId] = useState<string | null>(null);
    const [dropTargetChoiceId, setDropTargetChoiceId] = useState<string | null>(null);

    const isAnyMenuOpen = isTypeMenuOpen || isActionsMenuOpen;

    const questionTypeOptions = useMemo(() => toolboxItems
        .filter(item => item.name !== 'Block' && item.name !== 'Page Break')
        .map(item => ({
        type: item.name as QuestionType,
        label: item.name,
        icon: item.icon,
        })), [toolboxItems]);
        

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
    
    const handleChoiceDragStart = useCallback((e: React.DragEvent, choiceId: string) => {
        e.stopPropagation();
        setDraggedChoiceId(choiceId);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleChoiceDragOver = useCallback((e: React.DragEvent, choiceId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedChoiceId !== choiceId) {
            setDropTargetChoiceId(choiceId);
        }
    }, [draggedChoiceId]);

    const handleChoiceDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
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
        
        onUpdateQuestion(question.id, { choices });
        setDraggedChoiceId(null);
        setDropTargetChoiceId(null);
    }, [draggedChoiceId, dropTargetChoiceId, question.id, question.choices, onUpdateQuestion]);
    
    const handleChoiceDragEnd = useCallback((e: React.DragEvent) => {
        e.stopPropagation();
        setDraggedChoiceId(null);
        setDropTargetChoiceId(null);
    }, []);

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
    const hasLogicIssues = logicIssues.length > 0;

    return (
        <div
            id={id}
            data-question-id={question.id}
            draggable={true}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={() => onSelect(question)}
            className={`p-4 rounded-lg border-2 transition-all cursor-grab group grid grid-cols-[auto_1fr] items-start gap-x-3 relative ${
                isSelected ? 'border-primary bg-surface-container-high shadow-md' : 'border-outline-variant hover:border-outline'
            } ${isDragging ? 'opacity-50' : ''} ${isAnyMenuOpen ? 'z-10' : ''}`}
        >
            {/* Grid Cell 1: Checkbox */}
            <input
                type="checkbox"
                className="h-4 w-4 rounded border-outline text-primary focus:ring-primary accent-primary mt-1"
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
                    {question.forceResponse && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary-container text-on-primary-container rounded-full">
                            Required
                        </span>
                    )}
                    {question.isHidden && (
                        <div className={`relative group/tooltip ${question.forceResponse ? 'ml-2' : ''}`}>
                            <VisibilityOffIcon className="text-on-surface-variant text-lg" />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-surface-container-highest text-on-surface text-xs rounded-md p-2 shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20">
                                This question is hidden
                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-surface-container-highest"></div>
                            </div>
                        </div>
                    )}
                     {hasLogicIssues && (
                        <div className={`relative group/tooltip ${question.forceResponse || question.isHidden ? 'ml-2' : ''}`}>
                            <WarningIcon className="text-error" />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-surface-container-highest text-on-surface text-xs rounded-md p-2 shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20">
                                <h4 className="font-bold mb-1">Logic Issues:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {logicIssues.map((issue, index) => <li key={index}>{issue.message}</li>)}
                                </ul>
                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-surface-container-highest"></div>
                            </div>
                        </div>
                    )}
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
                          <div className="absolute top-full right-0 mt-2 w-64 z-20" style={{ fontFamily: "'Open Sans', sans-serif" }}>
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
                <EditableText
                    html={question.text}
                    onChange={(newText) => onUpdateQuestion(question.id, { text: newText })}
                    onFocus={() => onSelect(question)}
                    className="text-on-surface min-h-[24px]"
                />
                
                {question.type === QuestionType.TextEntry && (
                    <div className="mt-4">
                        <textarea
                            className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface resize-y cursor-default"
                            rows={question.textEntrySettings?.answerLength === 'paragraph' ? 4 : question.textEntrySettings?.answerLength === 'essay' ? 8 : 1}
                            placeholder={question.textEntrySettings?.placeholder || ''}
                            readOnly
                        />
                    </div>
                )}
                
                {question.choices && (
                    <div 
                        className="mt-4 space-y-2"
                        onDrop={handleChoiceDrop}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDropTargetChoiceId(null);
                        }}
                    >
                        {question.choices.map((choice, index) => {
                            const { variable, label } = parseChoice(choice.text);
                            return (
                                <React.Fragment key={choice.id}>
                                    {dropTargetChoiceId === choice.id && <ChoiceDropIndicator />}
                                    <div 
                                        className={`flex items-center group/choice transition-opacity ${draggedChoiceId === choice.id ? 'opacity-30' : ''}`}
                                        draggable={true}
                                        onDragStart={(e) => handleChoiceDragStart(e, choice.id)}
                                        onDragOver={(e) => handleChoiceDragOver(e, choice.id)}
                                        onDragEnd={handleChoiceDragEnd}
                                    >
                                        <DragIndicatorIcon className="text-xl text-on-surface-variant mr-1 cursor-grab opacity-0 group-hover/choice:opacity-100" />
                                        {question.type === QuestionType.Radio ? (
                                            index === 0 ? (
                                                <RadioIcon className="text-xl text-on-surface-variant mr-2" />
                                            ) : (
                                                <RadioButtonUncheckedIcon className="text-xl text-on-surface-variant mr-2" />
                                            )
                                        ) : (
                                            <CheckboxOutlineIcon className="text-xl text-on-surface-variant mr-2" />
                                        )}
                                        
                                        <div className="text-on-surface flex-grow min-h-[24px] flex items-center gap-2">
                                            {variable && <span className="font-bold text-on-surface">{variable}</span>}
                                            <EditableText
                                                html={label}
                                                onChange={(newLabel) => {
                                                    const newText = variable ? `${variable} ${newLabel}` : newLabel;
                                                    const newChoices = (question.choices || []).map(c => 
                                                        c.id === choice.id ? { ...c, text: newText } : c
                                                    );
                                                    onUpdateQuestion(question.id, { choices: newChoices });
                                                }}
                                                onFocus={() => onSelect(question)}
                                                className="text-on-surface flex-grow"
                                            />
                                        </div>
                                        
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
                                </React.Fragment>
                            );
                        })}
                        {dropTargetChoiceId === null && draggedChoiceId && <ChoiceDropIndicator />}
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
                
                {question.displayLogic && question.displayLogic.conditions.length > 0 && (
                    <DisplayLogicDisplay
                        logic={question.displayLogic}
                        survey={survey}
                        onClick={() => onSelect(question, 'Behavior')}
                    />
                )}
                {question.skipLogic && (
                    <SkipLogicDisplay
                        logic={question.skipLogic}
                        currentQuestion={question}
                        survey={survey}
                        onClick={() => onSelect(question, 'Behavior')}
                    />
                )}
                {question.branchingLogic && question.branchingLogic.branches.length > 0 && (
                     <BranchingLogicDisplay
                        logic={question.branchingLogic}
                        survey={survey}
                        onClick={() => onSelect(question, 'Advanced')}
                    />
                )}
            </div>
        </div>
    );
});

export default QuestionCard;