import React from 'react';
import type { Survey, Question, DisplayLogic, SkipLogic, BranchingLogic, DisplayLogicCondition, BranchingCondition } from '../types';
import { EyeIcon, ArrowRightAltIcon, CallSplitIcon } from './icons';
import { truncate, parseChoice } from '../utils';

// Helper to find a question by its QID
const findQuestionByQid = (survey: Survey, qid: string): Question | undefined => {
    return survey.blocks.flatMap(b => b.questions).find(q => q.qid === qid);
};

// Helper to find a question by its internal ID
const findQuestionById = (survey: Survey, id: string): Question | undefined => {
    return survey.blocks.flatMap(b => b.questions).find(q => q.id === id);
};

// Helper to format a destination
const formatDestination = (destination: string, survey: Survey): string => {
    if (destination === 'next') return 'Next Question';
    if (destination === 'end') return 'End of Survey';
    const question = findQuestionById(survey, destination);
    return question ? `${question.qid}: ${truncate(question.text, 30)}` : 'an unknown location';
};

// Helper to format a single condition
const formatCondition = (condition: DisplayLogicCondition | BranchingCondition, survey: Survey): string => {
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

// --- Display Logic Component ---
export const DisplayLogicDisplay: React.FC<{ logic: DisplayLogic; survey: Survey; onClick: () => void }> = ({ logic, survey, onClick }) => {
    const confirmedConditions = logic.conditions.filter(c => c.isConfirmed === true);

    if (confirmedConditions.length === 0) {
        return null;
    }

    const summary = confirmedConditions.map(c => formatCondition(c, survey)).join(` <span class="font-bold text-primary">${logic.operator}</span> `);

    return (
        <div 
            onClick={onClick}
            className="mt-4 p-3 border border-outline-variant rounded-md bg-surface-container-high cursor-pointer hover:border-primary"
        >
            <div className="flex items-center gap-2 mb-2">
                <EyeIcon className="text-lg text-primary" />
                <h4 className="text-sm font-bold text-on-surface">Display Logic</h4>
            </div>
            <div className="pl-2 space-y-1 text-sm text-on-surface-variant">
                <p>
                    Show this question if: <span className="font-semibold text-on-surface" dangerouslySetInnerHTML={{ __html: summary }} />.
                </p>
            </div>
        </div>
    );
};


// --- Skip Logic Component ---
export const SkipLogicDisplay: React.FC<{ logic: SkipLogic; currentQuestion: Question; survey: Survey; onClick: () => void }> = ({ logic, currentQuestion, survey, onClick }) => {
    if (logic.type === 'simple' && logic.isConfirmed !== true) {
        return null;
    }

    const confirmedRules = logic.type === 'per_choice' 
        ? logic.rules.filter(r => r.isConfirmed === true)
        : [];

    if (logic.type === 'per_choice' && confirmedRules.length === 0) {
        return null;
    }
    
    if (logic.type === 'simple' && logic.isConfirmed !== true) return null;

    return (
        <div 
            onClick={onClick}
            className="mt-4 p-3 border border-outline-variant rounded-md bg-surface-container-high cursor-pointer hover:border-primary"
        >
            <div className="flex items-center gap-2 mb-2">
                <ArrowRightAltIcon className="text-lg text-primary" />
                <h4 className="text-sm font-bold text-on-surface">Skip Logic</h4>
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
        </div>
    );
};


// --- Branching Logic Component ---
export const BranchingLogicDisplay: React.FC<{ logic: BranchingLogic; survey: Survey; onClick: () => void }> = ({ logic, survey, onClick }) => {
    const hasAnyConfirmedLogic = logic.branches.some(branch =>
        (branch.thenSkipToIsConfirmed && branch.conditions.some(c => c.isConfirmed === true))
    ) || logic.otherwiseIsConfirmed;
    
    if (!hasAnyConfirmedLogic) {
        return null;
    }
    
    return (
        <div
            onClick={onClick}
            className="mt-4 p-3 border border-outline-variant rounded-md bg-surface-container-high cursor-pointer hover:border-primary"
        >
            <div className="flex items-center gap-2 mb-2">
                <CallSplitIcon className="text-lg text-primary" />
                <h4 className="text-sm font-bold text-on-surface">Branching Logic</h4>
            </div>
            <div className="pl-2 space-y-2 text-sm">
                {logic.branches.map((branch) => {
                    const confirmedConditions = branch.conditions.filter(c => c.isConfirmed === true);
                    if (confirmedConditions.length === 0 || !branch.thenSkipToIsConfirmed) return null;
                    return (
                        <div key={branch.id} className="p-2 bg-surface rounded-md">
                            <span className="font-bold text-primary">IF </span>
                            <span>{confirmedConditions.map(c => formatCondition(c, survey)).join(` ${branch.operator} `)}</span>
                            <span className="font-bold text-primary"> THEN </span>
                            <span>skip to <span className="font-semibold">{formatDestination(branch.thenSkipTo, survey)}</span>.</span>
                        </div>
                    );
                })}
                {logic.otherwiseIsConfirmed && (
                     <div className="p-2 bg-surface rounded-md">
                        <span className="font-bold text-on-surface-variant">OTHERWISE </span>
                        <span>skip to <span className="font-semibold">{formatDestination(logic.otherwiseSkipTo, survey)}</span>.</span>
                     </div>
                )}
            </div>
        </div>
    );
};