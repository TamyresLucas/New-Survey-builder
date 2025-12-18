
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
                targetQuestion.choices.push(newChoice);
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

        default:
            return state;
    }
}
