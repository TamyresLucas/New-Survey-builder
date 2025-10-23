import React, { useState, useRef, useCallback, useReducer, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SubHeader from './components/SubHeader';
import LeftSidebar from './components/LeftSidebar';
import BuildPanel from './components/BuildPanel';
import SurveyCanvas from './components/SurveyCanvas';
// FIX: Changed import to a named import since RightSidebar is not a default export.
import { RightSidebar } from './components/RightSidebar';
import SurveyStructureWidget from './components/SurveyStructureWidget';
import GeminiPanel from './components/GeminiPanel';
import { BulkEditPanel } from './components/BulkEditPanel';
import type { Survey, Question, ToolboxItemData, QuestionType, Choice, LogicIssue } from './types';
import { initialSurveyData, toolboxItems as initialToolboxItems } from './constants';
import { renumberSurveyVariables, generateId } from './utils';
import { QuestionType as QTEnum } from './types';
// FIX: Import the 'Action' type from 'surveyReducer' to resolve 'Cannot find name' error.
import { surveyReducer, SurveyActionType, type Action } from './state/surveyReducer';
import { PanelRightIcon, WarningIcon, XIcon } from './components/icons';
import { validateSurveyLogic } from './logicValidator';
import DiagramCanvas from './components/DiagramCanvas';
import { SurveyPreview } from './components/SurveyPreview';
import CanvasTabs from './components/CanvasTabs';

const Toast: React.FC<{ message: string; onDismiss: () => void; onUndo?: () => void }> = ({ message, onDismiss, onUndo }) => {
  useEffect(() => {
    // Make toasts with an undo button last longer
    const duration = onUndo ? 10000 : 6000;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, onUndo]);

  return (
      <div 
          className="flex items-center gap-4 px-4 py-3 rounded-lg shadow-2xl bg-error-container text-on-error-container animate-fade-in-up w-auto max-w-md"
          role="alert"
      >
          <WarningIcon className="text-xl flex-shrink-0" />
          <p className="text-sm font-medium flex-grow">{message}</p>
          <div className="flex-shrink-0 flex items-center gap-2 border-l border-on-error-container/20 pl-3 ml-2">
              {onUndo && (
                  <button
                      onClick={onUndo}
                      className="px-3 py-1 text-xs font-bold uppercase rounded-full hover:bg-black/10 text-on-error-container"
                  >
                      Undo
                  </button>
              )}
              <button 
                  onClick={onDismiss} 
                  className="p-1 -mr-1 rounded-full hover:bg-black/10"
                  aria-label="Dismiss"
              >
                  <XIcon className="text-lg" />
              </button>
          </div>
      </div>
  );
};

const App: React.FC = () => {
  const [survey, dispatch] = useReducer(surveyReducer, initialSurveyData, renumberSurveyVariables);
  const [history, setHistory] = useState<Survey[]>([]);
  const [toolboxItems, setToolboxItems] = useState<ToolboxItemData[]>(initialToolboxItems);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [checkedQuestions, setCheckedQuestions] = useState<Set<string>>(new Set());
  const [activeMainTab, setActiveMainTab] = useState<string>('Build');
  const [activeCanvasTab, setActiveCanvasTab] = useState<'Online' | 'Phone'>('Online');
  const [isBuildPanelOpen, setIsBuildPanelOpen] = useState(true);
  const [isGeminiPanelOpen, setIsGeminiPanelOpen] = useState(false);
  const [geminiHelpTopic, setGeminiHelpTopic] = useState<string | null>(null);
  const [activeRightSidebarTab, setActiveRightSidebarTab] = useState('Settings');
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);
  const [logicIssues, setLogicIssues] = useState<LogicIssue[]>([]);
  const [focusedLogicSource, setFocusedLogicSource] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; onUndo?: () => void }[]>([]);

  // FIX: Hoisted showBulkEditPanel declaration before its use on line 41.
  const showBulkEditPanel = checkedQuestions.size >= 2;

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const surveyRef = useRef(survey);
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<string>>(new Set());
  const prevSelectedQuestionIdRef = useRef<string | null>(null);
  
  // Ref to hold the latest history state to avoid stale closures in callbacks.
  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const isDiagramView = activeMainTab === 'Flow';
  const isAnyRightPanelOpen = isGeminiPanelOpen || showBulkEditPanel || !!selectedQuestion;


  useEffect(() => {
    surveyRef.current = survey;
    // Run logic validation whenever the survey changes
    const issues = validateSurveyLogic(survey);
    setLogicIssues(issues);
  }, [survey]);

  // Sync selectedQuestion with survey state to prevent stale data in the sidebar
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
  }, [survey, selectedQuestion]);

  // When the selected question changes, clean up any unconfirmed logic from the *previous* question.
  useEffect(() => {
    const prevId = prevSelectedQuestionIdRef.current;
    // If there was a previously selected question, and it's different from the new one, clean it up.
    if (prevId && prevId !== selectedQuestion?.id) {
        dispatch({ type: SurveyActionType.CLEANUP_UNCONFIRMED_LOGIC, payload: { questionId: prevId } });
    }
    // Update the ref to the current selection for the next change.
    prevSelectedQuestionIdRef.current = selectedQuestion?.id ?? null;
  }, [selectedQuestion]);

  const dismissToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const handleUndo = useCallback(() => {
    // Use the ref to get the most up-to-date history state, avoiding stale closures.
    const currentHistory = historyRef.current;
    if (currentHistory.length > 0) {
        const lastState = currentHistory[currentHistory.length - 1];
        dispatch({ type: SurveyActionType.RESTORE_STATE, payload: lastState });
        setHistory(currentHistory.slice(0, -1));
        setToasts([]); // Clear all toasts on undo
    }
  }, [dispatch]);

  const showToast = useCallback((message: string, onUndo?: () => void) => {
    const newToast = { id: Date.now() + Math.random(), message, onUndo };
    setToasts(prevToasts => [...prevToasts, newToast]);
  }, []);

  const undoableActionTypes = useMemo(() => new Set([
      SurveyActionType.REORDER_QUESTION,
      SurveyActionType.REPOSITION_QUESTION,
      SurveyActionType.MOVE_QUESTION_TO_NEW_BLOCK,
      SurveyActionType.MOVE_QUESTION_TO_EXISTING_BLOCK,
      SurveyActionType.DELETE_QUESTION,
      SurveyActionType.DELETE_BLOCK,
      SurveyActionType.BULK_DELETE_QUESTIONS,
      SurveyActionType.BULK_MOVE_TO_NEW_BLOCK,
      SurveyActionType.DELETE_CHOICE,
  ]), []);

  const dispatchAndRecord = useCallback((action: Action) => {
      if (undoableActionTypes.has(action.type)) {
          // Limit history size to prevent memory issues, e.g., 10 levels
          setHistory(prev => [...prev, survey].slice(-10)); 
      }
      dispatch(action);
  }, [survey, undoableActionTypes]);


  const handleBackToTop = useCallback(() => {
    canvasContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectQuestion = useCallback((question: Question | null, options?: { tab?: string; focusOn?: string }) => {
    if (question === null) {
      setSelectedQuestion(null);
      setIsRightSidebarExpanded(false); // Reset on close
      setFocusedLogicSource(null);
      return;
    }
    if (question.type === QTEnum.PageBreak) {
      setSelectedQuestion(null);
      return;
    }

    // If Gemini panel is open, keep it open but update the context.
    // If user was viewing a help topic, switch back to chat.
    if (isGeminiPanelOpen && geminiHelpTopic) {
      setGeminiHelpTopic(null);
    }
  
    setSelectedQuestion(question);

    // If a tab was explicitly passed, set it as active.
    // Otherwise, the active tab remains unchanged, preserving the "sticky" tab behavior.
    if (options?.tab) {
      setActiveRightSidebarTab(options.tab);
    }
    
    setFocusedLogicSource(options?.focusOn ?? null);
    
  }, [isGeminiPanelOpen, geminiHelpTopic]);

  // Effect to handle clicks outside of the selected question card and right panel to deselect.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (selectedQuestion) {
            const target = event.target as HTMLElement;

            // Clicks that control the build panel should not deselect the question.
            const isClickOnLeftSidebar = target.closest('nav.w-20');
            const isClickOnBuildPanelToggle = target.closest('[aria-label="Collapse build panel"], [aria-label="Open build panel"]');
            
            // Clicks on the Gemini panel toggle should not deselect the question.
            const isClickOnGeminiToggle = target.closest('[aria-label="AI Features"]');

            if (isClickOnLeftSidebar || isClickOnBuildPanelToggle || isClickOnGeminiToggle) {
                return;
            }

            const isClickInRightPanel = rightPanelRef.current?.contains(target);
            const isClickInQuestionCard = target.closest('[data-question-id]');
            const isClickInDiagramNode = target.closest('.react-flow__node');
            const isClickInDiagramEdge = target.closest('.react-flow__edge');
            
            if (!isClickInRightPanel && !isClickInQuestionCard && !isClickInDiagramNode && !isClickInDiagramEdge) {
                handleSelectQuestion(null);
            }
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedQuestion, handleSelectQuestion]); // handleSelectQuestion is memoized

  const handleToggleCollapseAll = useCallback(() => {
    setCollapsedBlocks(prev => {
      const allBlockIds = survey.blocks.map(b => b.id);
      if (prev.size >= allBlockIds.length) {
        return new Set<string>();
      } else {
        return new Set<string>(allBlockIds);
      }
    });
  }, [survey.blocks]);

  const handleToggleBlockCollapse = useCallback((blockId: string) => {
    setCollapsedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  }, []);

  const handleCollapseBlock = useCallback((blockId: string) => {
    setCollapsedBlocks(prev => {
        const newSet = new Set(prev);
        newSet.add(blockId);
        return newSet;
    });
  }, []);

  const handleExpandBlock = useCallback((blockId: string) => {
    setCollapsedBlocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(blockId);
        return newSet;
    });
  }, []);

  const handleToggleGeminiPanel = useCallback(() => {
    setIsGeminiPanelOpen(prev => {
        const willBeOpen = !prev;
        if (willBeOpen) {
            // If we are opening the panel, clear any bulk selection
            if (checkedQuestions.size > 0) {
                setCheckedQuestions(new Set());
            }
        } else { // When closing
            setGeminiHelpTopic(null);
        }
        return willBeOpen;
    });
  }, [checkedQuestions.size]);
  
  const handleRequestGeminiHelp = useCallback((topic: string) => {
    setGeminiHelpTopic(topic);
    setIsGeminiPanelOpen(true);
    // Don't deselect the question, so we can return to it.
  }, []);

  const handleToggleRightSidebarExpand = useCallback(() => {
    setIsRightSidebarExpanded(prev => !prev);
  }, []);
  
  const handleExpandRightSidebar = useCallback(() => {
    setIsRightSidebarExpanded(true);
  }, []);

  const handleUpdateQuestion = useCallback((questionId: string, updates: Partial<Question>) => {
    dispatch({ type: SurveyActionType.UPDATE_QUESTION, payload: { questionId, updates } });
  }, []);
  
  const handleReorderQuestion = useCallback((draggedQuestionId: string, targetQuestionId: string | null, targetBlockId: string) => {
    const onLogicRemoved = (message: string) => {
        showToast(message, handleUndo);
    };
    dispatchAndRecord({ type: SurveyActionType.REORDER_QUESTION, payload: { draggedQuestionId, targetQuestionId, targetBlockId, onLogicRemoved } });
  }, [showToast, handleUndo, dispatchAndRecord]);

  const handleReorderToolbox = useCallback((newItems: ToolboxItemData[]) => {
    setToolboxItems(newItems);
  }, []);

  const handleReorderBlock = useCallback((draggedBlockId: string, targetBlockId: string | null) => {
    dispatchAndRecord({ type: SurveyActionType.REORDER_BLOCK, payload: { draggedBlockId, targetBlockId } });
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
  }, [handleSelectQuestion, dispatchAndRecord]);
  
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
  }, [handleSelectQuestion, dispatchAndRecord]);

  const handleAddQuestionFromAI = useCallback((questionType: QuestionType, text: string, choiceStrings?: string[], afterQid?: string, beforeQid?: string) => {
    dispatchAndRecord({ type: SurveyActionType.ADD_QUESTION_FROM_AI, payload: { questionType, text, choiceStrings, afterQid, beforeQid } });
  }, [dispatchAndRecord]);

  const handleRepositionQuestion = useCallback((args: { qid: string; after_qid?: string; before_qid?: string }) => {
    const onLogicRemoved = (message: string) => {
        showToast(message, handleUndo);
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
  }, [handleUpdateQuestion]);


  const handleAddBlock = useCallback((blockId: string, position: 'above' | 'below') => {
    dispatchAndRecord({ type: SurveyActionType.ADD_BLOCK, payload: { blockId, position } });
  }, [dispatchAndRecord]);

  const handleCopyBlock = useCallback((blockId: string) => {
    dispatchAndRecord({ type: SurveyActionType.COPY_BLOCK, payload: { blockId } });
  }, [dispatchAndRecord]);
  
  const handleExpandAllBlocks = useCallback(() => {
    setCollapsedBlocks(new Set());
  }, []);

  const handleCollapseAllBlocks = useCallback(() => {
    setCollapsedBlocks(new Set(survey.blocks.map(b => b.id)));
  }, [survey.blocks]);

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
  }, [selectedQuestion, dispatchAndRecord]);

  const handleDeleteQuestionFromAI = useCallback((qid: string) => {
    const questionToDelete = surveyRef.current.blocks.flatMap(b => b.questions).find(q => q.qid === qid);
    if (questionToDelete) {
      handleDeleteQuestion(questionToDelete.id);
    } else {
      console.warn(`[AI Action] Could not find question with QID: ${qid} to delete.`);
    }
  }, [handleDeleteQuestion]);

  const handleDeleteBlock = useCallback((blockId: string) => {
    const blockToDelete = survey.blocks.find(b => b.id === blockId);
    if (!blockToDelete) return;
    
    if (selectedQuestion && blockToDelete.questions.some(q => q.id === selectedQuestion.id)) {
        setSelectedQuestion(null);
    }

    const questionIdsToDelete = new Set(blockToDelete.questions.map(q => q.id));
    setCheckedQuestions(prev => {
        const newSet = new Set(prev);
        questionIdsToDelete.forEach(id => newSet.delete(id));
        return newSet;
    });

    dispatchAndRecord({ type: SurveyActionType.DELETE_BLOCK, payload: { blockId } });
  }, [survey, selectedQuestion, dispatchAndRecord]);
  
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
  }, []);

  const handleSelectAllInBlock = useCallback((blockId: string) => {
    const block = survey.blocks.find(b => b.id === blockId);
    if (!block) return;
    const questionIds = block.questions
        .filter(q => q.type !== QTEnum.PageBreak)
        .map(q => q.id);
        
    setCheckedQuestions(prev => new Set([...prev, ...questionIds]));
  }, [survey.blocks]);

  const handleUnselectAllInBlock = useCallback((blockId: string) => {
    const block = survey.blocks.find(b => b.id === blockId);
    if (!block) return;
    const questionIds = new Set(block.questions.map(q => q.id));
    setCheckedQuestions(prev => {
        const newSet = new Set(prev);
        questionIds.forEach(id => newSet.delete(id));
        return newSet;
    });
  }, [survey.blocks]);

  const handleCopyQuestion = useCallback((questionId: string) => {
    dispatchAndRecord({ type: SurveyActionType.COPY_QUESTION, payload: { questionId } });
  }, [dispatchAndRecord]);

  const handleMoveQuestionToNewBlock = useCallback((questionId: string) => {
    const onLogicRemoved = (message: string) => {
        showToast(message, handleUndo);
    };
    dispatchAndRecord({ type: SurveyActionType.MOVE_QUESTION_TO_NEW_BLOCK, payload: { questionId, onLogicRemoved } });
    handleSelectQuestion(null);
  }, [handleSelectQuestion, showToast, handleUndo, dispatchAndRecord]);
  
  const handleMoveQuestionToExistingBlock = useCallback((questionId: string, targetBlockId: string) => {
    const onLogicRemoved = (message: string) => {
        showToast(message, handleUndo);
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
  }, []);
  
  const handleUpdateSurveyTitle = useCallback((title: string) => {
    dispatch({ type: SurveyActionType.UPDATE_SURVEY_TITLE, payload: { title } });
  }, []);

  const handleTabSelect = useCallback((tabId: string) => {
    if (tabId === 'Build' && activeMainTab === 'Build') {
      setIsBuildPanelOpen(prev => !prev);
    } else if (tabId === 'Build') {
      setIsBuildPanelOpen(true);
    }
    setActiveMainTab(tabId);
  }, [activeMainTab]);

  const allBlocksCollapsed = survey.blocks.length > 0 && collapsedBlocks.size === survey.blocks.length;

  // Bulk action handlers
  const handleClearSelection = useCallback(() => {
    setCheckedQuestions(new Set());
  }, []);

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

  const handleBulkUnforceResponse = useCallback(() => {
    dispatchAndRecord({ type: SurveyActionType.BULK_UPDATE_QUESTIONS, payload: { questionIds: checkedQuestions, updates: { forceResponse: false } } });
  }, [checkedQuestions, dispatchAndRecord]);
  
  const handleAddToLibrary = useCallback(() => {
    alert('Add to Library functionality not implemented.');
  }, []);

  const handleTogglePreviewMode = useCallback(() => {
    setIsPreviewMode(prev => !prev);
  }, []);

  // Deselect single question when bulk selecting
  useEffect(() => {
    if (checkedQuestions.size >= 2 && selectedQuestion) {
      handleSelectQuestion(null);
    }
  }, [checkedQuestions.size, selectedQuestion, handleSelectQuestion]);

  // Memoize selected question objects for performance
  const selectedQuestionObjects = useMemo(() => {
    if (checkedQuestions.size === 0) return [];
    const allQuestions = survey.blocks.flatMap(b => b.questions);
    return allQuestions.filter(q => checkedQuestions.has(q.id));
  }, [checkedQuestions, survey.blocks]);

  // Show "Make Optional" if at least one selected question is required
  const showUnforceResponse = useMemo(() => {
    return selectedQuestionObjects.some(q => q.forceResponse === true);
  }, [selectedQuestionObjects]);

  // Show "Force Response" if at least one selected question is optional
  const showForceResponse = useMemo(() => {
    return selectedQuestionObjects.some(q => !q.forceResponse);
  }, [selectedQuestionObjects]);

  const mainContent = useMemo(() => {
    switch (activeMainTab) {
      case 'Build':
        return (
          <>
            {isBuildPanelOpen && (
              <BuildPanel
                survey={survey}
                onClose={() => setIsBuildPanelOpen(false)}
                onSelectQuestion={handleSelectQuestion}
                selectedQuestion={selectedQuestion}
                checkedQuestions={checkedQuestions}
                collapsedBlocks={collapsedBlocks}
                toolboxItems={toolboxItems}
                onReorderToolbox={handleReorderToolbox}
                onReorderQuestion={handleReorderQuestion}
                onReorderBlock={handleReorderBlock}
                onAddBlock={handleAddBlock}
                onCopyBlock={handleCopyBlock}
                onAddQuestionToBlock={handleAddQuestionToBlock}
                onExpandAllBlocks={handleExpandAllBlocks}
                onCollapseAllBlocks={handleCollapseAllBlocks}
                onDeleteBlock={handleDeleteBlock}
                onDeleteQuestion={handleDeleteQuestion}
                onCopyQuestion={handleCopyQuestion}
                onMoveQuestionToNewBlock={handleMoveQuestionToNewBlock}
                onMoveQuestionToExistingBlock={handleMoveQuestionToExistingBlock}
                onAddPageBreakAfterQuestion={handleAddPageBreakAfterQuestion}
                onExpandBlock={handleExpandBlock}
                onCollapseBlock={handleCollapseBlock}
                onSelectAllInBlock={handleSelectAllInBlock}
                onUnselectAllInBlock={handleUnselectAllInBlock}
              />
            )}
            
            <div className="relative flex-1 flex flex-col min-w-0">
              <div ref={canvasContainerRef} className={`relative flex-1 overflow-y-auto pt-16 px-4 pb-4 transition-all duration-300 ${selectedQuestion || isGeminiPanelOpen || showBulkEditPanel ? 'pr-0' : ''}`}>
                <SurveyCanvas 
                  survey={survey} 
                  selectedQuestion={selectedQuestion} 
                  checkedQuestions={checkedQuestions}
                  logicIssues={logicIssues}
                  onSelectQuestion={handleSelectQuestion}
                  onUpdateQuestion={handleUpdateQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onCopyQuestion={handleCopyQuestion}
                  onMoveQuestionToNewBlock={handleMoveQuestionToNewBlock}
                  onMoveQuestionToExistingBlock={handleMoveQuestionToExistingBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onReorderQuestion={handleReorderQuestion}
                  onReorderBlock={handleReorderBlock}
                  onAddBlockFromToolbox={handleAddBlockFromToolbox}
                  onAddQuestion={handleAddQuestion}
                  onAddBlock={handleAddBlock}
                  onAddQuestionToBlock={handleAddQuestionToBlock}
                  onToggleQuestionCheck={handleToggleQuestionCheck}
                  onSelectAllInBlock={handleSelectAllInBlock}
                  onUnselectAllInBlock={handleUnselectAllInBlock}
                  toolboxItems={toolboxItems}
                  collapsedBlocks={collapsedBlocks}
                  onToggleBlockCollapse={handleToggleBlockCollapse}
                  // FIX: `onCopyBlock` was not defined. It should be `handleCopyBlock`.
                  onCopyBlock={handleCopyBlock}
                  onExpandAllBlocks={handleExpandAllBlocks}
                  onCollapseAllBlocks={handleCollapseAllBlocks}
                  onExpandBlock={handleExpandBlock}
                  onCollapseBlock={handleCollapseBlock}
                  onAddChoice={handleAddChoice}
                  onAddPageBreakAfterQuestion={handleAddPageBreakAfterQuestion}
                  onUpdateBlockTitle={handleUpdateBlockTitle}
                  onUpdateSurveyTitle={handleUpdateSurveyTitle}
                  onAddFromLibrary={handleAddToLibrary}
                />
              </div>
              {!isBuildPanelOpen && (
                <button
                  onClick={() => setIsBuildPanelOpen(true)}
                  className="absolute top-4 left-0 z-10 p-2 rounded-r-md text-on-surface-variant hover:bg-surface-container-high"
                  aria-label="Open build panel"
                >
                  <PanelRightIcon className="text-xl" />
                </button>
              )}
              <CanvasTabs 
                  variant="floating"
                  activeTab={activeCanvasTab}
                  onTabChange={setActiveCanvasTab}
              />
            </div>
          </>
        );
      case 'Flow':
        return (
          <>
            <DiagramCanvas survey={survey} selectedQuestion={selectedQuestion} onSelectQuestion={handleSelectQuestion} onUpdateQuestion={handleUpdateQuestion} activeMainTab={activeMainTab} />
            <CanvasTabs 
              variant="floating"
              activeTab={activeCanvasTab}
              onTabChange={setActiveCanvasTab}
            />
          </>
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-2xl text-on-surface-variant">{activeMainTab} page is not implemented yet.</p>
          </div>
        );
    }
  }, [
    activeMainTab, isBuildPanelOpen, survey, selectedQuestion, checkedQuestions, collapsedBlocks, toolboxItems, logicIssues,
    handleSelectQuestion, handleReorderToolbox, handleReorderQuestion, handleReorderBlock, handleAddBlock,
    handleCopyBlock, handleAddQuestionToBlock, handleExpandAllBlocks, handleCollapseAllBlocks, handleDeleteBlock,
    handleDeleteQuestion, handleCopyQuestion, handleAddPageBreakAfterQuestion, handleExpandBlock, handleCollapseBlock,
    handleSelectAllInBlock, handleUnselectAllInBlock, handleUpdateQuestion, handleAddBlockFromToolbox, handleAddQuestion,
    handleToggleQuestionCheck, handleToggleBlockCollapse, handleAddChoice, handleUpdateBlockTitle, handleUpdateSurveyTitle,
    handleAddToLibrary, isGeminiPanelOpen, showBulkEditPanel, activeCanvasTab, handleMoveQuestionToNewBlock, handleMoveQuestionToExistingBlock
  ]);
  
  return (
    <div className="flex flex-col h-screen bg-surface text-on-surface">
      <Header 
        surveyName={survey.title} 
        isGeminiPanelOpen={isGeminiPanelOpen} 
        onToggleGeminiPanel={handleToggleGeminiPanel} 
        onUpdateSurveyName={handleUpdateSurveyTitle}
      />
      <SubHeader onTogglePreview={handleTogglePreviewMode} />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar activeTab={activeMainTab} onTabSelect={handleTabSelect} />
        <main className={`flex flex-1 bg-surface overflow-hidden ${isDiagramView ? 'relative' : ''}`}>
          {mainContent}
          <div
            ref={rightPanelRef}
            className={
              isDiagramView
                ? `absolute top-0 right-0 h-full shadow-lg transform transition-transform duration-300 ease-in-out
                  ${isAnyRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}
                  ${isRightSidebarExpanded && selectedQuestion ? 'w-1/2' : 'w-96'}`
                : `flex-shrink-0 transition-all duration-300 ease-in-out ${isRightSidebarExpanded && selectedQuestion ? 'w-[50%]' : 'w-96'}`
            }
          >
            {isGeminiPanelOpen ? (
                <GeminiPanel 
                  onClose={handleToggleGeminiPanel} 
                  onAddQuestion={handleAddQuestionFromAI}
                  onUpdateQuestion={handleUpdateQuestionFromAI}
                  onRepositionQuestion={handleRepositionQuestion}
                  onDeleteQuestion={handleDeleteQuestionFromAI}
                  helpTopic={geminiHelpTopic}
                  selectedQuestion={selectedQuestion}
                  survey={survey}
                  logicIssues={logicIssues}
                />
            ) : showBulkEditPanel ? (
              <BulkEditPanel
                checkedQuestionCount={checkedQuestions.size}
                onClose={handleClearSelection}
                onDuplicate={handleBulkDuplicate}
                onAddToLibrary={handleAddToLibrary}
                onMoveQuestions={() => alert('Move Questions functionality not implemented.')}
                onMoveToNewBlock={handleBulkMoveToNewBlock}
                onHideQuestion={handleBulkHideQuestion}
                onHideBackButton={handleBulkHideBackButton}
                onForceResponse={handleBulkForceResponse}
                showForceResponse={showForceResponse}
                onUnforceResponse={handleBulkUnforceResponse}
                showUnforceResponse={showUnforceResponse}
                onDelete={handleBulkDelete}
              />
            ) : selectedQuestion ? (
                <RightSidebar 
                  question={selectedQuestion} 
                  survey={survey}
                  logicIssues={logicIssues.filter(issue => issue.questionId === selectedQuestion.id)}
                  focusedLogicSource={focusedLogicSource}
                  onClose={() => handleSelectQuestion(null)} 
                  activeTab={activeRightSidebarTab}
                  onTabChange={setActiveRightSidebarTab}
                  onUpdateQuestion={handleUpdateQuestion}
                  onAddChoice={handleAddChoice}
                  onDeleteChoice={handleDeleteChoice}
                  isExpanded={isRightSidebarExpanded}
                  onToggleExpand={handleToggleRightSidebarExpand}
                  onExpandSidebar={handleExpandRightSidebar}
                  toolboxItems={toolboxItems}
                  onRequestGeminiHelp={handleRequestGeminiHelp}
                />
            ) : (activeMainTab === 'Build' && (
                <div className="pt-4 pr-4 pb-8 pl-4">
                    <SurveyStructureWidget 
                        survey={survey} 
                        onBackToTop={handleBackToTop}
                        onToggleCollapseAll={handleToggleCollapseAll}
                        allBlocksCollapsed={allBlocksCollapsed}
                    />
                </div>
            ))}
          </div>
        </main>
      </div>
      {isPreviewMode && (
        <SurveyPreview survey={survey} onClose={handleTogglePreviewMode} />
      )}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col-reverse items-end gap-2">
        {toasts.map((toast) => (
            <Toast key={toast.id} message={toast.message} onDismiss={() => dismissToast(toast.id)} onUndo={toast.onUndo} />
        ))}
      </div>
    </div>
  );
};

export default App;