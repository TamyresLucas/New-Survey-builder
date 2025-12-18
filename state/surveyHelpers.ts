
import type { Survey, Question, Block } from '../types.js';
import { QuestionType as QTEnum } from '../types.js';
import { renumberSurveyVariables } from '../utils/logic.js';
import { generateId } from './idProvider.js';

// Helper function to perform post-move logic validation
export const validateAndCleanLogicAfterMove = (
    survey: Survey
): string | undefined => {
    const allQuestions = survey.blocks.flatMap((b: Block) => b.questions);
    const questionIndexMap = new Map(allQuestions.map((q, i) => [q.id, i]));
    const blockIndexMap = new Map(survey.blocks.map((b, i) => [b.id, i]));

    // We need to iterate through ALL questions because moving one question (e.g., Q1)
    // can invalidate logic on another question (e.g., Q2 which depended on Q1).
    const affectedQuestions: string[] = [];

    for (const question of allQuestions) {
        const questionIndex = questionIndexMap.get(question.id);
        if (questionIndex === undefined) continue;

        const currentBlockIndex = survey.blocks.findIndex(b => b.questions.some(q => q.id === question.id));

        let hasIssues = false;

        // --- 1. Validate Skip Logic (preventing backward skips) ---
        if (question.skipLogic) {
            let isLogicInvalid = false;
            const logic = question.skipLogic;

            const checkTarget = (targetId: string): boolean => {
                if (!targetId || targetId === 'next' || targetId === 'end') return false;

                if (targetId.startsWith('block:')) {
                    const blockId = targetId.substring(6);
                    const targetBlockIndex = blockIndexMap.get(blockId);
                    // Invalid if skipping to a previous block
                    return targetBlockIndex !== undefined && targetBlockIndex < currentBlockIndex;
                } else {
                    const targetIndex = questionIndexMap.get(targetId);
                    // Invalid if skipping to a previous question
                    return targetIndex !== undefined && targetIndex <= questionIndex;
                }
            };

            if (logic.type === 'simple') {
                if (checkTarget(logic.skipTo)) isLogicInvalid = true;
            } else if (logic.type === 'per_choice') {
                for (const rule of logic.rules) {
                    if (checkTarget(rule.skipTo)) {
                        isLogicInvalid = true;
                        break;
                    }
                }
            }

            if (isLogicInvalid) {
                hasIssues = true;
            }
        }

        // --- 2. Validate Branching Logic (Loops & Dependencies) ---
        if (question.branchingLogic) {
            const logic = question.branchingLogic;
            let loopErrorFound = false;
            let dependencyErrorFound = false;

            // A. Check Destinations (Loops)
            const checkBranchTarget = (targetId: string): boolean => {
                if (!targetId || targetId === 'next' || targetId === 'end') return false;
                if (targetId.startsWith('block:')) {
                    const blockId = targetId.substring(6);
                    const targetBlockIndex = blockIndexMap.get(blockId);
                    return targetBlockIndex !== undefined && targetBlockIndex < currentBlockIndex;
                } else {
                    const targetIndex = questionIndexMap.get(targetId);
                    return targetIndex !== undefined && targetIndex <= questionIndex;
                }
            };

            // Check "Otherwise" path
            if (checkBranchTarget(logic.otherwiseSkipTo)) {
                loopErrorFound = true;
            }

            // Check specific branches
            if (logic.branches) {
                logic.branches.forEach(branch => {
                    if (branch.thenSkipToIsConfirmed && checkBranchTarget(branch.thenSkipTo)) {
                        loopErrorFound = true;
                    }

                    // B. Check Conditions (Dependencies)
                    const invalidConditions = branch.conditions.some(condition => {
                        if (!condition.questionId) return false;
                        const sourceQ = allQuestions.find(q => q.qid === condition.questionId);
                        if (!sourceQ) return false; // Let standard validator catch missing questions
                        const sourceIndex = questionIndexMap.get(sourceQ.id);
                        // Condition valid only if source is BEFORE current question
                        return sourceIndex !== undefined && sourceIndex >= questionIndex;
                    });

                    if (invalidConditions) {
                        dependencyErrorFound = true;
                    }
                });
            }

            if (loopErrorFound || dependencyErrorFound) {
                hasIssues = true;
            }
        }

        // --- 3. Validate Display Logic (Dependencies) ---
        if (question.displayLogic) {
            const invalidConditions = question.displayLogic.conditions.some(condition => {
                if (!condition.questionId) return false;
                const sourceQ = allQuestions.find(q => q.qid === condition.questionId);
                if (!sourceQ) return false;

                const sourceIndex = questionIndexMap.get(sourceQ.id);
                return sourceIndex !== undefined && sourceIndex >= questionIndex;
            });

            if (invalidConditions) {
                hasIssues = true;
            }
        }

        if (hasIssues) {
            affectedQuestions.push(question.qid);
        }
    }

    if (affectedQuestions.length > 0) {
        const displayCount = 3;
        const shownQids = affectedQuestions.slice(0, displayCount).join(', ');
        const remaining = affectedQuestions.length - displayCount;

        let message = `Logic on ${shownQids}`;
        if (remaining > 0) message += ` and ${remaining} others`;
        message += ` is now invalid. Please review.`;

        return message;
    }

    return undefined;
};

