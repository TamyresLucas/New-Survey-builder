import React, { useMemo } from 'react';
import type { Survey, Question, DisplayLogic, SkipLogic, BranchingLogic, DisplayLogicCondition, BranchingLogicCondition, LogicSet, LogicIssue } from '../types';
import { EyeIcon, ArrowRightAltIcon, CallSplitIcon, DoubleArrowRightIcon, WarningIcon, XIcon } from './icons';
import { truncate, parseChoice } from '../utils';

// ... helpers ... (unchanged)
const findQuestionByQid = (survey: Survey, qid: string): Question | undefined => {
    return survey.blocks.flatMap(b => b.questions).find(q => q.qid === qid);
};

const findQuestionById = (survey: Survey, id: string): Question | undefined => {
    return survey.blocks.flatMap(b => b.questions).find(q => q.id === id);
};

const formatDestination = (destination: string, survey: Survey): string => {
    if (destination === 'next') return 'Next Question';
    if (destination === 'end') return 'End of Survey';

    if (destination.startsWith('block:')) {
        const blockId = destination.substring(6);
        const block = survey.blocks.find(b => b.id === blockId);
        return block ? `Block ${block.bid}: ${truncate(block.title, 30)}` : 'an unknown block';
    }

    const question = findQuestionById(survey, destination);
    return question ? `${question.qid}: ${truncate(question.text, 30)}` : 'an unknown location';
};

const formatCondition = (condition: DisplayLogicCondition | BranchingLogicCondition, survey: Survey): string => {
    const question = findQuestionByQid(survey, condition.questionId);
    const qText = question ? question.qid : 'Unknown Q';
    const operatorMap = {
        equals: '=',
        not_equals: '≠',
        contains: 'contains',
        greater_than: '>',
        less_than: '<',
        is_empty: 'is empty',
        is_not_empty: 'is not empty'
    };
    const operator = operatorMap[condition.operator] || condition.operator;
    if (['is_empty', 'is_not_empty'].includes(condition.operator)) {
        return `${qText} ${operator}`;
    }
    return `${qText} ${operator} "${condition.value}"`;
};

const formatLogicSet = (set: LogicSet, survey: Survey): string => {
    const conditions = set.conditions.map(c => formatCondition(c, survey));
    if (conditions.length === 0) return '';
    const joined = conditions.join(` <span class="font-bold text-primary">${set.operator}</span> `);
    return `(${joined})`;
};

