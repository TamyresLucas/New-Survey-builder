import type { Survey, Question, Block, QuestionType, Choice } from '../types';
import { renumberSurveyVariables, generateId } from '../utils';
import { CHOICE_BASED_QUESTION_TYPES, NON_CHOICE_BASED_QUESTION_TYPES_WITH_TEXT } from '../utils';
import { QuestionType as QTEnum } from '../types';


export enum SurveyActionType {
    UPDATE_SURVEY_TITLE = 'UPDATE_SURVEY_TITLE',
    UPDATE_BLOCK_TITLE = 'UPDATE_BLOCK_TITLE',
    UPDATE_BLOCK = 'UPDATE_BLOCK',
    UPDATE_QUESTION = 'UPDATE_QUESTION',
    ADD_QUESTION = 'ADD_QUESTION',
    ADD_QUESTION_FROM_AI = 'ADD_QUESTION_FROM_AI',
    DELETE_QUESTION = 'DELETE_QUESTION',
    COPY_QUESTION = 'COPY_QUESTION',
    REORDER_QUESTION = 'REORDER_QUESTION',
    ADD_CHOICE = 'ADD_CHOICE',
    DELETE_CHOICE = 'DELETE_CHOICE',
    ADD_PAGE_BREAK_AFTER_QUESTION = 'ADD_PAGE_BREAK_AFTER_QUESTION',
    ADD_BLOCK = 'ADD_BLOCK',
    DELETE_BLOCK = 'DELETE_BLOCK',
    COPY_BLOCK = 'COPY_BLOCK',
    REORDER_BLOCK = 'REORDER_BLOCK',
    MOVE_BLOCK_UP = 'MOVE_BLOCK_UP',
    MOVE_BLOCK_DOWN = 'MOVE_BLOCK_DOWN',
    ADD_BLOCK_FROM_TOOLBOX = 'ADD_BLOCK_FROM_TOOLBOX',
    BULK_DELETE_QUESTIONS = 'BULK_DELETE_QUESTIONS',
    BULK_DUPLICATE_QUESTIONS = 'BULK_DUPLICATE_QUESTIONS',
    BULK_UPDATE_QUESTIONS = 'BULK_UPDATE_QUESTIONS',
    BULK_MOVE_TO_NEW_BLOCK = 'BULK_MOVE_TO_NEW_BLOCK',
    MOVE_QUESTION_TO_NEW_BLOCK = 'MOVE_QUESTION_TO_NEW_BLOCK',
    MOVE_QUESTION_TO_EXISTING_BLOCK = 'MOVE_QUESTION_TO_EXISTING_BLOCK',
    REPOSITION_QUESTION = 'REPOSITION_QUESTION',
    CLEANUP_UNCONFIRMED_LOGIC = 'CLEANUP_UNCONFIRMED_LOGIC',
    RESTORE_STATE = 'RESTORE_STATE',
    SET_PAGING_MODE = 'SET_PAGING_MODE',
    REPLACE_SURVEY = 'REPLACE_SURVEY',
    SET_GLOBAL_AUTOADVANCE = 'SET_GLOBAL_AUTOADVANCE',
    CLEAR_LOGIC_VALIDATION_MESSAGE = 'CLEAR_LOGIC_VALIDATION_MESSAGE',
}

export interface Action {
    type: SurveyActionType;
    payload?: any;
}

