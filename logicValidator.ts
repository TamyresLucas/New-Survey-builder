import type { Survey, Question, LogicIssue } from './types';

// Create a map for quick lookups of questions by different properties for efficient validation.
const getQuestionMap = (survey: Survey): { byId: Map<string, Question>, byQid: Map<string, Question>, byIndex: Map<string, number> } => {
    const questions = survey.blocks.flatMap(b => b.questions);
    const byId = new Map(questions.map(q => [q.id, q]));
    const byQid = new Map(questions.filter(q => q.qid).map(q => [q.qid, q]));
    const byIndex = new Map(questions.map((q, i) => [q.id, i]));
    return { byId, byQid, byIndex };
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

            // 1. Validate Display Logic
            if (question.displayLogic) {
                for (const condition of question.displayLogic.conditions) {
                    if (!condition.questionId) continue; // This is a temporary state, not a validation error
                    
                    const sourceQuestion = byQid.get(condition.questionId);
                    if (!sourceQuestion) {
                        issues.push({
                            questionId: question.id,
                            type: 'display',
                            message: `The selected question (${condition.questionId}) no longer exists.`,
                            sourceId: condition.id,
                            field: 'questionId',
                        });
                    } else {
                        const sourceQuestionIndex = byIndex.get(sourceQuestion.id)!;
                        if (sourceQuestionIndex >= currentQuestionIndex) {
                            issues.push({
                                questionId: question.id,
                                type: 'display',
                                message: `Logic cannot depend on a future question (${sourceQuestion.qid}).`,
                                sourceId: condition.id,
                                field: 'questionId',
                            });
                        }
                    }
                }
            }
            // NEW: Validate Hide Logic
            if (question.hideLogic) {
                for (const condition of question.hideLogic.conditions) {
                    if (!condition.questionId) continue;
                    
                    const sourceQuestion = byQid.get(condition.questionId);
                    if (!sourceQuestion) {
                        issues.push({
                            questionId: question.id,
                            type: 'hide',
                            message: `The selected question (${condition.questionId}) no longer exists.`,
                            sourceId: condition.id,
                            field: 'questionId',
                        });
                    } else {
                        const sourceQuestionIndex = byIndex.get(sourceQuestion.id)!;
                        if (sourceQuestionIndex >= currentQuestionIndex) {
                            issues.push({
                                questionId: question.id,
                                type: 'hide',
                                message: `Logic cannot depend on a future question (${sourceQuestion.qid}).`,
                                sourceId: condition.id,
                                field: 'questionId',
                            });
                        }
                    }
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
                
                for(const branch of question.branchingLogic.branches) {
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
                }
                validateBranchTarget(question.branchingLogic.otherwiseSkipTo, 'otherwise');
            }
        }
    }
    return issues;
};
