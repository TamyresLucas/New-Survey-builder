import React, { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react';
import type { Question, ToolboxItemData, Choice, Survey, LogicIssue, Block } from '../types';
import { QuestionType } from '../types';
import { Button } from './Button';
import {
    DotsHorizontalIcon, RadioIcon, ChevronDownIcon,
    CheckboxOutlineIcon, XIcon, DragIndicatorIcon, PlusIcon,
    RadioButtonUncheckedIcon,
    WarningIcon,
    VisibilityOffIcon,
    AsteriskIcon
} from './icons';
import { PageBreakActionsMenu, QuestionActionsMenu, QuestionTypeSelectionMenuContent } from './ActionMenus';
import { generateId, parseChoice } from '../utils';
import { DisplayLogicDisplay, SkipLogicDisplay, BranchingLogicDisplay } from './LogicDisplays';
import type { PageInfo } from './SurveyCanvas';
import { EditableText } from './EditableText';

// Helper for inline editing with contentEditable



const ChoiceDropIndicator = () => (
    <div className="relative h-px w-full bg-primary my-1 ml-6">
        <div className="absolute left-0 top-1-2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
    </div>
);

const TableDropIndicator: React.FC<{ colSpan: number }> = ({ colSpan }) => (
    <tr className="h-0 p-0 m-0">
        <td colSpan={colSpan} className="p-0 border-0 h-0 m-0 relative">
            <div className="absolute inset-x-0 top-[-1px] h-px bg-primary">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
        </td>
    </tr>
);

const QuestionCard: React.FC<{
    question: Question,
    survey: Survey,
    parentBlock: Block,
    currentBlockId: string,
    logicIssues: LogicIssue[],
    isSelected: boolean,
    isChecked: boolean,
    onSelect: (question: Question, options?: { tab?: string; focusOn?: string }) => void,
    onToggleCheck: (questionId: string) => void;
    id: string;
    onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
    onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
    onDeleteQuestion: (questionId: string) => void;
    onCopyQuestion: (questionId: string) => void;
    onMoveQuestionToNewBlock: (questionId: string) => void;
    onMoveQuestionToExistingBlock: (questionId: string, targetBlockId: string) => void;
    toolboxItems: ToolboxItemData[];
    isDragging: boolean;
    onDragStart: () => void;
    onDragEnd: () => void;
    onAddChoice: (questionId: string) => void;
    onAddPageBreakAfterQuestion: (questionId: string) => void;
    pageInfo?: PageInfo;
    focusedLogicSource: string | null;
    printMode?: boolean;
}> = memo(({
    question, survey, parentBlock, currentBlockId, logicIssues, isSelected, isChecked, onSelect, onToggleCheck, id,
    onUpdateQuestion, onUpdateBlock, onDeleteQuestion, onCopyQuestion, onMoveQuestionToNewBlock, onMoveQuestionToExistingBlock, toolboxItems,
    isDragging, onDragStart, onDragEnd, onAddChoice, onAddPageBreakAfterQuestion, pageInfo, focusedLogicSource,
    printMode = false
}) => {

    const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
    const typeMenuContainerRef = useRef<HTMLDivElement>(null);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const actionsMenuContainerRef = useRef<HTMLDivElement>(null);

    const [draggedChoiceId, setDraggedChoiceId] = useState<string | null>(null);
    const [dropTargetChoiceId, setDropTargetChoiceId] = useState<string | null>(null);

    const [isEditingPageName, setIsEditingPageName] = useState(false);
    const [pageNameValue, setPageNameValue] = useState('');
    const pageNameInputRef = useRef<HTMLInputElement>(null);

    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [labelValue, setLabelValue] = useState(question.label || '');
    const [labelError, setLabelError] = useState<string | null>(null);

    const isAnyMenuOpen = isTypeMenuOpen || isActionsMenuOpen;

    const questionTypeOptions = useMemo(() => toolboxItems
        .filter(item => item.name !== 'Block' && item.name !== 'Page Break')
        .map(item => ({
            type: item.name as QuestionType,
            label: item.name,
            icon: item.icon,
        })), [toolboxItems]);

    useEffect(() => {
        if (pageInfo) {
            setPageNameValue(pageInfo.pageName);
        }
    }, [pageInfo]);

    useEffect(() => {
        if (isEditingPageName && pageNameInputRef.current) {
            pageNameInputRef.current.focus();
            pageNameInputRef.current.select();
        }
    }, [isEditingPageName]);

    useEffect(() => {
        setIsEditingLabel(false);
        setLabelValue(question.label || '');
        setLabelError(null);
    }, [question.id, question.label]);


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
                { id: `${question.id} c1`, text: `${question.qid}_1 Yes` },
                { id: `${question.id} c2`, text: `${question.qid}_2 No` },
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

    const handleAddColumn = useCallback(() => {
        const currentScalePoints = question.scalePoints || [];
        const newScalePoint: Choice = {
            id: generateId('s'),
            text: `Column ${Number(currentScalePoints.length) + 1} `
        };
        onUpdateQuestion(question.id, { scalePoints: [...currentScalePoints, newScalePoint] });
    }, [question.id, question.scalePoints, onUpdateQuestion]);

    const handleScalePointTextChange = useCallback((scalePointId: string, newText: string) => {
        const newScalePoints = (question.scalePoints || []).map(sp =>
            sp.id === scalePointId ? { ...sp, text: newText } : sp
        );
        onUpdateQuestion(question.id, { scalePoints: newScalePoints });
    }, [question.id, question.scalePoints, onUpdateQuestion]);

    const handleSavePageName = useCallback(() => {
        if (pageInfo && pageNameValue.trim() && pageNameValue.trim() !== pageInfo.pageName) {
            if (pageInfo.source === 'block' && onUpdateBlock) {
                onUpdateBlock(pageInfo.sourceId, { pageName: pageNameValue.trim() });
            } else if (pageInfo.source === 'page_break') {
                onUpdateQuestion(pageInfo.sourceId, { pageName: pageNameValue.trim() });
            }
        }
        setIsEditingPageName(false);
    }, [pageInfo, pageNameValue, onUpdateBlock, onUpdateQuestion]);

    const handlePageNameKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSavePageName();
        } else if (e.key === 'Escape') {
            setIsEditingPageName(false);
            if (pageInfo) setPageNameValue(pageInfo.pageName);
        }
    }, [handleSavePageName, pageInfo]);

    const handleLabelEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLabelValue(question.label || '');
        setIsEditingLabel(true);
    };

    const saveLabel = () => {
        const trimmedValue = labelValue.trim();

        if (!trimmedValue && !question.label) {
            setIsEditingLabel(false);
            return;
        }

        if (trimmedValue) {
            const isDuplicate = survey.blocks
                .flatMap(b => b.questions)
                .some(q =>
                    q.id !== question.id &&
                    q.type === QuestionType.Description &&
                    q.label?.trim().toLowerCase() === trimmedValue.toLowerCase()
                );

            if (isDuplicate) {
                setLabelError(`Label "${trimmedValue}" is already in use.`);
                return;
            }
        }

        const newLabel = trimmedValue ? trimmedValue : undefined;
        if (newLabel !== question.label) {
            onUpdateQuestion(question.id, { label: newLabel });
        }

        setIsEditingLabel(false);
        setLabelError(null);
    };

    const handleLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveLabel();
        } else if (e.key === 'Escape') {
            setIsEditingLabel(false);
            setLabelValue(question.label || '');
            setLabelError(null);
        }
    };

    const willAutoadvance = useMemo(() => {
        const isCompatibleType = [QuestionType.Radio, QuestionType.ChoiceGrid].includes(question.type);
        if (!isCompatibleType) {
            return false;
        }
        // Question-level setting takes precedence
        if (typeof question.autoAdvance === 'boolean') {
            return question.autoAdvance;
        }
        // If question-level is undefined, inherit from block
        return !!parentBlock.autoAdvance;
    }, [question.type, question.autoAdvance, parentBlock.autoAdvance]);

    const handleActivate = () => {
        onUpdateQuestion(question.id, { isHidden: false });
        setIsActionsMenuOpen(false);
    };

    const handleDeactivate = () => {
        onUpdateQuestion(question.id, { isHidden: true });
        setIsActionsMenuOpen(false);
    };

    const handlePreview = () => {
        onSelect(question, { tab: 'Preview' });
        setIsActionsMenuOpen(false);
    };

    const pageIndicator = useMemo(() => {
        if (!pageInfo) return null;

        const content = (
            <div className="flex items-center gap-4 text-on-surface-variant w-full">
                <div className="flex-grow h-px bg-outline"></div>

                <div className="flex-shrink-0 flex items-stretch border border-outline rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ring-offset-surface-container transition-shadow hover:border-outline-hover">
                    <span
                        className="bg-surface-container-high px-3 py-1.5 text-sm font-bold text-on-surface border-r border-outline"
                        style={{ fontFamily: "'Open Sans', sans-serif" }}
                    >
                        P{pageInfo.pageNumber}
                    </span>
                    {isEditingPageName ? (
                        <input
                            ref={pageNameInputRef}
                            type="text"
                            value={pageNameValue}
                            onChange={(e) => setPageNameValue(e.target.value)}
                            onBlur={handleSavePageName}
                            onKeyDown={handlePageNameKeyDown}
                            onClick={e => e.stopPropagation()}
                            className="font-semibold text-sm text-on-surface bg-surface-container px-3 py-1.5 border border-transparent hover:border-input-border-hover focus:outline-none w-32 rounded-md transition-colors"
                            style={{ fontFamily: "'Open Sans', sans-serif" }}
                        />
                    ) : (
                        <span
                            onClick={(e) => { e.stopPropagation(); setIsEditingPageName(true); }}
                            className="font-semibold text-sm text-on-surface cursor-pointer bg-surface-container hover:bg-surface-container-lowest px-3 py-1.5 transition-colors"
                            style={{ fontFamily: "'Open Sans', sans-serif" }}
                        >
                            {pageNameValue}
                        </span>
                    )}
                </div>

                <div className="flex-grow h-px bg-outline"></div>
            </div>
        );

        // Render interactive indicator for explicit PageBreak questions
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
                    className={`relative py-4 group cursor-grab ${isDragging ? 'opacity-50' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onSelect(question); }}
                >
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DragIndicatorIcon className="text-xl text-on-surface-variant" />
                    </div>
                    {content}
                    {!printMode && (
                        <div ref={actionsMenuContainerRef} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsActionsMenuOpen(prev => !prev); }}
                                className={`p-1.5 rounded-md hover:bg-surface-container-lowest ${isActionsMenuOpen ? '!bg-surface-container-high' : ''}`}
                                aria-label="Page break actions"
                            >
                                <DotsHorizontalIcon className="text-xl" />
                            </button>
                            {isActionsMenuOpen && (
                                <PageBreakActionsMenu
                                    onMoveToNewBlock={() => { onMoveQuestionToNewBlock(question.id); setIsActionsMenuOpen(false); }}
                                    onDelete={!question.isAutomatic ? () => { onDeleteQuestion(question.id); setIsActionsMenuOpen(false); } : undefined}
                                />
                            )}
                        </div>
                    )}
                </div>
            );
        }
        // Render non-interactive indicator for implicit page starts
        else {
            return (
                <div className="mb-4">
                    {content}
                </div>
            );
        }
    }, [pageInfo, isEditingPageName, pageNameValue, handleSavePageName, handlePageNameKeyDown, question, id, onDragStart, onDragEnd, isDragging, onSelect, onDeleteQuestion, isActionsMenuOpen, onMoveQuestionToNewBlock]);

    if (question.type === QuestionType.PageBreak) {
        return pageIndicator;
    }

    const CurrentQuestionTypeIcon = questionTypeOptions.find(o => o.type === question.type)?.icon || RadioIcon;
    const hasLogicIssues = logicIssues.length > 0;

    const hasDisplayLogic = useMemo(() => {
        if (!question.displayLogic) return false;
        return question.displayLogic.conditions.length > 0 || (question.displayLogic.logicSets && question.displayLogic.logicSets.length > 0);
    }, [question.displayLogic]);

    return (
        <>
            {pageIndicator}
            <div
                id={id}
                data-question-id={question.id}
                draggable={true}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onClick={(e) => { e.stopPropagation(); onSelect(question); }}
                className={`p-4 rounded-lg border transition-all group relative grid grid-cols-[auto_1fr] items-start gap-x-3 bg-surface-container ${!printMode ? 'cursor-grab' : ''} ${isSelected
                    ? (hasLogicIssues ? 'border-error shadow-md' : 'border-primary shadow-md')
                    : question.isHidden
                        ? 'border-outline bg-surface-container opacity-60'
                        : 'border-outline hover:border-outline hover:shadow-md'
                    } ${isDragging ? 'opacity-50' : ''} ${isAnyMenuOpen ? 'z-10' : ''} ${hasDisplayLogic ? 'border-dashed' : ''}`}
            >
                {/* Grid Cell 1: Checkbox */}
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input-border text-primary focus:ring-primary accent-primary self-center dark:border-outline-variant dark:bg-transparent cursor-pointer"
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
                        {question.type === QuestionType.Description ? (
                            <div className="relative mr-2">
                                {isEditingLabel ? (
                                    <div>
                                        <input
                                            type="text"
                                            value={labelValue}
                                            onChange={(e) => {
                                                setLabelValue(e.target.value);
                                                if (labelError) setLabelError(null);
                                            }}
                                            onBlur={saveLabel}
                                            onKeyDown={handleLabelKeyDown}
                                            onClick={e => e.stopPropagation()}
                                            className={`font-semibold text-on-surface bg-transparent border-b-2 -mb-px focus:outline-none w-32 ${labelError ? 'border-error' : 'border-primary'}`}
                                            autoFocus
                                            placeholder="Description Label"
                                        />
                                    </div>
                                ) : (
                                    <span
                                        onClick={printMode ? undefined : handleLabelEditClick}
                                        className={`font-semibold text-on-surface-variant ${!printMode ? 'cursor-pointer hover:underline' : ''}`}
                                    >
                                        {question.label || 'Description'}
                                    </span>
                                )}
                                {labelError && <div className="absolute top-full mt-1 text-xs text-error bg-error-container p-1 rounded shadow-lg z-10">{labelError}</div>}
                            </div>
                        ) : (
                            <div className="flex items-center mr-2">
                                <span className="font-bold text-on-surface">{question.qid}</span>
                                {question.forceResponse && <AsteriskIcon className="text-sm text-error ml-0.5" />}
                            </div>
                        )}

                        {willAutoadvance && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary text-on-primary rounded-full">
                                Autoadvance
                            </span>
                        )}
                        {question.isHidden && (
                            <div className={`relative group / tooltip ${question.forceResponse || willAutoadvance ? 'ml-2' : ''} `}>
                                <VisibilityOffIcon className="text-on-surface-variant text-lg" />
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-surface-container-highest text-on-surface text-xs rounded-md p-2 shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20">
                                    This question is hidden
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-surface-container-highest"></div>
                                </div>
                            </div>
                        )}

                    </div>
                    {!printMode && (
                        <div className="flex items-center gap-2">
                            <div ref={typeMenuContainerRef} className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsTypeMenuOpen(prev => !prev);
                                    }}
                                    className={`h-[32px] flex items-center gap-2 rounded-md px-2 border border-input-border bg-transparent hover:border-input-border-hover transition-colors ${isTypeMenuOpen ? '!border-input-border-hover' : ''}`}
                                >
                                    <div className="w-[19px] h-[19px] flex-shrink-0 flex items-center justify-center">
                                        <CurrentQuestionTypeIcon className="text-base text-primary" />
                                    </div>
                                    <span className="font-semibold text-sm text-on-surface truncate leading-[19px]">{question.type}</span>
                                    <ChevronDownIcon className="text-lg text-on-surface-variant flex-shrink-0" />
                                </button>
                                {isTypeMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-64 z-20" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                                        <QuestionTypeSelectionMenuContent onSelect={handleTypeSelect} toolboxItems={toolboxItems} />
                                    </div>
                                )}
                            </div>
                            <div ref={actionsMenuContainerRef} className="relative transition-opacity">
                                <Button
                                    variant="tertiary"
                                    iconOnly
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsActionsMenuOpen(prev => !prev);
                                    }}
                                    aria-label="Question actions"
                                    active={isActionsMenuOpen}
                                >
                                    <DotsHorizontalIcon className="text-xl" />
                                </Button>
                                {isActionsMenuOpen && (
                                    <QuestionActionsMenu
                                        question={question}
                                        onDuplicate={() => { onCopyQuestion(question.id); setIsActionsMenuOpen(false); }}
                                        onDelete={() => { onDeleteQuestion(question.id); setIsActionsMenuOpen(false); }}
                                        onAddPageBreak={() => { onAddPageBreakAfterQuestion(question.id); setIsActionsMenuOpen(false); }}
                                        onMoveToNewBlock={() => { onMoveQuestionToNewBlock(question.id); setIsActionsMenuOpen(false); }}
                                        onPreview={handlePreview}
                                        onActivate={handleActivate}
                                        onDeactivate={handleDeactivate}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Grid Cell 3: Body Content (starts in column 2) */}
                <div className="col-start-2 mt-3 min-w-0">
                    <EditableText
                        html={question.text}
                        onChange={(newText) => onUpdateQuestion(question.id, { text: newText })}
                        onFocus={() => onSelect(question)}
                        className="text-on-surface min-h-[24px]"
                        readOnly={printMode}
                    />

                    {question.type === QuestionType.TextEntry && (
                        <div className="mt-4">
                            <textarea
                                className="w-full bg-transparent border border-input-border rounded-md p-2 text-sm text-on-surface resize-y cursor-default hover:border-input-border-hover transition-colors"
                                rows={question.textEntrySettings?.answerLength === 'long' ? 8 : 1}
                                placeholder={question.textEntrySettings?.placeholder || ''}
                                readOnly
                            />
                        </div>
                    )}

                    {question.type === QuestionType.ChoiceGrid && (
                        <div className="mt-4">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-outline">
                                            <th className="py-2 pr-2 text-left"></th>
                                            {(question.scalePoints || []).map(sp => (
                                                <th key={sp.id} className="py-2 px-3 text-center text-xs font-normal text-on-surface-variant align-bottom group/header relative">
                                                    <EditableText
                                                        html={sp.text}
                                                        onChange={(newText) => handleScalePointTextChange(sp.id, newText)}
                                                        onFocus={() => onSelect(question)}
                                                        className="text-on-surface-variant"
                                                        readOnly={printMode}
                                                    />
                                                    {!printMode && (
                                                        <Button
                                                            variant="danger"
                                                            size="small"
                                                            iconOnly
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newScalePoints = question.scalePoints?.filter(p => p.id !== sp.id);
                                                                onUpdateQuestion(question.id, { scalePoints: newScalePoints });
                                                            }}
                                                            className="absolute -top-1 -right-1 opacity-0 group-hover/header:opacity-100"
                                                            aria-label="Remove column"
                                                        >
                                                            <XIcon className="text-base" />
                                                        </Button>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody
                                        onDrop={handleChoiceDrop}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDropTargetChoiceId(null);
                                        }}
                                    >
                                        {(question.choices || []).map(choice => {
                                            const { variable, label } = parseChoice(choice.text);
                                            const numColumns = (question.scalePoints?.length || 0) + 1;
                                            return (
                                                <React.Fragment key={choice.id}>
                                                    {dropTargetChoiceId === choice.id && <TableDropIndicator colSpan={numColumns} />}
                                                    <tr
                                                        className={`border-b border-outline last:border-b-0 group/choice transition-opacity ${draggedChoiceId === choice.id ? 'opacity-30' : ''}`}
                                                        draggable
                                                        onDragStart={(e) => handleChoiceDragStart(e, choice.id)}
                                                        onDragOver={(e) => handleChoiceDragOver(e, choice.id)}
                                                        onDragEnd={handleChoiceDragEnd}
                                                    >
                                                        <td className="p-2 text-sm text-on-surface pr-4 relative">
                                                            <div className="flex items-center gap-1">
                                                                {!printMode && <DragIndicatorIcon className="text-xl text-on-surface-variant cursor-grab opacity-0 group-hover/choice:opacity-100 transition-opacity" />}
                                                                {variable && <span className="font-semibold text-on-surface">{variable}</span>}
                                                                <EditableText
                                                                    html={label}
                                                                    onChange={(newLabel) => {
                                                                        const newText = variable ? `${variable} ${newLabel} ` : newLabel;
                                                                        const newChoices = (question.choices || []).map(c =>
                                                                            c.id === choice.id ? { ...c, text: newText } : c
                                                                        );
                                                                        onUpdateQuestion(question.id, { choices: newChoices });
                                                                    }}
                                                                    onFocus={() => onSelect(question)}
                                                                    className="text-on-surface flex-grow"
                                                                    readOnly={printMode}
                                                                />
                                                                {!printMode && (
                                                                    <Button
                                                                        variant="danger"
                                                                        size="small"
                                                                        iconOnly
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const newChoices = question.choices?.filter(c => c.id !== choice.id);
                                                                            onUpdateQuestion(question.id, { choices: newChoices });
                                                                        }}
                                                                        className="opacity-0 group-hover/choice:opacity-100"
                                                                        aria-label="Remove row"
                                                                    >
                                                                        <XIcon className="text-base" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        {(question.scalePoints || []).map(sp => (
                                                            <td key={sp.id} className="p-2 text-center">
                                                                <RadioButtonUncheckedIcon className="text-xl text-outline" />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                </React.Fragment>
                                            );
                                        })}
                                        {dropTargetChoiceId === null && draggedChoiceId && <TableDropIndicator colSpan={(question.scalePoints?.length || 0) + 1} />}
                                    </tbody>
                                </table>
                            </div>
                            {!printMode && (
                                <div className="flex items-center gap-4 mt-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddChoice(question.id);
                                        }}
                                        className="flex items-center text-sm text-primary font-semibold transition-colors hover:bg-primary hover:text-on-primary rounded-md px-4 py-1.5"
                                    >
                                        <PlusIcon className="text-base mr-1" /> Add row
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddColumn();
                                        }}
                                        className="flex items-center text-sm text-primary font-semibold transition-colors hover:bg-primary hover:text-on-primary rounded-md px-4 py-1.5"
                                    >
                                        <PlusIcon className="text-base mr-1" /> Add column
                                    </button>
                                </div>
                            )}
                        </div>
                    )}


                    {question.choices && question.type !== QuestionType.ChoiceGrid && (
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
                                            className={`flex items-center group/choice transition-opacity h-[32px] ${draggedChoiceId === choice.id ? 'opacity-30' : ''}`}
                                            draggable={true}
                                            onDragStart={(e) => handleChoiceDragStart(e, choice.id)}
                                            onDragOver={(e) => handleChoiceDragOver(e, choice.id)}
                                            onDragEnd={handleChoiceDragEnd}
                                        >
                                            {!printMode && <DragIndicatorIcon className="text-xl text-on-surface-variant mr-1 cursor-grab opacity-0 group-hover/choice:opacity-100" />}
                                            {question.type === QuestionType.Radio ? (
                                                index === 0 ? (
                                                    <RadioIcon className="text-xl text-primary mr-2" />
                                                ) : (
                                                    <RadioButtonUncheckedIcon className="text-xl text-on-surface-variant mr-2" />
                                                )
                                            ) : (
                                                <CheckboxOutlineIcon className="text-xl text-on-surface-variant mr-2" />
                                            )}

                                            <div className="text-on-surface flex-grow h-full flex items-center gap-2">
                                                {variable && <span className="font-semibold text-on-surface mr-2">{variable}</span>}
                                                <EditableText
                                                    html={label}
                                                    onChange={(newLabel) => {
                                                        const newText = variable ? `${variable} ${newLabel} ` : newLabel;
                                                        const newChoices = (question.choices || []).map(c =>
                                                            c.id === choice.id ? { ...c, text: newText } : c
                                                        );
                                                        onUpdateQuestion(question.id, { choices: newChoices });
                                                    }}
                                                    onFocus={() => onSelect(question)}
                                                    className="text-on-surface flex-grow"
                                                    readOnly={printMode}
                                                />
                                            </div>

                                            {!printMode && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const newChoices = question.choices?.filter(c => c.id !== choice.id);
                                                        onUpdateQuestion(question.id, { choices: newChoices });
                                                    }}
                                                    className="w-6 h-6 flex items-center justify-center rounded-md text-error hover:bg-error-container opacity-0 group-hover/choice:opacity-100 transition-opacity"
                                                    aria-label="Remove choice"
                                                >
                                                    <XIcon className="text-base" />
                                                </button>
                                            )}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                            {dropTargetChoiceId === null && draggedChoiceId && <ChoiceDropIndicator />}
                            {!printMode && (
                                <Button
                                    variant="tertiary-primary"
                                    size="large"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddChoice(question.id);
                                    }}
                                    className="mt-2"
                                >
                                    <PlusIcon className="text-xl mr-2" /> Add choice
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Logic Displays */}
                    {question.displayLogic && (
                        <DisplayLogicDisplay
                            logic={question.displayLogic}
                            survey={survey}
                            onClick={(id) => onSelect(question, { tab: 'Behavior', focusOn: id || 'display' })}
                            issues={logicIssues.filter(i => i.type === 'display')}
                            isFocused={focusedLogicSource === 'display'}
                            focusedId={focusedLogicSource}
                            onRemove={() => onUpdateQuestion(question.id, { displayLogic: undefined })}
                            readOnly={printMode}
                        />
                    )}
                    {question.skipLogic && (
                        <SkipLogicDisplay
                            logic={question.skipLogic}
                            currentQuestion={question}
                            survey={survey}
                            onClick={() => onSelect(question, { tab: 'Behavior', focusOn: 'skip' })}
                            onRemove={() => onUpdateQuestion(question.id, { skipLogic: undefined })}
                            issues={logicIssues.filter(i => i.type === 'skip')}
                            isFocused={focusedLogicSource === 'skip'}
                            readOnly={printMode}
                        />
                    )}
                    {question.branchingLogic && (
                        <BranchingLogicDisplay
                            logic={question.branchingLogic}
                            survey={survey}
                            question={question}
                            onClick={(id) => onSelect(question, { tab: 'Behavior', focusOn: id || 'branching' })}
                            issues={logicIssues.filter(i => i.type === 'branching')}
                            isFocused={focusedLogicSource === 'branching'}
                            focusedId={focusedLogicSource}
                            onRemove={() => onUpdateQuestion(question.id, { branchingLogic: undefined, draftBranchingLogic: undefined })}
                            readOnly={printMode}
                        />
                    )}
                </div>
            </div>
        </>
    );
});

export default QuestionCard;