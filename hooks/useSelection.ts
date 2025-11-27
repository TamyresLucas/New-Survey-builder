import { useState, useRef, useEffect, useCallback } from 'react';
import type { Survey, Question, Block } from '../types';
import { QuestionType as QTEnum } from '../types';
import { SurveyActionType } from '../state/surveyReducer';

export const useSelection = (survey: Survey, dispatch: React.Dispatch<any>) => {
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
    const [focusTarget, setFocusTarget] = useState<{ type: string; id: string; tab: string; element: string; } | null>(null);
    const [focusedLogicSource, setFocusedLogicSource] = useState<string | null>(null);
    const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);

    const prevSelectedQuestionIdRef = useRef<string | null>(null);

    // Sync selectedQuestion with survey state to prevent stale data
    useEffect(() => {
        if (selectedQuestion) {
            const updatedQuestion = survey.blocks
                .flatMap(b => b.questions)
                .find(q => q.id === selectedQuestion.id);

            if (updatedQuestion && JSON.stringify(updatedQuestion) !== JSON.stringify(selectedQuestion)) {
                setSelectedQuestion(updatedQuestion);
            } else if (!updatedQuestion) {
                setSelectedQuestion(null);
            }
        }
        if (selectedBlock) {
            const updatedBlock = survey.blocks.find(b => b.id === selectedBlock.id);
            if (updatedBlock && JSON.stringify(updatedBlock) !== JSON.stringify(selectedBlock)) {
                setSelectedBlock(updatedBlock);
            } else if (!updatedBlock) {
                setSelectedBlock(null);
            }
        }
    }, [survey, selectedQuestion, selectedBlock]);

    // When the selected question changes, clean up any unconfirmed logic from the *previous* question.
    useEffect(() => {
        const prevId = prevSelectedQuestionIdRef.current;
        if (prevId && prevId !== selectedQuestion?.id) {
            dispatch({ type: SurveyActionType.CLEANUP_UNCONFIRMED_LOGIC, payload: { questionId: prevId } });
        }
        prevSelectedQuestionIdRef.current = selectedQuestion?.id ?? null;
    }, [selectedQuestion, dispatch]);

    const handleSelectBlock = useCallback((block: Block | null, options?: { tab: string, focusOn: string }) => {
        if (block) {
            setSelectedQuestion(null);
            if (options) {
                setFocusTarget({ type: 'block', id: block.id, tab: options.tab, element: options.focusOn });
            } else {
                setFocusTarget(null);
            }
        } else {
            setIsRightSidebarExpanded(false); // Reset on close
            setFocusTarget(null);
        }
        setSelectedBlock(block);
    }, []);

    const handleSelectQuestion = useCallback((question: Question | null, options?: { tab?: string; focusOn?: string }) => {
        if (question) {
            setSelectedBlock(null);
            setFocusTarget(null);
        }

        if (question === null) {
            setIsRightSidebarExpanded(false); // Reset on close
            setFocusedLogicSource(null);
        } else {
            if (question.type === QTEnum.PageBreak) {
                setSelectedQuestion(null);
                return;
            }

            setFocusedLogicSource(options?.focusOn ?? null);
        }

        setSelectedQuestion(question);
    }, []);

    return {
        selectedQuestion,
        setSelectedQuestion,
        selectedBlock,
        setSelectedBlock,
        focusTarget,
        setFocusTarget,
        focusedLogicSource,
        setFocusedLogicSource,
        isRightSidebarExpanded,
        setIsRightSidebarExpanded,
        handleSelectBlock,
        handleSelectQuestion
    };
};
