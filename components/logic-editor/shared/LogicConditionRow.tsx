import React, { useMemo } from 'react';
import type { Question, DisplayLogicCondition, BranchingLogicCondition, LogicIssue } from '../../../types';
import { QuestionType } from '../../../types';
import { CHOICE_BASED_QUESTION_TYPES, parseChoice, truncate } from '../../../utils';
import { XIcon, ChevronDownIcon, CheckmarkIcon, InfoIcon, PlusIcon } from '../../icons';

export const LogicConditionRow: React.FC<{
    condition: DisplayLogicCondition | BranchingLogicCondition;
    onUpdateCondition: (field: keyof (DisplayLogicCondition | BranchingLogicCondition), value: any) => void;
    onRemoveCondition?: () => void;
    onAddCondition?: () => void;
    onConfirm?: () => void;
    availableQuestions: Question[];
    isConfirmed: boolean;
    issues?: LogicIssue[];
    invalidFields?: Set<keyof (DisplayLogicCondition | BranchingLogicCondition) | 'skipTo'>;
    isFirstCondition?: boolean;
    currentQuestion?: Question;
    usedValues?: Set<string>;
    questionWidth?: string;
    operatorWidth?: string;
    valueWidth?: string;
}> = ({ 
    condition, 
    onUpdateCondition, 
    onRemoveCondition, 
    onAddCondition,
    onConfirm, 
    availableQuestions, 
    isConfirmed, 
    issues = [], 
    invalidFields = new Set(), 
    isFirstCondition = false, 
    currentQuestion, 
    usedValues,
    questionWidth = "w-48",
    operatorWidth = "w-40",
    valueWidth = "flex-1 min-w-[150px]"
}) => {
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
            if ('gridValue' in condition) {
                onUpdateCondition('gridValue', '');
            }
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
        <div className="flex items-center gap-2 p-2 rounded-md w-full">
            {/* 1. Question */}
            <div className={`relative group/tooltip ${questionWidth} flex-shrink-0`}>
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
                            <option value="">Question</option>
                            {availableQuestions.map(q => <option key={q.id} value={q.qid}>{q.qid}: {truncate(q.text, 30)}</option>)}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    </>
                )}
                <Tooltip issue={questionIssue} />
            </div>

            {referencedQuestion?.type === QuestionType.ChoiceGrid && referencedQuestion.choices && referencedQuestion.scalePoints ? (
            <>
                {/* 2. Row Select (for ChoiceGrid) */}
                <div className={`relative group/tooltip ${valueWidth}`}>
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
                <div className={`relative group/tooltip ${operatorWidth} flex-shrink-0`}>
                    <select 
                        value={condition.operator} 
                        onChange={handleOperatorChange} 
                        className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none ${operatorBorderClass}`} 
                        aria-label="Select interaction"
                        disabled={!referencedQuestion}
                    >
                        <option value="">Interaction</option>
                        {availableOperators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    <Tooltip issue={operatorIssue} />
                </div>

                {/* 4. Value Select (for ChoiceGrid) */}
                <div className={`relative group/tooltip ${valueWidth}`}>
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
                <div className={`relative group/tooltip ${operatorWidth} flex-shrink-0`}>
                    <select 
                        value={condition.operator} 
                        onChange={handleOperatorChange} 
                        className={`w-full bg-surface border rounded-md px-2 py-1.5 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 appearance-none ${operatorBorderClass}`} 
                        aria-label="Select interaction"
                        disabled={!referencedQuestion}
                    >
                        <option value="">Interaction</option>
                        {availableOperators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl" />
                    <Tooltip issue={operatorIssue} />
                </div>
                {/* 2. Value / Answer */}
                <div className={`relative group/tooltip ${valueWidth}`}>
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
             {onAddCondition && (
                <button onClick={onAddCondition} className="p-1.5 text-primary hover:text-on-primary hover:bg-primary rounded-full transition-colors flex-shrink-0" aria-label="Add condition below">
                    <PlusIcon className="text-lg" />
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