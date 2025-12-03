import type { Survey, Question, LogicIssue, DisplayLogicCondition, BranchingLogicCondition } from './types';
import { QuestionType } from './types';

// Create a map for quick lookups of questions by different properties for efficient validation.
const getQuestionMap = (survey: Survey): { byId: Map<string, Question>, byQid: Map<string, Question>, byIndex: Map<string, number> } => {
    const questions = survey.blocks.flatMap(b => b.questions);
    const byId = new Map(questions.map(q => [q.id, q]));
    const byQid = new Map(questions.filter(q => q.qid).map(q => [q.qid, q]));
    const byIndex = new Map(questions.map((q, i) => [q.id, i]));
    return { byId, byQid, byIndex };
};

/**
 * Analyzes a list of conditions joined by 'AND' to find logical contradictions.
 */
const checkAndLogicForContradictions = (
    conditions: (DisplayLogicCondition | BranchingLogicCondition)[],
    byQid: Map<string, Question>,
    currentQuestionId: string,
    sourceId: string, // This is the ID of the LogicSet or the specific branch
    type: 'display' | 'hide' | 'branching'
): LogicIssue[] => {
    const issues: LogicIssue[] = [];

    // Group conditions by the source question they reference
    const conditionsBySource = new Map<string, (DisplayLogicCondition | BranchingLogicCondition)[]>();

    for (const condition of conditions) {
        if (!condition.questionId) continue;
        if (!conditionsBySource.has(condition.questionId)) {
            conditionsBySource.set(condition.questionId, []);
        }
        conditionsBySource.get(condition.questionId)!.push(condition);
    }

    // Analyze each source question's constraints
    for (const [sourceQid, conds] of conditionsBySource.entries()) {
        const sourceQuestion = byQid.get(sourceQid);
        if (!sourceQuestion) continue;

        const equalsValues = new Set<string>();
        const notEqualsValues = new Set<string>();
        let requiresEmpty = false;
        let requiresNotEmpty = false;

        for (const cond of conds) {
            if (cond.operator === 'equals') equalsValues.add(cond.value);
            if (cond.operator === 'not_equals') notEqualsValues.add(cond.value);
            if (cond.operator === 'is_empty') requiresEmpty = true;
            if (cond.operator === 'is_not_empty' || cond.operator === 'contains') requiresNotEmpty = true;
        }

        // 1. Check for Empty vs Not Empty contradiction
        if (requiresEmpty && requiresNotEmpty) {
            issues.push({
                questionId: currentQuestionId,
                type,
                message: `Contradiction: Logic requires ${sourceQid} to be both empty and not empty.`,
                sourceId: sourceId,
                field: 'operator'
            });
        }

        // 2. Check for Direct Contradiction (Equals X AND Not Equals X)
        for (const val of equalsValues) {
            if (notEqualsValues.has(val)) {
                issues.push({
                    questionId: currentQuestionId,
                    type,
                    message: `Contradiction: Logic requires ${sourceQid} to equal '${val}' AND NOT equal '${val}'.`,
                    sourceId: sourceId,
                    field: 'value'
                });
            }
        }

        // 3. Check for Mutually Exclusive Equals (Single Choice Questions)
        const isSingleChoice = sourceQuestion.type === QuestionType.Radio || sourceQuestion.type === QuestionType.DropDownList;

        if (isSingleChoice && equalsValues.size > 1) {
            issues.push({
                questionId: currentQuestionId,
                type,
                message: `Impossible logic: ${sourceQid} is single-choice but must equal multiple values (${Array.from(equalsValues).join(' AND ')}).`,
                sourceId: sourceId,
                field: 'value'
            });
        }

        // 4. Check for Value Requirement vs Empty Requirement
        if (requiresEmpty && (equalsValues.size > 0 || notEqualsValues.size > 0)) {
            issues.push({
                questionId: currentQuestionId,
                type,
                message: `Contradiction: Logic requires ${sourceQid} to be empty, but also checks for a value.`,
                sourceId: sourceId,
                field: 'operator'
            });
        }
    }

    return issues;
};

/**
 * Validates all logic across the entire survey.
 * @param survey The survey object to validate.
 * @returns An array of LogicIssue objects representing any found problems.
 */
