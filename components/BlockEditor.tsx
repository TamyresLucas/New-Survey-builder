import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Block, Survey, Question, QuestionRandomizationRule, RandomizationPattern, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition, LogicIssue, DisplayLogic, DisplayLogicCondition } from '../types';
import { QuestionType } from '../types';
import { XIcon, ChevronDownIcon, PlusIcon, ExpandIcon, CollapseIcon, CheckmarkIcon, ArrowRightAltIcon, CallSplitIcon, ContentPasteIcon, InfoIcon } from './icons';
import { generateId, truncate, parseChoice, CHOICE_BASED_QUESTION_TYPES, isBranchingLogicExhaustive } from '../utils';

interface BlockEditorProps {
    block: Block;
    survey: Survey;
    onClose: () => void;
    onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onExpandSidebar: () => void;
    focusTarget: { type: string; id: string; tab: string; element: string } | null;
    onFocusHandled: () => void;
}

// ====================================================================================
// INTERNAL HELPER COMPONENTS (Copied from RightSidebar for consistency)
// ====================================================================================

const PasteInlineForm: React.FC<{
    onSave: (text: string) => { success: boolean; error?: string };
    onCancel: () => void;
    placeholder: string;
    primaryActionLabel: string;
    disclosureText: string;
}> = ({ onSave, onCancel, placeholder, primaryActionLabel, disclosureText }) => {
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

interface LogicConditionRowProps {
    condition: BranchingLogicCondition;
    onUpdateCondition: (field: keyof BranchingLogicCondition, value: any) => void;
    onRemoveCondition?: () => void;
    onConfirm?: () => void;
    availableQuestions: Question[];
    isConfirmed: boolean;
    invalidFields?: Set<keyof BranchingLogicCondition | 'skipTo'>;
}

const LogicConditionRow: React.FC<LogicConditionRowProps> = ({ condition, onUpdateCondition, onRemoveCondition, onConfirm, availableQuestions, isConfirmed, invalidFields = new Set() }) => {
    const referencedQuestion = useMemo(() => availableQuestions.find(q => q.qid === condition.questionId), [availableQuestions, condition.questionId]);
    const isNumericInput = referencedQuestion?.type === QuestionType.NumericAnswer;
    const isChoiceBasedInput = referencedQuestion && CHOICE_BASED_QUESTION_TYPES.has(referencedQuestion.type);

    const valueIsDisabled = !referencedQuestion || ['is_empty', 'is_not_empty'].includes(condition.operator);
    const questionBorderClass = invalidFields.has('questionId') ? 'border-error' : 'border-input-border focus:outline-primary';
    const operatorBorderClass = invalidFields.has('operator') ? 'border-error' : 'border-input-border focus:outline-primary';
    const valueBorderClass = invalidFields.has('value') ? 'border-error' : 'border-input-border focus:outline-primary';

    const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newOperator = e.target.value;
        onUpdateCondition('operator', newOperator);
        if (['is_empty', 'is_not_empty'].includes(newOperator)) {
            onUpdateCondition('value', '');
        }
    };

    return (
        <div className="flex items-center gap-2 p-2 bg-surface-container-high rounded-md min-w-max">
            <div className="relative w-48 flex-shrink-0">
                <select
                    value={condition.questionId}
                    onChange={(e) => onUpdateCondition('questionId', e.target.value)}
                    className={`w-full bg-transparent border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none ${questionBorderClass}`}
                >
                    <option value="">select question</option>
                    {availableQuestions.map(q => <option key={q.id} value={q.qid}>{q.qid}: {truncate(q.text, 50)}</option>)}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
            </div>
            <div className="relative w-40 flex-shrink-0">
                <select
                    value={condition.operator}
                    onChange={handleOperatorChange}
                    className={`w-full bg-transparent border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none ${operatorBorderClass}`}
                    disabled={!referencedQuestion}
                >
                    <option value="">select interaction</option>
                    <option value="equals">equals</option>
                    <option value="not_equals">not equals</option>
                    <option value="contains">contains</option>
                    <option value="greater_than">greater than</option>
                    <option value="less_than">less than</option>
                    <option value="is_empty">is empty</option>
                    <option value="is_not_empty">is not empty</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
            </div>
            <div className="relative flex-1 min-w-[150px]">
                {isChoiceBasedInput && referencedQuestion?.choices ? (
                    <div className="relative">
                        <select
                            value={condition.value}
                            onChange={(e) => onUpdateCondition('value', e.target.value)}
                            className={`w-full bg-transparent border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none disabled:bg-surface-container-high ${valueBorderClass}`}
                            disabled={valueIsDisabled}
                        >
                            <option value="">select answer</option>
                            {referencedQuestion.choices.map(choice => (
                                <option key={choice.id} value={choice.text}>{parseChoice(choice.text).label}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
                    </div>
                ) : (
                    <input
                        type={isNumericInput ? "number" : "text"}
                        value={condition.value}
                        onChange={(e) => onUpdateCondition('value', e.target.value)}
                        placeholder="select answer"
                        className={`w-full bg-transparent border rounded-md px-2 py-1.5 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 disabled:bg-surface-container-high ${valueBorderClass}`}
                        disabled={valueIsDisabled}
                    />
                )}
            </div>
            {onRemoveCondition && (
                <button onClick={onRemoveCondition} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full"><XIcon className="text-lg" /></button>
            )}
            {!isConfirmed && onConfirm && (
                <button onClick={onConfirm} className="p-1.5 bg-primary text-on-primary rounded-full hover:opacity-90"><CheckmarkIcon className="text-lg" /></button>
            )}
        </div>
    );
};

interface DestinationRowProps {
    label: string | React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    onConfirm?: () => void;
    onRemove?: () => void;
    isConfirmed?: boolean;
    invalid?: boolean;
    followingBlocks: Block[];
    followingQuestions: Question[];
    className?: string;
    [key: string]: any;
}

const DestinationRow: React.FC<DestinationRowProps> = ({ label, value, onChange, onConfirm, onRemove, isConfirmed = true, invalid = false, followingBlocks, followingQuestions, className = '', ...rest }) => (
    <div className={`flex items-center gap-2 ${className}`} {...rest}>
        <span className="text-sm text-on-surface flex-shrink-0">{label}</span>
        <div className="relative flex-1">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className={`w-full bg-transparent border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none ${invalid ? 'border-error' : 'border-input-border'}`}
            >
                <option value="">Select destination...</option>
                <optgroup label="Default">
                    <option value="end">End of Survey</option>
                </optgroup>
                {followingBlocks.length > 0 && (
                    <optgroup label="Blocks">
                        {followingBlocks.map(block => (
                            <option key={block.id} value={`block:${block.id}`}>{block.bid}: {truncate(block.title, 50)}</option>
                        ))}
                    </optgroup>
                )}
                {followingQuestions.length > 0 && (
                    <optgroup label="Questions">
                        {followingQuestions.map(q => <option key={q.id} value={q.id}>{q.qid}: {truncate(q.text, 50)}</option>)}
                    </optgroup>
                )}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
        </div>
        {onRemove && <button onClick={onRemove} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full"><XIcon className="text-lg" /></button>}
        {!isConfirmed && onConfirm && <button onClick={onConfirm} className="p-1.5 bg-primary text-on-primary rounded-full hover:opacity-90"><CheckmarkIcon className="text-lg" /></button>}
    </div>
);

// ====================================================================================
// Block-specific Display Logic Editor
// ====================================================================================
interface BlockDisplayLogicEditorProps {
    block: Block;
    survey: Survey;
    onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
    onExpandSidebar: () => void;
}

const BlockDisplayLogicEditor: React.FC<BlockDisplayLogicEditorProps> = ({ block, survey, onUpdateBlock, onExpandSidebar }) => {
    const displayLogic = block.draftDisplayLogic ?? block.displayLogic;
    const [validationErrors, setValidationErrors] = useState<Map<string, Set<keyof DisplayLogicCondition>>>(new Map());
    const [isPasting, setIsPasting] = useState(false);

    const previousQuestions = useMemo(() => {
        const allBlocks = survey.blocks;
        const currentBlockIndex = allBlocks.findIndex(b => b.id === block.id);
        if (currentBlockIndex === -1) return [];

        return allBlocks
            .slice(0, currentBlockIndex)
            .flatMap(b => b.questions)
            .filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak);
    }, [survey, block.id]);

    const handleUpdate = (updates: Partial<Block>) => {
        onUpdateBlock(block.id, updates);
    };

    const handleAddDisplayLogic = () => {
        const newCondition: DisplayLogicCondition = {
            id: generateId('cond'),
            questionId: '',
            operator: '',
            value: '',
            isConfirmed: false,
        };
        handleUpdate({
            displayLogic: {
                operator: displayLogic?.operator || 'AND',
                conditions: [...(displayLogic?.conditions || []), newCondition],
            },
        });
        onExpandSidebar();
    };

    const handlePasteLogic = (text: string): { success: boolean; error?: string } => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const newConditions: DisplayLogicCondition[] = [];
        const validOperators = ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const lineNum = i + 1;
            const lineParts = line.split(/\s+/);
            const [qidCandidate, operator, ...valueParts] = lineParts;
            const value = valueParts.join(' ');

            if (!qidCandidate || !operator) {
                return { success: false, error: `Line ${lineNum}: Syntax error. Use "QuestionID operator value".` };
            }

            const qid = qidCandidate.toUpperCase();
            if (!previousQuestions.some(q => q.qid === qid)) {
                return { success: false, error: `Line ${lineNum}: Question "${qid}" is not a valid preceding question.` };
            }

            const operatorCleaned = operator.toLowerCase();
            if (!validOperators.includes(operatorCleaned)) {
                return { success: false, error: `Line ${lineNum}: Operator "${operator}" is not recognized.` };
            }

            const requiresValue = !['is_empty', 'is_not_empty'].includes(operatorCleaned);
            if (requiresValue && !value.trim()) {
                return { success: false, error: `Line ${lineNum}: Missing value for operator "${operator}".` };
            }

            newConditions.push({ id: generateId('cond'), questionId: qid, operator: operatorCleaned as DisplayLogicCondition['operator'], value: value.trim(), isConfirmed: true });
        }

        if (newConditions.length > 0) {
            handleUpdate({
                displayLogic: {
                    operator: displayLogic?.operator || 'AND',
                    conditions: [...(displayLogic?.conditions || []), ...newConditions],
                },
            });
            onExpandSidebar();
            return { success: true };
        }
        return { success: false, error: "No valid logic found." };
    };

    const handleConfirmCondition = (conditionId: string) => {
        if (!displayLogic) return;
        const condition = displayLogic.conditions.find(c => c.id === conditionId);
        if (!condition) return;

        const tempErrors = new Set<keyof DisplayLogicCondition>();
        if (!condition.questionId) tempErrors.add('questionId');
        if (!condition.operator) tempErrors.add('operator');

        const requiresValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
        if (!String(condition.value).trim() && requiresValue) {
            tempErrors.add('value');
        }

        if (tempErrors.size > 0) {
            setValidationErrors(prev => new Map(prev).set(conditionId, tempErrors));
            return;
        }

        const newConditions = displayLogic.conditions.map(c => c.id === conditionId ? { ...c, isConfirmed: true } : c);
        handleUpdate({ displayLogic: { ...displayLogic, conditions: newConditions } });
        setValidationErrors(prev => {
            const newErrors = new Map(prev);
            newErrors.delete(conditionId);
            return newErrors;
        });
    };

    const handleUpdateCondition = (index: number, field: keyof DisplayLogicCondition, value: any) => {
        if (!displayLogic) return;
        const newConditions = [...displayLogic.conditions];
        newConditions[index] = { ...newConditions[index], [field]: value, isConfirmed: false };
        if (field === 'questionId') {
            newConditions[index].value = '';
            newConditions[index].operator = '';
        }
        handleUpdate({ displayLogic: { ...displayLogic, conditions: newConditions } });
    };

    const handleRemoveCondition = (index: number) => {
        if (!displayLogic) return;
        const newConditions = displayLogic.conditions.filter((_, i) => i !== index);
        handleUpdate({ displayLogic: newConditions.length > 0 ? { ...displayLogic, conditions: newConditions } : undefined });
    };

    const setLogicOperator = (operator: 'AND' | 'OR') => {
        if (!displayLogic) return;
        handleUpdate({ displayLogic: { ...displayLogic, operator } });
    };

    if (!displayLogic || displayLogic.conditions.length === 0) {
        return (
            <div>
                <h3 className="text-sm font-medium text-on-surface mb-1">Display Logic</h3>
                <p className="text-xs text-on-surface-variant mb-3">Control when this block is shown to respondents.</p>
                {isPasting ? (
                    <PasteInlineForm
                        onSave={handlePasteLogic}
                        onCancel={() => setIsPasting(false)}
                        placeholder={"Q1 equals Yes\nQ2 not_equals 5"}
                        primaryActionLabel="Add Display Logic"
                        disclosureText="Enter one condition per line (e.g., Q1 equals Yes)."
                    />
                ) : (
                    <div className="flex items-center gap-4">
                        <button onClick={handleAddDisplayLogic} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors">
                            <PlusIcon className="text-base" />
                            Add Display Logic
                        </button>
                        <CopyAndPasteButton onClick={() => setIsPasting(true)} />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                    <h3 className="text-sm font-medium text-on-surface">Display Logic</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">Control when this block is shown to respondents.</p>
                </div>
                <button
                    onClick={() => handleUpdate({ displayLogic: undefined, draftDisplayLogic: undefined })}
                    className="text-sm font-medium text-error hover:underline px-2 py-1 rounded-md hover:bg-error-container/50"
                >
                    Remove
                </button>
            </div>

            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-on-surface">Show this block if:</p>
                    {displayLogic.conditions.length > 1 && (
                        <div className="flex gap-1">
                            <button onClick={() => setLogicOperator('AND')} className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${displayLogic.operator === 'AND' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>AND</button>
                            <button onClick={() => setLogicOperator('OR')} className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${displayLogic.operator === 'OR' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high border border-outline text-on-surface'}`}>OR</button>
                        </div>
                    )}
                </div>
                <button onClick={handleAddDisplayLogic} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors">
                    <PlusIcon className="text-base" />
                    Add condition
                </button>
            </div>

            <div className="space-y-2 mb-3">
                {displayLogic.conditions.map((condition, index) => (
                    <LogicConditionRow
                        key={condition.id || index}
                        condition={condition}
                        onUpdateCondition={(field, value) => handleUpdateCondition(index, field, value)}
                        onRemoveCondition={() => handleRemoveCondition(index)}
                        onConfirm={() => handleConfirmCondition(condition.id)}
                        availableQuestions={previousQuestions}
                        isConfirmed={condition.isConfirmed === true}
                        invalidFields={validationErrors.get(condition.id)}
                    />
                ))}
            </div>
        </div>
    );
};

// ====================================================================================
// Block-specific Skip Logic Editor (was named BranchingLogicEditor)
// ====================================================================================
interface BlockSkipLogicEditorProps {
    block: Block;
    survey: Survey;
    onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
    onExpandSidebar: () => void;
}

const BlockSkipLogicEditor: React.FC<BlockSkipLogicEditorProps> = ({ block, survey, onUpdateBlock, onExpandSidebar }) => {
    const branchingLogic = block.draftBranchingLogic ?? block.branchingLogic;
    const [validationErrors, setValidationErrors] = useState<Map<string, Set<keyof BranchingLogicCondition | 'skipTo'>>>(new Map());
    const [isPasting, setIsPasting] = useState(false);

    const questionsForConditions = useMemo(() =>
        survey.blocks
            .flatMap(b => b.id === block.id ? [] : b.questions)
            .filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak),
        [survey, block.id]
    );

    const currentBlockIndex = useMemo(() => survey.blocks.findIndex(b => b.id === block.id), [survey, block.id]);
    const followingBlocks = useMemo(() => survey.blocks.slice(currentBlockIndex + 1), [survey, currentBlockIndex]);
    const followingQuestions = useMemo(() => followingBlocks.flatMap(b => b.questions).filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak), [followingBlocks]);

    const handleUpdate = (updates: Partial<Block>) => {
        onUpdateBlock(block.id, updates);
    };

    const handlePasteLogic = (text: string): { success: boolean; error?: string } => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const newBranches: BranchingLogicBranch[] = [];
        const validOperators = ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const lineNum = i + 1;

            const parts = line.split(/ THEN SKIP TO | -> /i);
            if (parts.length !== 2) {
                return { success: false, error: `Line ${lineNum}: Invalid syntax. Use "IF <condition> THEN SKIP TO <destination>" or "<condition> -> <destination>".` };
            }

            let conditionStr = parts[0].trim();
            const destinationStr = parts[1].trim();

            if (conditionStr.toLowerCase().startsWith('if ')) {
                conditionStr = conditionStr.substring(3).trim();
            }

            const condParts = conditionStr.split(/\s+/);
            const [qidCandidate, operator, ...valueParts] = condParts;
            const value = valueParts.join(' ');

            if (!qidCandidate || !operator) { return { success: false, error: `Line ${lineNum}: Invalid condition syntax.` }; }

            const qid = qidCandidate.toUpperCase();
            if (!questionsForConditions.some(q => q.qid === qid)) {
                return { success: false, error: `Line ${lineNum}: Question "${qid}" is not a valid question for logic.` };
            }

            const operatorCleaned = operator.toLowerCase();
            if (!validOperators.includes(operatorCleaned)) { return { success: false, error: `Line ${lineNum}: Operator "${operator}" is not recognized.` }; }

            const requiresValue = !['is_empty', 'is_not_empty'].includes(operatorCleaned);
            if (requiresValue && !value.trim()) { return { success: false, error: `Line ${lineNum}: Missing value for operator "${operator}".` }; }

            const condition: BranchingLogicCondition = {
                id: generateId('cond'), questionId: qid,
                operator: operatorCleaned as BranchingLogicCondition['operator'],
                value: value.trim(), isConfirmed: true,
            };

            let thenSkipTo = '';
            const destUpper = destinationStr.toUpperCase();
            if (destUpper === 'END') { thenSkipTo = 'end'; }
            else if (destUpper.startsWith('BL')) {
                const block = survey.blocks.find(b => b.bid === destUpper);
                if (block) { thenSkipTo = `block:${block.id}`; }
                else { return { success: false, error: `Line ${lineNum}: Destination block "${destinationStr}" not found.` }; }
            } else if (destUpper.startsWith('Q')) {
                const question = survey.blocks.flatMap(b => b.questions).find(q => q.qid === destUpper);
                if (question) { thenSkipTo = question.id; }
                else { return { success: false, error: `Line ${lineNum}: Destination question "${destinationStr}" not found.` }; }
            } else { return { success: false, error: `Line ${lineNum}: Invalid destination "${destinationStr}". Use a Block ID (BL2), Question ID (Q5), or "End".` }; }

            newBranches.push({
                id: generateId('branch'), operator: 'AND', conditions: [condition],
                thenSkipTo, thenSkipToIsConfirmed: true
            });
        }

        if (newBranches.length > 0) {
            handleUpdate({
                branchingLogic: {
                    branches: [...(branchingLogic?.branches || []), ...newBranches],
                    otherwiseSkipTo: 'next', // This is for block logic, so 'next' isn't applicable. Maybe default to nothing.
                    otherwiseIsConfirmed: branchingLogic?.otherwiseIsConfirmed || true,
                },
            });
            onExpandSidebar();
            return { success: true };
        }

        return { success: false, error: "No valid logic found." };
    };

    if (!branchingLogic) {
        return (
            <div>
                <p className="text-xs text-on-surface-variant mb-3">Create rules to skip this entire block based on previous answers.</p>
                {isPasting ? (
                    <PasteInlineForm
                        onSave={handlePasteLogic}
                        onCancel={() => setIsPasting(false)}
                        placeholder={"IF Q1 equals Yes THEN SKIP TO BL4\nQ2 is_empty -> End"}
                        primaryActionLabel="Add Skip Logic"
                        disclosureText="Enter one rule per line."
                    />
                ) : (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                handleUpdate({
                                    branchingLogic: {
                                        branches: [{
                                            id: generateId('branch'), operator: 'AND',
                                            conditions: [{ id: generateId('cond'), questionId: '', operator: '', value: '', isConfirmed: false }],
                                            thenSkipTo: '', thenSkipToIsConfirmed: false,
                                        }],
                                        otherwiseSkipTo: '',
                                        otherwiseIsConfirmed: true,
                                    }
                                });
                                onExpandSidebar();
                            }}
                            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            <PlusIcon className="text-base" /> Add Skip Logic
                        </button>
                        <CopyAndPasteButton onClick={() => setIsPasting(true)} />
                    </div>
                )}
            </div>
        );
    }

    const handleUpdateBranch = (branchId: string, updates: Partial<BranchingLogicBranch>) => {
        const newBranches = branchingLogic.branches.map(b => b.id === branchId ? { ...b, ...updates } : b);
        handleUpdate({ branchingLogic: { ...branchingLogic, branches: newBranches } });
    };

    const handleUpdateCondition = (branchId: string, conditionId: string, field: keyof BranchingLogicCondition, value: any) => {
        const branch = branchingLogic.branches.find(b => b.id === branchId);
        if (!branch) return;
        const newConditions = branch.conditions.map(c => c.id === conditionId ? { ...c, [field]: value, isConfirmed: false } : c);
        handleUpdateBranch(branchId, { conditions: newConditions, thenSkipToIsConfirmed: false });
    };

    const handleAddCondition = (branchId: string) => {
        const branch = branchingLogic.branches.find(b => b.id === branchId);
        if (!branch) return;
        const newCondition: BranchingLogicCondition = { id: generateId('cond'), questionId: '', operator: '', value: '', isConfirmed: false };
        handleUpdateBranch(branchId, { conditions: [...branch.conditions, newCondition] });
    };

    const handleRemoveCondition = (branchId: string, conditionId: string) => {
        const branch = branchingLogic.branches.find(b => b.id === branchId);
        if (!branch || branch.conditions.length <= 1) return;
        const newConditions = branch.conditions.filter(c => c.id !== conditionId);
        handleUpdateBranch(branchId, { conditions: newConditions });
    };

    const handleConfirmBranch = (branchId: string) => {
        const branch = branchingLogic.branches.find(b => b.id === branchId);
        if (!branch) return;

        const newValidationErrors = new Map(validationErrors);
        let isBranchValid = true;
        branch.conditions.forEach(c => {
            const errors = new Set<keyof BranchingLogicCondition>();
            if (!c.questionId) errors.add('questionId');
            if (!c.operator) errors.add('operator');
            if (!['is_empty', 'is_not_empty'].includes(c.operator) && !c.value) errors.add('value');
            if (errors.size > 0) {
                newValidationErrors.set(c.id, errors);
                isBranchValid = false;
            } else {
                newValidationErrors.delete(c.id);
            }
        });
        if (!branch.thenSkipTo) {
            newValidationErrors.set(branch.id, new Set(['skipTo']));
            isBranchValid = false;
        } else {
            newValidationErrors.delete(branch.id);
        }
        setValidationErrors(newValidationErrors);

        if (isBranchValid) {
            const newConditions = branch.conditions.map(c => ({ ...c, isConfirmed: true }));
            handleUpdateBranch(branchId, { conditions: newConditions, thenSkipToIsConfirmed: true });
        }
    };

    const handleAddBranch = () => {
        const newBranch: BranchingLogicBranch = {
            id: generateId('branch'), operator: 'AND',
            conditions: [{ id: generateId('cond'), questionId: '', operator: '', value: '', isConfirmed: false }],
            thenSkipTo: '', thenSkipToIsConfirmed: false
        };
        handleUpdate({ branchingLogic: { ...branchingLogic, branches: [...branchingLogic.branches, newBranch] } });
    };

    const handleRemoveBranch = (branchId: string) => {
        const newBranches = branchingLogic.branches.filter(b => b.id !== branchId);
        if (newBranches.length === 0) {
            handleUpdate({ branchingLogic: undefined });
        } else {
            handleUpdate({ branchingLogic: { ...branchingLogic, branches: newBranches } });
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                    <p className="text-xs text-on-surface-variant">Create rules to skip this entire block based on previous answers.</p>
                </div>
                <button onClick={() => handleUpdate({ branchingLogic: undefined, draftBranchingLogic: undefined })} className="text-sm font-medium text-error hover:underline">Remove</button>
            </div>
            <div className="space-y-4">
                {branchingLogic.branches.map((branch) => (
                    <div key={branch.id} className="p-3 border border-outline-variant rounded-md bg-surface-container">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="font-bold text-primary">IF</span>
                                <div className="pl-4">
                                    {branch.conditions.length > 1 && (
                                        <select value={branch.operator} onChange={e => handleUpdateBranch(branch.id, { operator: e.target.value as 'AND' | 'OR' })} className="text-xs font-semibold p-1 rounded-md bg-transparent border border-input-border mb-2">
                                            <option value="AND">All conditions are met (AND)</option>
                                            <option value="OR">Any condition is met (OR)</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => handleRemoveBranch(branch.id)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full"><XIcon className="text-lg" /></button>
                        </div>
                        <div className="space-y-2 mb-3">
                            {branch.conditions.map((condition, index) => (
                                <LogicConditionRow
                                    key={condition.id || index}
                                    condition={condition}
                                    onUpdateCondition={(field, value) => handleUpdateCondition(branch.id, condition.id, field, value)}
                                    onRemoveCondition={() => handleRemoveCondition(branch.id, condition.id)}
                                    onConfirm={() => handleConfirmBranch(branch.id)}
                                    availableQuestions={questionsForConditions}
                                    isConfirmed={condition.isConfirmed === true}
                                    invalidFields={validationErrors.get(condition.id)}
                                />
                            ))}
                            <button onClick={() => handleAddCondition(branch.id)} className="text-xs font-medium text-primary hover:underline ml-1">+ Add condition</button>
                        </div>

                        <div className="flex items-center gap-2 pl-4 border-l-2 border-outline-variant ml-2">
                            <span className="text-xs font-bold text-on-surface-variant">THEN SKIP TO</span>
                            <DestinationRow
                                label=""
                                value={branch.thenSkipTo}
                                onChange={(val) => handleUpdateBranch(branch.id, { thenSkipTo: val, thenSkipToIsConfirmed: false })}
                                onConfirm={() => handleConfirmBranch(branch.id)}
                                isConfirmed={branch.thenSkipToIsConfirmed === true}
                                invalid={validationErrors.get(branch.id)?.has('skipTo')}
                                followingBlocks={followingBlocks}
                                followingQuestions={followingQuestions}
                                className="flex-1"
                            />
                        </div>
                    </div>
                ))}

                <div className="pt-2">
                    <button onClick={handleAddBranch} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                        <PlusIcon className="text-base" /> Add Rule (OR)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function BlockEditor({ block, survey, onClose, onUpdateBlock, isExpanded, onToggleExpand, onExpandSidebar, focusTarget, onFocusHandled }: BlockEditorProps) {
    const [activeTab, setActiveTab] = useState<'Display' | 'Skip'>('Display');

    // Handle focus target
    useEffect(() => {
        if (focusTarget && focusTarget.type === 'block' && focusTarget.id === block.id) {
            if (focusTarget.element === 'logic') {
                // Logic focusing is handled by expanding the relevant section
            }
            onFocusHandled();
        }
    }, [focusTarget, block.id, onFocusHandled]);

    return (
        <div className={`bg-surface border-b border-outline-variant transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 space-y-6">
                <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Block Title</label>
                    <input
                        type="text"
                        value={block.title}
                        onChange={(e) => onUpdateBlock(block.id, { title: e.target.value })}
                        className="w-full bg-surface border border-outline rounded-md px-3 py-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                    />
                </div>

                <div>
                    <div className="flex border-b border-outline-variant mb-4">
                        <button
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Display' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                            onClick={() => setActiveTab('Display')}
                        >
                            Display Logic
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Skip' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                            onClick={() => setActiveTab('Skip')}
                        >
                            Skip Logic
                        </button>
                    </div>

                    {activeTab === 'Display' ? (
                        <BlockDisplayLogicEditor block={block} survey={survey} onUpdateBlock={onUpdateBlock} onExpandSidebar={onExpandSidebar} />
                    ) : (
                        <BlockSkipLogicEditor block={block} survey={survey} onUpdateBlock={onUpdateBlock} onExpandSidebar={onExpandSidebar} />
                    )}
                </div>
            </div>
        </div>
    );
}