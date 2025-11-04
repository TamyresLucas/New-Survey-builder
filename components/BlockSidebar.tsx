import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Block, Survey, Question, QuestionRandomizationRule, RandomizationPattern, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition, LogicIssue, DisplayLogic, DisplayLogicCondition } from '../types';
import { QuestionType } from '../types';
import { XIcon, ChevronDownIcon, PlusIcon, ExpandIcon, CollapseIcon, CheckmarkIcon, ArrowRightAltIcon, CallSplitIcon, ContentPasteIcon, InfoIcon } from './icons';
import { generateId, truncate, parseChoice, CHOICE_BASED_QUESTION_TYPES } from '../utils';

interface BlockSidebarProps {
  block: Block;
  survey: Survey;
  onClose: () => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onExpandSidebar: () => void;
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
    const questionBorderClass = invalidFields.has('questionId') ? 'border-error' : 'border-outline focus:outline-primary';
    const operatorBorderClass = invalidFields.has('operator') ? 'border-error' : 'border-outline focus:outline-primary';
    const valueBorderClass = invalidFields.has('value') ? 'border-error' : 'border-outline focus:outline-primary';

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
                    className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none ${questionBorderClass}`} 
                >
                    <option value="">select question</option>
                    {availableQuestions.map(q => <option key={q.id} value={q.qid}>{q.qid}: {truncate(q.text, 50)}</option>)}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
            </div>
            <div className="relative w-40 flex-shrink-0">
                <select 
                    value={condition.operator} 
                    onChange={handleOperatorChange} 
                    className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none ${operatorBorderClass}`} 
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
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
            </div>
            <div className="relative flex-1 min-w-[150px]">
                {isChoiceBasedInput && referencedQuestion?.choices ? (
                     <div className="relative">
                        <select
                            value={condition.value}
                            onChange={(e) => onUpdateCondition('value', e.target.value)}
                            className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none disabled:bg-surface-container-high ${valueBorderClass}`}
                            disabled={valueIsDisabled}
                        >
                            <option value="">select answer</option>
                            {referencedQuestion.choices.map(choice => (
                                <option key={choice.id} value={choice.text}>{parseChoice(choice.text).label}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                     </div>
                ) : (
                    <input 
                        type={isNumericInput ? "number" : "text"} 
                        value={condition.value} 
                        onChange={(e) => onUpdateCondition('value', e.target.value)} 
                        placeholder="select answer"
                        className={`w-full bg-surface border rounded-md px-2 py-1.5 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 disabled:bg-surface-container-high ${valueBorderClass}`}
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
                className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none ${invalid ? 'border-error' : 'border-outline'}`}
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
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
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
        const lines = text.split('\n').filter(line => line.trim());
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
        if (requiresValue && !String(condition.value).trim()) tempErrors.add('value');

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
        const lines = text.split('\n').filter(line => line.trim());
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
                 const question = survey.blocks.flatMap(b=>b.questions).find(q => q.qid === destUpper);
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
                                        <select value={branch.operator} onChange={e => handleUpdateBranch(branch.id, { operator: e.target.value as 'AND' | 'OR' })} className="text-xs font-semibold p-1 rounded-md bg-surface-container-high border border-outline mb-2">
                                            <option value="AND">All conditions are met (AND)</option>
                                            <option value="OR">Any condition is met (OR)</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => handleRemoveBranch(branch.id)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full"><XIcon className="text-lg"/></button>
                        </div>
                        <div className="space-y-2 mb-3">
                            {branch.conditions.map((condition, index) => (
                                <LogicConditionRow
                                    key={condition.id}
                                    condition={condition}
                                    onUpdateCondition={(field, value) => handleUpdateCondition(branch.id, condition.id, field, value)}
                                    onRemoveCondition={branch.conditions.length > 1 ? () => handleRemoveCondition(branch.id, condition.id) : undefined}
                                    onConfirm={() => handleConfirmBranch(branch.id)}
                                    availableQuestions={questionsForConditions}
                                    isConfirmed={condition.isConfirmed === true}
                                    invalidFields={validationErrors.get(condition.id)}
                                />
                            ))}
                            <button onClick={() => handleAddCondition(branch.id)} className="text-xs font-medium text-primary hover:underline">+ Add condition</button>
                        </div>
                        <DestinationRow
                            label={<span className="font-bold text-primary">THEN SKIP TO</span>}
                            value={branch.thenSkipTo}
                            onChange={(value) => handleUpdateBranch(branch.id, { thenSkipTo: value, thenSkipToIsConfirmed: false })}
                            onConfirm={() => handleConfirmBranch(branch.id)}
                            isConfirmed={branch.thenSkipToIsConfirmed}
                            invalid={validationErrors.has(branch.id)}
                            followingBlocks={followingBlocks}
                            followingQuestions={followingQuestions}
                        />
                    </div>
                ))}
            </div>
            <button onClick={handleAddBranch} className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"><PlusIcon className="text-base" /> Add branch</button>
        </div>
    );
};