export const validateSurveyLogic = (survey: Survey): LogicIssue[] => {
    const issues: LogicIssue[] = [];
    const { byId, byQid, byIndex } = getQuestionMap(survey);
    const blockOfQuestionMap = new Map<string, number>();
    survey.blocks.forEach((block, index) => {
        block.questions.forEach(q => {
            blockOfQuestionMap.set(q.id, index);
        });
    });


    for (const block of survey.blocks) {
        for (const question of block.questions) {
            const currentQuestionIndex = byIndex.get(question.id)!;
            const currentBlockIndex = blockOfQuestionMap.get(question.id)!;

            const validateCondition = (condition: any, type: 'display' | 'hide', sourceId: string) => {
                if (!condition.questionId) return;

                const sourceQuestion = byQid.get(condition.questionId);
                if (!sourceQuestion) {
                    issues.push({
                        questionId: question.id,
                        type: type,
                        message: `The selected question (${condition.questionId}) no longer exists.`,
                        sourceId: sourceId,
                        field: 'questionId',
                    });
                } else {
                    const sourceQuestionIndex = byIndex.get(sourceQuestion.id)!;
                    if (sourceQuestionIndex >= currentQuestionIndex) {
                        issues.push({
                            questionId: question.id,
                            type: type,
                            message: `Logic cannot depend on a future question (${sourceQuestion.qid}).`,
                            sourceId: sourceId,
                            field: 'questionId',
                        });
                    }
                }
            };

            // 1. Validate Display Logic
            if (question.displayLogic) {
                const logic = question.displayLogic;
                // Standard structural checks
                logic.conditions.forEach(c => validateCondition(c, 'display', c.id));
                if (logic.logicSets) {
                    logic.logicSets.forEach(set => {
                        // Check conditions within the set
                        set.conditions.forEach(c => validateCondition(c, 'display', set.id));

                        // Advanced Semantic Check for Sets (AND)
                        if (set.operator === 'AND') {
                            const contradictions = checkAndLogicForContradictions(set.conditions, byQid, question.id, set.id, 'display');
                            issues.push(...contradictions);
                        }
                    });
                }

                // Advanced Semantic Check for Top Level (AND)
                if (logic.operator === 'AND') {
                    const contradictions = checkAndLogicForContradictions(logic.conditions, byQid, question.id, 'root', 'display');
                    issues.push(...contradictions);
                }
            }

            // NEW: Validate Hide Logic
            if (question.hideLogic) {
                const logic = question.hideLogic;
                logic.conditions.forEach(c => validateCondition(c, 'hide', c.id));
                if (logic.logicSets) {
                    logic.logicSets.forEach(set => {
                        set.conditions.forEach(c => validateCondition(c, 'hide', set.id));
                        if (set.operator === 'AND') {
                            const contradictions = checkAndLogicForContradictions(set.conditions, byQid, question.id, set.id, 'hide');
                            issues.push(...contradictions);
                        }
                    });
                }
                if (logic.operator === 'AND') {
                    const contradictions = checkAndLogicForContradictions(logic.conditions, byQid, question.id, 'root', 'hide');
                    issues.push(...contradictions);
                }
            }

            // 2. Validate Skip Logic
            if (question.skipLogic) {
                const validateTarget = (target: string, sourceId?: string) => {
                    if (target === 'next' || target === 'end' || !target) return;

                    if (target.startsWith('block:')) {
                        const blockId = target.substring(6);
                        const targetBlockIndex = survey.blocks.findIndex(b => b.id === blockId);
                        if (targetBlockIndex === -1) {
                            issues.push({
                                questionId: question.id,
                                type: 'skip',
                                message: `The destination block no longer exists.`,
                                sourceId,
                                field: 'skipTo',
                            });
                        } else if (targetBlockIndex < currentBlockIndex) {
                            issues.push({
                                questionId: question.id,
                                type: 'skip',
                                message: `Skipping backward to a previous block can cause loops.`,
                                sourceId,
                                field: 'skipTo',
                            });
                        }
                    } else {
                        const targetQuestion = byId.get(target);
                        if (!targetQuestion) {
                            issues.push({
                                questionId: question.id,
                                type: 'skip',
                                message: `The destination question no longer exists.`,
                                sourceId,
                                field: 'skipTo',
                            });
                        } else {
                            const targetQuestionIndex = byIndex.get(targetQuestion.id)!;
                            if (targetQuestionIndex <= currentQuestionIndex) {
                                issues.push({
                                    questionId: question.id,
                                    type: 'skip',
                                    message: `Skipping backward to ${targetQuestion.qid} can cause loops.`,
                                    sourceId,
                                    field: 'skipTo',
                                });
                            }
                        }
                    }
                };

                if (question.skipLogic.type === 'simple') {
                    validateTarget(question.skipLogic.skipTo, 'simple');
                } else if (question.skipLogic.type === 'per_choice') {
                    for (const rule of question.skipLogic.rules) {
                        if (!question.choices?.some(c => c.id === rule.choiceId)) {
                            issues.push({
                                questionId: question.id,
                                type: 'skip',
                                message: `A choice associated with this skip rule has been deleted.`,
                                sourceId: rule.choiceId, // use choiceId as source
                                // No specific field for this one, it's a general issue for the rule.
                            });
                        }
                        validateTarget(rule.skipTo, rule.choiceId);
                    }
                }
            }

            // 3. Validate Branching Logic
            if (question.branchingLogic) {
                const validateBranchTarget = (target: string, sourceId?: string) => {
                    if (target === 'next' || target === 'end' || !target) return;

                    if (target.startsWith('block:')) {
                        const blockId = target.substring(6);
                        const targetBlockIndex = survey.blocks.findIndex(b => b.id === blockId);
                        if (targetBlockIndex === -1) {
                            issues.push({
                                questionId: question.id,
                                type: 'branching',
                                message: `The destination block no longer exists.`,
                                sourceId,
                                field: 'skipTo',
                            });
                        } else if (targetBlockIndex < currentBlockIndex) {
                            issues.push({
                                questionId: question.id,
                                type: 'branching',
                                message: `Branching backward to a previous block can cause loops.`,
                                sourceId,
                                field: 'skipTo',
                            });
                        }
                    } else {
                        const targetQuestion = byId.get(target);
                        if (!targetQuestion) {
                            issues.push({
                                questionId: question.id,
                                type: 'branching',
                                message: `The destination question no longer exists.`,
                                sourceId,
                                field: 'skipTo',
                            });
                        } else {
                            const targetQuestionIndex = byIndex.get(targetQuestion.id)!;
                            if (targetQuestionIndex <= currentQuestionIndex) {
                                issues.push({
                                    questionId: question.id,
                                    type: 'branching',
                                    message: `Branching backward to ${targetQuestion.qid} can cause loops.`,
                                    sourceId,
                                    field: 'skipTo',
                                });
                            }
                        }
                    }
                }

                if (question.branchingLogic.branches) {
                    for (const branch of question.branchingLogic.branches) {
                        for (const condition of branch.conditions) {
                            if (!condition.questionId) continue; // Temporary state

                            const sourceQuestion = byQid.get(condition.questionId);
                            if (!sourceQuestion) {
                                issues.push({
                                    questionId: question.id,
                                    type: 'branching',
                                    message: `The selected question (${condition.questionId}) in this branch no longer exists.`,
                                    sourceId: condition.id,
                                    field: 'questionId',
                                });
                            } else {
                                const sourceQuestionIndex = byIndex.get(sourceQuestion.id)!;
                                if (sourceQuestionIndex > currentQuestionIndex) {
                                    issues.push({
                                        questionId: question.id,
                                        type: 'branching',
                                        message: `Advanced logic cannot depend on a future question (${sourceQuestion.qid}).`,
                                        sourceId: condition.id,
                                        field: 'questionId',
                                    });
                                }
                            }
                        }
                        validateBranchTarget(branch.thenSkipTo, branch.id);

                        // Advanced Semantic Check for Branches
                        if (branch.operator === 'AND') {
                            const contradictions = checkAndLogicForContradictions(branch.conditions, byQid, question.id, branch.id, 'branching');
                            issues.push(...contradictions);
                        }
                    }
                }
                validateBranchTarget(question.branchingLogic.otherwiseSkipTo, 'otherwise');
            }
        }
    }
    return issues;
};