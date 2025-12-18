import { Survey, DisplayLogic, SkipLogic, SkipLogicRule, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition } from '../types';
import { generateId, parseChoice, CHOICE_BASED_QUESTION_TYPES } from '../utils';

// Helper to deep compare function calls, ignoring the 'force' parameter
export const isSameLogicChange = (a: { name: string, args: any } | null, b: { name: string, args: any }) => {
    if (!a) return false;

    const aArgs = { ...a.args };
    delete aArgs.force;
    const bArgs = { ...b.args };
    delete bArgs.force;

    return a.name === b.name && JSON.stringify(aArgs) === JSON.stringify(bArgs);
};

export const calculateLogicUpdate = (name: string, args: any, survey: Survey): { qid?: string, bid?: string, payload: any } | null => {
    if (name === 'set_branching_logic') {
        const { targetId, branches: inputBranches, otherwiseDestination } = args;
        const targetQ = survey.blocks.flatMap(b => b.questions).find(q => q.qid === targetId);
        const targetB = survey.blocks.find(b => b.bid === targetId || b.id === targetId); // Handle Block IDs

        if (!targetQ && !targetB) return null;

        const newBranchingLogic: BranchingLogic = {
            branches: inputBranches.map((br: any) => ({
                id: generateId('br'),
                operator: br.conditionOperator || 'AND',
                conditions: br.conditions.map((c: any) => ({
                    id: generateId('bc'),
                    questionId: c.sourceQid, // Using variable name here, might need ID mapping in usage
                    operator: c.operator,
                    value: c.value,
                    isConfirmed: true
                })),
                thenSkipTo: br.destination, // Need to ensure mapped to internal ID eventually if needed, but keeping simple for now
                thenSkipToIsConfirmed: true,
                pathName: br.pathName || `Path ${generateId('p')}`
            })),
            otherwiseSkipTo: otherwiseDestination || 'next',
            otherwiseIsConfirmed: true
        };

        if (targetQ) {
            return { qid: targetQ.qid, payload: { branchingLogic: newBranchingLogic } };
        } else if (targetB) {
            // Block branching logic
            // Assuming Block type supports branchingLogic property as seen in types.ts
            return { bid: targetB.id, payload: { branchingLogic: newBranchingLogic } };
        }
    }

    const { qid } = args;
    if (!qid) return null;

    const questionToUpdate = survey.blocks.flatMap(b => b.questions).find(q => q.qid === qid);
    if (!questionToUpdate && name !== 'remove_display_logic' && name !== 'remove_skip_logic') return null;

    switch (name) {
        case 'set_display_logic': {
            const { logicalOperator, conditions } = args as { logicalOperator?: 'AND' | 'OR'; conditions: { sourceQid: string; operator: any; value?: string }[] };
            if (questionToUpdate) {
                const newDisplayLogic: DisplayLogic = {
                    operator: logicalOperator || 'AND',
                    conditions: conditions.map(c => ({ id: generateId('dlc'), questionId: c.sourceQid, operator: c.operator, value: c.value || '', isConfirmed: true }))
                };
                return { qid, payload: { displayLogic: newDisplayLogic } };
            }
            break;
        }
        case 'remove_display_logic': {
            return { qid, payload: { displayLogic: undefined } };
        }
        case 'set_skip_logic': {
            const { rules } = args as { rules: { choiceText?: string; destinationQid: string }[] };
            if (!questionToUpdate) break;

            let newSkipLogic: SkipLogic | undefined;

            if (rules.length === 1 && !rules[0].choiceText && !CHOICE_BASED_QUESTION_TYPES.has(questionToUpdate.type as any)) {
                const destQ = survey.blocks.flatMap(b => b.questions).find(q => q.qid.toLowerCase() === rules[0].destinationQid.toLowerCase());
                const skipTo = ['next', 'end'].includes(rules[0].destinationQid.toLowerCase()) ? rules[0].destinationQid.toLowerCase() : destQ?.id || '';
                if (skipTo) newSkipLogic = { type: 'simple', skipTo, isConfirmed: true };
            } else if (questionToUpdate.choices) {
                const skipRules: SkipLogicRule[] = [];
                for (const rule of rules) {
                    const choice = questionToUpdate.choices.find(c => parseChoice(c.text).label.toLowerCase() === rule.choiceText?.toLowerCase());
                    if (choice) {
                        const destQ = survey.blocks.flatMap(b => b.questions).find(q => q.qid.toLowerCase() === rule.destinationQid.toLowerCase());
                        const skipTo = ['next', 'end'].includes(rule.destinationQid.toLowerCase()) ? rule.destinationQid.toLowerCase() : destQ?.id || '';
                        if (skipTo) skipRules.push({ id: generateId('slr'), choiceId: choice.id, skipTo, isConfirmed: true });
                    }
                }
                if (skipRules.length > 0) newSkipLogic = { type: 'per_choice', rules: skipRules };
            }

            if (newSkipLogic) return { qid, payload: { skipLogic: newSkipLogic } };
            break;
        }
        case 'remove_skip_logic': {
            return { qid, payload: { skipLogic: undefined } };
        }
    }
    return null;
};
