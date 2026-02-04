
import type { Survey, Block, Question } from '../../types.js';
import { Action, SurveyActionType } from '../actions.js';
import { applyPagingAndRenumber } from '../surveyHelpers.js';
import { QuestionType as QTEnum } from '../../types.js';

export const metaReducer = (state: Survey, action: Action): Survey => {
    switch (action.type) {
        case SurveyActionType.UPDATE_SURVEY_TITLE: {
            const newState = JSON.parse(JSON.stringify(state));
            newState.title = action.payload.title;
            return newState;
        }

        case SurveyActionType.UPDATE_DISPLAY_TITLE: {
            const newState = JSON.parse(JSON.stringify(state));
            newState.displayTitle = action.payload.displayTitle;
            return newState;
        }

        case SurveyActionType.SET_PAGING_MODE: {
            const newState = JSON.parse(JSON.stringify(state));
            const oldPagingMode = state.pagingMode;
            newState.pagingMode = action.payload.pagingMode;
            return applyPagingAndRenumber(newState, oldPagingMode);
        }

        case SurveyActionType.REPLACE_SURVEY: {
            return applyPagingAndRenumber(action.payload);
        }

        case SurveyActionType.RESTORE_STATE: {
            return action.payload;
        }

        case SurveyActionType.SET_GLOBAL_AUTOADVANCE: {
            const newState = JSON.parse(JSON.stringify(state));
            const { enabled } = action.payload;
            newState.globalAutoAdvance = enabled;
            const autoadvanceableTypes = new Set([QTEnum.Radio, QTEnum.ChoiceGrid]);

            if (enabled) {
                newState.blocks.forEach((block: Block) => {
                    block.autoAdvance = true;
                    block.questions.forEach((q: Question) => {
                        if (autoadvanceableTypes.has(q.type)) {
                            q.autoAdvance = true;
                        }
                    });
                });
            } else {
                newState.blocks.forEach((block: Block) => {
                    block.autoAdvance = false;
                    block.questions.forEach((q: Question) => {
                        if (autoadvanceableTypes.has(q.type)) {
                            q.autoAdvance = false;
                        }
                    });
                });
            }
            return newState;
        }

        case SurveyActionType.CLEAR_LOGIC_VALIDATION_MESSAGE: {
            const newState = JSON.parse(JSON.stringify(state));
            newState.lastLogicValidationMessage = undefined;
            return newState;
        }

        default:
            return state;
    }
}
