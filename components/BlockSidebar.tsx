import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Block, Survey, Question, QuestionRandomizationRule, RandomizationPattern, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition, LogicIssue, DisplayLogic, DisplayLogicCondition } from '../types';
import { QuestionType } from '../types';
import { XIcon, ChevronDownIcon, PlusIcon, InfoIcon } from './icons';
import { generateId, truncate, parseChoice, isBranchingLogicExhaustive } from '../utils';
import {
    PasteInlineForm,
    CopyAndPasteButton,
    CollapsibleSection,
    LogicConditionRow,
    DestinationRow
} from './LogicEditors';

interface BlockSidebarProps {
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

export const BlockSidebar: React.FC<BlockSidebarProps> = ({ block, survey, onClose, onUpdateBlock, isExpanded, onToggleExpand, onExpandSidebar, focusTarget, onFocusHandled }) => {
  const [activeTab, setActiveTab] = useState('Settings');
  const [title, setTitle] = useState(block.title);
  const [sectionName, setSectionName] = useState(block.sectionName || block.title);
  const continueToRef = useRef<HTMLSelectElement>(null);

  const tabs = ['Settings', 'Behavior', 'Advanced'];

  const lastInteractiveQuestion = useMemo(() => {
    // Find the last question in the block that is not a Page Break or Description
    return [...block.questions]
      .reverse()
      .find(
        (q) =>
          q.type !== QuestionType.PageBreak &&
          q.type !== QuestionType.Description
      );
  }, [block.questions]);

  const isDefaultPathDisabled = useMemo(
    () => isBranchingLogicExhaustive(lastInteractiveQuestion),
    [lastInteractiveQuestion]
  );

  useEffect(() => {
    if (focusTarget?.type === 'block' && focusTarget.id === block.id && focusTarget.element === 'continueTo') {
        setActiveTab(focusTarget.tab);
        
        // Use a timeout to ensure the tab has rendered and the element is visible
        setTimeout(() => {
            if (continueToRef.current) {
                continueToRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                continueToRef.current.focus();
                
                // Add highlight effect
                const parentContainer = continueToRef.current.closest('div.relative');
                if (parentContainer) {
                    parentContainer.classList.add('logic-highlight');
                    setTimeout(() => parentContainer.classList.remove('logic-highlight'), 2500);
                }
            }
            onFocusHandled();
        }, 100);
    }
  }, [focusTarget, block.id, onFocusHandled]);

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

  const localQuestionGroups = useMemo(() => {
    const groups = new Set<string>();
    block.questions.forEach(q => {
        if (q.groupName) {
            groups.add(q.groupName);
        }
    });
    return Array.from(groups).sort();
  }, [block.questions]);

  const globalQuestionGroups = useMemo(() => {
    const allGroups = new Set<string>();
    survey.blocks.forEach(b => {
        if (b.id !== block.id) { // only other blocks
            b.questions.forEach(q => {
                if (q.groupName) {
                    allGroups.add(q.groupName);
                }
            });
        }
    });
    return Array.from(allGroups).sort();
  }, [survey.blocks, block.id]);
  
  const currentBlockIndex = useMemo(() => survey.blocks.findIndex(b => b.id === block.id), [survey.blocks, block.id]);

  const compatibleBlocks = useMemo(() => {
      if (currentBlockIndex === -1) return [];
      
      return survey.blocks.filter((b, index) => 
          index > currentBlockIndex && // Must come after
          b.branchName === block.branchName // Must be in the same path
      );
  }, [survey.blocks, block.id, block.branchName, currentBlockIndex]);

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

  const questionCount = useMemo(() => 
    block.questions.filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak).length,
    [block.questions]
  );

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
        {survey.pagingMode === 'multi-per-page' && (
            <div className="flex items-start gap-3 pt-6 border-t border-outline-variant">
                <input
                    type="checkbox"
                    id="block-auto-page-breaks"
                    className="w-4 h-4 rounded border-outline text-primary focus:ring-primary accent-primary mt-0.5"
                    checked={!!block.automaticPageBreaks}
                    onChange={(e) => onUpdateBlock(block.id, { automaticPageBreaks: e.target.checked })}
                />
                <div>
                    <label htmlFor="block-auto-page-breaks" className="text-sm font-medium text-on-surface block">
                        Automatic page break between questions
                    </label>
                    <p className="text-xs text-on-surface-variant mt-0.5">Applies page breaks between each question within this block.</p>
                </div>
            </div>
        )}
    </div>
  );

  const renderBehaviorTab = () => (
    <div className="space-y-8">
        <CollapsibleSection title="Navigation" defaultExpanded={true}>
            <div className="space-y-6">
                <div>
                    <label htmlFor="continue-to" className={`block text-sm font-medium mb-1 ${isDefaultPathDisabled ? 'text-on-surface-variant/70' : 'text-on-surface-variant'}`}>
                    Continue to
                    </label>
                    <div className="relative">
                    <select
                        id="continue-to"
                        ref={continueToRef}
                        value={block.continueTo || 'next'}
                        onChange={e => onUpdateBlock(block.id, { continueTo: e.target.value })}
                        className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none disabled:bg-surface-container-high disabled:cursor-not-allowed disabled:text-on-surface-variant/70"
                        disabled={isDefaultPathDisabled}
                    >
                        <option value="next">Default (next block)</option>
                        <option value="end">End of Survey</option>
                        {compatibleBlocks.length > 0 && (
                            <optgroup label="Blocks in this path">
                                {compatibleBlocks.map(b => (
                                    <option key={b.id} value={`block:${b.id}`}>
                                        {b.bid}: {truncate(b.title, 50)}
                                    </option>
                                ))}
                            </optgroup>
                        )}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">Define the block's default exit path.</p>
                    {isDefaultPathDisabled && (
                        <div className="mt-2 p-2 bg-primary-container/20 border border-primary-container/30 rounded-md text-xs text-on-primary-container flex items-start gap-2">
                            <InfoIcon className="text-base flex-shrink-0 mt-0.5" />
                            <span>This is disabled because the last question in the block has exhaustive branching logic that defines all possible exits.</span>
                        </div>
                    )}
                </div>
                <div>
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
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <div className="flex-1 pr-4">
                            <label htmlFor="block-auto-advance" className="text-sm font-medium text-on-surface block">
                                Autoadvance
                            </label>
                            <p className="text-xs text-on-surface-variant mt-0.5">Automatically moves to the next page when a question in this block is answered.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="block-auto-advance"
                                checked={!!block.autoAdvance}
                                onChange={(e) => onUpdateBlock(block.id, { autoAdvance: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <div className="flex-1 pr-4">
                            <label htmlFor="block-hide-back-button" className="text-sm font-medium text-on-surface block">
                                Hide back button
                            </label>
                            <p className="text-xs text-on-surface-variant mt-0.5">Prevent respondent from going back from any question in this block.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="block-hide-back-button"
                                checked={!!block.hideBackButton}
                                onChange={(e) => onUpdateBlock(block.id, { hideBackButton: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>
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
                isConfirmed: false,
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
            isConfirmed: false,
        };
        onUpdateBlock(block.id, {
            questionRandomization: [...(block.questionRandomization || []), newRule],
        });
    };
    
    const handleUpdateRandomizationRule = (ruleId: string, updates: Partial<QuestionRandomizationRule>) => {
        const newRules = (block.questionRandomization || []).map(rule => {
            if (rule.id === ruleId) {
                const updatedRule = { ...rule, ...updates, isConfirmed: false };

                // When changing the pattern, reset the group if it's no longer valid.
                if ('pattern' in updates) {
                    const newIsSync = updates.pattern === 'synchronized';
                    const oldIsSync = rule.pattern === 'synchronized';

                    if (newIsSync && !oldIsSync) { // Switched to sync
                        // if current group is a local group, reset it
                        if (localQuestionGroups.includes(rule.questionGroupId || '')) {
                            updatedRule.questionGroupId = undefined;
                        }
                    } else if (!newIsSync && oldIsSync) { // Switched from sync
                        // if current group is a global group, reset it
                        if (globalQuestionGroups.includes(rule.questionGroupId || '')) {
                            updatedRule.questionGroupId = undefined;
                        }
                    }
                }
                return updatedRule;
            }
            return rule;
        });
        onUpdateBlock(block.id, { questionRandomization: newRules });
    };

    const handleConfirmRandomizationRule = (ruleId: string) => {
        const newRules = (block.questionRandomization || []).map(rule =>
            rule.id === ruleId ? { ...rule, isConfirmed: true } : rule
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
                            <div className="space-y-2">
                                {block.questionRandomization.map((rule) => {
                                    const availableQuestions = block.questions.filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak);
                                    const isSync = rule.pattern === 'synchronized';
                                    return (
                                        <div key={rule.id}>
                                            {/* Rule content placeholder */}
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

  const renderContent = () => {
    switch(activeTab) {
      case 'Settings':
        return renderSettingsTab();
      case 'Behavior':
        return renderBehaviorTab();
      case 'Advanced':
        return renderAdvancedTab();
      default:
        return null;
    }
  };

  return (
    <aside className="w-full h-full bg-surface-container border-l border-outline-variant flex flex-col">
      <header className="p-4 border-b border-outline-variant flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          Edit Block {block.bid}
        </h2>
        <div className="flex items-center gap-2">
          {/* Expand/Collapse buttons would go here */}
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
        {renderContent()}
      </div>
    </aside>
  );
};