// Helper function to perform post-move logic validation
const validateAndCleanLogicAfterMove = (
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

const applyPagingRules = (survey: Survey, oldPagingMode?: Survey['pagingMode']): Survey => {
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

const applyPagingAndRenumber = (survey: Survey, oldPagingMode?: Survey['pagingMode']): Survey => {
    const surveyWithPagingRules = applyPagingRules(survey, oldPagingMode);
    return renumberSurveyVariables(surveyWithPagingRules);
};

export function surveyReducer(state: Survey, action: Action): Survey {
    const newState = JSON.parse(JSON.stringify(state));

    switch (action.type) {
        case SurveyActionType.UPDATE_SURVEY_TITLE: {
            newState.title = action.payload.title;
            return newState;
        }

        case SurveyActionType.UPDATE_BLOCK_TITLE: {
            const { blockId, title } = action.payload;
            const block = newState.blocks.find((b: Block) => b.id === blockId);
            if (block) {
                block.title = title;
            }
            return newState;
        }

        case SurveyActionType.UPDATE_BLOCK: {
            const { blockId, updates } = action.payload;
            const block = newState.blocks.find((b: Block) => b.id === blockId);
            if (block) {
                Object.assign(block, updates);

                // If hideBackButton is updated on the block, propagate to all its questions.
                if ('hideBackButton' in updates) {
                    block.questions.forEach((q: Question) => {
                        q.hideBackButton = updates.hideBackButton;
                    });
                }

                if (updates.autoAdvance === false) {
                    newState.globalAutoAdvance = false;
                }
            }
            // If the update affects paging, we need to re-apply rules.
            if ('automaticPageBreaks' in updates) {
                return applyPagingAndRenumber(newState, state.pagingMode);
            }
            return newState; // Renumbering not needed for other block updates like title change.
        }

        case SurveyActionType.UPDATE_QUESTION: {
            const { questionId, updates } = action.payload;
            let originalQuestion: Question | undefined;
            let questionInState: Question | undefined;

            if (updates.autoAdvance === false) {
                newState.globalAutoAdvance = false;
            }

            for (const block of newState.blocks) {
                const q = block.questions.find((q: Question) => q.id === questionId);
                if (q) {
                    originalQuestion = JSON.parse(JSON.stringify(q));
                    questionInState = q;
                    break;
                }
            }

            if (!originalQuestion || !questionInState) return state;

            const finalUpdates = { ...updates };

            if (
                updates.type === QTEnum.Description &&
                originalQuestion.type !== QTEnum.Description &&
                originalQuestion.choices &&
                originalQuestion.choices.length > 0
            ) {
                const questionText = originalQuestion.text.startsWith('Click to write') ? '' : originalQuestion.text + '\n';
                const choicesText = originalQuestion.choices.map((c: Choice) => c.text).join('\n');
                finalUpdates.text = `${questionText}${choicesText}`.trim();
            }

            if (
                updates.type &&
                CHOICE_BASED_QUESTION_TYPES.has(updates.type) &&
                NON_CHOICE_BASED_QUESTION_TYPES_WITH_TEXT.has(originalQuestion.type) &&
                !originalQuestion.choices?.length
            ) {
                const questionText = originalQuestion.text;
                // Regex to find variables with optional parentheses, like (Q1_1) or Q1_1
                const choiceRegex = /\s*\(?\w+_\d+\)?.*?(?=\s*\(?\w+_\d+\)?|$)/g;
                const potentialChoices = questionText.match(choiceRegex);

                if (potentialChoices && potentialChoices.length > 0) {
                    const firstChoiceMatch = potentialChoices[0];
                    const firstChoiceIndex = questionText.indexOf(firstChoiceMatch);
                    let mainQuestionText = questionText.substring(0, firstChoiceIndex).trim();
                    if (mainQuestionText === '') {
                        mainQuestionText = 'Click to write the question text';
                    }

                    const newChoices: Choice[] = potentialChoices.map((choiceText: string) => ({
                        id: generateId('c'),
                        text: choiceText.trim(),
                    }));

                    finalUpdates.text = mainQuestionText;
                    finalUpdates.choices = newChoices;
                }
            }

            if (updates.type && !CHOICE_BASED_QUESTION_TYPES.has(updates.type)) {
                finalUpdates.choices = undefined;
            }

            if (updates.type === QTEnum.ChoiceGrid) {
                // When switching TO Choice Grid, enable mobile layout by default
                if (originalQuestion.type !== QTEnum.ChoiceGrid) {
                    finalUpdates.advancedSettings = {
                        ...originalQuestion.advancedSettings,
                        enableMobileLayout: true,
                    };
                }
                // And if it doesn't have scale points, add them
                if (!originalQuestion.scalePoints?.length) {
                    finalUpdates.scalePoints = [
                        { id: generateId('s'), text: 'Column 1' },
                        { id: generateId('s'), text: 'Column 2' },
                        { id: generateId('s'), text: 'Column 3' },
                    ];
                }
            } else if (updates.type && updates.type !== QTEnum.ChoiceGrid) {
                finalUpdates.scalePoints = undefined;
            }

            // Handle linking choices
            if ('linkedChoicesSource' in updates) {
                const sourceQuestionId = updates.linkedChoicesSource;
                if (sourceQuestionId) {
                    const allQuestions = newState.blocks.flatMap((b: Block) => b.questions);
                    const sourceQuestion = allQuestions.find((q: Question) => q.id === sourceQuestionId);

                    if (sourceQuestion) {
                        if (sourceQuestion.choices) {
                            questionInState.choices = sourceQuestion.choices.map((c: Choice) => ({ ...c, id: generateId('c') }));
                        }
                        if (sourceQuestion.scalePoints) {
                            questionInState.scalePoints = sourceQuestion.scalePoints.map((sp: Choice) => ({ ...sp, id: generateId('s') }));
                        }
                    }
                }
                // If sourceQuestionId is undefined/null/empty, it's an unlink.
                // The choices are kept, and the linkedChoicesSource property is updated by Object.assign below.
            }

            // --- DRAFT LOGIC HANDLING ---
            if ('displayLogic' in finalUpdates) {
                if (finalUpdates.displayLogic === undefined) {
                    delete questionInState.displayLogic;
                    delete questionInState.draftDisplayLogic;
                } else {
                    questionInState.draftDisplayLogic = finalUpdates.displayLogic;

                    // Check both top-level conditions AND logic sets
                    const conditionsConfirmed = questionInState.draftDisplayLogic.conditions?.every((c: any) => c.isConfirmed) ?? true;
                    const logicSetsConfirmed = questionInState.draftDisplayLogic.logicSets?.every((s: any) => s.isConfirmed) ?? true;

                    if (conditionsConfirmed && logicSetsConfirmed) {
                        questionInState.displayLogic = questionInState.draftDisplayLogic;
                        delete questionInState.draftDisplayLogic;
                    }
                }
                delete finalUpdates.displayLogic;
            }
            if ('hideLogic' in finalUpdates) {
                if (finalUpdates.hideLogic === undefined) {
                    delete questionInState.hideLogic;
                    delete questionInState.draftHideLogic;
                } else {
                    questionInState.draftHideLogic = finalUpdates.hideLogic;

                    const conditionsConfirmed = questionInState.draftHideLogic.conditions?.every((c: any) => c.isConfirmed) ?? true;
                    const logicSetsConfirmed = questionInState.draftHideLogic.logicSets?.every((s: any) => s.isConfirmed) ?? true;

                    if (conditionsConfirmed && logicSetsConfirmed) {
                        questionInState.hideLogic = questionInState.draftHideLogic;
                        delete questionInState.draftHideLogic;
                    }
                }
                delete finalUpdates.hideLogic;
            }
            if ('skipLogic' in finalUpdates) {
                if (finalUpdates.skipLogic === undefined) {
                    delete questionInState.skipLogic;
                    delete questionInState.draftSkipLogic;
                } else {
                    questionInState.draftSkipLogic = finalUpdates.skipLogic;
                    let allConfirmed = false;
                    if (questionInState.draftSkipLogic.type === 'simple') {
                        allConfirmed = questionInState.draftSkipLogic.isConfirmed === true;
                    } else if (questionInState.draftSkipLogic.type === 'per_choice') {
                        allConfirmed = questionInState.draftSkipLogic.rules?.every(r => r.isConfirmed === true);
                    }
                    if (allConfirmed) {
                        questionInState.skipLogic = questionInState.draftSkipLogic;
                        delete questionInState.draftSkipLogic;
                    }
                }
                delete finalUpdates.skipLogic;
            }
            if ('branchingLogic' in finalUpdates) {
                if (finalUpdates.branchingLogic === undefined) {
                    delete questionInState.branchingLogic;
                    delete questionInState.draftBranchingLogic;
                } else {
                    questionInState.draftBranchingLogic = finalUpdates.branchingLogic;
                    const allConfirmed = questionInState.draftBranchingLogic.otherwiseIsConfirmed === true &&
                        questionInState.draftBranchingLogic.branches?.every(b =>
                            b.thenSkipToIsConfirmed === true &&
                            b.conditions.every(c => c.isConfirmed === true)
                        );
                    if (allConfirmed) {
                        questionInState.branchingLogic = questionInState.draftBranchingLogic;
                        delete questionInState.draftBranchingLogic;
                    }
                }
                delete finalUpdates.branchingLogic;
            }
            if ('beforeWorkflows' in finalUpdates) {
                if (finalUpdates.beforeWorkflows === undefined) {
                    delete questionInState.beforeWorkflows;
                    delete questionInState.draftBeforeWorkflows;
                } else {
                    questionInState.draftBeforeWorkflows = finalUpdates.beforeWorkflows;
                    const allConfirmed = questionInState.draftBeforeWorkflows.every((w: any) => w.actions.every((a: any) => a.isConfirmed));
                    if (allConfirmed) {
                        questionInState.beforeWorkflows = questionInState.draftBeforeWorkflows;
                        delete questionInState.draftBeforeWorkflows;
                    }
                }
                delete finalUpdates.beforeWorkflows;
            }
            if ('afterWorkflows' in finalUpdates) {
                if (finalUpdates.afterWorkflows === undefined) {
                    delete questionInState.afterWorkflows;
                    delete questionInState.draftAfterWorkflows;
                } else {
                    questionInState.draftAfterWorkflows = finalUpdates.afterWorkflows;
                    const allConfirmed = questionInState.draftAfterWorkflows.every((w: any) => w.actions.every((a: any) => a.isConfirmed));
                    if (allConfirmed) {
                        questionInState.afterWorkflows = questionInState.draftAfterWorkflows;
                        delete questionInState.draftAfterWorkflows;
                    }
                }
                delete finalUpdates.afterWorkflows;
            }


            Object.assign(questionInState, finalUpdates);

            return updates.type || finalUpdates.choices || finalUpdates.scalePoints || 'pageName' in updates ? renumberSurveyVariables(newState) : newState;
        }

        case SurveyActionType.ADD_QUESTION: {
            const { questionType, targetQuestionId, targetBlockId } = action.payload;
            const newQuestion: Question = {
                id: generateId('q'),
                qid: '',
                text: questionType === QTEnum.PageBreak ? 'Page Break' : 'Click to write the question text',
                type: questionType,
            };

            if (CHOICE_BASED_QUESTION_TYPES.has(questionType)) {
                if (questionType === QTEnum.ChoiceGrid) {
                    newQuestion.text = "Please rate your experience:";
                    newQuestion.choices = [
                        { id: generateId('c'), text: 'Product' },
                        { id: generateId('c'), text: 'Service' },
                        { id: generateId('c'), text: 'Speed' },
                    ];
                    newQuestion.scalePoints = [
                        { id: generateId('s'), text: 'Very Dissatisfied' },
                        { id: generateId('s'), text: 'Dissatisfied' },
                        { id: generateId('s'), text: 'Neutral' },
                        { id: generateId('s'), text: 'Satisfied' },
                        { id: generateId('s'), text: 'Very Satisfied' },
                    ];
                    newQuestion.answerFormat = 'grid';
                    newQuestion.advancedSettings = { enableMobileLayout: true };
                } else {
                    newQuestion.choices = [
                        { id: generateId('c'), text: 'Click to write choice 1' },
                        { id: generateId('c'), text: 'Click to write choice 2' },
                        { id: generateId('c'), text: 'Click to write choice 3' },
                    ];
                }
            }

            if (questionType === QTEnum.TextEntry) {
                newQuestion.textEntrySettings = {
                    answerLength: 'long',
                };
            }

            const targetBlock = newState.blocks.find((b: Block) => b.id === targetBlockId);
            if (!targetBlock) return state;

            let targetIndex = targetBlock.questions.findIndex((q: Question) => q.id === targetQuestionId);
            if (targetQuestionId === null) targetIndex = targetBlock.questions.length;
            if (targetIndex !== -1) {
                targetBlock.questions.splice(targetIndex, 0, newQuestion);
            } else {
                targetBlock.questions.push(newQuestion);
            }

            action.payload.onQuestionAdded?.(newQuestion.id);

            return applyPagingAndRenumber(newState);
        }

        case SurveyActionType.ADD_QUESTION_FROM_AI: {
            const { questionType, text, choiceStrings, afterQid, beforeQid } = action.payload;
            const newQuestion: Question = {
                id: generateId('q'),
                qid: '',
                text: text,
                type: questionType,
            };

            if (choiceStrings && choiceStrings.length > 0) {
                newQuestion.choices = choiceStrings.map((choiceText: string) => ({ id: generateId('c'), text: choiceText }));
            } else if ([QTEnum.Radio, QTEnum.Checkbox].includes(questionType)) {
                newQuestion.choices = [
                    { id: generateId('c'), text: 'Click to write choice 1' },
                    { id: generateId('c'), text: 'Click to write choice 2' },
                ];
            }

            let questionAdded = false;
            if (beforeQid) {
                for (const block of newState.blocks) {
                    const targetIndex = block.questions.findIndex((q: Question) => q.qid === beforeQid);
                    if (targetIndex !== -1) {
                        block.questions.splice(targetIndex, 0, newQuestion);
                        questionAdded = true;
                        break;
                    }
                }
            } else if (afterQid) {
                for (const block of newState.blocks) {
                    const targetIndex = block.questions.findIndex((q: Question) => q.qid === afterQid);
                    if (targetIndex !== -1) {
                        block.questions.splice(targetIndex + 1, 0, newQuestion);
                        questionAdded = true;
                        break;
                    }
                }
            }

            if (!questionAdded) {
                let lastBlock = newState.blocks[newState.blocks.length - 1];
                if (!lastBlock) {
                    // If no blocks exist, create one.
                    lastBlock = {
                        id: generateId('block'),
                        title: 'Default Block',
                        questions: []
                    };
                    newState.blocks.push(lastBlock);
                }
                lastBlock.questions.push(newQuestion);
            }

            return applyPagingAndRenumber(newState);
        }

        case SurveyActionType.DELETE_QUESTION: {
            const { questionId } = action.payload;
            let questionFoundAndRemoved = false;

            for (const block of newState.blocks) {
                const questionIndex = block.questions.findIndex((q: Question) => q.id === questionId);
                if (questionIndex !== -1) {
                    block.questions.splice(questionIndex, 1);
                    questionFoundAndRemoved = true;
                    break;
                }
            }

            return questionFoundAndRemoved ? applyPagingAndRenumber(newState) : state;
        }

        case SurveyActionType.COPY_QUESTION: {
            const { questionId } = action.payload;
            let questionToCopy: Question | undefined;
            let blockIndex = -1;
            let questionIndex = -1;

            for (let i = 0; i < newState.blocks.length; i++) {
                const j = newState.blocks[i].questions.findIndex((q: Question) => q.id === questionId);
                if (j !== -1) {
                    questionToCopy = newState.blocks[i].questions[j];
                    blockIndex = i;
                    questionIndex = j;
                    break;
                }
            }

            if (!questionToCopy || blockIndex === -1) return state;

            const newQuestion: Question = {
                ...questionToCopy,
                id: generateId('q'),
                choices: questionToCopy.choices?.map((c: Choice) => ({ ...c, id: generateId('c') }))
            };

            // Add logic to handle unique description labels on copy
            const allOtherLabels = new Set(
                newState.blocks
                    .flatMap((b: Block) => b.questions)
                    .filter((q: Question) => q.type === QTEnum.Description && q.label)
                    .map((q: Question) => q.label!)
            );

            if (newQuestion.type === QTEnum.Description && newQuestion.label) {
                let finalLabel = newQuestion.label;
                if (allOtherLabels.has(finalLabel)) {
                    // If it's a default numbered label, clear it and let renumbering handle it.
                    if (/^Description \d+$/.test(finalLabel)) {
                        newQuestion.label = undefined;
                    } else {
                        // It's a custom label, so find a unique name.
                        let copyNum = 1;
                        let newAttempt = `${newQuestion.label} (Copy)`;
                        while (allOtherLabels.has(newAttempt)) {
                            copyNum++;
                            newAttempt = `${newQuestion.label} (Copy ${copyNum})`;
                        }
                        newQuestion.label = newAttempt;
                    }
                }
            }

            newState.blocks[blockIndex].questions.splice(questionIndex + 1, 0, newQuestion);
            return applyPagingAndRenumber(newState);
        }

        case SurveyActionType.REORDER_QUESTION: {
            const { draggedQuestionId, targetQuestionId, targetBlockId, onLogicRemoved } = action.payload;
            let draggedQuestion: Question | undefined;
            let originalBlockId: string | undefined;

            for (const block of newState.blocks) {
                const qIndex = block.questions.findIndex((q: Question) => q.id === draggedQuestionId);
                if (qIndex !== -1) {
                    [draggedQuestion] = block.questions.splice(qIndex, 1);
                    originalBlockId = block.id;
                    break;
                }
            }

            if (!draggedQuestion) return state;

            const targetBlock = newState.blocks.find((b: Block) => b.id === targetBlockId);
            if (targetBlock) {
                let targetQuestionIndex = targetBlock.questions.findIndex((q: Question) => q.id === targetQuestionId);
                if (targetQuestionId === null) targetQuestionIndex = targetBlock.questions.length;

                if (targetQuestionIndex !== -1) {
                    targetBlock.questions.splice(targetQuestionIndex, 0, draggedQuestion);
                } else {
                    targetBlock.questions.push(draggedQuestion);
                }
            }

            if (originalBlockId) {
                const originalBlock = newState.blocks.find((b: Block) => b.id === originalBlockId);
                if (originalBlock && originalBlock.questions.length === 0 && newState.blocks.length > 1) {
                    newState.blocks = newState.blocks.filter((b: Block) => b.id !== originalBlockId);
                }
            }

            newState.lastLogicValidationMessage = validateAndCleanLogicAfterMove(newState);

            return applyPagingAndRenumber(newState);
        }

        case SurveyActionType.ADD_CHOICE: {
            const { questionId } = action.payload;
            let targetQuestion: Question | undefined;
            for (const block of newState.blocks) {
                targetQuestion = block.questions.find((q: Question) => q.id === questionId);
                if (targetQuestion) break;
            }

            if (targetQuestion) {
                if (!targetQuestion.choices) targetQuestion.choices = [];
                const choiceNum = targetQuestion.choices.length + 1;

                const defaultText = targetQuestion.type === QTEnum.ChoiceGrid
                    ? `Row ${choiceNum}`
                    : `Click to write choice ${choiceNum}`;

                const newChoice: Choice = {
                    id: generateId('c'),
                    text: defaultText,
                };
                targetQuestion.choices.push(newChoice);
            }

            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.DELETE_CHOICE: {
            const { questionId, choiceId } = action.payload;
            for (const block of newState.blocks) {
                const question = block.questions.find((q: Question) => q.id === questionId);
                if (question && question.choices) {
                    question.choices = question.choices.filter((c: Choice) => c.id !== choiceId);
                }
            }
            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.ADD_PAGE_BREAK_AFTER_QUESTION: {
            const { questionId } = action.payload;
            for (const block of newState.blocks) {
                const questionIndex = block.questions.findIndex((q: Question) => q.id === questionId);
                if (questionIndex !== -1) {
                    const newPageBreak: Question = {
                        id: generateId('q'),
                        qid: '',
                        text: 'Page Break',
                        type: QTEnum.PageBreak,
                    };
                    block.questions.splice(questionIndex + 1, 0, newPageBreak);
                    return applyPagingAndRenumber(newState);
                }
            }
            return state;
        }

        case SurveyActionType.ADD_BLOCK: {
            const { blockId, position } = action.payload;
            const newBlock: Block = { id: generateId('block'), title: 'New block', questions: [] };
            const targetIndex = newState.blocks.findIndex((b: Block) => b.id === blockId);
            if (targetIndex === -1) return state;

            const insertionIndex = position === 'above' ? targetIndex : targetIndex + 1;
            newState.blocks.splice(insertionIndex, 0, newBlock);
            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.DELETE_BLOCK: {
            const { blockId } = action.payload;
            newState.blocks = newState.blocks.filter((b: Block) => b.id !== blockId);
            if (newState.blocks.length === 0) {
                newState.blocks.push({
                    id: generateId('block'),
                    title: 'Default Block',
                    questions: []
                });
            }
            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.COPY_BLOCK: {
            const { blockId } = action.payload;
            const blockToCopyIndex = newState.blocks.findIndex((b: Block) => b.id === blockId);
            if (blockToCopyIndex === -1) return state;

            const blockToCopy = newState.blocks[blockToCopyIndex];
            const newBlock: Block = {
                ...blockToCopy,
                id: generateId('block'),
                title: `${blockToCopy.title} (Copy)`,
                questions: blockToCopy.questions.map((q: Question) => ({
                    ...q,
                    id: generateId('q'),
                    choices: q.choices?.map((c: Choice) => ({ ...c, id: generateId('c') }))
                }))
            };

            // Add logic to handle unique description labels on copy
            const allOtherLabels = new Set(
                newState.blocks
                    .flatMap((b: Block) => b.questions)
                    .filter((q: Question) => q.type === QTEnum.Description && q.label)
                    .map((q: Question) => q.label!)
            );

            // This set will track labels as we make them unique *within* the new block
            const labelsInNewBlock = new Set<string>();

            newBlock.questions.forEach((q: Question) => {
                if (q.type === QTEnum.Description && q.label) {
                    let finalLabel = q.label;
                    if (allOtherLabels.has(finalLabel) || labelsInNewBlock.has(finalLabel)) {
                        if (/^Description \d+$/.test(finalLabel)) {
                            q.label = undefined; // Let renumbering handle it
                        } else {
                            let copyNum = 1;
                            let newAttempt = `${q.label} (Copy)`;
                            while (allOtherLabels.has(newAttempt) || labelsInNewBlock.has(newAttempt)) {
                                copyNum++;
                                newAttempt = `${q.label} (Copy ${copyNum})`;
                            }
                            finalLabel = newAttempt;
                        }
                    }
                    q.label = finalLabel;
                    if (q.label) {
                        labelsInNewBlock.add(q.label);
                    }
                }
            });

            newState.blocks.splice(blockToCopyIndex + 1, 0, newBlock);
            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.REORDER_BLOCK: {
            const { draggedBlockId, targetBlockId } = action.payload;
            const blocks = newState.blocks;
            const draggedBlockIndex = blocks.findIndex((b: Block) => b.id === draggedBlockId);
            if (draggedBlockIndex === -1) return state;

            const [draggedBlock] = blocks.splice(draggedBlockIndex, 1);
            if (targetBlockId === null) {
                blocks.push(draggedBlock);
            } else {
                const targetBlockIndex = blocks.findIndex((b: Block) => b.id === targetBlockId);
                if (targetBlockIndex !== -1) {
                    blocks.splice(targetBlockIndex, 0, draggedBlock);
                } else {
                    blocks.push(draggedBlock);
                }
            }
            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.MOVE_BLOCK_UP: {
            const { blockId } = action.payload;
            const blockIndex = newState.blocks.findIndex((b: Block) => b.id === blockId);
            if (blockIndex > 0) {
                const temp = newState.blocks[blockIndex - 1];
                newState.blocks[blockIndex - 1] = newState.blocks[blockIndex];
                newState.blocks[blockIndex] = temp;
                return renumberSurveyVariables(newState);
            }
            return state;
        }

        case SurveyActionType.MOVE_BLOCK_DOWN: {
            const { blockId } = action.payload;
            const blockIndex = newState.blocks.findIndex((b: Block) => b.id === blockId);
            if (blockIndex !== -1 && blockIndex < newState.blocks.length - 1) {
                const temp = newState.blocks[blockIndex + 1];
                newState.blocks[blockIndex + 1] = newState.blocks[blockIndex];
                newState.blocks[blockIndex] = temp;
                return renumberSurveyVariables(newState);
            }
            return state;
        }

        case SurveyActionType.ADD_BLOCK_FROM_TOOLBOX: {
            const { targetBlockId } = action.payload;
            const newBlock: Block = { id: generateId('block'), title: 'New block', questions: [] };

            if (targetBlockId === null) {
                // Dropped at the end
                newState.blocks.push(newBlock);
            } else {
                const targetIndex = newState.blocks.findIndex((b: Block) => b.id === targetBlockId);
                if (targetIndex !== -1) {
                    newState.blocks.splice(targetIndex, 0, newBlock);
                } else {
                    // Fallback: if target not found for some reason, add to end
                    newState.blocks.push(newBlock);
                }
            }
            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.BULK_DELETE_QUESTIONS: {
            const { questionIds } = action.payload; // questionIds is a Set<string>
            newState.blocks.forEach((block: Block) => {
                block.questions = block.questions.filter((q: Question) => !questionIds.has(q.id));
            });
            // remove empty blocks
            newState.blocks = newState.blocks.filter((block: Block) => block.questions.length > 0 || newState.blocks.length === 1);
            return applyPagingAndRenumber(newState);
        }

        case SurveyActionType.BULK_UPDATE_QUESTIONS: {
            const { questionIds, updates } = action.payload; // questionIds is a Set<string>
            newState.blocks.forEach((block: Block) => {
                block.questions.forEach((q: Question) => {
                    if (questionIds.has(q.id)) {
                        Object.assign(q, updates);
                    }
                });
            });
            return newState; // Renumbering not needed for property updates
        }

        case SurveyActionType.BULK_DUPLICATE_QUESTIONS: {
            const { questionIds } = action.payload; // questionIds is a Set<string>
            const questionsToCopy: Question[] = [];
            let lastQuestionBlockIndex = -1;
            let lastQuestionIndex = -1;

            // Find all questions to copy and the position of the last one
            for (let i = newState.blocks.length - 1; i >= 0; i--) {
                const block = newState.blocks[i];
                for (let j = block.questions.length - 1; j >= 0; j--) {
                    const question = block.questions[j];
                    if (questionIds.has(question.id)) {
                        questionsToCopy.unshift(JSON.parse(JSON.stringify(question))); // Keep original order
                        if (lastQuestionIndex === -1) {
                            lastQuestionIndex = j;
                            lastQuestionBlockIndex = i;
                        }
                    }
                }
            }

            if (questionsToCopy.length === 0 || lastQuestionBlockIndex === -1) {
                return state;
            }

            const duplicatedQuestions = questionsToCopy.map((q: Question) => ({
                ...q,
                id: generateId('q'),
                choices: q.choices?.map((c: Choice) => ({ ...c, id: generateId('c') }))
            }));

            newState.blocks[lastQuestionBlockIndex].questions.splice(lastQuestionIndex + 1, 0, ...duplicatedQuestions);

            return applyPagingAndRenumber(newState);
        }

        case SurveyActionType.BULK_MOVE_TO_NEW_BLOCK: {
            const { questionIds } = action.payload; // questionIds is a Set<string>
            const questionsToMove: Question[] = [];
            let firstQuestionBlockIndex = -1;

            // Extract questions to move
            newState.blocks.forEach((block: Block, blockIndex: number) => {
                const questionsInBlock = block.questions.filter(q => questionIds.has(q.id));
                if (questionsInBlock.length > 0 && firstQuestionBlockIndex === -1) {
                    firstQuestionBlockIndex = blockIndex;
                }
                questionsToMove.push(...questionsInBlock);
                block.questions = block.questions.filter(q => !questionIds.has(q.id));
            });

            if (questionsToMove.length === 0) return state;

            const newBlock: Block = {
                id: generateId('block'),
                title: 'New block',
                questions: questionsToMove,
            };

            const insertionIndex = firstQuestionBlockIndex !== -1 ? firstQuestionBlockIndex + 1 : newState.blocks.length;
            newState.blocks.splice(insertionIndex, 0, newBlock);

            // Cleanup any empty blocks
            newState.blocks = newState.blocks.filter((block: Block) => block.questions.length > 0);
            if (newState.blocks.length === 0) { // Should not happen if we moved questions, but as a safeguard
                newState.blocks.push({ id: generateId('block'), title: 'Default Block', questions: [] });
            }

            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.MOVE_QUESTION_TO_NEW_BLOCK: {
            const { questionId, onLogicRemoved, onQuestionMoved } = action.payload;
            let questionToMove: Question | undefined;
            let originalBlock: Block | undefined;
            let originalBlockIndex = -1;
            let questionsToMoveWithPageBreak: Question[] = [];

            // Find and remove the question from its original block
            for (let i = 0; i < newState.blocks.length; i++) {
                const block = newState.blocks[i];
                const questionIndex = block.questions.findIndex((q: Question) => q.id === questionId);
                if (questionIndex !== -1) {
                    [questionToMove] = block.questions.splice(questionIndex, 1);
                    originalBlock = block;
                    originalBlockIndex = i;

                    if (questionToMove && questionToMove.type === QTEnum.PageBreak) {
                        questionsToMoveWithPageBreak.push(questionToMove);
                        // Start looking for questions to move from the index where the page break was
                        let nextQuestionIndex = questionIndex;
                        // The array has shifted, so the item at `questionIndex` is now the one after the page break
                        while (nextQuestionIndex < block.questions.length) {
                            const nextQuestion = block.questions[nextQuestionIndex];
                            if (nextQuestion.type === QTEnum.PageBreak) {
                                break; // Stop at the next page break
                            }
                            // Splice the question out and add it to our list
                            const [movedQuestion] = block.questions.splice(nextQuestionIndex, 1);
                            questionsToMoveWithPageBreak.push(movedQuestion);
                            // Do not increment nextQuestionIndex because splice shortens the array in place
                        }
                    }
                    break;
                }
            }

            if (!questionToMove || !originalBlock) {
                return state;
            }

            const newBlock: Block = {
                id: generateId('block'),
                title: 'New Block',
                questions: questionsToMoveWithPageBreak.length > 0 ? questionsToMoveWithPageBreak : [questionToMove],
            };

            newState.blocks.splice(originalBlockIndex + 1, 0, newBlock);

            if (originalBlock.questions.length === 0 && newState.blocks.length > 1) {
                newState.blocks = newState.blocks.filter((b: Block) => b.id !== originalBlock.id);
            }

            onQuestionMoved?.(questionId);

            newState.lastLogicValidationMessage = validateAndCleanLogicAfterMove(newState);

            return applyPagingAndRenumber(newState);
        }

        case SurveyActionType.MOVE_QUESTION_TO_EXISTING_BLOCK: {
            const { questionId, targetBlockId, onLogicRemoved } = action.payload;
            let questionToMove: Question | undefined;
            let originalBlockId: string | undefined;

            // Find and remove the question from its original block
            for (const block of newState.blocks) {
                const qIndex = block.questions.findIndex((q: Question) => q.id === questionId);
                if (qIndex !== -1) {
                    [questionToMove] = block.questions.splice(qIndex, 1);
                    originalBlockId = block.id;
                    break;
                }
            }

            if (!questionToMove) return state;

            // Find target block and add the question
            const targetBlock = newState.blocks.find((b: Block) => b.id === targetBlockId);
            if (!targetBlock) {
                // Failsafe: if target block is not found, put the question back.
                const originalBlock = newState.blocks.find((b: Block) => b.id === originalBlockId);
                originalBlock?.questions.push(questionToMove);
                return state;
            }

            targetBlock.questions.push(questionToMove);

            // Clean up original block if it becomes empty
            if (originalBlockId) {
                const originalBlock = newState.blocks.find((b: Block) => b.id === originalBlockId);
                if (originalBlock && originalBlock.questions.length === 0 && newState.blocks.length > 1) {
                    newState.blocks = newState.blocks.filter((b: Block) => b.id !== originalBlockId);
                }
            }

            newState.lastLogicValidationMessage = validateAndCleanLogicAfterMove(newState);

            return applyPagingAndRenumber(newState);
        }


        case SurveyActionType.REPOSITION_QUESTION: {
            const { qid, after_qid, before_qid, onLogicRemoved } = action.payload;

            let draggedQuestion: Question | undefined;
            let originalBlock: Block | undefined;

            // Find and remove the question to be moved
            for (const block of newState.blocks) {
                const qIndex = block.questions.findIndex((q: Question) => q.qid === qid);
                if (qIndex !== -1) {
                    [draggedQuestion] = block.questions.splice(qIndex, 1);
                    originalBlock = block;
                    break;
                }
            }

            if (!draggedQuestion) {
                console.warn(`[Reducer] Could not find question with QID ${qid} to reposition.`);
                return state; // No change
            }

            let targetPlaced = false;
            const targetQid = before_qid || after_qid;
            const isAfter = !!after_qid;

            if (targetQid) {
                for (const block of newState.blocks) {
                    const targetQIndex = block.questions.findIndex((q: Question) => q.qid === targetQid);
                    if (targetQIndex !== -1) {
                        const insertionIndex = isAfter ? targetQIndex + 1 : targetQIndex;
                        block.questions.splice(insertionIndex, 0, draggedQuestion);
                        targetPlaced = true;
                        break;
                    }
                }
            }

            if (!targetPlaced) {
                console.warn(`[Reducer] Could not find target QID ${targetQid}. Reverting move.`);
                if (originalBlock) {
                    // Failsafe: put it back if target not found. This is complex because we don't store original index.
                    // For now, add to end of original block.
                    originalBlock.questions.push(draggedQuestion);
                } else {
                    newState.blocks[newState.blocks.length - 1].questions.push(draggedQuestion);
                }
            }

            // Cleanup original block if it becomes empty
            if (originalBlock && originalBlock.questions.length === 0 && newState.blocks.length > 1) {
                newState.blocks = newState.blocks.filter((b: Block) => b.id !== originalBlock.id);
            }

            newState.lastLogicValidationMessage = validateAndCleanLogicAfterMove(newState);

            return applyPagingAndRenumber(newState);
        }

        case SurveyActionType.CLEANUP_UNCONFIRMED_LOGIC: {
            const { questionId } = action.payload;
            if (!questionId) return state;

            let questionToClean: Question | undefined;

            for (const block of newState.blocks) {
                questionToClean = block.questions.find((q: Question) => q.id === questionId);
                if (questionToClean) break;
            }

            if (!questionToClean) return state;

            // When a user navigates away from a question, any unconfirmed changes
            // stored in the draft state are discarded. The confirmed logic remains untouched.
            delete questionToClean.draftDisplayLogic;
            delete questionToClean.draftHideLogic;
            delete questionToClean.draftSkipLogic;
            delete questionToClean.draftBranchingLogic;
            delete questionToClean.draftBeforeWorkflows;
            delete questionToClean.draftAfterWorkflows;

            return newState;
        }

        case SurveyActionType.RESTORE_STATE: {
            // This action payload is a complete survey state.
            return action.payload;
        }

        case SurveyActionType.SET_PAGING_MODE: {
            const { pagingMode } = action.payload;
            const oldPagingMode = state.pagingMode;

            const nextState = JSON.parse(JSON.stringify(state));
            nextState.pagingMode = pagingMode;

            return applyPagingAndRenumber(nextState, oldPagingMode);
        }

        case SurveyActionType.REPLACE_SURVEY: {
            return applyPagingAndRenumber(action.payload);
        }

        case SurveyActionType.SET_GLOBAL_AUTOADVANCE: {
            const { enabled } = action.payload;
            newState.globalAutoAdvance = enabled;
            const autoadvanceableTypes = new Set([QTEnum.Radio, QTEnum.ChoiceGrid]);

            if (enabled) {
                // If enabling, turn it on for everything compatible.
                newState.blocks.forEach((block: Block) => {
                    block.autoAdvance = true;
                    block.questions.forEach((q: Question) => {
                        if (autoadvanceableTypes.has(q.type)) {
                            q.autoAdvance = true;
                        }
                    });
                });
            } else {
                // If disabling, turn it off for everything.
                newState.blocks.forEach((block: Block) => {
                    block.autoAdvance = false;
                    block.questions.forEach((q: Question) => {
                        if (autoadvanceableTypes.has(q.type)) {
                            q.autoAdvance = false;
                        }
                    });
                });
            }
            return newState; // No renumbering needed for this property change
        }

        case SurveyActionType.CLEAR_LOGIC_VALIDATION_MESSAGE: {
            newState.lastLogicValidationMessage = undefined;
            return newState;
        }

        default:
            return state;
    }
}