// ====================================================================================
// MAIN SIDEBAR COMPONENT
// ====================================================================================

export const BlockSidebar: React.FC<BlockSidebarProps> = ({ block, survey, onClose, onUpdateBlock, isExpanded, onToggleExpand, onExpandSidebar }) => {
  const [activeTab, setActiveTab] = useState('Settings');
  const [title, setTitle] = useState(block.title);
  const [sectionName, setSectionName] = useState(block.sectionName || block.title);

  const tabs = ['Settings', 'Behavior', 'Advanced'];

  useEffect(() => {
    setTitle(block.title);
    setSectionName(block.sectionName || block.title);
  }, [block]);

  const surveyPaths = useMemo(() => {
    const paths = new Set<string>();
    survey.blocks.forEach(b => {
      b.questions.forEach(q => {
        if (q.branchingLogic) {
          q.branchingLogic.branches.forEach(branch => {
            if (branch.pathName) paths.add(branch.pathName);
          });
          if (q.branchingLogic.otherwisePathName) {
            paths.add(q.branchingLogic.otherwisePathName);
          }
        }
      });
    });
    return Array.from(paths);
  }, [survey]);

  const questionGroups = useMemo(() => {
    const groups = new Set<string>();
    survey.blocks.forEach(b => {
        b.questions.forEach(q => {
            if (q.groupName) {
                groups.add(q.groupName);
            }
        });
    });
    return Array.from(groups).sort();
  }, [survey]);

  const handleTitleBlur = () => {
    if (title.trim() && title.trim() !== block.title) {
      onUpdateBlock(block.id, { title: title.trim() });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLTextAreaElement).blur();
    } else if (e.key === 'Escape') {
      setTitle(block.title);
      (e.target as HTMLTextAreaElement).blur();
    }
  };

  const handleSectionNameBlur = () => {
    if (sectionName.trim() !== block.sectionName) {
      onUpdateBlock(block.id, { sectionName: sectionName.trim() || undefined });
    }
  };

  const handleSectionNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
        setSectionName(block.sectionName || block.title);
        (e.target as HTMLInputElement).blur();
    }
  };

  const handleIsSectionToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    onUpdateBlock(block.id, { 
      isSurveySection: isChecked,
      // If turning on and no custom name exists, default it to block title
      sectionName: isChecked && !block.sectionName ? block.title : block.sectionName
    });
  };

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="block-title" className="block text-sm font-medium text-on-surface-variant mb-1">
          Block Title
        </label>
        <textarea
          id="block-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          rows={2}
          className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
          placeholder="Enter block title..."
        />
      </div>
      <div>
        <label htmlFor="survey-path" className="block text-sm font-medium text-on-surface-variant mb-1">
          Survey Path
        </label>
        <div className="relative">
          <select
            id="survey-path"
            value={block.branchName || ''}
            onChange={e => onUpdateBlock(block.id, { branchName: e.target.value || undefined })}
            className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
          >
            <option value="">None</option>
            {surveyPaths.map(path => (
              <option key={path} value={path}>{path}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
        </div>
        <p className="text-xs text-on-surface-variant mt-1">Associate this block with a survey path.</p>
      </div>
      <div>
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <label htmlFor="set-as-section" className="text-sm font-medium text-on-surface block">
                    Set as survey section
                </label>
                <p className="text-xs text-on-surface-variant mt-0.5">Display a section header for this block.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="set-as-section" checked={block.isSurveySection || false} onChange={handleIsSectionToggle} className="sr-only peer" />
                <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
        </div>
        {block.isSurveySection && (
          <div className="mt-4 pl-4 border-l-2 border-outline-variant">
            <label htmlFor="section-name" className="block text-sm font-medium text-on-surface-variant mb-1">
              Section Name
            </label>
            <input
              type="text"
              id="section-name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              onBlur={handleSectionNameBlur}
              onKeyDown={handleSectionNameKeyDown}
              className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
              placeholder="Enter section name..."
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderBehaviorTab = () => (
    <div className="space-y-8">
        <CollapsibleSection title="Looping" defaultExpanded={true}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <label htmlFor="enable-looping" className="text-sm font-medium text-on-surface block">
                        Enable question looping
                    </label>
                    <p className="text-xs text-on-surface-variant mt-0.5">Repeat the questions in this block.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                    type="checkbox"
                    id="enable-looping"
                    checked={block.loopingEnabled || false}
                    onChange={e => onUpdateBlock(block.id, { loopingEnabled: e.target.checked })}
                    className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
            {block.loopingEnabled && (
            <div className="mt-4 pl-4 border-l-2 border-outline-variant">
                <label htmlFor="max-loop-size" className="block text-sm font-medium text-on-surface-variant mb-1">
                Max. Loop Size
                </label>
                <input
                type="number"
                id="max-loop-size"
                value={block.maxLoopSize || ''}
                onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                    onUpdateBlock(block.id, { maxLoopSize: value });
                }}
                className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                placeholder="e.g., 5"
                min="1"
                />
            </div>
            )}
        </CollapsibleSection>
        <CollapsibleSection title="Logic" defaultExpanded={true}>
            <div className="divide-y divide-outline-variant">
                <div className="py-6 first:pt-0">
                    <BlockDisplayLogicEditor
                        block={block}
                        survey={survey}
                        onUpdateBlock={onUpdateBlock}
                        onExpandSidebar={onExpandSidebar}
                    />
                </div>
                <div className="py-6 first:pt-0">
                    <h3 className="text-sm font-medium text-on-surface mb-1">Skip Logic</h3>
                    <BlockSkipLogicEditor
                        block={block}
                        survey={survey}
                        onUpdateBlock={onUpdateBlock}
                        onExpandSidebar={onExpandSidebar}
                    />
                </div>
            </div>
        </CollapsibleSection>
    </div>
  );

  const renderAdvancedTab = () => {
    // Handlers for Question Randomization
    const handleToggleRandomization = (enabled: boolean) => {
      if (enabled) {
        onExpandSidebar();
        // If turning on and there are no rules, add a default rule.
        if (!block.questionRandomization || block.questionRandomization.length === 0) {
            const newRule: QuestionRandomizationRule = {
                id: generateId('rand'),
                startQuestionId: '',
                endQuestionId: '',
                pattern: 'permutation',
            };
            onUpdateBlock(block.id, {
                questionRandomization: [newRule],
            });
        }
      } else {
        // Turning off
        onUpdateBlock(block.id, {
            questionRandomization: undefined,
        });
      }
    };

    const handleAddRandomizationRule = () => {
        const newRule: QuestionRandomizationRule = {
            id: generateId('rand'),
            startQuestionId: '',
            endQuestionId: '',
            pattern: 'permutation',
        };
        onUpdateBlock(block.id, {
            questionRandomization: [...(block.questionRandomization || []), newRule],
        });
    };
    
    const handleUpdateRandomizationRule = (ruleId: string, updates: Partial<QuestionRandomizationRule>) => {
        const newRules = (block.questionRandomization || []).map(rule =>
            rule.id === ruleId ? { ...rule, ...updates } : rule
        );
        onUpdateBlock(block.id, { questionRandomization: newRules });
    };

    const handleRemoveRandomizationRule = (ruleId: string) => {
        const newRules = (block.questionRandomization || []).filter(rule => rule.id !== ruleId);
        onUpdateBlock(block.id, { questionRandomization: newRules.length > 0 ? newRules : undefined });
    };

    return (
        <div className="space-y-6">
            {/* Question Randomization Section */}
            <div>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <label htmlFor="enable-randomization" className="text-sm font-medium text-on-surface block">
                            Enable question randomization
                        </label>
                        <p className="text-xs text-on-surface-variant mt-0.5">Randomize the order of questions in this block.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                        type="checkbox"
                        id="enable-randomization"
                        checked={!!block.questionRandomization}
                        onChange={e => handleToggleRandomization(e.target.checked)}
                        className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                {block.questionRandomization && (
                    <div className="mt-4 space-y-4">
                        <button onClick={handleAddRandomizationRule} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                            <PlusIcon className="text-base" /> Add randomization
                        </button>
                        <div className="space-y-3">
                            {isExpanded && (
                                <div className="grid grid-cols-[1fr,1fr,1fr,1fr,auto] gap-2 text-xs font-medium text-on-surface-variant px-2">
                                    <label>Start question</label>
                                    <label>End question</label>
                                    <label>Pattern</label>
                                    <label>Question Group</label>
                                </div>
                            )}
                            <div className="space-y-2">
                                {block.questionRandomization.map((rule) => {
                                    const questionsInBlock = block.questions.filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak);
                                    const startQuestionIndex = questionsInBlock.findIndex(q => q.id === rule.startQuestionId);
                                    const endQuestionOptions = startQuestionIndex !== -1
                                        ? questionsInBlock.slice(startQuestionIndex + 1)
                                        : [];
                                    
                                    const showGroupSelect = rule.pattern === 'permutation' || rule.pattern === 'rotation' || rule.pattern === 'synchronized';
                                    const gridCols = isExpanded 
                                        ? 'grid-cols-[1fr,1fr,1fr,1fr,auto]' 
                                        : (showGroupSelect ? 'grid-cols-[1fr,1fr,1fr,1fr,auto]' : 'grid-cols-[1fr,1fr,1fr,auto]');

                                    return (
                                        <div key={rule.id} className={`grid ${gridCols} items-center gap-2`}>
                                            {/* Start Question */}
                                            <div className="relative">
                                                <select
                                                    value={rule.startQuestionId}
                                                    onChange={e => handleUpdateRandomizationRule(rule.id, { startQuestionId: e.target.value, endQuestionId: '' })}
                                                    className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                                >
                                                    <option value="">{isExpanded ? 'Select start...' : 'Start Q'}</option>
                                                    {questionsInBlock.map(q => <option key={q.id} value={q.id}>{q.qid}: {truncate(q.text, 20)}</option>)}
                                                </select>
                                                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                                            </div>
                                            {/* End Question */}
                                            <div className="relative">
                                                <select
                                                    value={rule.endQuestionId}
                                                    onChange={e => handleUpdateRandomizationRule(rule.id, { endQuestionId: e.target.value })}
                                                    disabled={!rule.startQuestionId}
                                                    className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none disabled:bg-surface-container-highest"
                                                >
                                                    <option value="">{isExpanded ? 'Select end...' : 'End Q'}</option>
                                                    {endQuestionOptions.map(q => <option key={q.id} value={q.id}>{q.qid}: {truncate(q.text, 20)}</option>)}
                                                </select>
                                                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                                            </div>
                                            {/* Pattern */}
                                            <div className="relative">
                                                <select
                                                    value={rule.pattern}
                                                    onChange={e => {
                                                        const newPattern = e.target.value as RandomizationPattern;
                                                        const updates: Partial<QuestionRandomizationRule> = { pattern: newPattern };
                                                        if (newPattern !== 'permutation' && newPattern !== 'rotation' && newPattern !== 'synchronized') {
                                                            updates.questionGroupId = undefined;
                                                        }
                                                        handleUpdateRandomizationRule(rule.id, updates);
                                                    }}
                                                    className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                                >
                                                    <option value="permutation">Permutation</option>
                                                    <option value="rotation">Rotation</option>
                                                    <option value="synchronized">Synchronized</option>
                                                    <option value="reverse_order">Reverse order</option>
                                                </select>
                                                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                                            </div>
                                            {/* Question Group (Conditional) */}
                                            <div className={`relative ${!showGroupSelect && 'hidden'} ${isExpanded && 'col-start-4'}`}>
                                                <select
                                                    value={rule.questionGroupId || ''}
                                                    onChange={e => handleUpdateRandomizationRule(rule.id, { questionGroupId: e.target.value || undefined })}
                                                    className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                                >
                                                    <option value="">{isExpanded ? 'Select group...' : 'Group'}</option>
                                                    {questionGroups.map(group => <option key={group} value={group}>{group}</option>)}
                                                </select>
                                                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                                            </div>
                                            {/* Remove Button */}
                                            <button onClick={() => handleRemoveRandomizationRule(rule.id)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full">
                                                <XIcon className="text-lg" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <aside className="w-full h-full bg-surface-container border-l border-outline-variant flex flex-col">
      <header className="p-4 border-b border-outline-variant flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          Edit Block {block.bid}
        </h2>
        <div className="flex items-center gap-2">
            <button onClick={onToggleExpand} className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high" aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}>
                {isExpanded ? <CollapseIcon className="text-xl" /> : <ExpandIcon className="text-xl" />}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high" aria-label="Close panel">
            <XIcon className="text-xl" />
            </button>
        </div>
      </header>

      <div className="border-b border-outline-variant px-4">
          <nav className="-mb-px flex space-x-4">
              {tabs.map(tab => (
                  <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
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

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'Settings' && renderSettingsTab()}
        {activeTab === 'Behavior' && renderBehaviorTab()}
        {activeTab === 'Advanced' && renderAdvancedTab()}
      </div>
    </aside>
  );
};