// Helper for Issue Card
const IssueCard: React.FC<{ issues: LogicIssue[] }> = ({ issues }) => {
    if (issues.length === 0) return null;

    return (
        <div className="flex items-center gap-2 p-3 rounded-[4px] border border-[#EF576B] bg-[#FEEFF1] text-[#232323] mt-3">
            <WarningIcon className="text-base text-[#CF455C] flex-shrink-0" />
            <div className="flex-1 text-sm font-normal font-['Open_Sans']">
                {Array.from(new Set(issues.map(i => i.message))).map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
        </div>
    );
};

// --- Display Logic Component ---
export const DisplayLogicDisplay: React.FC<{ logic: DisplayLogic; survey: Survey; onClick: (id?: string) => void; onRemove: () => void; issues?: LogicIssue[]; isFocused?: boolean; focusedId?: string | null; readOnly?: boolean }> = ({ logic, survey, onClick, onRemove, issues = [], isFocused = false, focusedId, readOnly = false }) => {
    const confirmedConditions = logic.conditions.filter(c => c.isConfirmed === true);
    const confirmedSets = logic.logicSets?.filter(s => s.isConfirmed === true) || [];

    if (confirmedConditions.length === 0 && confirmedSets.length === 0) {
        return null;
    }

    return (
        <div
            className={`mt-4 p-3 border rounded-md bg-surface-container-high relative group/logic transition-colors cursor-pointer ${isFocused ? 'border-primary ring-1 ring-primary' : 'border-outline-variant'}`}
            onClick={() => onClick()}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <EyeIcon className="text-lg text-primary" />
                    <h4 className="text-sm font-semibold text-on-surface">Display Logic</h4>
                </div>
                {!readOnly && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="w-6 h-6 flex items-center justify-center rounded-md text-error hover:bg-error-container opacity-0 group-hover/logic:opacity-100 transition-opacity"
                        title="Remove Display Logic"
                    >
                        <XIcon className="text-base" />
                    </button>
                )}
            </div>
            <div className="pl-2 space-y-1 text-sm text-on-surface-variant">
                <p className="mb-1">Show this question if:</p>
                <div className="flex flex-wrap gap-2 items-center">
                    {confirmedConditions.map((c, index) => (
                        <React.Fragment key={c.id}>
                            {index > 0 && <span className="font-semibold text-primary">{logic.operator}</span>}
                            <span
                                onClick={(e) => { e.stopPropagation(); onClick(c.id); }}
                                className={`font-semibold text-on-surface cursor-pointer hover:text-primary hover:underline bg-surface px-1.5 py-0.5 rounded border transition-colors ${focusedId === c.id ? 'border-primary ring-1 ring-primary' : 'border-transparent hover:border-outline'}`}
                            >
                                {formatCondition(c, survey)}
                            </span>
                        </React.Fragment>
                    ))}
                    {confirmedSets.map((s, index) => (
                        <React.Fragment key={s.id}>
                            {(confirmedConditions.length > 0 || index > 0) && <span className="font-semibold text-primary">{logic.operator}</span>}
                            <span
                                onClick={(e) => { e.stopPropagation(); onClick(s.id); }}
                                className={`font-semibold text-on-surface cursor-pointer hover:text-primary hover:underline bg-surface px-1.5 py-0.5 rounded border transition-colors ${focusedId === s.id ? 'border-primary ring-1 ring-primary' : 'border-transparent hover:border-outline'}`}
                                dangerouslySetInnerHTML={{ __html: formatLogicSet(s, survey) }}
                            />
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <IssueCard issues={issues} />
        </div>
    );
};

// ... SkipLogicDisplay, BranchingLogicDisplay, SurveyFlowDisplay (unchanged) ...
export const SkipLogicDisplay: React.FC<{ logic: SkipLogic; currentQuestion: Question; survey: Survey; onClick: () => void; onRemove: () => void; issues?: LogicIssue[]; isFocused?: boolean; readOnly?: boolean }> = ({ logic, currentQuestion, survey, onClick, onRemove, issues = [], isFocused = false, readOnly = false }) => {
    if (logic.type === 'simple' && logic.isConfirmed !== true) return null;

    const confirmedRules = logic.type === 'per_choice'
        ? logic.rules.filter(r => r.isConfirmed === true)
        : [];

    if (logic.type === 'per_choice' && confirmedRules.length === 0) return null;
    if (logic.type === 'simple' && logic.isConfirmed !== true) return null;

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove();
    };

    return (
        <div
            onClick={onClick}
            className={`mt-4 p-3 border rounded-md bg-surface-container-high cursor-pointer group/skiplogic transition-colors ${isFocused ? 'border-primary ring-1 ring-primary' : 'border-outline-variant'}`}
        >
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <DoubleArrowRightIcon className="text-lg text-primary" />
                    <h4 className="text-sm font-semibold text-on-surface">Skip Logic</h4>
                </div>
                <div className="flex items-center gap-2">
                    {!readOnly && (
                        <button
                            onClick={handleRemove}
                            className="w-6 h-6 flex items-center justify-center rounded-md text-error hover:bg-error-container opacity-0 group-hover/skiplogic:opacity-100 transition-opacity"
                            title="Remove Skip Logic"
                        >
                            <XIcon className="text-base" />
                        </button>
                    )}
                </div>
            </div>
            <div className="pl-2 space-y-1 text-sm text-on-surface-variant">
                {logic.type === 'simple' && logic.isConfirmed && (
                    <p>If answered → skip to <span className="font-semibold text-on-surface">{formatDestination(logic.skipTo, survey)}</span>.</p>
                )}
                {logic.type === 'per_choice' && currentQuestion.choices?.map(choice => {
                    const rule = confirmedRules.find(r => r.choiceId === choice.id);
                    if (!rule) return null;
                    const { label: choiceLabel } = parseChoice(choice.text);
                    return (
                        <p key={choice.id}>If "<span className="font-semibold text-on-surface">{truncate(choiceLabel, 20)}</span>" is selected → skip to <span className="font-semibold text-on-surface">{formatDestination(rule.skipTo, survey)}</span>.</p>
                    );
                })}
            </div>
            <IssueCard issues={issues} />
        </div>
    );
};


export const BranchingLogicDisplay: React.FC<{ logic: BranchingLogic; survey: Survey; onClick: (id?: string) => void; onRemove: () => void; question: Question; issues?: LogicIssue[]; isFocused?: boolean; focusedId?: string | null; readOnly?: boolean }> = ({ logic, survey, onClick, onRemove, question, issues = [], isFocused = false, focusedId, readOnly = false }) => {
    const showOtherwise = useMemo(() => {
        if (!question.choices || question.choices.length === 0) return true;
        const usedChoiceTexts = new Set<string>();
        if (logic) {
            for (const branch of logic.branches) {
                if (branch.thenSkipToIsConfirmed) {
                    for (const condition of branch.conditions) {
                        if (condition.questionId === question.qid && condition.isConfirmed && condition.value) {
                            usedChoiceTexts.add(condition.value);
                        }
                    }
                }
            }
        }
        return usedChoiceTexts.size < question.choices.length;
    }, [logic, question.qid, question.choices]);

    const hasAnyConfirmedLogic = logic.branches.some(branch =>
        (branch.thenSkipToIsConfirmed && branch.conditions.some(c => c.isConfirmed === true))
    ) || (showOtherwise && logic.otherwiseIsConfirmed);

    if (!hasAnyConfirmedLogic) return null;

    return (
        <div
            className={`mt-4 p-3 border rounded-md group/branching transition-colors cursor-pointer ${isFocused ? 'border-primary ring-1 ring-primary' : 'border-outline-variant'}`}
            onClick={() => onClick()}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <CallSplitIcon className="text-lg text-primary" />
                    <h4 className="text-sm font-semibold text-on-surface transition-colors">Branching Logic</h4>
                </div>
                {!readOnly && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="w-6 h-6 flex items-center justify-center rounded-md text-error hover:bg-error-container opacity-0 group-hover/branching:opacity-100 transition-opacity"
                        title="Remove Branching Logic"
                    >
                        <XIcon className="text-base" />
                    </button>
                )}
            </div>
            <div className="space-y-2 text-sm">
                {logic.branches.map((branch) => {
                    const confirmedConditions = branch.conditions.filter(c => c.isConfirmed === true);
                    if (confirmedConditions.length === 0 || !branch.thenSkipToIsConfirmed) return null;
                    return (
                        <div
                            key={branch.id}
                            onClick={(e) => { e.stopPropagation(); onClick(branch.id); }}
                            className={`p-2 bg-surface rounded-md cursor-pointer border transition-colors ${focusedId === branch.id ? 'border-primary ring-1 ring-primary' : 'border-transparent hover:border-outline'}`}
                        >
                            {branch.pathName && <span className="font-semibold text-on-surface">{branch.pathName}: </span>}
                            <span className="font-semibold text-primary">IF </span>
                            <span>{confirmedConditions.map((c, index) => (
                                <React.Fragment key={c.id}>
                                    {index > 0 && <span className="font-semibold text-primary"> {branch.operator} </span>}
                                    <span
                                        onClick={(e) => { e.stopPropagation(); onClick(branch.id); }}
                                        className="font-semibold hover:text-primary hover:underline cursor-pointer"
                                    >
                                        {formatCondition(c, survey)}
                                    </span>
                                </React.Fragment>
                            ))}</span>
                            <span className="font-semibold text-primary"> THEN </span>
                            <span>skip to <span className="font-semibold">{formatDestination(branch.thenSkipTo, survey)}</span>.</span>
                        </div>
                    );
                })}
                {showOtherwise && logic.otherwiseIsConfirmed && (
                    <div className="p-2 bg-surface rounded-md">
                        {logic.otherwisePathName && <span className="font-semibold text-on-surface">{logic.otherwisePathName}: </span>}
                        <span className="font-semibold text-on-surface-variant">OTHERWISE </span>
                        <span>skip to <span className="font-semibold">{formatDestination(logic.otherwiseSkipTo, survey)}</span>.</span>
                    </div>
                )}
            </div>
            <IssueCard issues={issues} />
        </div>
    );
};

export const SurveyFlowDisplay: React.FC<{ logic: SkipLogic; survey: Survey; onClick: () => void; }> = ({ logic, survey, onClick }) => {
    if (logic.type !== 'simple' || logic.isConfirmed !== true) return null;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
    };

    return (
        <div
            onClick={handleClick}
            className="p-3 border border-outline-variant rounded-md bg-surface-container-high cursor-pointer hover:border-primary"
        >
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <ArrowRightAltIcon className="text-lg text-primary" />
                    <h4 className="text-sm font-bold text-on-surface">Survey Flow</h4>
                </div>
            </div>
            <div className="pl-2 space-y-1 text-sm text-on-surface-variant">
                <p>Default path → <span className="font-semibold text-on-surface">{formatDestination(logic.skipTo, survey)}</span>.</p>
            </div>
        </div>
    );
};