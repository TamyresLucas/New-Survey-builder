
import type { Survey, Block, Question, Choice } from '../../types.js';
import { Action, SurveyActionType } from '../actions.js';
import { generateId } from '../idProvider.js';
import { renumberSurveyVariables, CHOICE_BASED_QUESTION_TYPES, NON_CHOICE_BASED_QUESTION_TYPES_WITH_TEXT } from '../../utils/logic.js';
import { applyPagingAndRenumber, validateAndCleanLogicAfterMove } from '../surveyHelpers.js';
import { QuestionType as QTEnum } from '../../types.js';

export const questionReducer = (state: Survey, action: Action): Survey => {
    switch (action.type) {
        case SurveyActionType.UPDATE_QUESTION: {
            const newState = JSON.parse(JSON.stringify(state));
            const { questionId, updates } = action.payload;
            let originalQuestion: Question | undefined;
            let questionInState: Question | undefined;

            if (updates.autoAdvance === false) {
                newState.globalAutoAdvance = false;
            }

            let keyBlock: Block | undefined;
            for (const block of newState.blocks) {
                const q = block.questions.find((q: Question) => q.id === questionId);
                if (q) {
                    originalQuestion = JSON.parse(JSON.stringify(q));
                    questionInState = q;
                    keyBlock = block;
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
                if (originalQuestion.type !== QTEnum.ChoiceGrid) {
                    finalUpdates.advancedSettings = {
                        ...originalQuestion.advancedSettings,
                        enableMobileLayout: true,
                    };
                }
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
            }

            if ('displayLogic' in finalUpdates) {
                if (finalUpdates.displayLogic === undefined) {
                    delete questionInState.displayLogic;
                    delete questionInState.draftDisplayLogic;
                } else {
                    questionInState.draftDisplayLogic = finalUpdates.displayLogic;
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
                        allConfirmed = questionInState.draftSkipLogic.rules?.every((r: any) => r.isConfirmed === true);
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
                } else if (finalUpdates.branchingLogic.branches && finalUpdates.branchingLogic.branches.length === 0) {
                    // FIX: If branches are empty, remove branching logic entirely.
                    // Cross-block routing should be handled by block.continueTo
                    delete questionInState.branchingLogic;
                    delete questionInState.draftBranchingLogic;
                } else {
                    questionInState.draftBranchingLogic = finalUpdates.branchingLogic;

                    const isOtherwiseReqSatisfied = questionInState.draftBranchingLogic.isExhaustive === true ||
                        questionInState.draftBranchingLogic.otherwiseIsConfirmed === true;

                    const allConfirmed = questionInState.draftBranchingLogic.branches?.every((b: any) =>
                        b.thenSkipToIsConfirmed === true &&
                        b.conditions.every((c: any) => c.isConfirmed === true)
                    );

                    if (allConfirmed && isOtherwiseReqSatisfied) {
                        questionInState.branchingLogic = questionInState.draftBranchingLogic;
                        delete questionInState.draftBranchingLogic;
                    }
                }
                delete finalUpdates.branchingLogic;
            }
            if ('beforeAdvancedLogics' in finalUpdates) {
                if (finalUpdates.beforeAdvancedLogics === undefined) {
                    delete questionInState.beforeAdvancedLogics;
                    delete questionInState.draftBeforeAdvancedLogics;
                } else {
                    questionInState.draftBeforeAdvancedLogics = finalUpdates.beforeAdvancedLogics;
                    const allConfirmed = questionInState.draftBeforeAdvancedLogics.every((w: any) => w.actions.every((a: any) => a.isConfirmed));
                    if (allConfirmed) {
                        questionInState.beforeAdvancedLogics = questionInState.draftBeforeAdvancedLogics;
                        delete questionInState.draftBeforeAdvancedLogics;
                    }
                }
                delete finalUpdates.beforeAdvancedLogics;
            }
            if ('afterAdvancedLogics' in finalUpdates) {
                if (finalUpdates.afterAdvancedLogics === undefined) {
                    delete questionInState.afterAdvancedLogics;
                    delete questionInState.draftAfterAdvancedLogics;
                } else {
                    questionInState.draftAfterAdvancedLogics = finalUpdates.afterAdvancedLogics;
                    const allConfirmed = questionInState.draftAfterAdvancedLogics.every((w: any) => w.actions.every((a: any) => a.isConfirmed));
                    if (allConfirmed) {
                        questionInState.afterAdvancedLogics = questionInState.draftAfterAdvancedLogics;
                        delete questionInState.draftAfterAdvancedLogics;
                    }
                }
                delete finalUpdates.afterAdvancedLogics;
            }

            Object.assign(questionInState, finalUpdates);

            // Synchronize block continueTo if this is the last question and otherwiseSkipTo changed
            if (keyBlock && questionInState.branchingLogic && questionInState.branchingLogic.otherwiseIsConfirmed) {
                const lastQuestion = keyBlock.questions[keyBlock.questions.length - 1];
                if (lastQuestion.id === questionInState.id) {
                    keyBlock.continueTo = questionInState.branchingLogic.otherwiseSkipTo;
                }
            }

            return updates.type || finalUpdates.choices || finalUpdates.scalePoints || 'pageName' in updates ? renumberSurveyVariables(newState) : newState;
        }

        case SurveyActionType.ADD_QUESTION: {
            const newState = JSON.parse(JSON.stringify(state));
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
                } else if (questionType === QTEnum.Radio) {
                    newQuestion.choices = [
                        { id: generateId('c'), text: 'Click to write choice 1' },
                        { id: generateId('c'), text: 'Click to write choice 2' },
                    ];
                } else {
                    // Checkbox and other choice-based types get 3 choices
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
            const newState = JSON.parse(JSON.stringify(state));
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
            const newState = JSON.parse(JSON.stringify(state));
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
            const newState = JSON.parse(JSON.stringify(state));
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

            const allOtherLabels = new Set(
                newState.blocks
                    .flatMap((b: Block) => b.questions)
                    .filter((q: Question) => q.type === QTEnum.Description && q.label)
                    .map((q: Question) => q.label!)
            );

            if (newQuestion.type === QTEnum.Description && newQuestion.label) {
                let finalLabel = newQuestion.label;
                if (allOtherLabels.has(finalLabel)) {
                    if (/^Description \d+$/.test(finalLabel)) {
                        newQuestion.label = undefined;
                    } else {
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
            const newState = JSON.parse(JSON.stringify(state));
            const { draggedQuestionId, targetQuestionId, targetBlockId } = action.payload;
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

        case SurveyActionType.ADD_PAGE_BREAK_AFTER_QUESTION: {
            const newState = JSON.parse(JSON.stringify(state));
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

        case SurveyActionType.MOVE_QUESTION_TO_NEW_BLOCK: {
            const newState = JSON.parse(JSON.stringify(state));
            const { questionId, onQuestionMoved } = action.payload;
            let questionToMove: Question | undefined;
            let originalBlock: Block | undefined;
            let originalBlockIndex = -1;
            let questionsToMoveWithPageBreak: Question[] = [];

            for (let i = 0; i < newState.blocks.length; i++) {
                const block = newState.blocks[i];
                const questionIndex = block.questions.findIndex((q: Question) => q.id === questionId);
                if (questionIndex !== -1) {
                    [questionToMove] = block.questions.splice(questionIndex, 1);
                    originalBlock = block;
                    originalBlockIndex = i;

                    if (questionToMove && questionToMove.type === QTEnum.PageBreak) {
                        questionsToMoveWithPageBreak.push(questionToMove);
                        let nextQuestionIndex = questionIndex;
                        while (nextQuestionIndex < block.questions.length) {
                            const nextQuestion = block.questions[nextQuestionIndex];
                            if (nextQuestion.type === QTEnum.PageBreak) {
                                break;
                            }
                            const [movedQuestion] = block.questions.splice(nextQuestionIndex, 1);
                            questionsToMoveWithPageBreak.push(movedQuestion);
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
            const newState = JSON.parse(JSON.stringify(state));
            const { questionId, targetBlockId } = action.payload;
            let questionToMove: Question | undefined;
            let originalBlockId: string | undefined;

            for (const block of newState.blocks) {
                const qIndex = block.questions.findIndex((q: Question) => q.id === questionId);
                if (qIndex !== -1) {
                    [questionToMove] = block.questions.splice(qIndex, 1);
                    originalBlockId = block.id;
                    break;
                }
            }

            if (!questionToMove) return state;

            const targetBlock = newState.blocks.find((b: Block) => b.id === targetBlockId);
            if (!targetBlock) {
                const originalBlock = newState.blocks.find((b: Block) => b.id === originalBlockId);
                originalBlock?.questions.push(questionToMove);
                return state;
            }

            targetBlock.questions.push(questionToMove);

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
            const newState = JSON.parse(JSON.stringify(state));
            const { qid, after_qid, before_qid } = action.payload;

            let draggedQuestion: Question | undefined;
            let originalBlock: Block | undefined;

            for (const block of newState.blocks) {
                const qIndex = block.questions.findIndex((q: Question) => q.qid === qid);
                if (qIndex !== -1) {
                    [draggedQuestion] = block.questions.splice(qIndex, 1);
                    originalBlock = block;
                    break;
                }
            }

            if (!draggedQuestion) {
                return state;
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
                if (originalBlock) {
                    originalBlock.questions.push(draggedQuestion);
                } else {
                    newState.blocks[newState.blocks.length - 1].questions.push(draggedQuestion);
                }
            }

            if (originalBlock && originalBlock.questions.length === 0 && newState.blocks.length > 1) {
                newState.blocks = newState.blocks.filter((b: Block) => b.id !== originalBlock.id);
            }

            newState.lastLogicValidationMessage = validateAndCleanLogicAfterMove(newState);
            return applyPagingAndRenumber(newState);
        }

        case SurveyActionType.CLEANUP_UNCONFIRMED_LOGIC: {
            const newState = JSON.parse(JSON.stringify(state));
            const { questionId } = action.payload;
            if (!questionId) return state;

            let questionToClean: Question | undefined;

            for (const block of newState.blocks) {
                questionToClean = block.questions.find((q: Question) => q.id === questionId);
                if (questionToClean) break;
            }

            if (!questionToClean) return state;

            delete questionToClean.draftDisplayLogic;
            delete questionToClean.draftHideLogic;
            delete questionToClean.draftSkipLogic;
            delete questionToClean.draftBranchingLogic;
            delete questionToClean.draftBeforeAdvancedLogics;
            delete questionToClean.draftAfterAdvancedLogics;

            return newState;
        }

        default:
            return state;
    }
}
