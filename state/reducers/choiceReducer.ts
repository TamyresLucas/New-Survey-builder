
import type { Survey, Question, Choice, Block } from '../../types.js';
import { Action, SurveyActionType } from '../actions.js';
import { generateId } from '../idProvider.js';
import { renumberSurveyVariables } from '../../utils/logic.js';
import { QuestionType as QTEnum } from '../../types.js';

export const choiceReducer = (state: Survey, action: Action): Survey => {
    switch (action.type) {
        case SurveyActionType.ADD_CHOICE: {
            const newState = JSON.parse(JSON.stringify(state));
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

                const { afterChoiceId } = action.payload;
                if (afterChoiceId) {
                    const index = targetQuestion.choices.findIndex((c: Choice) => c.id === afterChoiceId);
                    if (index !== -1) {
                        targetQuestion.choices.splice(index + 1, 0, newChoice);
                    } else {
                        targetQuestion.choices.push(newChoice);
                    }
                } else {
                    targetQuestion.choices.push(newChoice);
                }
            }

            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.DELETE_CHOICE: {
            const newState = JSON.parse(JSON.stringify(state));
            const { questionId, choiceId } = action.payload;
            for (const block of newState.blocks) {
                const question = block.questions.find((q: Question) => q.id === questionId);
                if (question && question.choices) {
                    question.choices = question.choices.filter((c: Choice) => c.id !== choiceId);
                }
            }
            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.ADD_DESCRIPTION_LINE: {
            const newState = JSON.parse(JSON.stringify(state));
            const { questionId } = action.payload;
            let targetQuestion: Question | undefined;
            for (const block of newState.blocks) {
                targetQuestion = block.questions.find((q: Question) => q.id === questionId);
                if (targetQuestion) break;
            }

            if (targetQuestion) {
                if (!targetQuestion.descriptionLines) targetQuestion.descriptionLines = [];
                const lineNum = targetQuestion.descriptionLines.length + 1;

                const newLine = {
                    id: generateId('dl'),
                    text: `Click to write text line ${lineNum}`,
                };

                const { afterLineId } = action.payload;
                if (afterLineId) {
                    const index = targetQuestion.descriptionLines.findIndex((l: any) => l.id === afterLineId);
                    if (index !== -1) {
                        targetQuestion.descriptionLines.splice(index + 1, 0, newLine);
                    } else {
                        targetQuestion.descriptionLines.push(newLine);
                    }
                } else {
                    targetQuestion.descriptionLines.push(newLine);
                }
            }

            return newState;
        }

        case SurveyActionType.DELETE_DESCRIPTION_LINE: {
            const newState = JSON.parse(JSON.stringify(state));
            const { questionId, lineId } = action.payload;
            for (const block of newState.blocks) {
                const question = block.questions.find((q: Question) => q.id === questionId);
                if (question && question.descriptionLines) {
                    question.descriptionLines = question.descriptionLines.filter((l: any) => l.id !== lineId);
                }
            }
            return newState;
        }

        default:
            return state;
    }
}
