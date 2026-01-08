import { useCallback } from 'react';
import type { Survey, Question, Block, ToolboxItemData, QuestionType, Choice } from '../types';
import { QuestionType as QTEnum } from '../types';
import { SurveyActionType, type Action } from '../state/surveyReducer';
import { generateId } from '../utils';
import { customerFeedbackSurvey } from '../data/test-surveys';

interface UseSurveyActionsProps {
    survey: Survey;
    dispatch: React.Dispatch<Action>;
    dispatchAndRecord: (action: Action) => void;
    handleSelectQuestion: (question: Question | null) => void;
    handleUndo: () => void;
    showToast: (message: string, type: 'error' | 'success', onUndo?: () => void) => void;
    setToolboxItems: React.Dispatch<React.SetStateAction<ToolboxItemData[]>>;
    setCheckedQuestions: React.Dispatch<React.SetStateAction<Set<string>>>;
    checkedQuestions: Set<string>;
    selectedQuestion: Question | null;
    selectedBlock: Block | null;
    setSelectedQuestion: React.Dispatch<React.SetStateAction<Question | null>>;
    setSelectedBlock: React.Dispatch<React.SetStateAction<Block | null>>;
    surveyRef: React.MutableRefObject<Survey>;
}

export const useSurveyActions = ({
    survey,
    dispatch,
    dispatchAndRecord,
    handleSelectQuestion,
    handleUndo,
    showToast,
    setToolboxItems,
    setCheckedQuestions,
    checkedQuestions,
    selectedQuestion,
    selectedBlock,
    setSelectedQuestion,
    setSelectedBlock,
    surveyRef
}: UseSurveyActionsProps) => {

    const handleUpdateQuestion = useCallback((questionId: string, updates: Partial<Question>) => {
        dispatch({ type: SurveyActionType.UPDATE_QUESTION, payload: { questionId, updates } });
    }, [dispatch]);

    const handleReorderQuestion = useCallback((draggedQuestionId: string, targetQuestionId: string | null, targetBlockId: string) => {
        const onLogicRemoved = (message: string) => {
            showToast(message, 'error', handleUndo);
        };
        dispatchAndRecord({ type: SurveyActionType.REORDER_QUESTION, payload: { draggedQuestionId, targetQuestionId, targetBlockId, onLogicRemoved } });
    }, [showToast, handleUndo, dispatchAndRecord]);

    const handleReorderToolbox = useCallback((newItems: ToolboxItemData[]) => {
        setToolboxItems(newItems);
    }, [setToolboxItems]);

    const handleReorderBlock = useCallback((draggedBlockId: string, targetBlockId: string | null) => {
        dispatchAndRecord({ type: SurveyActionType.REORDER_BLOCK, payload: { draggedBlockId, targetBlockId } });
    }, [dispatchAndRecord]);

    const handleMoveBlockUp = useCallback((blockId: string) => {
        dispatchAndRecord({ type: SurveyActionType.MOVE_BLOCK_UP, payload: { blockId } });
    }, [dispatchAndRecord]);

    const handleMoveBlockDown = useCallback((blockId: string) => {
        dispatchAndRecord({ type: SurveyActionType.MOVE_BLOCK_DOWN, payload: { blockId } });
    }, [dispatchAndRecord]);

    const handleAddBlockFromToolbox = useCallback((targetBlockId: string | null) => {
        dispatchAndRecord({ type: SurveyActionType.ADD_BLOCK_FROM_TOOLBOX, payload: { targetBlockId } });
    }, [dispatchAndRecord]);

    const handleAddQuestion = useCallback((questionType: QuestionType, targetQuestionId: string | null, targetBlockId: string) => {
        const onQuestionAdded = (newQuestionId: string) => {
            if (questionType !== QTEnum.PageBreak) {
                // This now uses a ref to get the latest survey state post-reducer update.
                setTimeout(() => {
                    const currentSurvey = surveyRef.current;
                    const addedQuestion = currentSurvey.blocks
                        .flatMap(b => b.questions)
                        .find(q => q.id === newQuestionId);
                    if (addedQuestion) {
                        handleSelectQuestion(addedQuestion);
                    }
                }, 0);
            }
        };
        dispatchAndRecord({ type: SurveyActionType.ADD_QUESTION, payload: { questionType, targetQuestionId, targetBlockId, onQuestionAdded } });
    }, [handleSelectQuestion, dispatchAndRecord, surveyRef]);

    const handleAddQuestionToBlock = useCallback((blockId: string, questionType: QuestionType) => {
        const onQuestionAdded = (newQuestionId: string) => {
            if (questionType !== QTEnum.PageBreak) {
                setTimeout(() => {
                    const currentSurvey = surveyRef.current;
                    const addedQuestion = currentSurvey.blocks
                        .flatMap(b => b.questions)
                        .find(q => q.id === newQuestionId);
                    if (addedQuestion) {
                        handleSelectQuestion(addedQuestion);
                    }
                }, 0);
            }
        };
        dispatchAndRecord({ type: SurveyActionType.ADD_QUESTION, payload: { questionType, targetQuestionId: null, targetBlockId: blockId, onQuestionAdded } });
    }, [handleSelectQuestion, dispatchAndRecord, surveyRef]);

    const handleAddQuestionFromAI = useCallback((questionType: QuestionType, text: string, choiceStrings?: string[], afterQid?: string, beforeQid?: string) => {
        dispatchAndRecord({ type: SurveyActionType.ADD_QUESTION_FROM_AI, payload: { questionType, text, choiceStrings, afterQid, beforeQid } });
    }, [dispatchAndRecord]);

    const handleRepositionQuestion = useCallback((args: { qid: string; after_qid?: string; before_qid?: string }) => {
        const onLogicRemoved = (message: string) => {
            showToast(message, 'error', handleUndo);
        };
        dispatchAndRecord({
            type: SurveyActionType.REPOSITION_QUESTION,
            payload: { ...args, onLogicRemoved }
        });
    }, [showToast, handleUndo, dispatchAndRecord]);

    const handleUpdateQuestionFromAI = useCallback((args: any) => {
        const { qid, ...updatesFromAI } = args;
        if (!qid) {
            console.warn('[AI Action] No QID provided for update.');
            return;
        }

        const question = surveyRef.current.blocks.flatMap(b => b.questions).find(q => q.qid === qid);
        if (question) {
            const finalUpdates: Partial<Question> = {};

            // Directly map top-level properties from AI args to Question properties
            if (updatesFromAI.text !== undefined) finalUpdates.text = updatesFromAI.text;
            if (updatesFromAI.type !== undefined) finalUpdates.type = updatesFromAI.type;
            if (updatesFromAI.forceResponse !== undefined) finalUpdates.forceResponse = updatesFromAI.forceResponse;
            if (updatesFromAI.minSelections !== undefined) {
                finalUpdates.choiceValidation = { ...question.choiceValidation, minSelections: updatesFromAI.minSelections };
            }
            if (updatesFromAI.maxSelections !== undefined) {
                finalUpdates.choiceValidation = { ...question.choiceValidation, maxSelections: updatesFromAI.maxSelections };
            }

            if (updatesFromAI.answerFormat !== undefined) {
                finalUpdates.answerFormat = updatesFromAI.answerFormat;
                if (updatesFromAI.answerFormat === 'grid' && question.type !== QTEnum.ChoiceGrid) {
                    finalUpdates.type = QTEnum.ChoiceGrid;
                } else if (updatesFromAI.answerFormat === 'list' && question.type === QTEnum.ChoiceGrid) {
                    finalUpdates.type = QTEnum.Radio;
                }
            }

            // Handle 'multipleSelection' to toggle between Radio and Checkbox
            if (updatesFromAI.multipleSelection !== undefined) {
                if (question.type === QTEnum.Radio || question.type === QTEnum.Checkbox) {
                    finalUpdates.type = updatesFromAI.multipleSelection ? QTEnum.Checkbox : QTEnum.Radio;
                }
            }

            // Handle nested 'answerBehavior' for properties like randomization
            if (updatesFromAI.randomizeChoices !== undefined) {
                finalUpdates.answerBehavior = {
                    ...question.answerBehavior, // Preserve existing behavior settings
                    randomizeChoices: updatesFromAI.randomizeChoices,
                };
            }

            // Handle logic updates. The entire logic object is passed. 'undefined' is used for removal.
            if ('displayLogic' in updatesFromAI) finalUpdates.displayLogic = updatesFromAI.displayLogic;
            if ('skipLogic' in updatesFromAI) finalUpdates.skipLogic = updatesFromAI.skipLogic;
            if ('branchingLogic' in updatesFromAI) finalUpdates.branchingLogic = updatesFromAI.branchingLogic;

            // Handle 'choices' transformation from string array to Choice object array
            if (updatesFromAI.choices) {
                finalUpdates.choices = updatesFromAI.choices.map((choiceText: string): Choice => ({
                    id: generateId('c'),
                    text: choiceText,
                }));
            }

            if (Object.keys(finalUpdates).length > 0) {
                handleUpdateQuestion(question.id, finalUpdates);
            }
        } else {
            console.warn(`[AI Action] Could not find question with QID: ${qid} to update.`);
        }
    }, [handleUpdateQuestion, surveyRef]);


    const handleAddBlock = useCallback((blockId: string, position: 'above' | 'below') => {
        dispatchAndRecord({ type: SurveyActionType.ADD_BLOCK, payload: { blockId, position } });
    }, [dispatchAndRecord]);

    const handleAddSurveyFromLibrary = useCallback((surveyId: string, targetBlockId: string | null) => {
        let sourceSurvey: Survey | undefined;
        if (surveyId === 'customer_feedback') {
            sourceSurvey = customerFeedbackSurvey;
        }

        if (sourceSurvey) {
            dispatchAndRecord({ type: SurveyActionType.ADD_SURVEY_FROM_LIBRARY, payload: { sourceSurvey, targetBlockId } });
            showToast('Survey imported successfully from library', 'success');
        } else {
            console.warn(`Survey with ID ${surveyId} not found in library.`);
            showToast('Failed to import survey: Survey not found', 'error');
        }
    }, [dispatchAndRecord, showToast]);

    const handleCopyBlock = useCallback((blockId: string) => {
        dispatchAndRecord({ type: SurveyActionType.COPY_BLOCK, payload: { blockId } });
    }, [dispatchAndRecord]);

    const handleDeleteQuestion = useCallback((questionId: string) => {
        dispatchAndRecord({ type: SurveyActionType.DELETE_QUESTION, payload: { questionId } });
        if (selectedQuestion?.id === questionId) {
            setSelectedQuestion(null);
        }
        setCheckedQuestions(prev => {
            const newSet = new Set(prev);
            newSet.delete(questionId);
            return newSet;
        });
    }, [selectedQuestion, dispatchAndRecord, setSelectedQuestion, setCheckedQuestions]);

    const handleDeleteQuestionFromAI = useCallback((qid: string) => {
        const questionToDelete = surveyRef.current.blocks.flatMap(b => b.questions).find(q => q.qid === qid);
        if (questionToDelete) {
            handleDeleteQuestion(questionToDelete.id);
        } else {
            console.warn(`[AI Action] Could not find question with QID: ${qid} to delete.`);
        }
    }, [handleDeleteQuestion, surveyRef]);

    const handleDeleteBlock = useCallback((blockId: string) => {
        const blockToDelete = survey.blocks.find(b => b.id === blockId);
        if (!blockToDelete) return;

        if (selectedQuestion && blockToDelete.questions.some(q => q.id === selectedQuestion.id)) {
            setSelectedQuestion(null);
        }

        if (selectedBlock?.id === blockId) {
            setSelectedBlock(null);
        }

        const questionIdsToDelete = new Set(blockToDelete.questions.map(q => q.id));
        setCheckedQuestions(prev => {
            const newSet = new Set(prev);
            questionIdsToDelete.forEach(id => newSet.delete(id));
            return newSet;
        });

        dispatchAndRecord({ type: SurveyActionType.DELETE_BLOCK, payload: { blockId } });
    }, [survey, selectedQuestion, selectedBlock, dispatchAndRecord, setSelectedQuestion, setSelectedBlock, setCheckedQuestions]);

    const handleToggleQuestionCheck = useCallback((questionId: string) => {
        setCheckedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    }, [setCheckedQuestions]);

    const handleSelectAllInBlock = useCallback((blockId: string) => {
        const block = survey.blocks.find(b => b.id === blockId);
        if (!block) return;
        const questionIds = block.questions
            .filter(q => q.type !== QTEnum.PageBreak)
            .map(q => q.id);

        setCheckedQuestions(prev => new Set([...prev, ...questionIds]));
    }, [survey.blocks, setCheckedQuestions]);

    const handleUnselectAllInBlock = useCallback((blockId: string) => {
        const block = survey.blocks.find(b => b.id === blockId);
        if (!block) return;
        const questionIds = new Set(block.questions.map(q => q.id));
        setCheckedQuestions(prev => {
            const newSet = new Set(prev);
            questionIds.forEach(id => newSet.delete(id));
            return newSet;
        });
    }, [survey.blocks, setCheckedQuestions]);

    const handleCopyQuestion = useCallback((questionId: string) => {
        dispatchAndRecord({ type: SurveyActionType.COPY_QUESTION, payload: { questionId } });
    }, [dispatchAndRecord]);

    const handleMoveQuestionToNewBlock = useCallback((questionId: string) => {
        const onLogicRemoved = (message: string) => {
            showToast(message, 'error', handleUndo);
        };

        const onQuestionMoved = (movedQuestionId: string) => {
            setTimeout(() => {
                const currentSurvey = surveyRef.current;
                const movedQuestion = currentSurvey.blocks
                    .flatMap(b => b.questions)
                    .find(q => q.id === movedQuestionId);
                if (movedQuestion) {
                    handleSelectQuestion(movedQuestion);
                }
            }, 0);
        };

        dispatchAndRecord({ type: SurveyActionType.MOVE_QUESTION_TO_NEW_BLOCK, payload: { questionId, onLogicRemoved, onQuestionMoved } });
    }, [handleSelectQuestion, showToast, handleUndo, dispatchAndRecord, surveyRef]);

    const handleMoveQuestionToExistingBlock = useCallback((questionId: string, targetBlockId: string) => {
        const onLogicRemoved = (message: string) => {
            showToast(message, 'error', handleUndo);
        };
        dispatchAndRecord({ type: SurveyActionType.MOVE_QUESTION_TO_EXISTING_BLOCK, payload: { questionId, targetBlockId, onLogicRemoved } });
        handleSelectQuestion(null);
    }, [showToast, handleUndo, dispatchAndRecord, handleSelectQuestion]);

    const handleAddChoice = useCallback((questionId: string) => {
        dispatchAndRecord({ type: SurveyActionType.ADD_CHOICE, payload: { questionId } });
    }, [dispatchAndRecord]);

    const handleDeleteChoice = useCallback((questionId: string, choiceId: string) => {
        dispatchAndRecord({ type: SurveyActionType.DELETE_CHOICE, payload: { questionId, choiceId } });
    }, [dispatchAndRecord]);

    const handleAddPageBreakAfterQuestion = useCallback((questionId: string) => {
        dispatchAndRecord({ type: SurveyActionType.ADD_PAGE_BREAK_AFTER_QUESTION, payload: { questionId } });
    }, [dispatchAndRecord]);

    const handleUpdateBlockTitle = useCallback((blockId: string, title: string) => {
        dispatch({ type: SurveyActionType.UPDATE_BLOCK_TITLE, payload: { blockId, title } });
    }, [dispatch]);

    const handleUpdateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
        dispatch({ type: SurveyActionType.UPDATE_BLOCK, payload: { blockId, updates } });
    }, [dispatch]);

    const handleAddBlockFromAI = useCallback((title: string, insertAfterBid?: string) => {
        dispatchAndRecord({ type: SurveyActionType.ADD_BLOCK_FROM_AI, payload: { title, insertAfterBid } });
    }, [dispatchAndRecord]);

    const handleUpdateBlockFromAI = useCallback((args: any) => {
        const { bid, ...updates } = args;
        const block = surveyRef.current.blocks.find(b => b.bid === bid || b.id === bid);
        if (block) {
            const finalUpdates: Partial<Block> = {};
            if (updates.title) finalUpdates.title = updates.title;
            if (updates.branchingLogic) finalUpdates.branchingLogic = updates.branchingLogic;

            handleUpdateBlock(block.id, finalUpdates);
        }
    }, [handleUpdateBlock, surveyRef]);

    const handleUpdateSurveyTitle = useCallback((title: string) => {
        dispatch({ type: SurveyActionType.UPDATE_SURVEY_TITLE, payload: { title } });
    }, [dispatch]);

    const handlePagingModeChange = useCallback((mode: Survey['pagingMode']) => {
        dispatchAndRecord({ type: SurveyActionType.SET_PAGING_MODE, payload: { pagingMode: mode } });
    }, [dispatchAndRecord]);

    const handleGlobalAutoAdvanceChange = useCallback((enabled: boolean) => {
        if (enabled) {
            if (window.confirm("This will enable auto-advance for all compatible questions and blocks. Individual settings will be overridden. Are you sure?")) {
                dispatch({ type: SurveyActionType.SET_GLOBAL_AUTOADVANCE, payload: { enabled: true } });
            }
        } else {
            dispatch({ type: SurveyActionType.SET_GLOBAL_AUTOADVANCE, payload: { enabled: false } });
        }
    }, [dispatch]);

    // Bulk action handlers
    const handleClearSelection = useCallback(() => {
        setCheckedQuestions(new Set());
    }, [setCheckedQuestions]);

    const handleBulkDelete = useCallback(() => {
        if (window.confirm(`Are you sure you want to delete ${checkedQuestions.size} questions?`)) {
            dispatchAndRecord({ type: SurveyActionType.BULK_DELETE_QUESTIONS, payload: { questionIds: checkedQuestions } });
            handleClearSelection();
        }
    }, [checkedQuestions, handleClearSelection, dispatchAndRecord]);

    const handleBulkDuplicate = useCallback(() => {
        dispatchAndRecord({ type: SurveyActionType.BULK_DUPLICATE_QUESTIONS, payload: { questionIds: checkedQuestions } });
        handleClearSelection();
    }, [checkedQuestions, handleClearSelection, dispatchAndRecord]);

    const handleBulkMoveToNewBlock = useCallback(() => {
        dispatchAndRecord({ type: SurveyActionType.BULK_MOVE_TO_NEW_BLOCK, payload: { questionIds: checkedQuestions } });
        handleClearSelection();
    }, [checkedQuestions, handleClearSelection, dispatchAndRecord]);

    const handleBulkHideQuestion = useCallback(() => {
        dispatchAndRecord({ type: SurveyActionType.BULK_UPDATE_QUESTIONS, payload: { questionIds: checkedQuestions, updates: { isHidden: true } } });
    }, [checkedQuestions, dispatchAndRecord]);

    const handleBulkHideBackButton = useCallback(() => {
        dispatchAndRecord({ type: SurveyActionType.BULK_UPDATE_QUESTIONS, payload: { questionIds: checkedQuestions, updates: { hideBackButton: true } } });
    }, [checkedQuestions, dispatchAndRecord]);

    const handleBulkForceResponse = useCallback(() => {
        dispatchAndRecord({ type: SurveyActionType.BULK_UPDATE_QUESTIONS, payload: { questionIds: checkedQuestions, updates: { forceResponse: true } } });
    }, [checkedQuestions, dispatchAndRecord]);

    return {
        handleUpdateQuestion,
        handleReorderQuestion,
        handleReorderToolbox,
        handleReorderBlock,
        handleMoveBlockUp,
        handleMoveBlockDown,
        handleAddBlockFromToolbox,
        handleAddQuestion,
        handleAddQuestionToBlock,
        handleAddQuestionFromAI,
        handleRepositionQuestion,
        handleUpdateQuestionFromAI,
        handleAddBlockFromAI,
        handleUpdateBlockFromAI,
        handleAddBlock,
        handleCopyBlock,
        handleDeleteQuestion,
        handleDeleteQuestionFromAI,
        handleDeleteBlock,
        handleToggleQuestionCheck,
        handleSelectAllInBlock,
        handleUnselectAllInBlock,
        handleCopyQuestion,
        handleMoveQuestionToNewBlock,
        handleMoveQuestionToExistingBlock,
        handleAddChoice,
        handleDeleteChoice,
        handleAddPageBreakAfterQuestion,
        handleUpdateBlockTitle,
        handleUpdateBlock,
        handleUpdateSurveyTitle,
        handlePagingModeChange,
        handleGlobalAutoAdvanceChange,
        handleClearSelection,
        handleBulkDelete,
        handleBulkDuplicate,
        handleBulkMoveToNewBlock,
        handleBulkHideQuestion,
        handleBulkHideBackButton,

        handleBulkForceResponse,
        handleAddSurveyFromLibrary
    };
};
