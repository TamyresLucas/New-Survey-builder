import React, { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Survey, Question, Choice, DisplayLogicCondition, SkipLogicRule, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition, LogicIssue, Block, DisplayLogic, SkipLogic, ChoiceDisplayLogic, ChoiceDisplayCondition, RandomizationMethod, ChoiceEliminationLogic, ActionLogic, Workflow } from '../types';
import { QuestionType } from '../types';
import { generateId, parseChoice, CHOICE_BASED_QUESTION_TYPES, truncate, isBranchingLogicExhaustive } from '../utils';
import { 
    XIcon, PlusIcon, ChevronDownIcon,
    InfoIcon, ContentPasteIcon, CheckmarkIcon, DoubleArrowRightIcon, CallSplitIcon, ShuffleIcon, HideSourceIcon
} from './icons';

// ====================================================================================
// SHARED HELPER COMPONENTS
// ====================================================================================

export const PasteInlineForm: React.FC<{
  onSave: (text: string) => { success: boolean; error?: string };
  onCancel: () => void;
  placeholder: string;
  primaryActionLabel: string;
  disclosureText: string;
  helpTopic?: string;
  onRequestGeminiHelp?: (topic: string) => void;
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
        {helpTopic && onRequestGeminiHelp && (
            <button onClick={() => onRequestGeminiHelp(helpTopic)} className="text-primary hover:underline font-medium">learn more</button>
        )}
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


export const CopyAndPasteButton: React.FC<{ onClick: () => void; className?: string; disabled?: boolean; }> = ({ onClick, className = 'text-sm', disabled = false }) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className={`flex items-center gap-1 ${className} font-medium text-primary hover:underline transition-colors disabled:text-on-surface-variant disabled:no-underline disabled:cursor-not-allowed`}
    >
        <ContentPasteIcon className="text-base" />
        <span>Copy and paste</span>
    </button>
);


