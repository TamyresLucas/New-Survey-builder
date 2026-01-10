import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Survey, Block, Question, QuestionType, ToolboxItemData, LogicIssue, SurveyStatus } from './types';
import Header from './components/Header';
import SubHeader from './components/SubHeader';
import LeftSidebar from './components/LeftSidebar';
import BuildPanel from './components/BuildPanel';
import BlueprintSidebar from './components/BlueprintSidebar';
import { PrintSidebar } from './components/PrintSidebar';
import { BlueprintCanvas } from './components/BlueprintCanvas';
import SurveyCanvas from './components/SurveyCanvas';
import DiagramCanvas, { DiagramCanvasHandle } from './components/DiagramCanvas';
import { RightSidebar } from './components/RightSidebar';
import { BlockSidebar } from './components/BlockSidebar';
import { BulkEditPanel } from './components/BulkEditPanel';
import GeminiPanel from './components/GeminiPanel';
import { SurveyPreview } from './components/SurveyPreview';
import { SurveyExport } from './components/SurveyExport';
import PathAnalysisPanel from './components/diagram/PathAnalysisPanel';

import { ImportSurveyModal } from './components/ImportSurveyModal';
import { MoveQuestionsModal } from './components/MoveQuestionsModal';
import { useSurveyState } from './hooks/useSurveyState';
import { useSelection } from './hooks/useSelection';
import { useSurveyActions } from './hooks/useSurveyActions';
import { analyzeSurveyPaths, generateSurveyCsv } from './utils';
import { PrintDisplayOptions } from './components/PrintDisplayOptions';
import SurveyStructureWidget from './components/SurveyStructureWidget';
import { SurveyActionType } from './state/surveyReducer';
import { toolboxItems as initialToolboxItems } from './constants';
import { validateSurveyLogic } from './logicValidator';




// Icons
import { WarningIcon, CheckmarkIcon, XIcon, PanelRightIcon, CheckCircleIcon, PanelLeftIcon } from './components/icons';
import { Button } from './components/Button';

type ToastType = 'error' | 'success';

const Toast: React.FC<{ message: string; type: ToastType; onDismiss: () => void; onUndo?: () => void }> = ({ message, type, onDismiss, onUndo }) => {
    useEffect(() => {
        const duration = onUndo ? 10000 : 6000;
        const timer = setTimeout(onDismiss, duration);
        return () => clearTimeout(timer);
    }, [onDismiss, onUndo]);

    const isError = type === 'error';

    // Styles based on the provided design reference
    const containerClasses = isError
        ? 'bg-[#FEEFF1] border border-[#EF576B] text-[#232323] w-[460px]'
        : 'bg-[#E6F6F2] border border-[#00A078] text-[#232323] w-[460px] h-[60px]';

    const icon = isError
        ? <WarningIcon className="text-base text-[#CF455C] flex-shrink-0" />
        : <CheckCircleIcon className="text-base text-[#008563] flex-shrink-0" />;

    return (
        <div className={`flex items-center gap-2 p-4 rounded-[4px] shadow-lg animate-slide-up box-border ${containerClasses}`}>
            {icon}
            <span className="flex-1 text-sm font-normal font-['Open_Sans'] leading-[19px] flex items-center">{message}</span>
            {onUndo && (
                <button onClick={onUndo} className="px-3 py-1 text-sm font-bold rounded-full hover:bg-black/5 ml-2 transition-colors">
                    Undo
                </button>
            )}
            <button
                onClick={onDismiss}
                className="flex items-center justify-center w-7 h-7 hover:bg-black/5 rounded"
                aria-label="Dismiss"
            >
                <XIcon className="text-base text-[#232323]" />
            </button>
        </div>
    );
};

