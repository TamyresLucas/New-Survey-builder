import { Survey, Block, Question, LogicIssue, DisplayLogicCondition } from '../types';
import { validateSurveyLogic } from '../logicValidator';
import { findDirectEntryConditions } from './geminiContext';
import { parseChoice, generateId } from '../utils';

export const validateLogicChange = (
    name: string,
    args: any,
    survey: Survey
): { ok: boolean, error?: string } => {
    // Run standard validation for loops or skipping backward first
    const dryRunSurvey: Survey = JSON.parse(JSON.stringify(survey));
    const questionInDryRun = dryRunSurvey.blocks.flatMap((b: Block) => b.questions).find((q: Question) => q.qid === args.qid);
    if (!questionInDryRun) return { ok: false, error: 'Internal error during validation.' };

    switch (name) {
        case 'set_skip_logic': {
            const { rules } = args;
            if (rules.length === 1 && !rules[0].choiceText) { // Simple logic
                questionInDryRun.skipLogic = { type: 'simple', skipTo: rules[0].destinationQid, isConfirmed: true };
            } else { // Per-choice
                questionInDryRun.skipLogic = { type: 'per_choice', rules: (questionInDryRun.choices || []).map(() => ({ id: generateId('slr'), choiceId: '', skipTo: '', isConfirmed: true })) };
            }
            break;
        }
    }

    const initialIssues = validateSurveyLogic(survey);
    const newIssues = validateSurveyLogic(dryRunSurvey);
    const initialIssueKeys = new Set(initialIssues.map(i => `${i.questionId}-${i.message}`));

    let criticalNewIssues = newIssues.filter(issue => !initialIssueKeys.has(`${issue.questionId}-${issue.message}`));

    if (criticalNewIssues.length > 0) {
        const errorDetails = criticalNewIssues.map(issue => {
            const q = survey.blocks.flatMap(b => b.questions).find(q => q.id === issue.questionId);
            return `- On question ${q?.qid || 'unknown'}: ${issue.message}`;
        }).join('\n');
        return { ok: false, error: `This change may cause issues on other questions:\n${errorDetails}` };
    }

    // Advanced validation for impossible paths
    if (name === 'set_skip_logic') {
        const { qid, rules } = args;
        const sourceQ = survey.blocks.flatMap(b => b.questions).find(q => q.qid === qid);
        if (!sourceQ) return { ok: true };

        for (const rule of rules) {
            const { destinationQid } = rule;
            if (!destinationQid || ['next', 'end'].includes(destinationQid.toLowerCase())) continue;

            const targetQ = survey.blocks.flatMap(b => b.questions).find(q => q.qid.toLowerCase() === destinationQid.toLowerCase());
            if (!targetQ || !targetQ.displayLogic) continue;

            const targetDisplayConditions = targetQ.displayLogic.conditions.filter(c => c.isConfirmed);
            const entryConditions = findDirectEntryConditions(sourceQ.id, survey);

            if (rule.choiceText && sourceQ.choices) {
                const choice = sourceQ.choices.find(c => parseChoice(c.text).label.toLowerCase() === rule.choiceText.toLowerCase());
                if (choice) {
                    entryConditions.push({
                        id: generateId('inferred'),
                        questionId: sourceQ.qid,
                        operator: 'equals',
                        value: choice.text,
                        isConfirmed: true,
                    });
                }
            }

            const allConditions = [...targetDisplayConditions, ...entryConditions];
            const conditionsByQid = new Map<string, DisplayLogicCondition[]>();
            allConditions.forEach(c => {
                if (!conditionsByQid.has(c.questionId)) conditionsByQid.set(c.questionId, []);
                conditionsByQid.get(c.questionId)!.push(c);
            });

            for (const [conflictingQid, conditions] of conditionsByQid.entries()) {
                if (conditions.length < 2) continue;

                const values = new Set(conditions.filter(c => c.operator === 'equals').map(c => c.value));
                if (values.size > 1) {
                    return { ok: false, error: `This skip logic creates an impossible path. The conditions required to reach ${sourceQ.qid} mean the destination question ${targetQ.qid} would be HIDDEN due to its display logic. The conflict involves question ${conflictingQid}.` };
                }
            }
        }
    }

    return { ok: true };
};

export const validateReposition = (
    args: any,
    survey: Survey,
    logicIssues: LogicIssue[]
): { ok: boolean, error?: string } => {
    const { qid, after_qid, before_qid } = args;

    if (!after_qid && !before_qid) {
        return { ok: false, error: "The destination for the move is unclear. Please specify whether to move it before or after another question." };
    }

    const dryRunSurvey: Survey = JSON.parse(JSON.stringify(survey));

    let draggedQuestion: Question | undefined;
    let originalBlock: Block | undefined;

    for (const block of dryRunSurvey.blocks) {
        const qIndex = block.questions.findIndex((q: Question) => q.qid === qid);
        if (qIndex !== -1) {
            [draggedQuestion] = block.questions.splice(qIndex, 1);
            originalBlock = block;
            break;
        }
    }
    if (!draggedQuestion) return { ok: false, error: `Question ${qid} was not found in the survey.` };

    let targetPlaced = false;
    const targetQid = before_qid || after_qid;
    const isAfter = !!after_qid;

    if (targetQid) {
        for (const block of dryRunSurvey.blocks) {
            const targetQIndex = block.questions.findIndex((q: Question) => q.qid === targetQid);
            if (targetQIndex !== -1) {
                const insertionIndex = isAfter ? targetQIndex + 1 : targetQIndex;
                block.questions.splice(insertionIndex, 0, draggedQuestion);
                targetPlaced = true;
                break;
            }
        }
    }
    if (!targetPlaced) return { ok: false, error: `The target question ${targetQid} was not found.` };

    if (originalBlock && originalBlock.questions.length === 0 && dryRunSurvey.blocks.length > 1) {
        dryRunSurvey.blocks = dryRunSurvey.blocks.filter((b: Block) => b.id !== originalBlock!.id);
    }

    const newIssues = validateSurveyLogic(dryRunSurvey);

    const currentIssueMessages = new Set(logicIssues.map(i => i.message));
    const criticalNewIssues = newIssues.filter(issue => !currentIssueMessages.has(issue.message));

    if (criticalNewIssues.length > 0) {
        const errorDetails = criticalNewIssues.map(issue => {
            const q = dryRunSurvey.blocks.flatMap(b => b.questions).find(q => q.id === issue.questionId);
            return `- On question ${q?.qid || 'unknown'}: ${issue.message}`;
        }).join('\n');
        return { ok: false, error: `This move will create new logic issues:\n${errorDetails}` };
    }

    return { ok: true };
};
