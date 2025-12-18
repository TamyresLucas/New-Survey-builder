
import type { Survey } from '../types.js';
import { SurveyActionType, Action } from './actions.js';
import { blockReducer } from './reducers/blockReducer.js';
import { questionReducer } from './reducers/questionReducer.js';
import { choiceReducer } from './reducers/choiceReducer.js';
import { bulkReducer } from './reducers/bulkReducer.js';
import { metaReducer } from './reducers/metaReducer.js';

export { SurveyActionType };
export type { Action };

export function surveyReducer(state: Survey, action: Action): Survey {
    switch (action.type) {
        // Block Actions
        case SurveyActionType.UPDATE_BLOCK_TITLE:
        case SurveyActionType.UPDATE_BLOCK:
        case SurveyActionType.ADD_BLOCK:
        case SurveyActionType.DELETE_BLOCK:
        case SurveyActionType.COPY_BLOCK:
        case SurveyActionType.REORDER_BLOCK:
        case SurveyActionType.MOVE_BLOCK_UP:
        case SurveyActionType.MOVE_BLOCK_DOWN:
        case SurveyActionType.ADD_BLOCK_FROM_TOOLBOX:
        case SurveyActionType.ADD_BLOCK_FROM_AI:
            return blockReducer(state, action);

        // Question Actions
        case SurveyActionType.UPDATE_QUESTION:
        case SurveyActionType.ADD_QUESTION:
        case SurveyActionType.ADD_QUESTION_FROM_AI:
        case SurveyActionType.DELETE_QUESTION:
        case SurveyActionType.COPY_QUESTION:
        case SurveyActionType.REORDER_QUESTION:
        case SurveyActionType.ADD_PAGE_BREAK_AFTER_QUESTION:
        case SurveyActionType.MOVE_QUESTION_TO_NEW_BLOCK:
        case SurveyActionType.MOVE_QUESTION_TO_EXISTING_BLOCK:
        case SurveyActionType.REPOSITION_QUESTION:
        case SurveyActionType.CLEANUP_UNCONFIRMED_LOGIC:
            return questionReducer(state, action);

        // Choice Actions
        case SurveyActionType.ADD_CHOICE:
        case SurveyActionType.DELETE_CHOICE:
            return choiceReducer(state, action);

        // Bulk Actions
        case SurveyActionType.BULK_DELETE_QUESTIONS:
        case SurveyActionType.BULK_DUPLICATE_QUESTIONS:
        case SurveyActionType.BULK_UPDATE_QUESTIONS:
        case SurveyActionType.BULK_MOVE_TO_NEW_BLOCK:
            return bulkReducer(state, action);

        // Meta/Global Actions
        case SurveyActionType.UPDATE_SURVEY_TITLE:
        case SurveyActionType.SET_PAGING_MODE:
        case SurveyActionType.REPLACE_SURVEY:
        case SurveyActionType.SET_GLOBAL_AUTOADVANCE:
        case SurveyActionType.RESTORE_STATE:
        case SurveyActionType.CLEAR_LOGIC_VALIDATION_MESSAGE:
            return metaReducer(state, action);

        default:
            return state;
    }
}