export const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultExpanded?: boolean }> = ({ title, children, defaultExpanded = true }) => {
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

export const LogicConditionRow: React.FC<{
    condition: DisplayLogicCondition | BranchingLogicCondition;
    onUpdateCondition: (field: keyof (DisplayLogicCondition | BranchingLogicCondition), value: any) => void;
    onRemoveCondition?: () => void;
    onConfirm?: () => void;
    availableQuestions: Question[];
    isConfirmed: boolean;
    issues?: LogicIssue[];
    invalidFields?: Set<keyof (DisplayLogicCondition | BranchingLogicCondition) | 'skipTo'>;
    isFirstCondition?: boolean;
    currentQuestion?: Question;
    usedValues?: Set<string>;
}> = ({ condition, onUpdateCondition, onRemoveCondition, onConfirm, availableQuestions, isConfirmed, issues = [], invalidFields = new Set(), isFirstCondition = false, currentQuestion, usedValues }) => {
    const referencedQuestion = useMemo(() => {
        if (isFirstCondition && currentQuestion) {
            return currentQuestion;
        }
        return availableQuestions.find(q => q.qid === condition.questionId);
    }, [isFirstCondition, currentQuestion, availableQuestions, condition.questionId]);
    
    const isNumericInput = referencedQuestion?.type === QuestionType.NumericAnswer;
    const isChoiceBasedInput = referencedQuestion && CHOICE_BASED_QUESTION_TYPES.has(referencedQuestion.type);

    const availableOperators = useMemo(() => {
        const defaultOperators = [
            { value: 'equals', label: 'equals' }, { value: 'not_equals', label: 'not equals' },
            { value: 'is_empty', label: 'is empty' }, { value: 'is_not_empty', label: 'is not empty' },
        ];

        if (!referencedQuestion) {
            return [
                ...defaultOperators,
                { value: 'contains', label: 'contains' },
                { value: 'greater_than', label: 'greater than' },
                { value: 'less_than', label: 'less than' },
            ];
        }

        switch(referencedQuestion.type) {
            case QuestionType.ChoiceGrid:
                return [
                    { value: 'equals', label: 'equals' }, 
                    { value: 'not_equals', label: 'not equals' },
                    { value: 'greater_than', label: 'is more' },
                    { value: 'less_than', label: 'is less' },
                    { value: 'is_empty', label: 'is empty' },
                    { value: 'is_not_empty', label: 'is not empty' },
                ];
            case QuestionType.Radio:
            case QuestionType.Checkbox:
            case QuestionType.DropDownList: {
                let operators = [
                    { value: 'equals', label: 'is selected' }, { value: 'not_equals', label: 'is not selected' },
                    { value: 'is_empty', label: 'is empty' }, { value: 'is_not_empty', label: 'is not empty' },
                ];
                
                if (referencedQuestion.type === QuestionType.Radio && referencedQuestion.forceResponse) {
                    operators = operators.filter(op => op.value !== 'is_empty' && op.value !== 'is_not_empty');
                }

                return operators;
            }
            case QuestionType.NumericAnswer:
            case QuestionType.Slider:
            case QuestionType.StarRating:
                 return [
                    { value: 'equals', label: 'equals' }, { value: 'not_equals', label: 'not equals' },
                    { value: 'greater_than', label: 'greater than' }, { value: 'less_than', label: 'less than' },
                ];
            case QuestionType.TextEntry:
                return [
                    ...defaultOperators, { value: 'contains', label: 'contains' },
                ];
            default:
                 return defaultOperators;
        }
    }, [referencedQuestion]);
    
    type ConditionField = keyof (DisplayLogicCondition | BranchingLogicCondition);

    const getFieldIssue = (fieldName: ConditionField) => issues.find(i => i.field === fieldName);
    
    const questionIssue = getFieldIssue('questionId');
    const operatorIssue = getFieldIssue('operator');
    const valueIssue = getFieldIssue('value');

    const questionBorderClass = invalidFields.has('questionId') || questionIssue ? 'border-error' : 'border-outline focus:outline-primary';
    const operatorBorderClass = invalidFields.has('operator') || operatorIssue ? 'border-error' : 'border-outline focus:outline-primary';
    const valueBorderClass = invalidFields.has('value') || valueIssue ? 'border-error' : 'border-outline focus:outline-primary';

    const valueIsDisabled = !referencedQuestion || ['is_empty', 'is_not_empty'].includes(condition.operator);

    const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newOperator = e.target.value;
        onUpdateCondition('operator', newOperator);
        if (['is_empty', 'is_not_empty'].includes(newOperator)) {
            onUpdateCondition('value', '');
            onUpdateCondition('gridValue', '');
        }
    };

    const Tooltip: React.FC<{ issue?: LogicIssue }> = ({ issue }) => {
        if (!issue) return null;
        return (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-surface-container-highest text-on-surface text-xs rounded-md p-2 shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20">
                {issue.message}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-surface-container-highest"></div>
            </div>
        );
    };

    return (
        <div className="flex items-center gap-2 p-2 bg-surface-container-high rounded-md min-w-max">
            {/* 1. Question */}
            <div className="relative group/tooltip w-48 flex-shrink-0">
                {isFirstCondition && currentQuestion ? (
                    <div 
                        title={`${currentQuestion.qid}: ${currentQuestion.text}`}
                        className="w-full bg-surface-container-high border border-outline rounded-md px-2 py-1.5 text-sm text-on-surface-variant flex items-center gap-2 cursor-not-allowed"
                    >
                        <span className="font-semibold">{currentQuestion.qid}:</span>
                        <span className="truncate">{truncate(currentQuestion.text, 50)}</span>
                    </div>
                ) : (
                    <>
                        <select 
                            value={condition.questionId} 
                            onChange={(e) => onUpdateCondition('questionId', e.target.value)} 
                            className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none ${questionBorderClass}`} 
                            aria-label="Select question"
                        >
                            <option value="">select question</option>
                            {availableQuestions.map(q => <option key={q.id} value={q.qid}>{q.qid}: {truncate(q.text, 50)}</option>)}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    </>
                )}
                <Tooltip issue={questionIssue} />
            </div>

            {referencedQuestion?.type === QuestionType.ChoiceGrid && referencedQuestion.choices && referencedQuestion.scalePoints ? (
            <>
                {/* 2. Row Select (for ChoiceGrid) */}
                <div className="relative group/tooltip flex-1 min-w-[150px]">
                    <div className="relative">
                        <select
                            value={(condition as BranchingLogicCondition).value}
                            onChange={(e) => onUpdateCondition('value', e.target.value)}
                            className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none disabled:bg-surface-container-high disabled:cursor-not-allowed ${valueBorderClass}`}
                            aria-label="Condition row"
                            disabled={valueIsDisabled}
                        >
                            <option value="">select row</option>
                            {referencedQuestion.choices.map(choice => (
                                <option key={choice.id} value={choice.text}>{parseChoice(choice.text).label}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    </div>
                    <Tooltip issue={valueIssue} />
                </div>

                {/* 3. Operator (for ChoiceGrid) */}
                <div className="relative group/tooltip w-40 flex-shrink-0">
                    <select 
                        value={condition.operator} 
                        onChange={handleOperatorChange} 
                        className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none ${operatorBorderClass}`} 
                        aria-label="Select interaction"
                        disabled={!referencedQuestion}
                    >
                        <option value="">select interaction</option>
                        {availableOperators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    <Tooltip issue={operatorIssue} />
                </div>

                {/* 4. Value Select (for ChoiceGrid) */}
                <div className="relative group/tooltip flex-1 min-w-[150px]">
                    <div className="relative">
                        <select
                            value={(condition as BranchingLogicCondition).gridValue || ''}
                            onChange={(e) => onUpdateCondition('gridValue', e.target.value)}
                            className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none disabled:bg-surface-container-high disabled:cursor-not-allowed ${valueBorderClass}`}
                            aria-label="Condition scale point value"
                            disabled={valueIsDisabled}
                        >
                            <option value="">select value...</option>
                            {referencedQuestion.scalePoints.map((sp, index) => <option key={sp.id} value={sp.id}>{index + 1} - {sp.text}</option>)}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    </div>
                </div>
            </>
            ) : (
            <>
                {/* 3. Operator / Interaction */}
                <div className="relative group/tooltip w-40 flex-shrink-0">
                    <select 
                        value={condition.operator} 
                        onChange={handleOperatorChange} 
                        className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none ${operatorBorderClass}`} 
                        aria-label="Select interaction"
                        disabled={!referencedQuestion}
                    >
                        <option value="">select interaction</option>
                        {availableOperators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    <Tooltip issue={operatorIssue} />
                </div>
                {/* 2. Value / Answer */}
                <div className="relative group/tooltip flex-1 min-w-[150px]">
                    {isChoiceBasedInput && referencedQuestion?.choices ? (
                         <div className="relative">
                            <select
                                value={(condition as BranchingLogicCondition).value}
                                onChange={(e) => onUpdateCondition('value', e.target.value)}
                                className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none disabled:bg-surface-container-high disabled:cursor-not-allowed ${valueBorderClass}`}
                                aria-label="Condition value"
                                disabled={valueIsDisabled}
                            >
                                <option value="">select answer</option>
                                {referencedQuestion.choices.filter(choice => !usedValues?.has(choice.text)).map(choice => (
                                    <option key={choice.id} value={choice.text}>{parseChoice(choice.text).label}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                         </div>
                    ) : (
                        <input 
                            type={isNumericInput ? "number" : "text"} 
                            value={(condition as BranchingLogicCondition).value} 
                            onChange={(e) => onUpdateCondition('value', e.target.value)} 
                            placeholder="select answer"
                            className={`w-full bg-surface border rounded-md px-2 py-1.5 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 disabled:bg-surface-container-high disabled:cursor-not-allowed ${valueBorderClass}`}
                            aria-label="Condition value" 
                            disabled={valueIsDisabled}
                        />
                    )}
                     <Tooltip issue={valueIssue} />
                </div>
            </>
        )}
            
            {onRemoveCondition && (
                <button onClick={onRemoveCondition} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full transition-colors flex-shrink-0" aria-label="Remove condition">
                    <XIcon className="text-lg" />
                </button>
            )}
            {!isConfirmed && onConfirm && (
                <button onClick={onConfirm} className="p-1.5 bg-primary text-on-primary rounded-full hover:opacity-90 transition-colors flex-shrink-0" aria-label="Confirm condition">
                    <CheckmarkIcon className="text-lg" />
                </button>
            )}
        </div>
    );
};

export const DestinationRow: React.FC<{
  label: string | React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  onConfirm?: () => void;
  onRemove?: () => void;
  isConfirmed?: boolean;
  issue?: LogicIssue;
  invalid?: boolean;
  followingBlocks?: Block[];
  followingQuestions: Question[];
  survey?: Survey;
  currentBlockId?: string | null;
  className?: string;
  hideNextQuestion?: boolean;
  usedDestinations?: Set<string>;
  [key: string]: any;
}> = ({ label, value, onChange, onConfirm, onRemove, isConfirmed = true, issue, invalid = false, followingBlocks = [], followingQuestions, survey, currentBlockId, className = '', hideNextQuestion = false, usedDestinations, ...rest }) => {
    const otherBlocks = useMemo(() => {
        if (!survey || !currentBlockId) return followingBlocks;
        return survey.blocks.filter(b => {
            if (b.id === currentBlockId) return false;
            if (usedDestinations?.has(`block:${b.id}`)) return false;
            return true;
        });
    }, [survey, currentBlockId, usedDestinations, followingBlocks]);

    return (
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
                        {!hideNextQuestion && <option value="next">Next Question</option>}
                        <option value="end">End of Survey</option>
                    </optgroup>
                    {otherBlocks.length > 0 && (
                        <optgroup label="Blocks">
                            {otherBlocks.map(block => (
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
};


// ====================================================================================
// QUESTION EDITOR COMPONENTS
// ====================================================================================

// --- Placeholder Components ---
export const ActionEditor: React.FC<any> = () => <div className="p-2 border border-dashed border-outline-variant rounded-md text-center text-xs text-on-surface-variant">Action Editor Placeholder</div>;
export const QuestionGroupEditor: React.FC<any> = () => <div>Question Group Editor Placeholder</div>;

export const ActivateQuestionSection: React.FC<{
  question: Question;
  handleUpdate: (updates: Partial<Question>) => void;
}> = ({ question, handleUpdate }) => {
  const isHidden = question.isHidden || false;
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label htmlFor="activate-question" className="text-sm font-medium text-on-surface block">
            Activate question
          </label>
          <p className="text-xs text-on-surface-variant mt-0.5">Make this question visible to respondents.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="activate-question"
            checked={!isHidden}
            onChange={(e) => handleUpdate({ isHidden: !e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    </div>
  );
};

export const ForceResponseSection: React.FC<{
  question: Question;
  handleUpdate: (updates: Partial<Question>) => void;
}> = ({ question, handleUpdate }) => {
  const isForced = question.forceResponse || false;
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label htmlFor="force-response" className="text-sm font-medium text-on-surface block">
            Force response
          </label>
          <p className="text-xs text-on-surface-variant mt-0.5">Require respondent to answer this question.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="force-response"
            checked={isForced}
            onChange={(e) => handleUpdate({ forceResponse: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    </div>
  );
};

export const RandomizeChoicesEditor: React.FC<{
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
}> = ({ question, onUpdate }) => {
  const answerBehavior = question.answerBehavior || {};
  const isRandomized = answerBehavior.randomizeChoices || false;

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      answerBehavior: {
        ...answerBehavior,
        randomizeChoices: e.target.checked,
        randomizationMethod: e.target.checked ? answerBehavior.randomizationMethod || 'permutation' : undefined
      }
    });
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({
      answerBehavior: {
        ...answerBehavior,
        randomizationMethod: e.target.value as RandomizationMethod,
      }
    });
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-on-surface mb-1">Answer Randomization</h3>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label htmlFor="randomize-choices" className="text-sm font-medium text-on-surface block">
            Randomize choices
          </label>
          <p className="text-xs text-on-surface-variant mt-0.5">Display choices in a random order.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="randomize-choices" checked={isRandomized} onChange={handleToggle} className="sr-only peer" />
          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
      {isRandomized && (
        <div className="mt-4 pl-4 border-l-2 border-outline-variant">
          <label htmlFor="randomization-method" className="block text-sm font-medium text-on-surface-variant mb-1">
            Randomization Method
          </label>
          <div className="relative">
            <select
              id="randomization-method"
              value={answerBehavior.randomizationMethod || 'permutation'}
              onChange={handleMethodChange}
              className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
            >
              <option value="permutation">Permutation</option>
              <option value="random_reverse">Random Reverse</option>
              <option value="reverse_order">Reverse Order</option>
              <option value="sort_by_code">Sort by Code</option>
              <option value="sort_by_text">Sort by Text</option>
              <option value="synchronized">Synchronized</option>
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
};

export const ChoiceEliminationEditor: React.FC<{
  question: Question;
  previousQuestions: Question[];
  onUpdate: (updates: Partial<Question>) => void;
  onAddLogic: () => void;
}> = ({ question, previousQuestions, onUpdate, onAddLogic }) => {
  const choiceEliminationLogic = question.choiceEliminationLogic;

  const handleEnable = () => {
    onUpdate({ choiceEliminationLogic: { sourceQuestionId: '' } });
    onAddLogic();
  };
  
  const handleRemove = () => {
    onUpdate({ choiceEliminationLogic: undefined });
  };
  
  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ choiceEliminationLogic: { sourceQuestionId: e.target.value } });
  };

  const compatibleSourceQuestions = useMemo(() => 
    previousQuestions.filter(q => 
      q.choices && q.choices.length > 0 && 
      (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox || q.type === QuestionType.DropDownList)
    ), 
  [previousQuestions]);

  if (!choiceEliminationLogic) {
    return (
      <div>
        <h3 className="text-sm font-medium text-on-surface mb-1">Carry Forward Choices</h3>
        <p className="text-xs text-on-surface-variant mb-3">Only show choices that were NOT selected in a previous question.</p>
        <button onClick={handleEnable} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors">
            <PlusIcon className="text-base" />
            Add carry forward rule
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-medium text-on-surface">Carry Forward Choices</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Only show choices that were NOT selected in a previous question.</p>
        </div>
        <button onClick={handleRemove} className="text-sm font-medium text-error hover:underline px-2 py-1 rounded-md hover:bg-error-container/50">
          Remove
        </button>
      </div>
      
      <div className="relative">
        <label htmlFor="carry-forward-source" className="block text-sm font-medium text-on-surface-variant mb-1">
          Source Question
        </label>
        <div className="relative">
          <select
            id="carry-forward-source"
            value={choiceEliminationLogic.sourceQuestionId}
            onChange={handleSourceChange}
            className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
          >
            <option value="">Select a source question...</option>
            {compatibleSourceQuestions.map(q => (
              <option key={q.id} value={q.qid}>{q.qid}: {truncate(q.text, 50)}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
        </div>
      </div>
    </div>
  );
};


// --- Main Logic Editors ---
export const ConditionalLogicEditor: React.FC<any> = () => <div>Conditional Logic Editor Placeholder</div>;
export const SkipLogicEditor: React.FC<any> = () => <div>Skip Logic Editor Placeholder</div>;
export const ChoiceDisplayLogicEditor: React.FC<any> = () => <div>Choice Display Logic Editor Placeholder</div>;

export const WorkflowSectionEditor: React.FC<{
    title: string;
    description: string;
    questionQid: string;
    workflows: Workflow[];
    onUpdateWorkflows: (workflows: Workflow[]) => void;
    onAddWorkflow: () => void;
}> = memo(({ title, description, questionQid, workflows, onUpdateWorkflows, onAddWorkflow }) => {

    const handleAddWorkflow = () => {
        const newWorkflow: Workflow = {
            id: generateId('wf'),
            wid: `${questionQid}-WF${workflows.length + 1}`,
            name: `New Workflow ${workflows.length + 1}`,
            actions: [],
        };
        onUpdateWorkflows([...workflows, newWorkflow]);
        onAddWorkflow();
    };

    const handleUpdateWorkflow = (workflowId: string, updates: Partial<Workflow>) => {
        onUpdateWorkflows(workflows.map(wf => wf.id === workflowId ? { ...wf, ...updates } : wf));
    };

    const handleRemoveWorkflow = (workflowId: string) => {
        onUpdateWorkflows(workflows.filter(wf => wf.id !== workflowId));
    };

    const handleAddAction = (workflowId: string) => {
        const workflow = workflows.find(wf => wf.id === workflowId);
        if (!workflow) return;
        const newAction: ActionLogic = { id: generateId('act'), type: '', isConfirmed: false, params: {} };
        const newActions = [...workflow.actions, newAction];
        handleUpdateWorkflow(workflowId, { actions: newActions });
    };

    const handleUpdateAction = (workflowId: string, actionId: string, updates: Partial<ActionLogic>) => {
        const workflow = workflows.find(wf => wf.id === workflowId);
        if (!workflow) return;
        const newActions = workflow.actions.map(act => act.id === actionId ? { ...act, ...updates, isConfirmed: false } : act);
        handleUpdateWorkflow(workflowId, { actions: newActions });
    };

    const handleRemoveAction = (workflowId: string, actionId: string) => {
        const workflow = workflows.find(wf => wf.id === workflowId);
        if (!workflow) return;
        const newActions = workflow.actions.filter(act => act.id !== actionId);
        handleUpdateWorkflow(workflowId, { actions: newActions });
    };

    const handleConfirmAction = (workflowId: string, actionId: string) => {
        const workflow = workflows.find(wf => wf.id === workflowId);
        if (!workflow) return;
        const newActions = workflow.actions.map(act => act.id === actionId ? { ...act, isConfirmed: true } : act);
        handleUpdateWorkflow(workflowId, { actions: newActions });
    };

    return (
        <div className="py-6 first:pt-0">
            <h3 className="text-sm font-medium text-on-surface">{title}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 mb-3">{description}</p>
            
            <div className="space-y-4">
                {workflows.map(workflow => (
                    <div key={workflow.id} className="p-3 border border-outline-variant rounded-md">
                        <div className="flex items-center justify-between mb-2">
                             <input type="text" value={workflow.name} onChange={e => handleUpdateWorkflow(workflow.id, { name: e.target.value })} className="font-semibold text-on-surface bg-transparent border-b border-transparent focus:border-primary focus:outline-none" />
                            <button onClick={() => handleRemoveWorkflow(workflow.id)} className="p-1 text-on-surface-variant hover:text-error"><XIcon/></button>
                        </div>
                        <div className="space-y-2">
                            {workflow.actions.map(action => (
                                <ActionEditor
                                    key={action.id}
                                    action={action}
                                    onUpdate={(updates: Partial<ActionLogic>) => handleUpdateAction(workflow.id, action.id, updates)}
                                    onRemove={() => handleRemoveAction(workflow.id, action.id)}
                                    onConfirm={() => handleConfirmAction(workflow.id, action.id)}
                                    isConfirmed={action.isConfirmed === true}
                                />
                            ))}
                        </div>
                         <button onClick={() => handleAddAction(workflow.id)} className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                            <PlusIcon className="text-base" />
                            Add action
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={handleAddWorkflow} className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                <PlusIcon className="text-base" />
                Add workflow
            </button>
        </div>
    );
});

// The complete BranchingLogicEditor from the user prompt
export const BranchingLogicEditor: React.FC<{ 
    question: Question;
    survey: Survey;
    previousQuestions: Question[];
    followingQuestions: Question[];
    issues: LogicIssue[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
    onRequestGeminiHelp: (topic: string) => void; 
}> = ({ 
    question, 
    survey, 
    previousQuestions, 
    followingQuestions, 
    issues, 
    onUpdate, 
    onAddLogic, 
    onRequestGeminiHelp 
}) => {
    const branchingLogic = question.draftBranchingLogic ?? question.branchingLogic;

    const currentBlockId = useMemo(() => {
        return survey.blocks.find(b => b.questions.some(q => q.id === question.id))?.id || null;
    }, [survey.blocks, question.id]);

    const handleUpdate = (updates: Partial<Question>) => {
        onUpdate(updates);
    };

    if (!branchingLogic) {
        return null; // This case is handled by the parent component's render logic
    }

    const handleUpdateBranch = (branchId: string, updates: Partial<BranchingLogicBranch>) => {
        const newBranches = branchingLogic.branches.map(b => 
            b.id === branchId ? { ...b, ...updates, thenSkipToIsConfirmed: false } : b
        );
        handleUpdate({ branchingLogic: { ...branchingLogic, branches: newBranches } });
    };

    const handleUpdateCondition = (
        branchId: string, 
        conditionId: string, 
        field: keyof BranchingLogicCondition, 
        value: any
    ) => {
        const branch = branchingLogic.branches.find(b => b.id === branchId);
        if (!branch) return;
        const newConditions = branch.conditions.map(c => 
            c.id === conditionId ? { ...c, [field]: value, isConfirmed: false } : c
        );
        handleUpdateBranch(branchId, { conditions: newConditions });
    };

    const handleAddCondition = (branchId: string) => {
        const branch = branchingLogic.branches.find(b => b.id === branchId);
        if (!branch) return;
        const newCondition: BranchingLogicCondition = { 
            id: generateId('cond'), 
            questionId: '', 
            operator: '', 
            value: '', 
            isConfirmed: false 
        };
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
        const newConditions = branch.conditions.map(c => ({...c, isConfirmed: true}));
        handleUpdateBranch(branchId, {conditions: newConditions, thenSkipToIsConfirmed: true});
    };
    
    const handleAddBranch = () => {
        const newBranch: BranchingLogicBranch = {
            id: generateId('branch'), 
            operator: 'AND',
            conditions: [{ 
                id: generateId('cond'), 
                questionId: '', 
                operator: '', 
                value: '', 
                isConfirmed: false 
            }],
            thenSkipTo: '', 
            thenSkipToIsConfirmed: false
        };
        handleUpdate({ 
            branchingLogic: { 
                ...branchingLogic, 
                branches: [...branchingLogic.branches, newBranch] 
            } 
        });
    };

    const handleRemoveBranch = (branchId: string) => {
        const newBranches = branchingLogic.branches.filter(b => b.id !== branchId);
        if (newBranches.length === 0 && !branchingLogic.otherwiseSkipTo) {
             handleUpdate({ branchingLogic: undefined });
        } else {
            handleUpdate({ branchingLogic: { ...branchingLogic, branches: newBranches } });
        }
    };
    
    const isOtherwiseExhaustive = isBranchingLogicExhaustive(question);

    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                    <p className="text-xs text-on-surface-variant">
                        Create complex paths through the survey based on multiple conditions.
                    </p>
                </div>
                <button 
                    onClick={() => handleUpdate({ 
                        branchingLogic: undefined, 
                        draftBranchingLogic: undefined 
                    })} 
                    className="text-sm font-medium text-error hover:underline"
                >
                    Remove
                </button>
            </div>
            
            <div className="space-y-4">
                {branchingLogic.branches.map((branch) => (
                    <div 
                        key={branch.id} 
                        className="p-3 border border-outline-variant rounded-md bg-surface-container"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="font-bold text-primary">IF</span>
                                <div className="pl-4">
                                    {branch.conditions.length > 1 && (
                                        <select 
                                            value={branch.operator} 
                                            onChange={e => handleUpdateBranch(
                                                branch.id, 
                                                { operator: e.target.value as 'AND' | 'OR' }
                                            )} 
                                            className="text-xs font-semibold p-1 rounded-md bg-surface-container-high border border-outline mb-2"
                                        >
                                            <option value="AND">All conditions are met (AND)</option>
                                            <option value="OR">Any condition is met (OR)</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => handleRemoveBranch(branch.id)} 
                                className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full"
                            >
                                <XIcon className="text-lg"/>
                            </button>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                            {branch.conditions.map((condition, index) => (
                                <LogicConditionRow
                                    key={condition.id}
                                    condition={condition}
                                    onUpdateCondition={(field, value) => 
                                        handleUpdateCondition(branch.id, condition.id, field, value)
                                    }
                                    onRemoveCondition={
                                        branch.conditions.length > 1 
                                            ? () => handleRemoveCondition(branch.id, condition.id) 
                                            : undefined
                                    }
                                    onConfirm={() => handleConfirmBranch(branch.id)}
                                    availableQuestions={previousQuestions}
                                    isConfirmed={condition.isConfirmed || false}
                                    issues={issues.filter(i => i.sourceId === condition.id)}
                                    isFirstCondition={index === 0}
                                    currentQuestion={question}
                                    usedValues={new Set()}
                                />
                            ))}
                            <button 
                                onClick={() => handleAddCondition(branch.id)} 
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                + Add condition
                            </button>
                        </div>
                        
                        <DestinationRow
                            label={<span className="font-bold text-primary">THEN SKIP TO</span>}
                            value={branch.thenSkipTo}
                            onChange={(value) => handleUpdateBranch(
                                branch.id, 
                                { thenSkipTo: value, thenSkipToIsConfirmed: false }
                            )}
                            onConfirm={() => handleConfirmBranch(branch.id)}
                            isConfirmed={branch.thenSkipToIsConfirmed}
                            followingQuestions={followingQuestions}
                            survey={survey}
                            currentBlockId={currentBlockId}
                        />
                    </div>
                ))}
            </div>
            
            <button 
                onClick={handleAddBranch} 
                className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
                <PlusIcon className="text-base" /> Add branch
            </button>
            
            <div className="mt-4 pt-4 border-t border-outline-variant">
                <DestinationRow
                    label={<span className="font-bold text-on-surface-variant">OTHERWISE SKIP TO</span>}
                    value={branchingLogic.otherwiseSkipTo}
                    onChange={(value) => handleUpdate({ 
                        branchingLogic: {
                            ...branchingLogic, 
                            otherwiseSkipTo: value, 
                            otherwiseIsConfirmed: false 
                        }
                    })}
                    onConfirm={() => handleUpdate({ 
                        branchingLogic: {
                            ...branchingLogic, 
                            otherwiseIsConfirmed: true 
                        }
                    })}
                    isConfirmed={branchingLogic.otherwiseIsConfirmed}
                    followingQuestions={followingQuestions}
                    survey={survey}
                    currentBlockId={currentBlockId}
                    hideNextQuestion={isOtherwiseExhaustive}
                />
                {isOtherwiseExhaustive && (
                    <div className="mt-2 p-2 bg-primary-container/20 border border-primary-container/30 rounded-md text-xs text-on-primary-container flex items-start gap-2">
                        <InfoIcon className="text-base flex-shrink-0 mt-0.5" />
                        <span>
                            The 'Otherwise' path is disabled because all choices are covered by a branch rule above.
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};