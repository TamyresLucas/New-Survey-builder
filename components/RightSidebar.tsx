import React, { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Survey, Question, ToolboxItemData, Choice, DisplayLogicCondition, SkipLogicRule, RandomizationMethod, CarryForwardLogic, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition, LogicIssue, ActionLogic, Workflow, Block } from '../types';
import { QuestionType, QuestionType as QTEnum } from '../types';
import { generateId, parseChoice, CHOICE_BASED_QUESTION_TYPES, truncate } from '../utils';
import { PasteChoicesModal } from './PasteChoicesModal';
import { 
    XIcon, PlusIcon, ExpandIcon, CollapseIcon, ChevronDownIcon, DragIndicatorIcon,
    MoreVertIcon, ArrowRightAltIcon,
    SignalIcon, BatteryIcon, RadioButtonUncheckedIcon, CheckboxOutlineIcon,
    RadioIcon, CheckboxFilledIcon, ShuffleIcon,
    InfoIcon, EyeIcon, ContentPasteIcon, CarryForwardIcon, CallSplitIcon,
    WarningIcon, CheckmarkIcon, ContentCopyIcon, LockOpenIcon, LockIcon
} from './icons';
import { QuestionTypeSelectionMenuContent } from './ActionMenus';

// ====================================================================================
// INTERNAL EDITOR COMPONENT
// This component contains all the logic and UI for editing a question.
// ====================================================================================

