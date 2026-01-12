import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { Question, ToolboxItemData, Choice, Survey, Block, PageInfo } from '../types';
import { QuestionType } from '../types';
import { generateId, parseChoice } from '../utils';

interface UseQuestionCardLogicProps {
    question: Question;
    survey: Survey;
    parentBlock: Block;
    onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
    onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
    onSelect: (question: Question, options?: { tab?: string; focusOn?: string }) => void;
    toolboxItems: ToolboxItemData[];
    pageInfo?: PageInfo;
}

export const useQuestionCardLogic = ({
    question,
    parentBlock,
    onUpdateQuestion,
    onUpdateBlock,
    onSelect,
    toolboxItems,
    pageInfo,
    survey
}: UseQuestionCardLogicProps) => {
    // Menu States
    const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
    const typeMenuContainerRef = useRef<HTMLDivElement>(null);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const actionsMenuContainerRef = useRef<HTMLDivElement>(null);

    // Drag States
    const [draggedChoiceId, setDraggedChoiceId] = useState<string | null>(null);
    const [dropTargetChoiceId, setDropTargetChoiceId] = useState<string | null>(null);

    // Editing States
    const [isEditingPageName, setIsEditingPageName] = useState(false);
    const [pageNameValue, setPageNameValue] = useState('');
    const pageNameInputRef = useRef<HTMLInputElement>(null);

    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [labelValue, setLabelValue] = useState(question.label || '');
    const [labelError, setLabelError] = useState<string | null>(null);
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);

    const isAnyMenuOpen = isTypeMenuOpen || isActionsMenuOpen;

    // Memoized Options
    const questionTypeOptions = useMemo(() => toolboxItems
        .filter(item => item.name !== 'Block' && item.name !== 'Page Break')
        .map(item => ({
            type: item.name as QuestionType,
            label: item.name,
            icon: item.icon,
        })), [toolboxItems]);

    // Computed Properties
    const willAutoadvance = useMemo(() => {
        const isCompatibleType = [QuestionType.Radio, QuestionType.ChoiceGrid].includes(question.type);
        if (!isCompatibleType) {
            return false;
        }
        if (typeof question.autoAdvance === 'boolean') {
            return question.autoAdvance;
        }
        return !!parentBlock.autoAdvance;
    }, [question.type, question.autoAdvance, parentBlock.autoAdvance]);

    const hasDisplayLogic = useMemo(() => {
        if (!question.displayLogic) return false;
        return question.displayLogic.conditions.length > 0 || (question.displayLogic.logicSets && question.displayLogic.logicSets.length > 0);
    }, [question.displayLogic]);

    // Effects
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

    // Handlers
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

    // Choice Drag & Drop Handlers
    const handleChoiceDragStart = useCallback((e: React.DragEvent, choiceId: string) => {
        e.stopPropagation();
        setDraggedChoiceId(choiceId);
        e.dataTransfer.setData('application/survey-choice', choiceId);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleChoiceDragOver = useCallback((e: React.DragEvent, choiceId: string) => {
        // Only handle choice drags - let other drag types bubble to parent handlers
        if (!e.dataTransfer.types.includes('application/survey-choice')) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (draggedChoiceId !== choiceId) {
            setDropTargetChoiceId(choiceId);
        }
    }, [draggedChoiceId]);

    const handleChoiceDrop = useCallback((e: React.DragEvent) => {
        // Only handle choice drags
        if (!e.dataTransfer.types.includes('application/survey-choice')) {
            return;
        }

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

    // Matrix/Grid Handlers
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

    // Paste Handlers
    const handlePasteChoices = useCallback((pastedText: string) => {
        const lines = pastedText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return;
        const newChoices: Choice[] = lines.map(line => ({ id: generateId('c'), text: line.trim() }));
        const currentChoices = question.choices || [];
        onUpdateQuestion(question.id, { choices: [...currentChoices, ...newChoices] });
    }, [question.id, question.choices, onUpdateQuestion]);

    // Page Name Handlers
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

    // Label Editing Handlers
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

    // Actions Menu Handlers
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

    return {
        // Refs
        typeMenuContainerRef,
        actionsMenuContainerRef,
        pageNameInputRef,

        // State
        isTypeMenuOpen,
        setIsTypeMenuOpen,
        isActionsMenuOpen,
        setIsActionsMenuOpen,
        isEditingPageName,
        setIsEditingPageName,
        pageNameValue,
        setPageNameValue,
        isEditingLabel,
        setIsEditingLabel,
        labelValue,
        setLabelValue,
        labelError,
        setLabelError,
        draggedChoiceId,
        dropTargetChoiceId,
        setDropTargetChoiceId, // Exposed for onDragOver cleanup
        isAnyMenuOpen,

        // Memoized / Computeds
        questionTypeOptions,
        willAutoadvance,
        hasDisplayLogic,

        // Handlers
        handleTypeSelect,
        handleChoiceDragStart,
        handleChoiceDragOver,
        handleChoiceDrop,
        handleChoiceDragEnd,
        handleAddColumn,
        handleScalePointTextChange,
        handlePasteChoices,
        isPasteModalOpen,
        setIsPasteModalOpen,
        handleSavePageName,
        handlePageNameKeyDown,
        handleLabelEditClick,
        saveLabel,
        handleLabelKeyDown,
        handleActivate,
        handleDeactivate,
        handlePreview
    };
};
