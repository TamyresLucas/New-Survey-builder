import type { Survey, Question, Block, QuestionType, Choice } from '../types';
import { renumberSurveyVariables } from '../utils';
import { CHOICE_BASED_QUESTION_TYPES, NON_CHOICE_BASED_QUESTION_TYPES_WITH_TEXT } from '../utils';
import { QuestionType as QTEnum } from '../types';


export enum SurveyActionType {
    UPDATE_SURVEY_TITLE = 'UPDATE_SURVEY_TITLE',
    UPDATE_BLOCK_TITLE = 'UPDATE_BLOCK_TITLE',
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
}

export interface Action {
    type: SurveyActionType;
    payload: any;
}

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

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

        case SurveyActionType.UPDATE_QUESTION: {
            const { questionId, updates } = action.payload;
            let originalQuestion: Question | undefined;
            
            for (const block of newState.blocks) {
                const q = block.questions.find((q: Question) => q.id === questionId);
                if (q) {
                  originalQuestion = JSON.parse(JSON.stringify(q));
                  break;
                }
            }
    
            if (!originalQuestion) return state;
    
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
                const choiceRegex = /\s*\(\w+_\d+\).*?(?=\s*\(\w+_\d+\)|$)/g;
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
    
            for (const block of newState.blocks) {
                const questionIndex = block.questions.findIndex((q: Question) => q.id === questionId);
                if (questionIndex !== -1) {
                    block.questions[questionIndex] = { ...block.questions[questionIndex], ...finalUpdates };
                    break;
                }
            }

            return updates.type || finalUpdates.choices ? renumberSurveyVariables(newState) : newState;
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
                newQuestion.choices = [
                    { id: generateId('c'), text: 'Click to write choice 1' },
                    { id: generateId('c'), text: 'Click to write choice 2' },
                    { id: generateId('c'), text: 'Click to write choice 3' },
                ];
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

            return renumberSurveyVariables(newState);
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
                const lastBlock = newState.blocks[newState.blocks.length - 1];
                if (lastBlock) {
                    lastBlock.questions.push(newQuestion);
                } else {
                    return state;
                }
            }

            return renumberSurveyVariables(newState);
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

            return questionFoundAndRemoved ? renumberSurveyVariables(newState) : state;
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

            newState.blocks[blockIndex].questions.splice(questionIndex + 1, 0, newQuestion);
            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.REORDER_QUESTION: {
            const { draggedQuestionId, targetQuestionId, targetBlockId } = action.payload;
            let draggedQuestion: Question | undefined;
            
            newState.blocks.forEach((block: Block) => {
                const qIndex = block.questions.findIndex(q => q.id === draggedQuestionId);
                if (qIndex !== -1) {
                    [draggedQuestion] = block.questions.splice(qIndex, 1);
                }
            });

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
            
            return renumberSurveyVariables(newState);
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
                const newChoice: Choice = {
                    id: generateId('c'),
                    text: `Click to write choice ${choiceNum}`,
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
                    return renumberSurveyVariables(newState);
                }
            }
            return state;
        }

        case SurveyActionType.ADD_BLOCK: {
            const { blockId, position } = action.payload;
            const newBlock: Block = { id: generateId('block'), title: 'New Block', questions: [] };
            const targetIndex = newState.blocks.findIndex((b: Block) => b.id === blockId);
            if (targetIndex === -1) return state;
            
            const insertionIndex = position === 'above' ? targetIndex : targetIndex + 1;
            newState.blocks.splice(insertionIndex, 0, newBlock);
            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.DELETE_BLOCK: {
            const { blockId } = action.payload;
            newState.blocks = newState.blocks.filter((b: Block) => b.id !== blockId);
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

        default:
            return state;
    }
}