interface QuestionEditorProps {
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

const QuestionEditor: React.FC<QuestionEditorProps> = memo(({
    question, survey, logicIssues, activeTab, focusedLogicSource, onUpdateQuestion, onAddChoice, onDeleteChoice,
    isExpanded, onExpandSidebar, toolboxItems, onRequestGeminiHelp
}) => {
    // FIX: Added placeholder components for missing logic editors to resolve compilation errors.
    const DisplayLogicEditor: React.FC<{ question: Question, onUpdate: (updates: Partial<Question>) => void; onAddLogic: () => void; }> = ({ question, onAddLogic }) => {
        const logic = question.draftDisplayLogic ?? question.displayLogic;
        if (!logic) {
            return (
                <div>
                    <label className="text-sm font-medium text-on-surface block">Display Logic</label>
                    <p className="text-xs text-on-surface-variant mt-0.5 mb-3">Show or hide this question based on previous answers.</p>
                    <button onClick={onAddLogic} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                        <PlusIcon className="text-base" />
                        Add display logic
                    </button>
                </div>
            );
        }
        return <div className="text-sm text-on-surface-variant p-2 bg-surface-container rounded-md">Display Logic Editor is not implemented.</div>;
    };
    const SkipLogicEditor: React.FC<{ question: Question, onUpdate: (updates: Partial<Question>) => void; onAddLogic: () => void; }> = ({ question, onAddLogic }) => {
        const logic = question.draftSkipLogic ?? question.skipLogic;
        if (!logic) {
             return (
                 <div>
                    <label className="text-sm font-medium text-on-surface block">Skip Logic</label>
                    <p className="text-xs text-on-surface-variant mt-0.5 mb-3">Send respondents to a future point in the survey.</p>
                    <button onClick={onAddLogic} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                        <PlusIcon className="text-base" />
                        Add skip logic
                    </button>
                </div>
            );
        }
        return <div className="text-sm text-on-surface-variant p-2 bg-surface-container rounded-md">Skip Logic Editor is not implemented.</div>;
    };
    const WorkflowSectionEditor: React.FC<{
        title: string;
        description: string;
        questionQid: string;
        workflows: Workflow[];
        onUpdateWorkflows: (workflows: Workflow[]) => void;
        onAddWorkflow: () => void;
    }> = ({ title, description, workflows, onAddWorkflow }) => {
        return (
            <div className="py-6 first:pt-0">
                <label className="text-sm font-medium text-on-surface block">{title}</label>
                <p className="text-xs text-on-surface-variant mt-0.5 mb-3">{description}</p>
                {workflows.length === 0 ? (
                    <button onClick={onAddWorkflow} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                        <PlusIcon className="text-base" />
                        Add workflow
                    </button>
                ) : (
                    <div className="text-sm text-on-surface-variant p-2 bg-surface-container rounded-md">Workflow editor is not implemented for this view.</div>
                )}
            </div>
        );
    };

    // --- Branching Logic Editor ---
    // A sub-component for a single condition
    const ConditionEditor: React.FC<{
        condition: BranchingLogicCondition;
        onUpdate: (updatedCondition: BranchingLogicCondition) => void;
        onRemove: () => void;
        sourceQuestions: Question[];
    }> = ({ condition, onUpdate, onRemove, sourceQuestions }) => {
        const selectedSourceQuestion = sourceQuestions.find(q => q.qid === condition.questionId);
        const sourceIsChoiceBased = selectedSourceQuestion && CHOICE_BASED_QUESTION_TYPES.has(selectedSourceQuestion.type);

        const operators = [
            { value: 'equals', label: 'equals' },
            { value: 'not_equals', label: 'not equals' },
            { value: 'contains', label: 'contains' },
            { value: 'is_empty', label: 'is empty' },
            { value: 'is_not_empty', label: 'is not empty' },
        ];

        return (
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <select
                        value={condition.questionId}
                        onChange={e => onUpdate({ ...condition, questionId: e.target.value, value: '', isConfirmed: false })}
                        className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                    >
                        <option value="">Select question...</option>
                        {sourceQuestions.map(q => <option key={q.id} value={q.qid}>{q.qid}: {truncate(q.text, 20)}</option>)}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
                <div className="relative flex-1">
                     <select
                        value={condition.operator}
                        onChange={e => onUpdate({ ...condition, operator: e.target.value as any, isConfirmed: false })}
                        className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                    >
                        <option value="">Operator...</option>
                        {operators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                     <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
                 <div className="relative flex-1">
                    {sourceIsChoiceBased && selectedSourceQuestion.choices ? (
                        <select
                            value={condition.value}
                            onChange={e => onUpdate({ ...condition, value: e.target.value, isConfirmed: true })}
                            className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                        >
                            <option value="">Select choice...</option>
                            {selectedSourceQuestion.choices.map(c => <option key={c.id} value={c.text}>{truncate(parseChoice(c.text).label, 20)}</option>)}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={condition.value}
                            onChange={e => onUpdate({ ...condition, value: e.target.value })}
                            onBlur={() => onUpdate({ ...condition, isConfirmed: true })}
                            className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                            placeholder="Enter value"
                            disabled={condition.operator === 'is_empty' || condition.operator === 'is_not_empty'}
                        />
                    )}
                     <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
                <button onClick={onRemove} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full">
                    <XIcon className="text-lg" />
                </button>
            </div>
        );
    };

    const BranchingLogicEditor: React.FC<{
        question: Question;
        survey: Survey;
        previousQuestions: Question[];
        followingQuestions: Question[];
        futureBlocks: Block[];
        futurePages: { name: string; destinationId: string }[];
        currentBlockId: string | undefined;
        issues: LogicIssue[];
        onUpdate: (updates: Partial<Question>) => void;
        onAddLogic: () => void;
        onRequestGeminiHelp: (topic: string) => void;
    }> = ({ question, survey, previousQuestions, followingQuestions, futureBlocks, futurePages, issues, onUpdate, onAddLogic, onRequestGeminiHelp }) => {
        const logic = question.draftBranchingLogic ?? question.branchingLogic;

        const handleUpdateLogic = useCallback((updates: Partial<BranchingLogic>) => {
            onUpdate({ branchingLogic: { ...(logic || { branches: [], otherwiseSkipTo: 'next' }), ...updates } });
        }, [logic, onUpdate]);

        const handleAddBranch = useCallback(() => {
            const newBranch: BranchingLogicBranch = {
                id: generateId('branch'),
                operator: 'AND',
                conditions: [{ id: generateId('cond'), questionId: '', operator: '', value: '', isConfirmed: false }],
                thenSkipTo: '',
                thenSkipToIsConfirmed: false,
            };
            handleUpdateLogic({ branches: [...(logic?.branches || []), newBranch] });
        }, [logic, handleUpdateLogic]);

        const handleRemoveLogic = useCallback(() => {
            onUpdate({ branchingLogic: undefined, draftBranchingLogic: undefined });
        }, [onUpdate]);

        const handleRemoveBranch = useCallback((branchId: string) => {
            handleUpdateLogic({ branches: logic?.branches.filter(b => b.id !== branchId) });
        }, [logic, handleUpdateLogic]);
        
        const handleUpdateBranch = useCallback((branchId: string, updates: Partial<BranchingLogicBranch>) => {
            handleUpdateLogic({
                branches: logic?.branches.map(b => b.id === branchId ? { ...b, ...updates } : b),
            });
        }, [logic, handleUpdateLogic]);

        if (!logic) {
            return (
                <div>
                    <label className="text-sm font-medium text-on-surface block">Branching Logic</label>
                    <p className="text-xs text-on-surface-variant mt-0.5 mb-3">Send respondents down different paths based on their answers.</p>
                    <button onClick={onAddLogic} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                        <PlusIcon className="text-base" />
                        Add branching logic
                    </button>
                </div>
            );
        }

        const renderDestinationOptions = () => (
            <>
                <option value="next">Next Question</option>
                {futurePages.length > 0 && (
                    <optgroup label="Pages">
                        {futurePages.map(page => <option key={page.destinationId} value={page.destinationId}>{page.name}</option>)}
                    </optgroup>
                )}
                {futureBlocks.length > 0 && (
                     <optgroup label="Blocks">
                        {futureBlocks.map(block => <option key={block.id} value={`block:${block.id}`}>{block.bid}: {truncate(block.title, 30)}</option>)}
                    </optgroup>
                )}
                {followingQuestions.length > 0 && (
                     <optgroup label="Questions">
                        {followingQuestions.map(q => <option key={q.id} value={q.id}>{q.qid}: {truncate(q.text, 40)}</option>)}
                    </optgroup>
                )}
                <option value="end">End of Survey</option>
            </>
        );

        return (
            <div>
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <label className="text-sm font-medium text-on-surface block">Branching Logic</label>
                        <p className="text-xs text-on-surface-variant mt-0.5">Send respondents down different paths based on their answers.</p>
                    </div>
                    <button onClick={handleRemoveLogic} className="text-xs font-medium text-error hover:underline flex-shrink-0 ml-4">Remove</button>
                </div>

                <div className="space-y-4">
                    {logic.branches.map((branch, branchIndex) => (
                        <div key={branch.id} className="bg-surface p-4 border border-outline-variant rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-primary">IF</span>
                                    {branch.conditions.length > 1 && (
                                        <div className="flex items-center rounded-full bg-surface-container-high p-1 text-xs font-bold">
                                            <button onClick={() => handleUpdateBranch(branch.id, { operator: 'AND' })} className={`px-2 py-0.5 rounded-full ${branch.operator === 'AND' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant'}`}>AND</button>
                                            <button onClick={() => handleUpdateBranch(branch.id, { operator: 'OR' })} className={`px-2 py-0.5 rounded-full ${branch.operator === 'OR' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant'}`}>OR</button>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => handleRemoveBranch(branch.id)} className="text-xs font-medium text-error hover:underline">Remove branch</button>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                                {branch.conditions.map((condition, condIndex) => (
                                    <ConditionEditor
                                        key={condition.id}
                                        condition={condition}
                                        sourceQuestions={previousQuestions}
                                        onUpdate={(updatedCondition) => {
                                            const newConditions = [...branch.conditions];
                                            newConditions[condIndex] = updatedCondition;
                                            handleUpdateBranch(branch.id, { conditions: newConditions });
                                        }}
                                        onRemove={() => {
                                            const newConditions = branch.conditions.filter(c => c.id !== condition.id);
                                            handleUpdateBranch(branch.id, { conditions: newConditions });
                                        }}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => handleUpdateBranch(branch.id, { conditions: [...branch.conditions, { id: generateId('cond'), questionId: '', operator: '', value: '', isConfirmed: false }] })}
                                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                            >
                                <PlusIcon className="text-base" />
                                Add condition
                            </button>

                            <div className="mt-4 pt-4 border-t border-outline-variant flex items-center gap-2">
                                <span className="text-sm font-bold text-primary">THEN</span>
                                 <div className="relative flex-1">
                                    <select
                                        value={branch.thenSkipTo || ''}
                                        onChange={(e) => handleUpdateBranch(branch.id, { thenSkipTo: e.target.value, thenSkipToIsConfirmed: true })}
                                        className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                    >
                                        <option value="">Select destination...</option>
                                        {renderDestinationOptions()}
                                    </select>
                                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <button onClick={handleAddBranch} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                        <PlusIcon className="text-base" />
                        Add branch
                    </button>
                </div>
                
                <div className="mt-6 border-t border-outline-variant pt-4">
                    <label className="block text-sm font-medium text-on-surface mb-2">Otherwise</label>
                    <div className="relative">
                        <select
                            value={logic.otherwiseSkipTo || 'next'}
                            onChange={(e) => handleUpdateLogic({ otherwiseSkipTo: e.target.value, otherwiseIsConfirmed: true })}
                            className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                        >
                            {renderDestinationOptions()}
                        </select>
                         <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    </div>
                </div>
            </div>
        );
    };
    
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
    const currentBlockId = useMemo(() => survey.blocks.find(b => b.questions.some(q => q.id === question.id))?.id, [survey, question.id]);

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

    const logicDestinationOptions = useMemo(() => {
        const allQuestions = survey.blocks.flatMap(b => b.questions);
        const questionIndexMap = new Map(allQuestions.map((q, i) => [q.id, i]));
        const questionToBlockIdMap = new Map<string, string>();
        survey.blocks.forEach(block => block.questions.forEach(q => questionToBlockIdMap.set(q.id, block.id)));

        const currentQuestionId = question.id;
        const currentQuestionIndex = questionIndexMap.get(currentQuestionId)!;
        const currentBlockId = questionToBlockIdMap.get(currentQuestionId)!;

        // 1. Find all blocks that are destinations of a branch.
        const branchDestinationBlockIds = new Set<string>();
        for (const q of allQuestions) {
            const branchingLogic = q.draftBranchingLogic ?? q.branchingLogic;
            if (branchingLogic) {
                for (const branch of branchingLogic.branches) {
                    if (branch.thenSkipTo?.startsWith('block:')) {
                        const blockId = branch.thenSkipTo.substring(6);
                        branchDestinationBlockIds.add(blockId);
                    }
                }
            }
        }
        
        // 2. Determine if we need to filter. We only filter if the current question is NOT in a branch block.
        const shouldFilter = !branchDestinationBlockIds.has(currentBlockId);

        // 3. Get all physically following questions
        const allFollowingQuestions = allQuestions
            .slice(currentQuestionIndex + 1)
            .filter(q => q.id !== currentQuestionId && q.type !== QuestionType.PageBreak && q.type !== QuestionType.Description && !q.isHidden);

        // 4. Filter them if needed
        const reachableFollowingQuestions = shouldFilter
            ? allFollowingQuestions.filter(q => !branchDestinationBlockIds.has(questionToBlockIdMap.get(q.id)!))
            : allFollowingQuestions;

        const reachableFollowingQuestionIds = new Set(reachableFollowingQuestions.map(q => q.id));

        // 5. Filter future blocks
        const filteredFutureBlocks = survey.blocks.filter(b => {
            if (b.id === currentBlockId) return false;
            // The block must contain at least one reachable question and must appear after the current block
            const blockIndex = survey.blocks.findIndex(block => block.id === b.id);
            const currentQuestionBlockIndex = survey.blocks.findIndex(block => block.id === currentBlockId);
            return blockIndex > currentQuestionBlockIndex && b.questions.some(q => reachableFollowingQuestionIds.has(q.id));
        });

        // 6. Filter future pages
        const filteredFuturePages: { name: string, destinationId: string }[] = [];
        const seenPageStarts = new Set<string>();
        let pageCounter = 1;

        survey.blocks.forEach((block, blockIndex) => {
            block.questions.forEach((questionInLoop, questionIndexInBlock) => {
                let isStartOfPage = false;
                let pageNameSource: 'block' | 'page_break' | null = null;
                const pageDefiningQuestion = questionInLoop;
                let firstContentQuestion: Question | undefined;
                const questionInLoopIndex = questionIndexMap.get(pageDefiningQuestion.id)!;

                if (blockIndex === 0 && questionIndexInBlock === 0 && questionInLoop.type !== QTEnum.PageBreak) {
                    isStartOfPage = true;
                    pageNameSource = 'block';
                    firstContentQuestion = pageDefiningQuestion;
                } else if (pageDefiningQuestion.type === QTEnum.PageBreak) {
                    pageCounter++;
                    isStartOfPage = true;
                    pageNameSource = 'page_break';
                    firstContentQuestion = allQuestions[questionInLoopIndex + 1];
                } else if (questionIndexInBlock === 0 && blockIndex > 0) {
                    const prevBlock = survey.blocks[blockIndex - 1];
                    const lastQuestionOfPrevBlock = prevBlock.questions[prevBlock.questions.length - 1];
                    if (!lastQuestionOfPrevBlock || lastQuestionOfPrevBlock.type !== QTEnum.PageBreak) {
                        pageCounter++;
                        isStartOfPage = true;
                        pageNameSource = 'block';
                        firstContentQuestion = pageDefiningQuestion;
                    }
                }
                
                if (isStartOfPage && firstContentQuestion && !seenPageStarts.has(firstContentQuestion.id)) {
                    const pageStartIndex = questionIndexMap.get(firstContentQuestion.id);
                    
                    if (pageStartIndex !== undefined && pageStartIndex > currentQuestionIndex && reachableFollowingQuestionIds.has(firstContentQuestion.id)) {
                        let storedPageName: string | undefined;
                        if (pageNameSource === 'block') {
                            storedPageName = block.pageName;
                        } else { 
                            storedPageName = pageDefiningQuestion.pageName;
                        }
                        
                        const isDefaultName = !storedPageName || /^Page \d+$/.test(storedPageName);
                        const pageName = isDefaultName ? `Page ${pageCounter}` : storedPageName;
                        
                        filteredFuturePages.push({
                            name: `P${pageCounter}: ${pageName}`,
                            destinationId: firstContentQuestion.id,
                        });
                        seenPageStarts.add(firstContentQuestion.id);
                    }
                }
            });
        });
        
        return {
            followingQuestions: reachableFollowingQuestions,
            futureBlocks: filteredFutureBlocks,
            futurePages: filteredFuturePages,
        };
    }, [survey, question]);


    const isChoiceBased = useMemo(() => CHOICE_BASED_QUESTION_TYPES.has(question.type), [question.type]);

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
            text: `Column ${Number(currentScalePoints.length) + 1}`
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

    // ... All render functions and sub-components from RightSidebar.tsx go here ...
    const renderChoiceBasedSettingsTab = () => {
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
            {question.type === QuestionType.ChoiceGrid && (
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
                                                                                <RadioIcon className="text-2xl text-primary flex-shrink-0" /> : 
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
                                                                        {isSelected ? <RadioIcon className="text-xl text-primary" /> : <RadioButtonUncheckedIcon className="text-xl text-on-surface-variant" />}
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
                                                        <RadioIcon className="text-2xl text-primary flex-shrink-0" /> : 
                                                        <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                                                ) : (
                                                    isSelected ?
                                                        <CheckboxFilledIcon className="text-2xl text-primary flex-shrink-0" /> :
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
                                                        {isSelected ? <RadioIcon className="text-2xl text-primary" /> : <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant" />}
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
                                        <RadioIcon className="text-2xl text-primary flex-shrink-0" /> :
                                        <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                                ) : (
                                    isSelected ?
                                        <CheckboxFilledIcon className="text-2xl text-primary flex-shrink-0" /> :
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
                    <InfoIcon className="text-primary text-base" />
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

  const renderDescriptionSettingsTab = () => (
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
      
      <div>
        <label htmlFor="question-text" className="block text-sm font-medium text-on-surface-variant mb-1">
          Content
        </label>
        <textarea
          id="question-text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          onBlur={handleTextBlur}
          onPaste={createPasteHandler(setQuestionText)}
          rows={4}
          className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
          placeholder="Enter your description here..."
        />
        <p className="text-xs text-on-surface-variant mt-1">Maximum 5000 characters</p>
      </div>
    </div>
  );

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
    // This is a placeholder for the actual implementation, which is quite large
    // All behavior-related components (DisplayLogicEditor, etc.) should be here
    return (
        <div className="space-y-8">
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
                    {previousQuestions.length > 0 && (
                        <>
                            <div className="py-6 first:pt-0">
                                <CarryForwardLogicEditor
                                    question={question}
                                    previousQuestions={previousQuestions}
                                    onUpdate={handleUpdate}
                                    logicKey="carryForwardStatements"
                                    label="Carry forward choices"
                                    addButtonLabel="Add choices"
                                    description="Use answers from a previous question as choices in this one."
                                    onAddLogic={onExpandSidebar}
                                />
                            </div>
                            <div className="py-6 first:pt-0">
                                 <CarryForwardLogicEditor
                                    question={question}
                                    previousQuestions={previousQuestions}
                                    onUpdate={handleUpdate}
                                    logicKey="carryForwardScalePoints"
                                    label="Carry forward scale points"
                                    addButtonLabel="Add scale points"
                                    description="Use scale points from a previous grid question as choices in this one."
                                    onAddLogic={onExpandSidebar}
                                />
                            </div>
                        </>
                    )}
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Logic" defaultExpanded={true}>
                <div className="divide-y divide-outline-variant">
                    {previousQuestions.length > 0 && (
                        <div className="py-6 first:pt-0">
                            <DisplayLogicEditor
                                question={question}
                                onUpdate={handleUpdate}
                                onAddLogic={onExpandSidebar}
                            />
                        </div>
                    )}
                    <div className="py-6 first:pt-0">
                        <SkipLogicEditor
                            question={question}
                            onUpdate={handleUpdate}
                            onAddLogic={onExpandSidebar}
                        />
                    </div>
                </div>
            </CollapsibleSection>
        </div>
    );
  };

  const renderAdvancedTab = () => {
    const beforeWorkflows = question.draftBeforeWorkflows ?? question.beforeWorkflows ?? [];
    const afterWorkflows = question.draftAfterWorkflows ?? question.afterWorkflows ?? [];

    const handleEnableBranching = () => {
        handleUpdate({
            branchingLogic: {
                branches: [
                    {
                        id: generateId('branch'),
                        operator: 'AND',
                        conditions: [{ id: generateId('cond'), questionId: '', operator: '', value: '', isConfirmed: false }],
                        thenSkipTo: '',
                        thenSkipToIsConfirmed: false,
                    }
                ],
                otherwiseSkipTo: 'next',
                otherwiseIsConfirmed: false,
            }
        });
        onExpandSidebar();
    };

    return (
      <div className="space-y-8">
        <CollapsibleSection title="Branching Logic" defaultExpanded={true}>
            <div className="py-6 first:pt-0">
              <BranchingLogicEditor
                  question={question}
                  survey={survey}
                  previousQuestions={previousQuestions}
                  followingQuestions={logicDestinationOptions.followingQuestions}
                  futureBlocks={logicDestinationOptions.futureBlocks}
                  futurePages={logicDestinationOptions.futurePages}
                  currentBlockId={currentBlockId}
                  issues={logicIssues.filter(i => i.type === 'branching')}
                  onUpdate={handleUpdate}
                  onAddLogic={handleEnableBranching}
                  onRequestGeminiHelp={onRequestGeminiHelp}
              />
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
                if (question.type === QuestionType.Description) return renderDescriptionSettingsTab();
                if (question.type !== QuestionType.PageBreak) {
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


// ====================================================================================
// SHARED SUB-COMPONENTS & HELPERS
// These are used by the QuestionEditor component above.
// ====================================================================================

const ChoiceDropIndicator = () => <div className="h-px bg-primary w-full my-1" />;

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultExpanded?: boolean }> = ({ title, children, defaultExpanded = true }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left group"
                aria-expanded={isExpanded}
            >
                <h3 className="text-base font-semibold text-on-surface">{title}</h3>
                <ChevronDownIcon className={`text-xl text-on-surface-variant transition-transform duration-200 group-hover:text-on-surface ${isExpanded ? '' : '-rotate-90'}`} />
            </button>
            {isExpanded && (
                <div className="mt-4">
                    {children}
                </div>
            )}
        </div>
    );
};

const PasteInlineForm: React.FC<{
  onSave: (text: string) => { success: boolean; error?: string };
  onCancel: () => void;
  placeholder: string;
  primaryActionLabel: string;
  disclosureText: string;
  helpTopic: string;
  onRequestGeminiHelp: (topic: string) => void;
}> = ({ onSave, onCancel, placeholder, primaryActionLabel, disclosureText, helpTopic, onRequestGeminiHelp }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (!text.trim()) {
      onCancel();
      return;
    }
    const result = onSave(text.trim());
    if (result.success) {
      onCancel(); 
    } else {
      setError(result.error || 'Invalid syntax.');
    }
  };

  return (
    <div className={`p-3 bg-surface-container-high rounded-md border ${error ? 'border-error' : 'border-outline-variant'}`}>
      <div className="text-xs text-on-surface-variant mb-2 flex items-center gap-1 flex-wrap">
        <InfoIcon className="text-sm flex-shrink-0" />
        <span>{disclosureText}</span>
        <button onClick={() => onRequestGeminiHelp(helpTopic)} className="text-primary hover:underline font-medium">learn more</button>
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError(null);
        }}
        rows={4}
        className={`w-full bg-surface border rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary font-mono ${error ? 'border-error' : 'border-outline'}`}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-xs text-error mt-2">{error}</p>
      )}
      <div className="mt-2 flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-xs font-semibold text-primary rounded-full hover:bg-primary-container">Cancel</button>
        <button onClick={handleSave} className="px-4 py-1.5 text-xs font-semibold text-on-primary bg-primary rounded-full hover:opacity-90">{primaryActionLabel}</button>
      </div>
    </div>
  );
};


const CopyAndPasteButton: React.FC<{ onClick: () => void; className?: string; disabled?: boolean; }> = ({ onClick, className = 'text-sm', disabled = false }) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className={`flex items-center gap-1 ${className} font-medium text-primary hover:underline transition-colors disabled:text-on-surface-variant disabled:no-underline disabled:cursor-not-allowed`}
    >
        <ContentPasteIcon className="text-base" />
        <span>Copy and paste</span>
    </button>
);


const ForceResponseSection: React.FC<{
    question: Question;
    handleUpdate: (updates: Partial<Question>) => void;
}> = ({ question, handleUpdate }) => {
    const { forceResponse = false } = question;

    const handleUpdateChoiceValidation = (key: 'minSelections' | 'maxSelections', value: string) => {
        const numValue = value ? parseInt(value, 10) : null;
        handleUpdate({
            choiceValidation: {
                ...question.choiceValidation,
                [key]: numValue,
            }
        });
    };
    
    const handleTextValidationUpdate = (key: 'minLength' | 'maxLength', value: string) => {
        const numValue = value ? parseInt(value, 10) : null;
        handleUpdate({
            textEntrySettings: {
                ...question.textEntrySettings,
                validation: {
                    ...question.textEntrySettings?.validation,
                    [key]: numValue,
                }
            }
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <label htmlFor="require-answer" className="text-sm font-medium text-on-surface block">
                        Require Answer
                    </label>
                    <p className="text-xs text-on-surface-variant mt-0.5">Respondent must answer to continue</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="require-answer" checked={forceResponse} onChange={(e) => handleUpdate({ forceResponse: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
            {forceResponse && (
                <div className="mt-4 pl-4 border-l-2 border-outline-variant">
                    {question.type === QuestionType.Checkbox && (
                        <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-2">Number of Selections</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="min-selections" className="block text-xs font-medium text-on-surface-variant mb-1">Minimum</label>
                                    <input
                                        type="number"
                                        id="min-selections"
                                        min="0"
                                        value={question.choiceValidation?.minSelections ?? ''}
                                        onChange={(e) => handleUpdateChoiceValidation('minSelections', e.target.value)}
                                        className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                                        placeholder="e.g., 1"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="max-selections" className="block text-xs font-medium text-on-surface-variant mb-1">Maximum</label>
                                    <input
                                        type="number"
                                        id="max-selections"
                                        min="1"
                                        value={question.choiceValidation?.maxSelections ?? ''}
                                        onChange={(e) => handleUpdateChoiceValidation('maxSelections', e.target.value)}
                                        className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                                        placeholder={`e.g., ${question.choices?.length || 3}`}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {question.type === QuestionType.TextEntry && (
                        <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-2">Character Length</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="min-length" className="block text-xs font-medium text-on-surface-variant mb-1">Minimum</label>
                                    <input
                                        type="number"
                                        id="min-length"
                                        min="0"
                                        value={question.textEntrySettings?.validation?.minLength ?? ''}
                                        onChange={(e) => handleTextValidationUpdate('minLength', e.target.value)}
                                        className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="max-length" className="block text-xs font-medium text-on-surface-variant mb-1">Maximum</label>
                                    <input
                                        type="number"
                                        id="max-length"
                                        min="1"
                                        value={question.textEntrySettings?.validation?.maxLength ?? ''}
                                        onChange={(e) => handleTextValidationUpdate('maxLength', e.target.value)}
                                        className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                                        placeholder="5000"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const RandomizeChoicesEditor: React.FC<{
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
}> = ({ question, onUpdate }) => {
    const isRandomized = question.answerBehavior?.randomizeChoices || false;
    const method = question.answerBehavior?.randomizationMethod || 'permutation';

    const handleToggleRandomization = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({
            answerBehavior: {
                ...question.answerBehavior,
                randomizeChoices: e.target.checked,
            }
        });
    };

    const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate({
            answerBehavior: {
                ...question.answerBehavior,
                randomizationMethod: e.target.value as RandomizationMethod,
            }
        });
    };
    
    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <label htmlFor="randomize-choices" className="text-sm font-medium text-on-surface block">
                        Randomize choices
                    </label>
                    <p className="text-xs text-on-surface-variant mt-0.5">Randomize the order of choices for each respondent.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        id="randomize-choices" 
                        checked={isRandomized} 
                        onChange={handleToggleRandomization}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
            {isRandomized && (
                <div className="mt-4 pl-4 border-l-2 border-outline-variant">
                    <label htmlFor="randomization-method" className="block text-sm font-medium text-on-surface-variant mb-1">Method</label>
                    <div className="relative">
                        <select
                            id="randomization-method"
                            value={method}
                            onChange={handleMethodChange}
                            className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                        >
                            <option value="permutation">Standard (Permutation)</option>
                            <option value="random_reverse">Random Reverse</option>
                            <option value="reverse_order">Reverse Order</option>
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    </div>
                </div>
            )}
        </div>
    );
};

const CarryForwardLogicEditor: React.FC<{
    question: Question;
    previousQuestions: Question[];
    onUpdate: (updates: Partial<Question>) => void;
    logicKey: 'carryForwardStatements' | 'carryForwardScalePoints';
    label: string;
    addButtonLabel: string;
    description: string;
    onAddLogic: () => void;
}> = ({ question, previousQuestions, onUpdate, logicKey, label, addButtonLabel, description, onAddLogic }) => {
    
    const logic = question[logicKey];

    const handleAdd = () => {
        onUpdate({ [logicKey]: { sourceQuestionId: '', filter: 'selected' } });
        onAddLogic();
    };

    const handleRemove = () => {
        onUpdate({ [logicKey]: undefined });
    };

    const handleUpdateLogic = (updates: Partial<CarryForwardLogic>) => {
        onUpdate({ [logicKey]: { ...logic, ...updates } });
    };

    if (!logic) {
        return (
            <div>
                <label className="text-sm font-medium text-on-surface block">{label}</label>
                <p className="text-xs text-on-surface-variant mt-0.5 mb-3">{description}</p>
                <button onClick={handleAdd} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    <PlusIcon className="text-base" />
                    {addButtonLabel}
                </button>
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div>
                    <label className="text-sm font-medium text-on-surface block">{label}</label>
                    <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
                </div>
                 <button onClick={handleRemove} className="text-xs font-medium text-error hover:underline">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">From Question</label>
                    <div className="relative">
                        <select
                            value={logic.sourceQuestionId}
                            onChange={(e) => handleUpdateLogic({ sourceQuestionId: e.target.value })}
                            className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                        >
                            <option value="">Select a question...</option>
                            {previousQuestions.map(q => (
                                <option key={q.id} value={q.qid}>{q.qid}: {truncate(q.text, 40)}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Filter</label>
                    <div className="relative">
                         <select
                            value={logic.filter}
                            onChange={(e) => handleUpdateLogic({ filter: e.target.value as any })}
                            className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                        >
                            <option value="selected">Selected</option>
                            <option value="not_selected">Not selected</option>
                            <option value="displayed">Displayed</option>
                            <option value="not_displayed">Not displayed</option>
                            <option value="all">All</option>
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ====================================================================================
// TOP-LEVEL SIDEBAR COMPONENT
// This is the main exported component that holds the tabs and the editor.
// ====================================================================================

interface RightSidebarProps {
  question: Question;
  survey: Survey;
  logicIssues: LogicIssue[];
  focusedLogicSource: string | null;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  onAddChoice: (questionId: string) => void;
  onDeleteChoice: (questionId: string, choiceId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onExpandSidebar: () => void;
  toolboxItems: ToolboxItemData[];
  onRequestGeminiHelp: (topic: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  question,
  survey,
  logicIssues,
  focusedLogicSource,
  onClose,
  activeTab,
  onTabChange,
  onUpdateQuestion,
  onAddChoice,
  onDeleteChoice,
  isExpanded,
  onToggleExpand,
  onExpandSidebar,
  toolboxItems,
  onRequestGeminiHelp,
}) => {
  const tabs = useMemo(() => {
    const availableTabs = ['Settings'];
    if (question.type !== QuestionType.Description && question.type !== QuestionType.PageBreak) {
      availableTabs.push('Behavior', 'Advanced');
    }
    if (CHOICE_BASED_QUESTION_TYPES.has(question.type) || question.type === QuestionType.TextEntry) {
      availableTabs.push('Preview');
    }
    return availableTabs;
  }, [question.type]);

  // If the current active tab is not available for this question type, default to 'Settings'
  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      onTabChange('Settings');
    }
  }, [tabs, activeTab, onTabChange]);


  return (
    <aside className="w-full h-full bg-surface-container border-l border-outline-variant flex flex-col">
      <div className="p-4 border-b border-outline-variant flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          Question Settings
        </h2>
        <div className="flex items-center gap-2">
            <button
                onClick={onToggleExpand}
                className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high"
                aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
            >
                {isExpanded ? <CollapseIcon className="text-xl" /> : <ExpandIcon className="text-xl" />}
            </button>
            <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high" aria-label="Close settings">
                <XIcon className="text-xl" />
            </button>
        </div>
      </div>
      <div className="px-4 border-b border-outline-variant">
        <nav className="-mb-px flex space-x-4">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab 
                ? 'border-primary text-primary' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto">
        <QuestionEditor 
            question={question} 
            survey={survey}
            logicIssues={logicIssues}
            focusedLogicSource={focusedLogicSource}
            activeTab={activeTab}
            onUpdateQuestion={onUpdateQuestion}
            onAddChoice={onAddChoice}
            onDeleteChoice={onDeleteChoice}
            isExpanded={isExpanded}
            onExpandSidebar={onExpandSidebar}
            toolboxItems={toolboxItems}
            onRequestGeminiHelp={onRequestGeminiHelp}
        />
      </div>
    </aside>
  );
};