export const applyPagingRules = (survey: Survey, oldPagingMode?: Survey['pagingMode']): Survey => {
    const newSurvey = JSON.parse(JSON.stringify(survey));
    const newPagingMode = survey.pagingMode;

    // Remove all automatic breaks before recalculating, to handle question moves/deletes correctly.
    newSurvey.blocks.forEach((block: Block) => {
        block.questions = block.questions.filter((q: Question) => !(q.type === QTEnum.PageBreak && q.isAutomatic));
    });

    // ALWAYS clean up any consecutive page breaks (manual or just-converted ones)
    newSurvey.blocks.forEach((block: Block) => {
        const cleanedQuestions: Question[] = [];
        for (let i = 0; i < block.questions.length; i++) {
            const currentQuestion = block.questions[i];
            const prevQuestion = cleanedQuestions[cleanedQuestions.length - 1];

            if (currentQuestion.type === QTEnum.PageBreak && prevQuestion?.type === QTEnum.PageBreak) {
                continue;
            }
            cleanedQuestions.push(currentQuestion);
        }
        block.questions = cleanedQuestions;
    });

    newSurvey.blocks.forEach((block: Block) => {
        const shouldApplyBreaks = newPagingMode === 'one-per-page' || (newPagingMode === 'multi-per-page' && block.automaticPageBreaks);

        if (shouldApplyBreaks) {
            const newQuestionsForBlock: Question[] = [];
            let hasSeenInteractiveQuestionInPage = false;

            block.questions.forEach((question: Question) => {
                const isInteractive = question.type !== QTEnum.PageBreak && question.type !== QTEnum.Description;

                if (isInteractive) {
                    if (hasSeenInteractiveQuestionInPage) {
                        newQuestionsForBlock.push({
                            id: generateId('pb'),
                            qid: '',
                            text: 'Page Break',
                            type: QTEnum.PageBreak,
                            isAutomatic: true,
                        });
                        hasSeenInteractiveQuestionInPage = false; // Reset for the *new* page
                    }
                }

                if (question.type === QTEnum.PageBreak && !question.isAutomatic) { // Only manual page breaks reset the counter
                    hasSeenInteractiveQuestionInPage = false;
                }

                newQuestionsForBlock.push(question);

                if (isInteractive) {
                    hasSeenInteractiveQuestionInPage = true;
                }
            });
            block.questions = newQuestionsForBlock;
        }
    });

    return newSurvey;
};

export const applyPagingAndRenumber = (survey: Survey, oldPagingMode?: Survey['pagingMode']): Survey => {
    const surveyWithPagingRules = applyPagingRules(survey, oldPagingMode);
    return renumberSurveyVariables(surveyWithPagingRules);
};