const App: React.FC = () => {


    // --- State Hooks ---
    const {
        survey,
        dispatch,
        dispatchAndRecord,
        history,
        handleUndo,
        surveyStatus,
        setSurveyStatus,
        publishedSurvey,
        setPublishedSurvey,
        isDirty
    } = useSurveyState();

    const [activeMainTab, setActiveMainTab] = useState('Build');
    const [isBuildPanelOpen, setIsBuildPanelOpen] = useState(true);
    const [isBlueprintPanelOpen, setIsBlueprintPanelOpen] = useState(true);
    const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);
    const [activeRightSidebarTab, setActiveRightSidebarTab] = useState('Settings');
    const [isGeminiPanelOpen, setIsGeminiPanelOpen] = useState(false);
    const [geminiHelpTopic, setGeminiHelpTopic] = useState<string | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isExportMode, setIsExportMode] = useState(false);

    // Print View Options State
    const [printDisplayOptions, setPrintDisplayOptions] = useState<Set<string>>(new Set([
        'Questionnaire Settings',
        'Block Settings',
        'Question Text',
        'Choices',
        'Columns and Rows',
        'Skip Logic',
        'Advanced Logic',
        'Variables',
        'References',
        'Options',
        'Advanced Settings',
        'Page Breaks'
    ]));

    const togglePrintOption = useCallback((option: string) => {
        setPrintDisplayOptions(prev => {
            const next = new Set(prev);
            if (next.has(option)) {
                next.delete(option);
            } else {
                next.add(option);
            }
            return next;
        });
    }, []);
    const [isPrintMode, setIsPrintMode] = useState(false); // Kept for logic compatibility but effectively unused or aliased

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isAppChangelogModalOpen, setIsAppChangelogModalOpen] = useState(false);
    const [isMoveQuestionsModalOpen, setIsMoveQuestionsModalOpen] = useState(false);
    const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType; onUndo?: () => void }[]>([]);
    const [selectedPathId, setSelectedPathId] = useState('all-paths');

    // Derived state for view mode
    const isDiagramView = activeMainTab === 'Flow';

    // Refs
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const flowExportRef = useRef<DiagramCanvasHandle>(null);

    // --- Selection Hook ---
    const {
        selectedQuestion,
        selectedBlock,
        handleSelectQuestion: originalHandleSelectQuestion,
        handleSelectBlock: originalHandleSelectBlock,
        focusTarget,
        setFocusTarget,
        setSelectedQuestion,
        setSelectedBlock,
        focusedLogicSource
    } = useSelection(survey, dispatch);

    const handleFocusHandled = useCallback(() => setFocusTarget(null), [setFocusTarget]);

    // Wrapper for handleSelectQuestion to also update the active tab and collapse sidebar
    const handleSelectQuestion = useCallback((question: Question | null, options?: { tab?: string; focusOn?: string }) => {
        // Determine if we are switching from one question to another
        const isSwitching = !!selectedQuestion && !!question && selectedQuestion.id !== question.id;

        originalHandleSelectQuestion(question, options);
        if (question) {
            setIsRightSidebarExpanded(false); // Ensure sidebar is collapsed when selecting a question
        }
        if (options?.tab) {
            setActiveRightSidebarTab(options.tab);
        } else if (!isSwitching && question) {
            // If not switching (i.e. fresh selection) and no specific tab requested, default to Settings
            setActiveRightSidebarTab('Settings');
        }
    }, [originalHandleSelectQuestion, selectedQuestion]);

    // Wrapper for handleSelectBlock to collapse sidebar
    const handleSelectBlock = useCallback((block: Block | null, options?: { tab: string, focusOn: string }) => {
        originalHandleSelectBlock(block, options);
        if (block) {
            setIsRightSidebarExpanded(false); // Ensure sidebar is collapsed when selecting a block
        }
    }, [originalHandleSelectBlock]);

    // Escape to deselect (must be after handleSelectQuestion and handleSelectBlock are defined)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                    return;
                }
                handleSelectQuestion(null);
                handleSelectBlock(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSelectQuestion, handleSelectBlock]);

    // --- Toast Logic ---
    const showToast = useCallback((message: string, type: ToastType = 'error', onUndo?: () => void) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type, onUndo }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    useEffect(() => {
        if (survey.lastLogicValidationMessage) {
            showToast(survey.lastLogicValidationMessage, 'error', handleUndo);
            dispatch({ type: SurveyActionType.CLEAR_LOGIC_VALIDATION_MESSAGE });
        }
    }, [survey.lastLogicValidationMessage, showToast, dispatch, handleUndo]);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // --- Actions Hook ---
    // We need a ref to the current survey for the actions hook to access latest state in async callbacks
    const surveyRef = useRef(survey);
    useEffect(() => {
        surveyRef.current = survey;
    }, [survey]);

    const [toolboxItems, setToolboxItems] = useState<ToolboxItemData[]>(initialToolboxItems);
    const [checkedQuestions, setCheckedQuestions] = useState<Set<string>>(new Set());
    const [collapsedBlocks, setCollapsedBlocks] = useState<Set<string>>(new Set());

    const actions = useSurveyActions({
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
    });

    // --- Logic Validation ---
    const logicIssues = useMemo(() => validateSurveyLogic(survey), [survey]);
    const paths = useMemo(() => analyzeSurveyPaths(survey), [survey]);

    // --- Event Handlers ---

    const handleToggleGeminiPanel = useCallback(() => {
        setIsGeminiPanelOpen(prev => !prev);
        if (!isGeminiPanelOpen) {
            setGeminiHelpTopic(null); // Reset topic when opening
        }
    }, [isGeminiPanelOpen]);

    const handleRequestGeminiHelp = useCallback((topic: string) => {
        setGeminiHelpTopic(topic);
        setIsGeminiPanelOpen(true);
    }, []);

    const handleToggleRightSidebarExpand = useCallback(() => {
        setIsRightSidebarExpanded(prev => !prev);
    }, []);

    const handleExpandRightSidebar = useCallback(() => {
        setIsRightSidebarExpanded(true);
        // Automatically collapse left sidebars when expanding right sidebar
        setIsBuildPanelOpen(false);
        setIsBlueprintPanelOpen(false);
    }, []);

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

    const handleConfirmMove = (targetBlockId: string | 'new') => {
        if (targetBlockId === 'new') {
            actions.handleBulkMoveToNewBlock();
        } else {
            actions.handleBulkMoveToExistingBlock(targetBlockId);
        }
        setIsMoveQuestionsModalOpen(false);
    };

    const handleMoveTo = useCallback((questionId: string) => {
        setCheckedQuestions(new Set([questionId]));
        setIsMoveQuestionsModalOpen(true);
    }, []);

    const handleExpandBlock = useCallback((blockId: string) => {
        setCollapsedBlocks(prev => {
            const newSet = new Set(prev);
            newSet.delete(blockId);
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



    // --- Side Effects ---

    // Close Build Panel when switching to Diagram view
    useEffect(() => {
        if (activeMainTab === 'Flow') {
            setIsBuildPanelOpen(false);
            setIsBlueprintPanelOpen(false);
        } else if (activeMainTab === 'Build') {
            setIsBuildPanelOpen(true);
            setIsBlueprintPanelOpen(false);
        } else if (activeMainTab === 'Blueprint') {
            setIsBuildPanelOpen(false);
            setIsBlueprintPanelOpen(true);
        }
    }, [activeMainTab]);

    // --- Derived UI State ---
    const showBulkEditPanel = checkedQuestions.size > 0;
    const isAnyRightPanelOpen = isGeminiPanelOpen || showBulkEditPanel || selectedBlock || selectedQuestion;

    // Prepare display survey (with filters if needed, e.g. search)
    const displaySurvey = survey;

    const handleTabSelect = useCallback((tabId: string) => {
        if (tabId === 'Build' && activeMainTab === 'Build') {
            setIsBuildPanelOpen(prev => !prev);
        } else if (tabId === 'Build') {
            setIsBuildPanelOpen(true);
        } else if (tabId === 'Blueprint' && activeMainTab === 'Blueprint') {
            setIsBlueprintPanelOpen(prev => !prev);
        } else if (tabId === 'Blueprint') {
            setIsBlueprintPanelOpen(true);
        }

        // Close right sidebar when navigating to pages other than Build or Flow
        if (tabId !== 'Build' && tabId !== 'Flow') {
            handleSelectQuestion(null);
            handleSelectBlock(null);
            setIsRightSidebarExpanded(false);
        }

        setActiveMainTab(tabId);
    }, [activeMainTab, handleSelectQuestion, handleSelectBlock]);

    const allBlocksCollapsed = survey.blocks.length > 0 && collapsedBlocks.size === survey.blocks.length;
    const handleExpandAllBlocks = useCallback(() => setCollapsedBlocks(new Set()), []);
    const handleCollapseAllBlocks = useCallback(() => setCollapsedBlocks(new Set(survey.blocks.map(b => b.id))), [survey.blocks]);

    // --- Print Selection State ---
    const [printSelectedQuestions, setPrintSelectedQuestions] = useState<Set<string>>(new Set());
    const [printSelectedBlocks, setPrintSelectedBlocks] = useState<Set<string>>(new Set());

    // Initialize all questions and blocks as selected by default for print when survey structure changes
    // We use a string fingerprint of IDs to avoid resetting on every survey object reference change
    const structureFingerprint = survey.blocks.map(b => `${b.id}:${b.questions.map(q => q.id).join(',')}`).join('|');

    useEffect(() => {
        const allQIds = new Set<string>();
        const allBIds = new Set<string>();
        survey.blocks.forEach(b => {
            allBIds.add(b.id);
            b.questions.forEach(q => allQIds.add(q.id));
        });
        setPrintSelectedQuestions(allQIds);
        setPrintSelectedBlocks(allBIds);
    }, [structureFingerprint]);

    // Hover state for synchronized hover between print canvas and survey outline
    const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(null);
    const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

    const handleTogglePrintCheck = useCallback((id: string) => {
        setPrintSelectedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const handleTogglePrintBlockCheck = useCallback((id: string) => {
        const block = survey.blocks.find(b => b.id === id);
        if (!block) return;

        setPrintSelectedBlocks(prev => {
            const newSet = new Set(prev);
            const isCurrentlySelected = newSet.has(id);

            // Update questions based on block toggle
            setPrintSelectedQuestions(prevQ => {
                const newQSet = new Set(prevQ);
                if (isCurrentlySelected) {
                    // Deselecting block -> deselected all questions
                    block.questions.forEach(q => newQSet.delete(q.id));
                } else {
                    // Selecting block -> select all questions
                    block.questions.forEach(q => newQSet.add(q.id));
                }
                return newQSet;
            });

            if (isCurrentlySelected) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, [survey]);

    // Derived state for Select All toggle
    const totalQuestions = useMemo(() => {
        const uniqueIds = new Set<string>();
        survey.blocks.forEach(block => {
            block.questions.forEach(q => uniqueIds.add(q.id));
        });
        return uniqueIds.size;
    }, [survey]);

    // Check if all *questions* are selected
    // Robust check: Ensure every currently existing question ID is in the selected set.
    // Simply comparing sizes can fail if the selected set contains stale IDs (from deleted questions) that weren't cleaned up.
    const areAllPrintSelected = useMemo(() => {
        if (totalQuestions === 0) return false;
        // Verify every current question is selected
        return survey.blocks.every(b => b.questions.every(q => printSelectedQuestions.has(q.id)));
    }, [survey, printSelectedQuestions, totalQuestions]);

    const handleToggleSelectAllPrint = useCallback((isChecked: boolean) => {
        if (isChecked) {
            // Select All
            const allQIds = new Set<string>();
            const allBIds = new Set<string>();
            survey.blocks.forEach(b => {
                allBIds.add(b.id);
                b.questions.forEach(q => allQIds.add(q.id));
            });
            setPrintSelectedQuestions(allQIds);
            setPrintSelectedBlocks(allBIds);
        } else {
            // Deselect All
            setPrintSelectedQuestions(new Set());
            setPrintSelectedBlocks(new Set());
        }
    }, [survey]);

    if (isPreviewMode) {
        return (
            <SurveyPreview
                survey={survey}
                onClose={() => setIsPreviewMode(false)}
            />
        );
    }

    if (isExportMode) {
        return (
            <SurveyExport
                survey={survey}
                onClose={() => setIsExportMode(false)}
            />
        );
    }

    return (
        <div className="flex flex-col h-screen bg-surface text-on-surface overflow-hidden font-sans print:h-auto print:overflow-visible">

            <Header
                surveyName={survey.title}
                isGeminiPanelOpen={isGeminiPanelOpen}
                onToggleGeminiPanel={handleToggleGeminiPanel}
                onUpdateSurveyName={actions.handleUpdateSurveyTitle}
                surveyStatus={surveyStatus}
                isDirty={isDirty}
                onToggleActivateSurvey={() => setSurveyStatus(prev => prev === 'active' ? 'stopped' : 'active')}
                onUpdateLiveSurvey={() => {
                    const isDraft = surveyStatus === 'draft';
                    const isPending = surveyStatus === 'pending';

                    const newTimestamp = new Date().toISOString();

                    // Update timestamp in survey state with explicit timestamp
                    dispatch({
                        type: SurveyActionType.UPDATE_TIMESTAMP,
                        payload: newTimestamp
                    });

                    // Create snapshot with matching new timestamp
                    const updatedSurvey = JSON.parse(JSON.stringify(survey));
                    updatedSurvey.lastSaved = newTimestamp;
                    setPublishedSurvey(updatedSurvey);

                    if (isDraft || isPending) {
                        setSurveyStatus('active');
                    }
                    showToast(isDraft ? "Survey published successfully!" : "Changes were published!", 'success');
                }}
                lastSaved={survey.lastSaved}
                onCopyLink={() => showToast("Link copied successfully", 'success')}
            />

            <SubHeader
                onTogglePreview={() => setIsPreviewMode(true)}
                onCopySurvey={() => {
                    const json = JSON.stringify(survey, null, 2);
                    navigator.clipboard.writeText(json);
                    showToast("Survey JSON copied to clipboard", 'success');
                }}
                onCopySurveyFlow={async () => {
                    if (activeMainTab !== 'Flow') {
                        showToast("Please switch to the Flow tab to copy the diagram.", 'error');
                        return;
                    }
                    if (flowExportRef.current) {
                        try {
                            await flowExportRef.current.exportAsPng();
                            showToast("Survey flow copied to clipboard", "success");
                        } catch (error) {
                            showToast("Failed to copy survey flow", "error");
                        }
                    }
                }}
                onExportCsv={() => {
                    const csvContent = generateSurveyCsv(survey);
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    if (link.download !== undefined) {
                        const url = URL.createObjectURL(blob);
                        link.setAttribute('href', url);
                        link.setAttribute('download', `${survey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.csv`);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        showToast("Survey exported to CSV successfully!", 'success');
                    }
                }}
                onPrintBlueprint={() => {
                    setActiveMainTab('Blueprint');
                }}
                onPrintSurvey={() => {
                    window.print();
                }}
                onImportSurvey={() => setIsImportModalOpen(true)}
                lastSaved={survey.lastSaved}
            />


            <div className="flex flex-1 overflow-hidden relative print:overflow-visible">
                <LeftSidebar
                    activeTab={activeMainTab}
                    onTabSelect={handleTabSelect}
                    onToggleCollapseAll={() => {
                        if (allBlocksCollapsed) {
                            handleExpandAllBlocks();
                        } else {
                            handleCollapseAllBlocks();
                        }
                    }}
                    allBlocksCollapsed={allBlocksCollapsed}
                />

                {activeMainTab === 'Blueprint' && isBlueprintPanelOpen && (
                    <BlueprintSidebar
                        onClose={() => setIsBlueprintPanelOpen(false)}
                        survey={survey}
                        selectedBlock={selectedBlock}
                        selectedQuestion={selectedQuestion}
                        onSelectBlock={handleSelectBlock}
                        onSelectQuestion={handleSelectQuestion}
                        hoveredQuestionId={hoveredQuestionId}
                        onQuestionHover={setHoveredQuestionId}
                        printDisplayOptions={printDisplayOptions}
                        onTogglePrintOption={togglePrintOption}
                    />
                )}

                {activeMainTab === 'Build' && isBuildPanelOpen && (
                    <BuildPanel
                        onClose={() => setIsBuildPanelOpen(false)}
                        survey={survey}
                        onSelectQuestion={handleSelectQuestion}
                        selectedQuestion={selectedQuestion}
                        selectedBlock={selectedBlock}
                        onSelectBlock={handleSelectBlock}
                        checkedQuestions={checkedQuestions}
                        collapsedBlocks={collapsedBlocks}
                        toolboxItems={toolboxItems}
                        logicIssues={logicIssues}
                        onReorderToolbox={actions.handleReorderToolbox}
                        onReorderQuestion={actions.handleReorderQuestion}
                        onReorderBlock={actions.handleReorderBlock}
                        onMoveBlockUp={actions.handleMoveBlockUp}
                        onMoveBlockDown={actions.handleMoveBlockDown}
                        onAddBlock={actions.handleAddBlock}
                        onCopyBlock={actions.handleCopyBlock}
                        onAddQuestionToBlock={actions.handleAddQuestionToBlock}
                        onExpandAllBlocks={handleExpandAllBlocks}
                        onCollapseAllBlocks={handleCollapseAllBlocks}
                        onDeleteBlock={actions.handleDeleteBlock}
                        onDeleteQuestion={actions.handleDeleteQuestion}
                        onCopyQuestion={actions.handleCopyQuestion}
                        onMoveQuestionToNewBlock={actions.handleMoveQuestionToNewBlock}
                        onMoveQuestionToExistingBlock={actions.handleMoveQuestionToExistingBlock}
                        onMoveTo={handleMoveTo}
                        onAddPageBreakAfterQuestion={actions.handleAddPageBreakAfterQuestion}
                        onExpandBlock={handleExpandBlock}
                        onCollapseBlock={handleCollapseBlock}
                        onSelectAllInBlock={actions.handleSelectAllInBlock}
                        onUnselectAllInBlock={actions.handleUnselectAllInBlock}
                        onUpdateQuestion={actions.handleUpdateQuestion}
                        onQuestionHover={setHoveredQuestionId}
                        hoveredQuestionId={hoveredQuestionId}
                        onBlockHover={setHoveredBlockId}
                        hoveredBlockId={hoveredBlockId}
                    />
                )}

                <main className="flex-1 flex flex-col relative overflow-hidden transition-all duration-300 min-w-0 print:overflow-visible">
                    {activeMainTab === 'Build' && !isBuildPanelOpen && (
                        <div className="absolute top-4 left-4 z-10">
                            <Button
                                variant="tertiary"
                                iconOnly
                                onClick={() => setIsBuildPanelOpen(true)}
                                aria-label="Expand sidebar"
                            >
                                <PanelRightIcon className="text-xl" />
                            </Button>
                        </div>
                    )}
                    {activeMainTab === 'Blueprint' && !isBlueprintPanelOpen && (
                        <div className="absolute top-4 left-4 z-10">
                            <Button
                                variant="tertiary"
                                iconOnly
                                onClick={() => setIsBlueprintPanelOpen(true)}
                                aria-label="Expand sidebar"
                            >
                                <PanelRightIcon className="text-xl" />
                            </Button>
                        </div>
                    )}
                    {activeMainTab === 'Blueprint' ? (
                        <div
                            id="print-canvas-scroll-container"
                            className="flex flex-1 overflow-y-auto relative flex-row scroll-smooth"
                            onClick={() => {
                                handleSelectQuestion(null);
                                handleSelectBlock(null);
                            }}
                        >
                            <BlueprintCanvas
                                survey={survey}
                                selectedBlock={selectedBlock}
                                selectedQuestion={selectedQuestion}
                                onSelectBlock={() => { }}
                                onSelectQuestion={() => { }}
                                printSelectedQuestions={printSelectedQuestions}
                                printSelectedBlocks={printSelectedBlocks}
                                onToggleCheck={handleTogglePrintCheck}
                                onToggleBlockCheck={handleTogglePrintBlockCheck}
                                printDisplayOptions={printDisplayOptions}
                                hoveredQuestionId={hoveredQuestionId}
                                onQuestionHover={setHoveredQuestionId}
                                onSelectAll={handleToggleSelectAllPrint}
                                allSelected={areAllPrintSelected}
                                collapsedBlocks={collapsedBlocks}
                                onToggleBlockCollapse={handleToggleBlockCollapse}
                            />
                            {/* Re-use the Right Sidebar Logic for Blueprint */}
                            {(isAnyRightPanelOpen || activeMainTab === 'Blueprint') && (
                                <div
                                    ref={rightPanelRef}
                                    className={`bg-surface ${isAnyRightPanelOpen ? 'border-l border-outline-variant shadow-xl' : ''} transition-all duration-300 flex flex-col z-20 min-h-full`}
                                    style={{
                                        width: (selectedBlock || selectedQuestion || showBulkEditPanel || isGeminiPanelOpen)
                                            ? (isRightSidebarExpanded ? '800px' : '400px')
                                            : '400px'
                                    }}
                                >
                                    <ErrorBoundary fallback={<div className="p-4 text-error">Editor temporarily unavailable</div>}>
                                        {isGeminiPanelOpen ? (
                                            <GeminiPanel
                                                onClose={() => setIsGeminiPanelOpen(false)}
                                                survey={survey}
                                                onAddQuestion={actions.handleAddQuestionFromAI}
                                                onUpdateQuestion={actions.handleUpdateQuestionFromAI}
                                                onRepositionQuestion={actions.handleRepositionQuestion}
                                                onDeleteQuestion={actions.handleDeleteQuestionFromAI}
                                                onAddBlock={actions.handleAddBlockFromAI}
                                                onUpdateBlock={actions.handleUpdateBlockFromAI}
                                                helpTopic={geminiHelpTopic}
                                                selectedQuestion={selectedQuestion}
                                                logicIssues={logicIssues}
                                            />
                                        ) : showBulkEditPanel ? (
                                            <BulkEditPanel
                                                checkedQuestionCount={checkedQuestions.size}
                                                onClose={() => setCheckedQuestions(new Set())}
                                                onMoveTo={() => setIsMoveQuestionsModalOpen(true)}
                                                onForceResponse={actions.handleBulkForceResponse}
                                                onAutoAdvance={actions.handleBulkAutoAdvance}
                                                onDelete={actions.handleBulkDelete}
                                            />
                                        ) : selectedBlock ? (
                                            <BlockSidebar
                                                block={selectedBlock}
                                                survey={survey}
                                                onClose={() => handleSelectBlock(null)}
                                                onUpdateBlock={actions.handleUpdateBlock}
                                                isExpanded={isRightSidebarExpanded}
                                                onToggleExpand={handleToggleRightSidebarExpand}
                                                onExpandSidebar={handleExpandRightSidebar}
                                                focusTarget={focusTarget}
                                                onFocusHandled={handleFocusHandled}
                                            />
                                        ) : selectedQuestion ? (
                                            <RightSidebar
                                                question={selectedQuestion}
                                                survey={survey}
                                                logicIssues={logicIssues}
                                                activeTab={activeRightSidebarTab}
                                                onTabChange={setActiveRightSidebarTab}
                                                focusedLogicSource={focusedLogicSource}
                                                onUpdateQuestion={actions.handleUpdateQuestion}
                                                onAddChoice={actions.handleAddChoice}
                                                onDeleteChoice={actions.handleDeleteChoice}
                                                isExpanded={isRightSidebarExpanded}
                                                onToggleExpand={handleToggleRightSidebarExpand}
                                                onExpandSidebar={handleExpandRightSidebar}
                                                onSelectBlock={handleSelectBlock}
                                                onClose={() => handleSelectQuestion(null)}
                                                toolboxItems={toolboxItems}
                                                onRequestGeminiHelp={handleRequestGeminiHelp}
                                            />
                                        ) : (
                                            <div className="p-4">
                                                <SurveyStructureWidget
                                                    survey={survey}
                                                    paths={paths}
                                                    selectedPathId={selectedPathId}
                                                    onPathChange={setSelectedPathId}

                                                    onPagingModeChange={(mode) => dispatchAndRecord({ type: SurveyActionType.SET_PAGING_MODE, payload: { pagingMode: mode } })}
                                                    onGlobalAutoAdvanceChange={(enabled) => dispatchAndRecord({ type: SurveyActionType.SET_GLOBAL_AUTOADVANCE, payload: { enabled: enabled } })}
                                                    logicIssues={logicIssues}
                                                />
                                            </div>
                                        )}
                                    </ErrorBoundary>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            id="main-canvas-scroll-container"
                            ref={canvasContainerRef}
                            className="flex-1 overflow-y-auto overflow-x-hidden bg-surface relative scroll-smooth flex flex-row"
                            onClick={() => {
                                handleSelectQuestion(null);
                                handleSelectBlock(null);
                            }}
                        >
                            <div className="flex-1 min-w-0">
                                {activeMainTab === 'Blueprint' ? (
                                    <div className="h-full w-full bg-surface"></div>
                                ) : isDiagramView ? (
                                    <div className="h-full w-full">
                                        <DiagramCanvas
                                            exportRef={flowExportRef}
                                            survey={survey}
                                            selectedQuestion={selectedQuestion}
                                            onSelectQuestion={handleSelectQuestion}
                                            onSelectBlock={handleSelectBlock}
                                            onUpdateQuestion={actions.handleUpdateQuestion}
                                            activeMainTab={activeMainTab}
                                        />
                                        <PathAnalysisPanel
                                            survey={survey}
                                        />
                                    </div>
                                ) : (
                                    <div className="p-8 pb-32 min-h-full">
                                        <SurveyCanvas
                                            survey={displaySurvey}
                                            selectedQuestion={selectedQuestion}
                                            selectedBlock={selectedBlock}
                                            checkedQuestions={checkedQuestions}
                                            logicIssues={logicIssues}
                                            onSelectQuestion={handleSelectQuestion}
                                            onSelectBlock={handleSelectBlock}
                                            onUpdateQuestion={actions.handleUpdateQuestion}
                                            onUpdateBlock={actions.handleUpdateBlock}
                                            onDeleteQuestion={actions.handleDeleteQuestion}
                                            onCopyQuestion={actions.handleCopyQuestion}
                                            onMoveQuestionToNewBlock={actions.handleMoveQuestionToNewBlock}
                                            onMoveQuestionToExistingBlock={actions.handleMoveQuestionToExistingBlock}
                                            onMoveTo={handleMoveTo}
                                            onDeleteBlock={actions.handleDeleteBlock}
                                            onReorderQuestion={actions.handleReorderQuestion}
                                            onReorderBlock={actions.handleReorderBlock}
                                            onAddBlockFromToolbox={actions.handleAddBlockFromToolbox}
                                            onAddQuestion={actions.handleAddQuestion}
                                            onAddBlock={actions.handleAddBlock}
                                            onAddQuestionToBlock={actions.handleAddQuestionToBlock}
                                            onToggleQuestionCheck={actions.handleToggleQuestionCheck}
                                            onSelectAllInBlock={actions.handleSelectAllInBlock}
                                            onUnselectAllInBlock={actions.handleUnselectAllInBlock}
                                            toolboxItems={toolboxItems}
                                            collapsedBlocks={collapsedBlocks}
                                            onToggleBlockCollapse={handleToggleBlockCollapse}
                                            onCopyBlock={actions.handleCopyBlock}
                                            onExpandAllBlocks={handleExpandAllBlocks}
                                            onCollapseAllBlocks={handleCollapseAllBlocks}
                                            onExpandBlock={handleExpandBlock}
                                            onCollapseBlock={handleCollapseBlock}
                                            onAddChoice={actions.handleAddChoice}
                                            onAddPageBreakAfterQuestion={actions.handleAddPageBreakAfterQuestion}
                                            onUpdateBlockTitle={actions.handleUpdateBlockTitle}
                                            onUpdateSurveyTitle={actions.handleUpdateSurveyTitle}
                                            onAddFromLibrary={actions.handleAddSurveyFromLibrary}
                                            focusedLogicSource={focusedLogicSource}
                                            printMode={isPrintMode}
                                            hoveredQuestionId={hoveredQuestionId}
                                            onQuestionHover={setHoveredQuestionId}
                                            hoveredBlockId={hoveredBlockId}
                                            onBlockHover={setHoveredBlockId}
                                        />
                                    </div>
                                )}
                            </div>
                            {(isAnyRightPanelOpen || activeMainTab === 'Build') && (
                                <div
                                    ref={rightPanelRef}
                                    className={`bg-surface ${isAnyRightPanelOpen ? 'border-l border-outline-variant shadow-xl' : ''} transition-all duration-300 flex flex-col z-20 sticky top-0 min-h-full`}
                                    style={{
                                        width: (selectedBlock || selectedQuestion || showBulkEditPanel || isGeminiPanelOpen)
                                            ? (isRightSidebarExpanded ? '800px' : '400px')
                                            : '400px'
                                    }}
                                >
                                    <ErrorBoundary fallback={<div className="p-4 text-error">Editor temporarily unavailable</div>}>
                                        {isGeminiPanelOpen ? (
                                            <GeminiPanel
                                                onClose={() => setIsGeminiPanelOpen(false)}
                                                survey={survey}
                                                onAddQuestion={actions.handleAddQuestionFromAI}
                                                onUpdateQuestion={actions.handleUpdateQuestionFromAI}
                                                onRepositionQuestion={actions.handleRepositionQuestion}
                                                onDeleteQuestion={actions.handleDeleteQuestionFromAI}
                                                onAddBlock={actions.handleAddBlockFromAI}
                                                onUpdateBlock={actions.handleUpdateBlockFromAI}
                                                helpTopic={geminiHelpTopic}
                                                selectedQuestion={selectedQuestion}
                                                logicIssues={logicIssues}
                                            />
                                        ) : showBulkEditPanel ? (
                                            <BulkEditPanel
                                                checkedQuestionCount={checkedQuestions.size}
                                                onClose={() => setCheckedQuestions(new Set())}
                                                onMoveTo={() => setIsMoveQuestionsModalOpen(true)}
                                                onForceResponse={actions.handleBulkForceResponse}
                                                onAutoAdvance={actions.handleBulkAutoAdvance}
                                                onDelete={actions.handleBulkDelete}
                                            />
                                        ) : selectedBlock ? (
                                            <BlockSidebar
                                                block={selectedBlock}
                                                survey={survey}
                                                onClose={() => handleSelectBlock(null)}
                                                onUpdateBlock={actions.handleUpdateBlock}
                                                isExpanded={isRightSidebarExpanded}
                                                onToggleExpand={handleToggleRightSidebarExpand}
                                                onExpandSidebar={handleExpandRightSidebar}
                                                focusTarget={focusTarget}
                                                onFocusHandled={handleFocusHandled}
                                            />
                                        ) : selectedQuestion ? (
                                            <RightSidebar
                                                question={selectedQuestion}
                                                survey={survey}
                                                logicIssues={logicIssues}
                                                activeTab={activeRightSidebarTab}
                                                onTabChange={setActiveRightSidebarTab}
                                                focusedLogicSource={focusedLogicSource}
                                                onUpdateQuestion={actions.handleUpdateQuestion}
                                                onAddChoice={actions.handleAddChoice}
                                                onDeleteChoice={actions.handleDeleteChoice}
                                                isExpanded={isRightSidebarExpanded}
                                                onToggleExpand={handleToggleRightSidebarExpand}
                                                onExpandSidebar={handleExpandRightSidebar}
                                                onSelectBlock={handleSelectBlock}
                                                onClose={() => handleSelectQuestion(null)}
                                                toolboxItems={toolboxItems}
                                                onRequestGeminiHelp={handleRequestGeminiHelp}
                                            />
                                        ) : (
                                            <div className="p-4">
                                                <SurveyStructureWidget
                                                    survey={survey}
                                                    paths={paths}
                                                    selectedPathId={selectedPathId}
                                                    onPathChange={setSelectedPathId}

                                                    onPagingModeChange={(mode) => dispatchAndRecord({ type: SurveyActionType.SET_PAGING_MODE, payload: { pagingMode: mode } })}
                                                    onGlobalAutoAdvanceChange={(enabled) => dispatchAndRecord({ type: SurveyActionType.SET_GLOBAL_AUTOADVANCE, payload: { enabled: enabled } })}
                                                    logicIssues={logicIssues}
                                                />
                                            </div>
                                        )}
                                    </ErrorBoundary>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Floating Action Buttons */}
                    <div className="absolute bottom-6 right-6 flex flex-col gap-3">
                        {/* Add buttons here if needed */}
                    </div>
                </main>

                {/* Build/Standard Right Sidebar - Only show in Build/Flow/Design modes, NOT Blueprint */}

            </div>

            {isMoveQuestionsModalOpen && (
                <MoveQuestionsModal
                    isOpen={isMoveQuestionsModalOpen}
                    onClose={() => setIsMoveQuestionsModalOpen(false)}
                    onMove={handleConfirmMove}
                    survey={survey}
                    questionCount={checkedQuestions.size}
                />
            )}

            <ImportSurveyModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={(importedSurvey) => {
                    dispatch({ type: SurveyActionType.RESTORE_STATE, payload: importedSurvey });
                    setIsImportModalOpen(false);
                    showToast("Survey imported successfully!", 'success');
                }}
            />

            {/* Toast Notifications */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none items-end">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            onDismiss={() => dismissToast(toast.id)}
                            onUndo={toast.onUndo}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;