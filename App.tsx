import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from './components/Header';
import SubHeader from './components/SubHeader';
import LeftSidebar from './components/LeftSidebar';
import BuildPanel from './components/BuildPanel';
import SurveyCanvas from './components/SurveyCanvas';
import DiagramCanvas from './components/DiagramCanvas';
import { RightSidebar } from './components/RightSidebar';
import { BlockSidebar } from './components/BlockSidebar';
import { BulkEditPanel } from './components/BulkEditPanel';
import GeminiPanel from './components/GeminiPanel';
import { SurveyPreview } from './components/SurveyPreview';
import { SurveyExport } from './components/SurveyExport';
import PathAnalysisPanel from './components/diagram/PathAnalysisPanel';
import { ImportSurveyModal } from './components/ImportSurveyModal';
import SurveyStructureWidget from './components/SurveyStructureWidget';

// Hooks
import { useSurveyState } from './hooks/useSurveyState';
import { useSelection } from './hooks/useSelection';
import { useSurveyActions } from './hooks/useSurveyActions';

// Types
import { ToolboxItemData, LogicIssue, SurveyStatus, Question, Block } from './types';
import { SurveyActionType } from './state/surveyReducer';
import { toolboxItems as initialToolboxItems } from './constants';
import { validateSurveyLogic } from './logicValidator';
import { analyzeSurveyPaths, generateSurveyCsv } from './utils';

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
    console.log('App component starting render...');

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
    const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);
    const [activeRightSidebarTab, setActiveRightSidebarTab] = useState('Settings');
    const [isGeminiPanelOpen, setIsGeminiPanelOpen] = useState(false);
    const [geminiHelpTopic, setGeminiHelpTopic] = useState<string | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isExportMode, setIsExportMode] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType; onUndo?: () => void }[]>([]);
    const [selectedPathId, setSelectedPathId] = useState('all-paths');

    // Derived state for view mode
    const isDiagramView = activeMainTab === 'Flow';

    // Refs
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);

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

    const handleBackToTop = useCallback(() => {
        if (canvasContainerRef.current) {
            canvasContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, []);

    // --- Side Effects ---

    // Close Build Panel when switching to Diagram view
    useEffect(() => {
        if (activeMainTab === 'Flow') {
            setIsBuildPanelOpen(false);
        } else if (activeMainTab === 'Build') {
            setIsBuildPanelOpen(true);
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
        }
        setActiveMainTab(tabId);
    }, [activeMainTab]);

    const allBlocksCollapsed = survey.blocks.length > 0 && collapsedBlocks.size === survey.blocks.length;
    const handleExpandAllBlocks = useCallback(() => setCollapsedBlocks(new Set()), []);
    const handleCollapseAllBlocks = useCallback(() => setCollapsedBlocks(new Set(survey.blocks.map(b => b.id))), [survey.blocks]);

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
        <div className="flex flex-col h-screen bg-surface text-on-surface overflow-hidden font-sans">
            <Header
                surveyName={survey.title}
                isGeminiPanelOpen={isGeminiPanelOpen}
                onToggleGeminiPanel={handleToggleGeminiPanel}
                onUpdateSurveyName={actions.handleUpdateSurveyTitle}
                surveyStatus={surveyStatus}
                isDirty={isDirty}
                onToggleActivateSurvey={() => setSurveyStatus(prev => prev === 'active' ? 'stopped' : 'active')}
                onUpdateLiveSurvey={() => {
                    setPublishedSurvey(JSON.parse(JSON.stringify(survey)));
                    showToast("Survey updated successfully!", 'success');
                }}
            />
            <SubHeader
                onTogglePreview={() => setIsPreviewMode(true)}
                onCopySurvey={() => {
                    const json = JSON.stringify(survey, null, 2);
                    navigator.clipboard.writeText(json);
                    showToast("Survey JSON copied to clipboard", 'success');
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
                onExport={() => setIsExportMode(true)}
                onImportSurvey={() => setIsImportModalOpen(true)}
            />

            <div className="flex flex-1 overflow-hidden relative">
                <LeftSidebar
                    activeTab={activeMainTab}
                    onTabSelect={handleTabSelect}
                />

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
                        onExpandBlock={handleExpandBlock}
                        onCollapseBlock={handleCollapseBlock}
                        onDeleteBlock={actions.handleDeleteBlock}
                        onDeleteQuestion={actions.handleDeleteQuestion}
                        onCopyQuestion={actions.handleCopyQuestion}
                        onMoveQuestionToNewBlock={actions.handleMoveQuestionToNewBlock}
                        onMoveQuestionToExistingBlock={actions.handleMoveQuestionToExistingBlock}
                        onAddPageBreakAfterQuestion={actions.handleAddPageBreakAfterQuestion}
                        onSelectAllInBlock={actions.handleSelectAllInBlock}
                        onUnselectAllInBlock={actions.handleUnselectAllInBlock}
                        onUpdateQuestion={actions.handleUpdateQuestion}
                    />
                )}

                <main className="flex-1 flex flex-col relative overflow-hidden transition-all duration-300">
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

                    <div
                        ref={canvasContainerRef}
                        className="flex-1 overflow-y-auto overflow-x-hidden bg-surface relative scroll-smooth"
                    >
                        {isDiagramView ? (
                            <div className="h-full w-full">
                                <DiagramCanvas
                                    survey={survey}
                                    selectedQuestion={selectedQuestion}
                                    onSelectQuestion={handleSelectQuestion}
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
                                    onAddFromLibrary={() => { }}
                                    focusedLogicSource={focusedLogicSource}
                                />
                            </div>
                        )}
                    </div>

                    {/* Floating Action Buttons */}
                    <div className="absolute bottom-6 right-6 flex flex-col gap-3">
                        {/* Add buttons here if needed */}
                    </div>
                </main>

                {/* Right Sidebar */}
                {(isAnyRightPanelOpen || activeMainTab === 'Build') && (
                    <div
                        ref={rightPanelRef}
                        className={`bg-surface border-l border-outline-variant shadow-xl transition-all duration-300 flex flex-col z-20`}
                        style={{
                            width: (selectedBlock || selectedQuestion || showBulkEditPanel || isGeminiPanelOpen)
                                ? (isRightSidebarExpanded ? '800px' : '400px')
                                : '400px'
                        }}
                    >
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
                                onDuplicate={actions.handleBulkDuplicate}
                                onAddToLibrary={() => { }}
                                onMoveQuestions={() => { }}
                                onMoveToNewBlock={actions.handleBulkMoveToNewBlock}
                                onHideQuestion={actions.handleBulkHideQuestion}
                                onHideBackButton={actions.handleBulkHideBackButton}
                                onForceResponse={actions.handleBulkForceResponse}
                                showForceResponse={true}
                                onUnforceResponse={() => actions.handleBulkForceResponse()}
                                showUnforceResponse={true}
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
                                    onBackToTop={handleBackToTop}
                                    onToggleCollapseAll={() => {
                                        if (allBlocksCollapsed) {
                                            handleExpandAllBlocks();
                                        } else {
                                            handleCollapseAllBlocks();
                                        }
                                    }}
                                    allBlocksCollapsed={allBlocksCollapsed}
                                    onPagingModeChange={(mode) => dispatchAndRecord({ type: SurveyActionType.SET_PAGING_MODE, payload: { pagingMode: mode } })}
                                    onGlobalAutoAdvanceChange={(enabled) => dispatchAndRecord({ type: SurveyActionType.SET_GLOBAL_AUTOADVANCE, payload: { enabled: enabled } })}
                                    logicIssues={logicIssues}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

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
        </div >
    );
};

export default App;